# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, Depends
# pyrefly: ignore [missing-import]
from fastapi.security import OAuth2PasswordBearer
from datetime import date
from models.user import UserSignup, UserLogin
from services.auth_service import signup_user, authenticate_user, create_access_token, verify_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user_from_token(token: str = Depends(oauth2_scheme)):
    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token or user not found")
    return user

@router.post("/signup")
def signup(user: UserSignup):
    try:
        user_id = signup_user(user)
        token = create_access_token(data={"sub": user_id})
        return {"success": True, "data": {"token": token}}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(user: UserLogin):
    try:
        user_id = authenticate_user(user)
        token = create_access_token(data={"sub": user_id})
        return {"success": True, "data": {"token": token}}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user_from_token)):
    user_data = {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "daily_hint_count": current_user.get("daily_hint_count", 0),
        "last_reset_date": current_user.get("last_reset_date", date.today().isoformat())
    }
    return {"success": True, "data": user_data}
