# pyrefly: ignore [missing-import]
from bson import ObjectId
from datetime import datetime
from db import problems_collection
from models.problem import ProblemCreate

def serialize_problem(problem: dict) -> dict:
    problem["id"] = str(problem["_id"])
    problem["user_id"] = str(problem["user_id"])
    del problem["_id"]
    return problem

def get_user_problems(user_id: ObjectId) -> list:
    problems = list(problems_collection.find({"user_id": user_id}).sort("solved_at", -1))
    return [serialize_problem(p) for p in problems]

def add_user_problem(problem_data: ProblemCreate, user_id: ObjectId) -> dict:
    problem_dict = problem_data.dict()
    problem_dict["user_id"] = user_id
    problem_dict["solved_at"] = datetime.utcnow()
    
    result = problems_collection.insert_one(problem_dict)
    problem_dict["_id"] = result.inserted_id
    return serialize_problem(problem_dict)

def delete_user_problem(problem_id: str, user_id: ObjectId) -> bool:
    if not ObjectId.is_valid(problem_id):
        raise ValueError("Invalid problem ID")
        
    result = problems_collection.delete_one({"_id": ObjectId(problem_id), "user_id": user_id})
    if result.deleted_count == 0:
        raise ValueError("Problem not found or unauthorized")
    
    return True
