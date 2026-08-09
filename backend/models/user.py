# pyrefly: ignore [missing-import]
from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    daily_hint_count: int
    last_reset_date: date
