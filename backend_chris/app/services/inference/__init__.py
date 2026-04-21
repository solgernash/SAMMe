import os
from functools import lru_cache

from .base import InferenceBackend


@lru_cache(maxsize=1)
def get_backend() -> InferenceBackend:
    name = os.environ.get("INFERENCE_BACKEND", "stub").lower()
    if name == "stub":
        from .stub import StubBackend
        return StubBackend()
    if name == "sam3d":
        from .sam3d import SAM3DBackend
        return SAM3DBackend()
    raise ValueError(f"Unknown INFERENCE_BACKEND: {name!r} (expected 'stub' or 'sam3d')")


__all__ = ["InferenceBackend", "get_backend"]
