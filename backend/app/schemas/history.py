from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class QuestionAnswerPair(BaseModel):
    question: str
    category: str
    difficulty: str
    user_answer: str
    scores: dict  # {accuracy, clarity, completeness, confidence}
    overall_score: int
    feedback: Optional[str] = None


class SaveSessionRequest(BaseModel):
    session_name: Optional[str] = None
    role: str
    experience_level: str
    company: Optional[str] = None
    questions: List[QuestionAnswerPair]


class SessionResponse(BaseModel):
    id: str
    session_name: Optional[str]
    role: str
    experience_level: str
    company: Optional[str]
    questions: List[dict]
    overall_score: int
    created_at: datetime