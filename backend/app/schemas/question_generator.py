from pydantic import BaseModel
from typing import List, Optional


class QuestionGenerateRequest(BaseModel):
    role: str  # e.g., "Software Engineer", "Data Scientist", "Product Manager"
    experience_level: str  # "junior", "mid", "senior", "lead"
    company: Optional[str] = None  # e.g., "Google", "Amazon"
    categories: Optional[List[str]] = ["all"]  # dsa, hr, behavioral, system_design
    num_questions: Optional[int] = 10  # 10-15
    focus_topics: Optional[List[str]] = None  # e.g., ["arrays", "caching", "leadership"]


class InterviewQuestion(BaseModel):
    question: str
    category: str  # dsa, hr, behavioral, system_design
    difficulty: str  # Easy, Medium, Hard
    topic: str
    hint: Optional[str] = None
    evaluation_criteria: List[str]


class QuestionGenerateResponse(BaseModel):
    role: str
    experience_level: str
    company: Optional[str]
    questions: List[InterviewQuestion]
    total_questions: int
    categories_covered: List[str]