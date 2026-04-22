from beanie import Document
from pydantic import Field
from uuid import UUID, uuid4
class User(Document):
    user_id: UUID = Field(default_factory=uuid4)
    username: str
    password_hash: str
    class Settings:
        name = "users"
    def getUserId(self) -> UUID:
        return self.user_id
    def getUsername(self) -> str:
        return self.username
    def getPasswordHash(self) -> str:
        return self.password_hash
    def setPasswordHash(self, newHash: str):
        self.password_hash = newHash