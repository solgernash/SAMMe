from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.db.store import avatars
from app.models.avatar import AvatarRecord

BASE_DIR = Path(__file__).resolve().parent.parent.parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
AVATARS_DIR = STORAGE_DIR / "avatars"


def _safe_filename(filename: str | None) -> str:
    original = Path(filename or "upload.jpg").name
    suffix = Path(original).suffix or ".jpg"
    return f"{uuid4().hex}{suffix.lower()}"


async def save_upload(file: UploadFile) -> AvatarRecord:
    avatar_id = uuid4().hex[:12]
    saved_name = _safe_filename(file.filename)
    destination = UPLOADS_DIR / saved_name

    content = await file.read()
    destination.write_bytes(content)

    avatar = AvatarRecord(
        id=avatar_id,
        status="processing",
        imageUrl=f"/static/uploads/{saved_name}",
        modelUrl=None,
    )
    avatars[avatar.id] = avatar
    return avatar


def mark_avatar_processing(avatar_id: str) -> AvatarRecord:
    avatar = avatars[avatar_id].model_copy(
        update={"status": "processing", "modelUrl": None, "error": None}
    )
    avatars[avatar_id] = avatar
    return avatar


def mark_avatar_ready(avatar_id: str, model_url: str) -> AvatarRecord:
    avatar = avatars[avatar_id].model_copy(
        update={"status": "ready", "modelUrl": model_url, "error": None}
    )
    avatars[avatar_id] = avatar
    return avatar


def mark_avatar_failed(avatar_id: str, error: str) -> AvatarRecord:
    avatar = avatars[avatar_id].model_copy(
        update={"status": "failed", "modelUrl": None, "error": error}
    )
    avatars[avatar_id] = avatar
    return avatar


def resolve_upload_path(image_url: str) -> Path:
    return UPLOADS_DIR / Path(image_url).name
