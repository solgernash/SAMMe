from pydantic import BaseModel, Field


class AvatarRecord(BaseModel):
    id: str
    status: str = "processing"
    imageUrl: str | None = None
    modelUrl: str | None = None
    error: str | None = None


class GenerateRequest(BaseModel):
    id: str = Field(..., description="Avatar id returned from POST /upload")


class HealthResponse(BaseModel):
    status: str
