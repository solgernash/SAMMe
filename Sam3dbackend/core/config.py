import os
from pydantic_settings import BaseSettings
class AppConfig(BaseSettings):
    db_url: str = "mongodb://localhost:27017"
    db_name: str = "sam3d_avatars"
    comfy_api_url: str = "http://127.0.0.1:8188"
    storage_folder: str = "F:/MeshAndPoseStorage"
    class Config:
        env_file = ".env"
    def getDbUrl(self) -> str:
        return self.db_url
    def getDbName(self) -> str:
        return self.db_name
    def getComfyApiUrl(self) -> str:
        return self.comfy_api_url
    def getStorageFolder(self) -> str:
        return self.storage_folder
appConfig = AppConfig()
os.makedirs(appConfig.getStorageFolder(), exist_ok=True)