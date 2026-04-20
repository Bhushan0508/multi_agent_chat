import random
import time
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from core.database import settings

# JWT Setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

# OTP Mock Service
# In production, this would integrate with Twilio/Firebase
class OTPService:
    def __init__(self):
        # phone -> {otp, expires}
        self.otps = {}

    def generate_otp(self, phone: str):
        otp = str(random.randint(100000, 999999))
        self.otps[phone] = {
            "otp": otp,
            "expires": time.time() + (settings.OTP_EXPIRE_MINUTES * 60)
        }
        print(f"DEBUG: OTP for {phone} is {otp}") # Mock SMS delivery
        return otp

    def verify_otp(self, phone: str, otp: str):
        if phone not in self.otps:
            return False
        
        data = self.otps[phone]
        if time.time() > data["expires"]:
            del self.otps[phone]
            return False
            
        if data["otp"] == otp:
            del self.otps[phone]
            return True
            
        return False

otp_service = OTPService()
