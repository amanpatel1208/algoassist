# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from pydantic import BaseModel

from controllers.auth import get_current_user_from_token
from services.chat_service import (
    start_chat_session,
    get_user_sessions,
    get_session_by_id,
    handle_chat_message,
    finish_chat_session
)

router = APIRouter()

class StartSession(BaseModel):
    problem_name: str

class SendMessage(BaseModel):
    session_id: str
    message: str

class FinishSession(BaseModel):
    session_id: str

@router.post("/start")
def start_session(data: StartSession, current_user: dict = Depends(get_current_user_from_token)):
    try:
        session = start_chat_session(data.problem_name, current_user["_id"])
        return {"success": True, "data": session}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
def get_sessions(current_user: dict = Depends(get_current_user_from_token)):
    try:
        sessions = get_user_sessions(current_user["_id"])
        return {"success": True, "data": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
def get_session(session_id: str, current_user: dict = Depends(get_current_user_from_token)):
    try:
        session = get_session_by_id(session_id, current_user["_id"])
        return {"success": True, "data": session}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/message")
def send_message(data: SendMessage, current_user: dict = Depends(get_current_user_from_token)):
    try:
        result = handle_chat_message(data.session_id, data.message, current_user)
        return {"success": True, "data": result}
    except ValueError as e:
        if str(e) == "Daily hint limit reached":
            raise HTTPException(status_code=429, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/finish")
def finish_session(data: FinishSession, current_user: dict = Depends(get_current_user_from_token)):
    try:
        result = finish_chat_session(data.session_id, current_user["_id"])
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
