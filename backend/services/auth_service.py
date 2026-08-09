import os
from datetime import datetime, timedelta
# pyrefly: ignore [missing-import]
import bcrypt
from jose import JWTError, jwt
# pyrefly: ignore [missing-import]
from bson import ObjectId
from db import users_collection
from models.user import UserSignup, UserLogin

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            return None
        return users_collection.find_one({"_id": ObjectId(user_id)})
    except JWTError:
        return None

def signup_user(user: UserSignup) -> str:
    if users_collection.find_one({"email": user.email}):
        raise ValueError("Email already registered")
    
    user_dict = user.dict()
    user_dict["password"] = get_password_hash(user.password)
    user_dict["created_at"] = datetime.utcnow()
    user_dict["daily_hint_count"] = 0
    user_dict["last_reset_date"] = datetime.utcnow().date().isoformat()
    
    result = users_collection.insert_one(user_dict)
    return str(result.inserted_id)

def authenticate_user(user: UserLogin) -> str:
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise ValueError("Invalid email or password")
    
    return str(db_user["_id"])
