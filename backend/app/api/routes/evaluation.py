from fastapi import APIRouter, Depends, HTTPException
from app.schemas.evaluation import EvaluateAnswerRequest, EvaluateAnswerResponse
from app.services.evaluation_service import evaluate_answer
from app.services.rag_service import retrieve_context
from app.api.deps import get_current_user
from app.core.database import get_mongo_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

router = APIRouter()


@router.post("/answer", response_model=EvaluateAnswerResponse)
async def evaluate_user_answer(
    request: EvaluateAnswerRequest,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """Evaluate a user's interview answer."""
    
    # Optionally retrieve context for better evaluation
    expected_context = None
    if request.expected_context:
        expected_context = request.expected_context
    else:
        # Auto-retrieve from RAG
        try:
            retrieval = retrieve_context(
                query=request.question,
                categories=[request.category] if request.category != "all" else None,
                n_results=2,
            )
            expected_context = retrieval["context"][:1000]
        except Exception:
            pass

    # Evaluate
    try:
        result = evaluate_answer(
            question=request.question,
            user_answer=request.user_answer,
            category=request.category,
            difficulty=request.difficulty,
            expected_context=expected_context,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Evaluation error: {str(e)}",
        )

    # Store evaluation in MongoDB
    eval_doc = {
        "user_id": str(current_user["_id"]),
        "question": request.question,
        "user_answer": request.user_answer,
        "category": request.category,
        "difficulty": request.difficulty,
        "scores": result["scores"],
        "overall_score": result["overall_score"],
        "feedback": result["feedback"],
        "created_at": datetime.utcnow(),
    }
    await db.evaluations.insert_one(eval_doc)

    return result