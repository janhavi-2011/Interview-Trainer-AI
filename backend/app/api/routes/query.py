from fastapi import APIRouter, Depends, HTTPException
from app.schemas.query import RAGQueryRequest, RAGQueryResponse, ContextOnlyRequest, ContextOnlyResponse
from app.services.rag_service import rag_query, retrieve_context
from app.api.deps import get_current_user
from app.core.database import get_mongo_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

router = APIRouter()


@router.post("/ask", response_model=RAGQueryResponse)
async def ask_question(
    request: RAGQueryRequest,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """Ask a question using the RAG pipeline."""
    
    # Validate categories
    valid_categories = ["dsa", "hr", "behavioral", "system_design", "all"]
    for cat in request.categories:
        if cat not in valid_categories:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category: {cat}. Valid: {valid_categories}",
            )

    # Run RAG pipeline
    try:
        result = rag_query(
            question=request.question,
            categories=request.categories,
            n_results=request.n_results,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"RAG pipeline error: {str(e)}",
        )

    # Store query history in MongoDB
    history_doc = {
        "user_id": str(current_user["_id"]),
        "question": request.question,
        "answer": result["answer"],
        "categories": request.categories,
        "sources_count": len(result["sources"]),
        "created_at": datetime.utcnow(),
    }
    await db.query_history.insert_one(history_doc)

    return result


@router.post("/context", response_model=ContextOnlyResponse)
async def get_context_only(
    request: ContextOnlyRequest,
    current_user=Depends(get_current_user),
):
    """Retrieve context from ChromaDB without generating an answer."""
    
    valid_categories = ["dsa", "hr", "behavioral", "system_design", "all"]
    for cat in request.categories:
        if cat not in valid_categories:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category: {cat}. Valid: {valid_categories}",
            )

    result = retrieve_context(
        query=request.query,
        categories=request.categories,
        n_results=request.n_results,
    )
    return result


@router.get("/history")
async def get_query_history(
    page: int = 1,
    limit: int = 20,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """Get user's query history."""
    skip = (page - 1) * limit
    
    queries = await db.query_history.find(
        {"user_id": str(current_user["_id"])}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    total = await db.query_history.count_documents(
        {"user_id": str(current_user["_id"])}
    )
    
    # Convert ObjectId to string
    for q in queries:
        q["_id"] = str(q["_id"])
    
    return {
        "queries": queries,
        "total": total,
        "page": page,
        "limit": limit,
    }