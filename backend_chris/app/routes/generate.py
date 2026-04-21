import asyncio
import logging

from fastapi import APIRouter, HTTPException, status

from app.db.store import avatars
from app.models.avatar import AvatarRecord, GenerateRequest
from app.services.avatar_service import (
    AVATARS_DIR,
    mark_avatar_failed,
    mark_avatar_processing,
    mark_avatar_ready,
    resolve_upload_path,
)
from app.services.inference import get_backend
from app.services.inference.runner import run_inference

logger = logging.getLogger(__name__)

router = APIRouter(tags=["generate"])


@router.post("/generate", response_model=AvatarRecord)
async def generate_avatar(payload: GenerateRequest) -> AvatarRecord:
    if payload.id not in avatars:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avatar id not found. Upload an image first.",
        )

    record = mark_avatar_processing(payload.id)
    asyncio.create_task(_process_avatar(payload.id))
    return record


async def _process_avatar(avatar_id: str) -> None:
    try:
        backend = get_backend()
        record = avatars[avatar_id]
        if not record.imageUrl:
            raise RuntimeError("avatar record is missing imageUrl")

        image_path = resolve_upload_path(record.imageUrl)
        output_name = f"{avatar_id}.glb"
        output_path = AVATARS_DIR / output_name

        await run_inference(backend, image_path, output_path)
        mark_avatar_ready(avatar_id, f"/static/avatars/{output_name}")
    except Exception as exc:
        logger.exception("inference failed for avatar %s", avatar_id)
        mark_avatar_failed(avatar_id, str(exc))
