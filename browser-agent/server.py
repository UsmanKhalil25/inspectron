"""Minimal FastAPI wrapper around browser-agent Agent."""

import asyncio
import json
import os
import time
from dataclasses import dataclass, field
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

load_dotenv()

from browser_agent.agent.service import Agent
from browser_agent.agent.views import AgentOutput
from browser_agent.browser.session import BrowserSession
from browser_agent.browser.views import BrowserStateSummary

app = FastAPI()


# ---------------------------------------------------------------------------
# In-memory run store
# ---------------------------------------------------------------------------


@dataclass
class RunState:
	status: str  # "running" | "done" | "error"
	screenshot_b64: str | None = None
	events: asyncio.Queue = field(default_factory=asyncio.Queue)
	result: str | None = None
	error: str | None = None
	browser_session: BrowserSession | None = None


runs: dict[str, RunState] = {}


# ---------------------------------------------------------------------------
# LLM factory
# ---------------------------------------------------------------------------


def get_llm():
	if os.getenv('OPENAI_API_KEY'):
		from browser_agent.llm.openai.chat import ChatOpenAI

		return ChatOpenAI(model='gpt-4o')
	if os.getenv('ANTHROPIC_API_KEY'):
		from browser_agent.llm.anthropic.chat import ChatAnthropic

		return ChatAnthropic(model='claude-sonnet-4-5')
	raise RuntimeError('No LLM API key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.')


# ---------------------------------------------------------------------------
# Background agent task
# ---------------------------------------------------------------------------


async def _run_agent(run_id: str, url: str, task: str) -> None:
	state = runs[run_id]

	async def register_new_step_callback(
		browser_state: BrowserStateSummary,
		agent_output: AgentOutput,
		step_n: int,
	) -> None:
		state.screenshot_b64 = browser_state.screenshot
		action_name = agent_output.action[0].__class__.__name__ if agent_output.action else 'unknown'
		await state.events.put(
			{
				'type': 'step',
				'step': step_n,
				'action': action_name,
				'goal': agent_output.next_goal or '',
				'url': browser_state.url,
			}
		)

	try:
		browser_session = BrowserSession(headless=True)
		state.browser_session = browser_session

		agent = Agent(
			task=f'Navigate to {url}. {task}',
			llm=get_llm(),
			browser_session=browser_session,
			register_new_step_callback=register_new_step_callback,
		)
		result = await agent.run(max_steps=50)
		state.result = result.final_result()
		state.status = 'done'
		await state.events.put({'type': 'done', 'result': state.result})
	except Exception as exc:
		state.error = str(exc)
		state.status = 'error'
		await state.events.put({'type': 'error', 'message': state.error})


# ---------------------------------------------------------------------------
# API routes
# ---------------------------------------------------------------------------


class RunRequest(BaseModel):
	url: str
	task: str


@app.post('/runs', status_code=201)
async def create_run(body: RunRequest):
	run_id = str(uuid4())
	runs[run_id] = RunState(status='running')
	asyncio.create_task(_run_agent(run_id, body.url, body.task))
	return {'run_id': run_id}


@app.get('/runs/{run_id}/screenshot')
async def get_screenshot(run_id: str):
	state = runs.get(run_id)
	if state is None:
		raise HTTPException(status_code=404, detail='Run not found')
	if state.screenshot_b64 is None:
		return Response(status_code=204)
	return {'screenshot': state.screenshot_b64}


@app.get('/runs/{run_id}/events')
async def stream_events(run_id: str):
	state = runs.get(run_id)
	if state is None:
		raise HTTPException(status_code=404, detail='Run not found')

	async def event_generator():
		while True:
			event = await state.events.get()
			yield f'data: {json.dumps(event)}\n\n'
			if event.get('type') in ('done', 'error'):
				break

	return StreamingResponse(event_generator(), media_type='text/event-stream')


@app.websocket('/runs/{run_id}/stream/frames')
async def stream_frames(websocket: WebSocket, run_id: str):
	"""WebSocket endpoint for streaming browser frames in real-time."""
	state = runs.get(run_id)
	if state is None:
		await websocket.close(code=404, reason='Run not found')
		return

	if state.browser_session is None:
		await websocket.close(code=400, reason='Browser session not ready')
		return

	await websocket.accept()

	frame_count = 0
	last_frame_time = time.time()

	try:
		while True:
			frame = await state.browser_session.get_streaming_frame(timeout=0.5)

			if frame:
				current_time = time.time()
				frame_count += 1

				await websocket.send_json(
					{
						'type': 'frame',
						'data': frame,
						'timestamp': current_time,
						'frame_number': frame_count,
						'latency_ms': int((current_time - last_frame_time) * 1000),
					}
				)
				last_frame_time = current_time

			if state.status in ('done', 'error'):
				break

	except WebSocketDisconnect:
		pass
	except Exception as e:
		try:
			await websocket.send_json(
				{
					'type': 'error',
					'message': str(e),
				}
			)
		except Exception:
			pass
	finally:
		await websocket.close()
