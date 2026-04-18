from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    full_name: str
    roll_number: str
    department: str
    batch: str
    phone: str
    address: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_profile_complete: bool
    
    class Config:
        orm_mode = True
        from_attributes = True
