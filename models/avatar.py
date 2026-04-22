from beanie import Document, Link
from pydantic import Field
from typing import Optional
from uuid import UUID, uuid4
from models.user import User
class Avatar(Document):
    avatar_id: UUID = Field(default_factory=uuid4)
    owner: Link[User]
    status: str 
    image_path: str
    mesh_path: Optional[str] = None
    pose_path: Optional[str] = None
    class Settings:
        name = "avatars"
    def getAvatarId(self) -> UUID:
        return self.avatar_id
    def getOwner(self) -> Link[User]:
        return self.owner
    def getStatus(self) -> str:
        return self.status
    def setStatus(self, newStatus: str):
        self.status = newStatus
    def getImagePath(self) -> str:
        return self.image_path
    def setImagePath(self, newPath: str):
        self.image_path = newPath
    def getMeshPath(self) -> Optional[str]:
        return self.mesh_path
    def setMeshPath(self, newPath: str):
        self.mesh_path = newPath
    def getPosePath(self) -> Optional[str]:
        return self.pose_path
    def setPosePath(self, newPath: str):
        self.pose_path = newPath