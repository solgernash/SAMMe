from fastapi import APIRouter

from app.db.store import avatars
from app.models.avatar import AvatarRecord

router = APIRouter(tags=["avatars"])


@router.get("/avatars", response_model=list[AvatarRecord])
def list_avatars() -> list[AvatarRecord]:
    return list(avatars.values())
