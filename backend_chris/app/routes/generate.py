from fastapi import APIRouter, HTTPException, status

from app.db.store import avatars
from app.models.avatar import AvatarRecord, GenerateRequest
from app.services.avatar_service import mark_avatar_processing

router = APIRouter(tags=["generate"])


@router.post("/generate", response_model=AvatarRecord)
def generate_avatar(payload: GenerateRequest) -> AvatarRecord:
    if payload.id not in avatars:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avatar id not found. Upload an image first.",
        )

    return mark_avatar_processing(payload.id)
