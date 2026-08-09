# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ProblemCreate(BaseModel):
    problem_name: str
    difficulty: str
    topic: str
    pattern: str
    confidence: str
    solve_time: Optional[int] = None
    hint_needed: bool = False
    core_insight: str = ""
    interview_frequency: str = "Low"
    source: str = ""
    notes: str = ""

class ProblemResponse(ProblemCreate):
    id: str
    user_id: str
    solved_at: datetime
