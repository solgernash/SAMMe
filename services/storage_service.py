import os
from uuid import UUID
from core.config import config
from models.avatar import Avatar

class FileStorage:
    
    @staticmethod
    def getUserFolder(userId: UUID) -> str:
        userFolder = os.path.join(config.storage_folder, str(userId))
        os.makedirs(userFolder, exist_ok=True)
        return userFolder
    @staticmethod
    def saveUploadedPhoto(userId: UUID, genId: UUID, imageData: bytes) -> str:
        folder = FileStorage.getUserFolder(userId)
        fileName = str(genId) + "_raw.jpg"
        fullPath = os.path.join(folder, fileName)
        with open(fullPath, "wb") as f:
            f.write(imageData)
        return fullPath
    @staticmethod
    def wipeAvatarFiles(avatar: Avatar):
        filesToDelete = [
            avatar.getImagePath(),
            avatar.getMeshPath(),
            avatar.getPosePath()
        ]
        for filePath in filesToDelete:
            if (filePath != None):
                if (filePath != ""):
                    if (os.path.exists(filePath)):
                        os.remove(filePath)