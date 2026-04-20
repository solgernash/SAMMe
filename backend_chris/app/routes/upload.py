from fastapi import APIRouter, File, UploadFile

from app.models.avatar import AvatarRecord
from app.services.avatar_service import save_upload

router = APIRouter(tags=["upload"])


@router.post("/upload", response_model=AvatarRecord)
async def upload_image(file: UploadFile = File(...)) -> AvatarRecord:
    return await save_upload(file)
