from pydantic import BaseModel
from typing import List, Optional


class EvaluateAnswerRequest(BaseModel):
    question: str
    user_answer: str
    category: str  # dsa, hr, behavioral, system_design
    difficulty: Optional[str] = "Medium"
    expected_context: Optional[str] = None  # Optional RAG context


class ScoreDetail(BaseModel):
    accuracy: int      # 0-100
    clarity: int       # 0-100
    completeness: int  # 0-100
    confidence: int    # 0-100


class EvaluateAnswerResponse(BaseModel):
    question: str
    user_answer: str
    scores: ScoreDetail
    overall_score: int  # 0-100
    feedback: str
    improved_answer: str