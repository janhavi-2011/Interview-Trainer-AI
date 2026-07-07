from pydantic import BaseModel
from typing import List, Optional


class RAGQueryRequest(BaseModel):
    question: str
    categories: Optional[List[str]] = ["all"]  # dsa, hr, behavioral, system_design, all
    n_results: Optional[int] = 5
    max_tokens: Optional[int] = 1024
    temperature: Optional[float] = 0.3


class RAGQueryResponse(BaseModel):
    question: str
    answer: str
    sources: List[dict]
    context_used: str
    total_sources_found: int


class ContextOnlyRequest(BaseModel):
    query: str
    categories: Optional[List[str]] = ["all"]
    n_results: Optional[int] = 5


class ContextOnlyResponse(BaseModel):
    context: str
    sources: List[dict]
    total_retrieved: int
    top_results_count: int