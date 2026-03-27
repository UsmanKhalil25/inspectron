"""Minimal FastAPI wrapper around browser-agent Agent."""

import asyncio
import json
import os
import re
import time
from dataclasses import dataclass, field
from pathlib import Path
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
	message_queue: asyncio.Queue = field(default_factory=asyncio.Queue)
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

		return ChatOpenAI(model='gpt-5.1')
	if os.getenv('ANTHROPIC_API_KEY'):
		from browser_agent.llm.anthropic.chat import ChatAnthropic

		return ChatAnthropic(model='claude-sonnet-4-5')
	raise RuntimeError('No LLM API key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.')


# ---------------------------------------------------------------------------
# Background agent task
# ---------------------------------------------------------------------------


async def _run_agent(run_id: str, url: str, task: str, max_steps: int = 100, system_extension: str | None = None) -> None:
	state = runs[run_id]
	agent_ref: list = [None]

	async def register_new_step_callback(
		browser_state: BrowserStateSummary,
		agent_output: AgentOutput,
		step_n: int,
	) -> None:
		state.screenshot_b64 = browser_state.screenshot

		# Drain pending user messages and inject into agent
		while not state.message_queue.empty():
			msg: str = state.message_queue.get_nowait()
			if agent_ref[0] is not None:
				agent_ref[0].message_manager.add_new_task(msg)
			await state.events.put(
				{
					'type': 'user_message',
					'content': msg,
					'timestamp': time.time(),
				}
			)

	async def register_step_finalized_callback(
		agent_output: AgentOutput,
		step_n: int,
		post_action_url: str,
	) -> None:
		# Extract action details
		action_data = agent_output.action[0] if agent_output.action else None
		action_name = 'unknown'
		action_params = {}
		action_display = 'No action'

		if action_data:
			action_dict = action_data.model_dump(exclude_unset=True)
			if action_dict:
				action_name = list(action_dict.keys())[0]
				action_params = action_dict[action_name]

				if action_name == 'click':
					idx = action_params.get('index', 'unknown')
					action_display = f'Clicked element #{idx}'
				elif action_name == 'input':
					idx = action_params.get('index', 'unknown')
					text = action_params.get('text', '')
					action_display = f'Typed "{text}" into element #{idx}'
				elif action_name == 'go_to_url':
					nav_url = action_params.get('url', '')
					action_display = f'Navigated to {nav_url}'
				elif action_name == 'scroll':
					direction = 'down' if action_params.get('down', True) else 'up'
					action_display = f'Scrolled {direction}'
				elif action_name == 'wait':
					action_display = 'Waited for page to load'
				elif action_name == 'go_back':
					action_display = 'Went back to previous page'
				else:
					action_display = f'Performed {action_name}'

		event = {
			'type': 'step',
			'step': step_n,
			'timestamp': time.time(),
			'thinking': agent_output.thinking,
			'action': {
				'name': action_name,
				'params': action_params,
				'display': action_display,
			},
			'context': {
				'url': post_action_url,
				'title': '',
			},
		}

		await state.events.put(event)

	try:
		browser_session = BrowserSession(headless=True)
		state.browser_session = browser_session

		agent = Agent(
			task=task,
			llm=get_llm(),
			browser_session=browser_session,
			register_new_step_callback=register_new_step_callback,
			register_step_finalized_callback=register_step_finalized_callback,
			extend_system_message=system_extension,
		)
		agent_ref[0] = agent
		result = await agent.run(max_steps=max_steps)
		state.result = result.final_result()
		state.status = 'done'
		await state.events.put(
			{
				'type': 'done',
				'result': state.result,
				'timestamp': time.time(),
			}
		)
	except Exception as exc:
		state.error = str(exc)
		state.status = 'error'
		await state.events.put(
			{
				'type': 'error',
				'message': state.error,
				'timestamp': time.time(),
			}
		)


# ---------------------------------------------------------------------------
# API routes
# ---------------------------------------------------------------------------


def load_skill(skill_name: str, url: str) -> str:
	skills_dir = Path(__file__).parent / 'skills'
	skill_path = (skills_dir / f'{skill_name}.md').resolve()
	# Guard against path traversal
	if not str(skill_path).startswith(str(skills_dir.resolve())):
		raise ValueError(f'Invalid skill name: {skill_name}')
	if not skill_path.exists():
		raise FileNotFoundError(f'Skill not found: {skill_name}')
	content = skill_path.read_text(encoding='utf-8')
	# Strip YAML frontmatter block (--- ... ---)
	content = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)
	return content.replace('{url}', url)


class RunRequest(BaseModel):
	url: str
	task: str | None = None
	skill: str | None = None
	max_steps: int = 100


@app.post('/runs', status_code=201)
async def create_run(body: RunRequest):
	system_extension: str | None = None
	if body.skill is not None:
		try:
			system_extension = load_skill(body.skill, body.url)
		except (FileNotFoundError, ValueError) as exc:
			raise HTTPException(status_code=404, detail=str(exc)) from exc
		task = f'Perform a security scan of {body.url}.'
	elif body.task is not None:
		task = body.task
	else:
		raise HTTPException(status_code=422, detail='Either task or skill must be provided')
	run_id = str(uuid4())
	runs[run_id] = RunState(status='running')
	asyncio.create_task(_run_agent(run_id, body.url, task, body.max_steps, system_extension))
	return {'run_id': run_id}


class MessageRequest(BaseModel):
	content: str


@app.post('/runs/{run_id}/message', status_code=200)
async def send_message(run_id: str, body: MessageRequest):
	state = runs.get(run_id)
	if state is None:
		raise HTTPException(status_code=404, detail='Run not found')
	if state.status != 'running':
		raise HTTPException(status_code=400, detail='Run is not in running state')
	await state.message_queue.put(body.content)
	return {'ok': True}


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
				current_url = await state.browser_session.get_current_page_url()

				await websocket.send_json(
					{
						'type': 'frame',
						'data': frame,
						'timestamp': current_time,
						'frame_number': frame_count,
						'latency_ms': int((current_time - last_frame_time) * 1000),
						'url': current_url,
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
