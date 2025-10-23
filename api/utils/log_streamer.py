import asyncio
import logging
from queue import Queue, Empty
from typing import AsyncGenerator


class QueueHandler(logging.Handler):
    """Custom logging handler that puts log records into a queue."""

    def __init__(self, log_queue: Queue):
        super().__init__()
        self.log_queue = log_queue

    def emit(self, record: logging.LogRecord):
        try:
            msg = self.format(record)
            self.log_queue.put(msg)
        except Exception:
            self.handleError(record)


class LogStreamer:
    """Manages log streaming for jobs."""

    def __init__(self):
        self.job_queues: dict[str, Queue] = {}
        self.job_loggers: dict[str, logging.Logger] = {}

    def create_job_logger(self, job_id: str) -> logging.Logger:
        """Create a logger for a specific job."""
        if job_id in self.job_loggers:
            return self.job_loggers[job_id]

        log_queue = Queue()
        self.job_queues[job_id] = log_queue

        # Create a logger for this job
        logger = logging.getLogger(f"job.{job_id}")
        logger.setLevel(logging.INFO)
        logger.propagate = False

        # Remove existing handlers
        logger.handlers.clear()

        # Add queue handler
        queue_handler = QueueHandler(log_queue)
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        queue_handler.setFormatter(formatter)
        logger.addHandler(queue_handler)

        self.job_loggers[job_id] = logger
        return logger

    async def stream_logs(self, job_id: str) -> AsyncGenerator[str, None]:
        """Stream logs for a specific job via SSE."""
        if job_id not in self.job_queues:
            yield f"data: Error: Job {job_id} not found\n\n"
            return

        log_queue = self.job_queues[job_id]
        consecutive_empty_checks = 0
        max_empty_checks = 60  # Stop after 30 seconds of no activity (60 * 0.5s)

        while True:
            try:
                # Non-blocking get with timeout
                try:
                    msg = log_queue.get_nowait()
                    yield f"data: {msg}\n\n"
                    consecutive_empty_checks = 0  # Reset counter when we get a message
                except Empty:
                    consecutive_empty_checks += 1
                    # No logs available, yield a keep-alive ping
                    await asyncio.sleep(0.5)
                    yield ": ping\n\n"
                    
                    # Stop streaming if no activity for too long
                    if consecutive_empty_checks >= max_empty_checks:
                        yield f"data: Job {job_id} completed or inactive\n\n"
                        break
            except Exception as e:
                yield f"data: Error streaming logs: {str(e)}\n\n"
                break

    def mark_job_completed(self, job_id: str):
        """Mark a job as completed by adding a completion message to the queue."""
        if job_id in self.job_queues:
            log_queue = self.job_queues[job_id]
            log_queue.put("Job completed successfully.")

    def cleanup_job(self, job_id: str):
        """Clean up resources for a completed job."""
        if job_id in self.job_loggers:
            logger = self.job_loggers[job_id]
            logger.handlers.clear()
            del self.job_loggers[job_id]

        if job_id in self.job_queues:
            del self.job_queues[job_id]


# Global log streamer instance
log_streamer = LogStreamer()

