from pathlib import Path


class SAM3DBackend:
    """Real inference backend wrapping Meta's SAM 3D Body model.

    Only loads on the GPU machine. The checkpoint is loaded once at backend
    construction and kept warm in VRAM for the lifetime of the process.

    Setup on the GPU box (tracked separately in Milestone 1):
      1. Clone the SAM 3D Body repo and place its ``sam3d_body_estimator`` package on PYTHONPATH
         (or install it into the Conda env).
      2. Download ``model.ckpt`` (~1.69 GB) from HuggingFace; point SAM3D_CHECKPOINT at it.
      3. Start the server with INFERENCE_BACKEND=sam3d.
    """

    name = "sam3d"

    def __init__(self) -> None:
        import os

        from sam3d_body_estimator import SAM3DBodyEstimator

        checkpoint = os.environ.get("SAM3D_CHECKPOINT")
        if not checkpoint:
            raise RuntimeError("SAM3D_CHECKPOINT env var must point to model.ckpt")
        self._estimator = SAM3DBodyEstimator(checkpoint_path=checkpoint)

    def estimate(self, image_path: Path, output_path: Path) -> None:
        import trimesh

        result = self._estimator.estimate(str(image_path))
        mesh = trimesh.Trimesh(
            vertices=result.vertices,
            faces=result.faces,
            visual=trimesh.visual.TextureVisuals(image=result.texture)
            if getattr(result, "texture", None) is not None
            else None,
        )
        output_path.parent.mkdir(parents=True, exist_ok=True)
        mesh.export(output_path, file_type="glb")
