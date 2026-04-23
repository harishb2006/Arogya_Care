from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/admin", tags=["admin"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def admin_login(req: LoginRequest):
    # Verify from .env
    admin_user = os.getenv("ADMIN_USERNAME")
    admin_pass = os.getenv("ADMIN_PASSWORD")
    
    if req.username == admin_user and req.password == admin_pass:
        return {"token": "ADMIN_AUTH_TOKEN_SECRET_XYZ123"}
    raise HTTPException(status_code=401, detail="Invalid admin credentials")
