from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from uuid import UUID
from models.user import User
from models.avatar import Avatar
from services.avatar_pipeline import AvatarPipeline
from services.storage_service import FileStorage
from api.routes_auth import requireUser
avatarRouter = APIRouter()
@avatarRouter.post("/generate")
async def createNewAvatar(backgroundTasks: BackgroundTasks, imageFile: UploadFile = File(...), currentUser: User = Depends(requireUser)):
    if (not imageFile.content_type.startswith("image/")):
        raise HTTPException(status_code=400, detail="file must be an image.")
    rawBytes = await imageFile.read()
    backgroundTasks.add_task(AvatarPipeline.runGeneration, currentUser, rawBytes)
    return {"message": "upload successful. avatar generation is processing."}
@avatarRouter.get("/list")
async def getMyAvatars(currentUser: User = Depends(requireUser)):
    userAvatars = await Avatar.find(Avatar.owner.id == currentUser.getUserId()).to_list()
    return userAvatars
@avatarRouter.delete("/{avatarId}")
async def deleteAvatar(avatarId: UUID, currentUser: User = Depends(requireUser)):
    avatarRecord = await Avatar.find_one(Avatar.avatar_id == avatarId, Avatar.owner.id == currentUser.getUserId())
    if (avatarRecord == None):
        raise HTTPException(status_code=404, detail="avatar not found or access denied.")
    FileStorage.wipeAvatarFiles(avatarRecord)
    await avatarRecord.delete()
    return {"message": "avatar and associated physical files permanently deleted."}