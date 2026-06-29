from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime

from db import problems_collection
from routes.auth import get_current_user_from_token
from models.problem import ProblemCreate

router = APIRouter()

def serialize_problem(problem):
    problem["id"] = str(problem["_id"])
    problem["user_id"] = str(problem["user_id"])
    del problem["_id"]
    return problem

@router.get("/")
def get_problems(current_user: dict = Depends(get_current_user_from_token)):
    problems = list(problems_collection.find({"user_id": current_user["_id"]}).sort("solved_at", -1))
    serialized = [serialize_problem(p) for p in problems]
    return {"success": True, "data": serialized}

@router.post("/")
def add_problem(problem: ProblemCreate, current_user: dict = Depends(get_current_user_from_token)):
    problem_dict = problem.dict()
    problem_dict["user_id"] = current_user["_id"]
    problem_dict["solved_at"] = datetime.utcnow()
    
    result = problems_collection.insert_one(problem_dict)
    problem_dict["_id"] = result.inserted_id
    
    return {"success": True, "data": serialize_problem(problem_dict)}

@router.delete("/{problem_id}")
def delete_problem(problem_id: str, current_user: dict = Depends(get_current_user_from_token)):
    if not ObjectId.is_valid(problem_id):
        raise HTTPException(status_code=400, detail="Invalid problem ID")
        
    result = problems_collection.delete_one({"_id": ObjectId(problem_id), "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Problem not found or unauthorized")
        
    return {"success": True, "data": {"deleted": True}}
