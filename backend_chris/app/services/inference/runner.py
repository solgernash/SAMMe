import asyncio
from pathlib import Path

from .base import InferenceBackend

_gpu_lock = asyncio.Lock()


async def run_inference(backend: InferenceBackend, image_path: Path, output_path: Path) -> None:
    """Serialize inference through a single GPU lock and run off the event loop."""
    async with _gpu_lock:
        await asyncio.to_thread(backend.estimate, image_path, output_path)
