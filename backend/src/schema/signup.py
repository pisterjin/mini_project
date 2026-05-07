from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class SignupRequest(BaseModel):
    username: str
    password: str
    full_name: str
    email: EmailStr
    gender: str                              # 'MALE' 또는 'FEMALE'
    birth_date: Optional[date] = None        # NULL 허용
    phone_number: Optional[str] = None       # NULL 허용
    telecom_provider: Optional[str] = None   # NULL 허용
    social_provider: str = "local"      # 기본값이 "local" 문자열
    social_id: Optional[str] = None     # 기본값이 None (NULL)


    