"""Streaming Watchdog for live browser preview using CDP screencast."""

import time
from typing import ClassVar

from bubus import BaseEvent
from cdp_use.cdp.page.events import ScreencastFrameEvent
from pydantic import PrivateAttr

from browser_agent.browser.events import AgentFocusChangedEvent, BrowserConnectedEvent, BrowserStopEvent
from browser_agent.browser.profile import ViewportSize
from browser_agent.browser.watchdog_base import BaseWatchdog
from browser_agent.utils import create_task_with_error_handling


class StreamingWatchdog(BaseWatchdog):
	"""
	Manages live browser preview streaming using CDP screencasting.

	This watchdog captures frames at a configurable FPS and pushes them
	to the browser session's frame queue for consumption by external clients
	(e.g., WebSocket server endpoints).
	"""

	LISTENS_TO: ClassVar[list[type[BaseEvent]]] = [BrowserConnectedEvent, BrowserStopEvent, AgentFocusChangedEvent]
	EMITS: ClassVar[list[type[BaseEvent]]] = []

	_current_session_id: str | None = PrivateAttr(default=None)
	_screencast_active: bool = PrivateAttr(default=False)
	_last_frame_time: float = PrivateAttr(default=0.0)

	async def on_BrowserConnectedEvent(self, event: BrowserConnectedEvent) -> None:
		"""
		Starts streaming if it is configured in the browser profile.
		"""
		profile = self.browser_session.browser_profile

		stream_fps = getattr(profile, 'stream_fps', 10)
		if stream_fps <= 0:
			self.logger.debug('[StreamingWatchdog] Streaming disabled (stream_fps=0)')
			return

		size = await self._get_current_viewport_size()
		if not size:
			self.logger.warning('Cannot start streaming: viewport size could not be determined.')
			return

		self.browser_session.cdp_client.register.Page.screencastFrame(self.on_screencastFrame)

		self._screencast_params = {
			'format': 'jpeg',
			'quality': getattr(profile, 'stream_quality', 85),
			'maxWidth': size['width'],
			'maxHeight': size['height'],
			'everyNthFrame': max(1, int(30 / stream_fps)),
		}

		await self._start_screencast()

	async def on_AgentFocusChangedEvent(self, event: AgentFocusChangedEvent) -> None:
		"""
		Switches streaming to the new tab.
		"""
		if self._screencast_active:
			self.logger.debug(f'[StreamingWatchdog] Agent focus changed to {event.target_id}, switching screencast...')
			await self._start_screencast()

	async def _start_screencast(self) -> None:
		"""Starts screencast on the currently focused tab."""
		if not self._screencast_params:
			return

		try:
			cdp_session = await self.browser_session.get_or_create_cdp_session()

			if self._current_session_id == cdp_session.session_id and self._screencast_active:
				return

			if self._current_session_id:
				try:
					await self.browser_session.cdp_client.send.Page.stopScreencast(session_id=self._current_session_id)
				except Exception as e:
					self.logger.debug(f'[StreamingWatchdog] Failed to stop screencast on old session: {e}')

			self._current_session_id = cdp_session.session_id

			await cdp_session.cdp_client.send.Page.startScreencast(
				params=self._screencast_params,  # type: ignore
				session_id=cdp_session.session_id,
			)
			self._screencast_active = True
			self.logger.info(f'[StreamingWatchdog] Started streaming on target {cdp_session.target_id}')

		except Exception as e:
			self.logger.error(f'[StreamingWatchdog] Failed to start screencast: {e}')
			self._screencast_active = False
			self._current_session_id = None

	async def _get_current_viewport_size(self) -> ViewportSize | None:
		"""Gets the current viewport size directly from the browser via CDP."""
		try:
			cdp_session = await self.browser_session.get_or_create_cdp_session()
			metrics = await cdp_session.cdp_client.send.Page.getLayoutMetrics(session_id=cdp_session.session_id)

			viewport = metrics.get('cssVisualViewport', {})
			width = viewport.get('clientWidth')
			height = viewport.get('clientHeight')

			if width and height:
				return ViewportSize(width=int(width), height=int(height))
		except Exception as e:
			self.logger.warning(f'[StreamingWatchdog] Failed to get viewport size: {e}')

		return None

	def on_screencastFrame(self, event: ScreencastFrameEvent, session_id: str | None) -> None:
		"""
		Synchronous handler for incoming screencast frames.

		Pushes frames to the browser session's frame queue.
		"""
		if self._current_session_id and session_id != self._current_session_id:
			return

		if not self._screencast_active:
			return

		frame_data = event.get('data')
		if not frame_data:
			return

		self.browser_session.push_streaming_frame(frame_data)
		self._last_frame_time = time.time()

		create_task_with_error_handling(
			self._ack_screencast_frame(event, session_id),
			name='ack_screencast_frame_streaming',
			logger_instance=self.logger,
			suppress_exceptions=True,
		)

	async def _ack_screencast_frame(self, event: ScreencastFrameEvent, session_id: str | None) -> None:
		"""
		Asynchronously acknowledges a screencast frame.
		"""
		try:
			await self.browser_session.cdp_client.send.Page.screencastFrameAck(
				params={'sessionId': event['sessionId']},
				session_id=session_id,
			)
		except Exception as e:
			self.logger.debug(f'[StreamingWatchdog] Failed to acknowledge screencast frame: {e}')

	async def on_BrowserStopEvent(self, event: BrowserStopEvent) -> None:
		"""
		Stops the streaming session.
		"""
		if self._screencast_active:
			self.logger.debug('[StreamingWatchdog] Stopping streaming...')
			self._screencast_active = False
			self._current_session_id = None
			self._screencast_params = None
