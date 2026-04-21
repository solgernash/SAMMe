from pathlib import Path

import numpy as np
import trimesh
from PIL import Image


class StubBackend:
    """Dev-only backend used when no NVIDIA GPU is available.

    Produces a procedurally-generated low-poly humanoid as a static .glb so
    the rest of the pipeline (queue, storage, frontend viewer) can be built
    and tested without SAM 3D Body. The real LocalSAM3DBackend is a drop-in
    replacement — only this file differs.
    """

    name = "stub"

    def estimate(self, image_path: Path, output_path: Path) -> None:
        with Image.open(image_path) as img:
            img.verify()

        mesh = _build_humanoid_proxy()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        mesh.export(output_path, file_type="glb")


SKIN = [220, 180, 160, 255]
SHIRT = [80, 120, 200, 255]
PANTS = [60, 60, 80, 255]

# Trimesh cylinders are along Z by default; glTF is Y-up, so rotate arms/legs.
_CYL_ALONG_Y = trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0])
_CYL_ALONG_X = trimesh.transformations.rotation_matrix(np.pi / 2, [0, 1, 0])


def _part(mesh: trimesh.Trimesh, color: list[int], translate: list[float]) -> trimesh.Trimesh:
    mesh.apply_translation(translate)
    mesh.visual.vertex_colors = color
    return mesh


def _build_humanoid_proxy() -> trimesh.Trimesh:
    parts: list[trimesh.Trimesh] = [
        _part(trimesh.creation.icosphere(subdivisions=2, radius=0.13), SKIN, [0.0, 1.73, 0.0]),
        _part(trimesh.creation.box(extents=[0.40, 0.60, 0.22]), SHIRT, [0.0, 1.30, 0.0]),
        _part(trimesh.creation.cylinder(radius=0.05, height=0.60, transform=_CYL_ALONG_X), SKIN, [-0.50, 1.50, 0.0]),
        _part(trimesh.creation.cylinder(radius=0.05, height=0.60, transform=_CYL_ALONG_X), SKIN, [0.50, 1.50, 0.0]),
        _part(trimesh.creation.cylinder(radius=0.07, height=0.80, transform=_CYL_ALONG_Y), PANTS, [-0.11, 0.60, 0.0]),
        _part(trimesh.creation.cylinder(radius=0.07, height=0.80, transform=_CYL_ALONG_Y), PANTS, [0.11, 0.60, 0.0]),
    ]
    return trimesh.util.concatenate(parts)
