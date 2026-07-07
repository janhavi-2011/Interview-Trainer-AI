from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.routes import auth, health, query, questions, evaluation, history, dashboard, roadmap

settings = get_settings()

app = FastAPI(
    title="My RAG Project API",
    version="1.0.0",
    description="RAG application with IBM watsonx.ai",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(query.router, prefix="/api/query", tags=["RAG Query"])
app.include_router(questions.router, prefix="/api/questions", tags=["Questions"])
# app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(evaluation.router, prefix="/api/evaluate", tags=["Evaluation"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["Roadmap"])