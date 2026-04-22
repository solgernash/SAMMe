from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta, timezone
from models.user import User
authRouter = APIRouter()
crypto = CryptContext(schemes=["bcrypt"], deprecated="auto")
LOCAL_SECRET = "sam3d_local_dev_secret"
class AuthPayload(BaseModel):
    username: str
    password: str
@authRouter.post("/register")
async def signUp(payload: AuthPayload):
    existingUser = await User.find_one(User.username == payload.username)
    if (existingUser != None):
        raise HTTPException(status_code=400, detail="username is already taken")
    safePassword = crypto.hash(payload.password)
    newAccount = User(username=payload.username, password_hash=safePassword)
    await newAccount.insert()
    return {"message": "account created successfully"}
@authRouter.post("/login")
async def signIn(payload: AuthPayload):
    account = await User.find_one(User.username == payload.username)
    if ((account == None) or (not crypto.verify(payload.password, account.getPasswordHash()))):
        raise HTTPException(status_code=401, detail="incorrect username or password")
    expiration = datetime.now(timezone.utc) + timedelta(days=7)
    token = jwt.encode({"user": str(account.getUserId()), "exp": expiration}, LOCAL_SECRET, algorithm="HS256")
    return {"access_token": token}
async def requireUser(authorization: str = Header(...)) -> User:
    try:
        tokenString = authorization.split(" ")[1]
        decodedData = jwt.decode(tokenString, LOCAL_SECRET, algorithms=["HS256"])
        activeUser = await User.find_one(User.user_id == decodedData.get("user"))
        if (activeUser == None):
            raise HTTPException(status_code=401, detail="user account no longer exists")
        return activeUser
    except Exception:
        raise HTTPException(status_code=401, detail="invalid or expired session")