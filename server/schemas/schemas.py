from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    phone: str
    name: Optional[str] = None
    about: Optional[str] = "Hey there! I am using WhatsApp AI."

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    profile_pic: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str

class MessageBase(BaseModel):
    receiver_id: int
    content: str
    is_group: bool = False
    type: str = "text"

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True
