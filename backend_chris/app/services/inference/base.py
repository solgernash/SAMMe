from pathlib import Path
from typing import Protocol


class InferenceBackend(Protocol):
    name: str

    def estimate(self, image_path: Path, output_path: Path) -> None:
        """Produce a .glb avatar from ``image_path`` and write it to ``output_path``.

        Implementations are synchronous (called from a worker thread by the
        runner). Raise on failure; the runner converts exceptions into a
        'failed' status on the avatar record.
        """
        ...
