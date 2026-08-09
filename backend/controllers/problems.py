# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
from controllers.auth import get_current_user_from_token
from models.problem import ProblemCreate
from services.problem_service import get_user_problems, add_user_problem, delete_user_problem

router = APIRouter()

@router.get("/")
def get_problems(current_user: dict = Depends(get_current_user_from_token)):
    try:
        problems = get_user_problems(current_user["_id"])
        return {"success": True, "data": problems}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def add_problem(problem: ProblemCreate, current_user: dict = Depends(get_current_user_from_token)):
    try:
        result = add_user_problem(problem, current_user["_id"])
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{problem_id}")
def delete_problem(problem_id: str, current_user: dict = Depends(get_current_user_from_token)):
    try:
        delete_user_problem(problem_id, current_user["_id"])
        return {"success": True, "data": {"deleted": True}}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
