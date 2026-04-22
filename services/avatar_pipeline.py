import os
from core.inference_queue import GpuQueue
from services.storage_service import FileStorage
from services.comfy_client import ComfyUIClient
from services.bpy_processor import BpyProcessor
from models.avatar import Avatar
from models.user import User
class AvatarPipeline:
    @staticmethod
    async def runGeneration(user: User, rawImageBytes: bytes):
        avatarRecord = Avatar(owner=user, status="processing", image_path="")
        await avatarRecord.insert()
        try:
            savedImg = FileStorage.saveUploadedPhoto(userId=user.getUserId(), genId=avatarRecord.getAvatarId(), imageData=rawImageBytes)
            avatarRecord.setImagePath(savedImg)
            await avatarRecord.save()
            targetFolder = os.path.dirname(savedImg)
            await GpuQueue.waitInLine()
            try:
                fbxOutput = await ComfyUIClient.processImage(imagePath=savedImg, outputDir=targetFolder)
                meshOutput, poseOutput = await BpyProcessor.runDoubleExtraction(fbxPath=fbxOutput, userId=str(user.getUserId()), avatarId=str(avatarRecord.getAvatarId()))
                avatarRecord.setMeshPath(meshOutput)
                avatarRecord.setPosePath(poseOutput)
                avatarRecord.setStatus("ready")
                await avatarRecord.save()
            finally:
                GpuQueue.doneProcessing()
        except Exception as err:
            print("generation broke for " + str(avatarRecord.getAvatarId()) + ": " + str(err))
            FileStorage.wipeAvatarFiles(avatarRecord)
            if (avatarRecord.getImagePath() != None):
                if (avatarRecord.getImagePath() != ""):
                    strayFbx = os.path.join(os.path.dirname(avatarRecord.getImagePath()), "sam3d_rigged.fbx")
                    if (os.path.exists(strayFbx)):
                        os.remove(strayFbx)
            avatarRecord.setImagePath("")
            avatarRecord.setMeshPath(None)
            avatarRecord.setPosePath(None)
            avatarRecord.setStatus("failed")
            await avatarRecord.save()