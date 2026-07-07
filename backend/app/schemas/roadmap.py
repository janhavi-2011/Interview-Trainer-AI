from pydantic import BaseModel
from typing import List, Optional


class RoadmapRequest(BaseModel):
    duration_days: int = 7  # 7 or 15
    focus_categories: Optional[List[str]] = None  # If None, uses weak topics


class DayPlan(BaseModel):
    day: int
    title: str
    topics: List[str]
    tasks: List[str]
    resources: List[dict]  # {title, url, type}
    estimated_hours: float


class RoadmapResponse(BaseModel):
    duration_days: int
    weak_topics: List[str]
    plan: List[DayPlan]
    total_estimated_hours: float