from fastapi import APIRouter, Depends, HTTPException
from app.schemas.history import SaveSessionRequest, SessionResponse
from app.api.deps import get_current_user
from app.core.database import get_mongo_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId

router = APIRouter()


@router.post("/session")
async def save_interview_session(
    request: SaveSessionRequest,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """Save a complete interview session."""
    
    # Calculate overall session score
    if request.questions:
        avg_score = sum(q.overall_score for q in request.questions) / len(request.questions)
    else:
        avg_score = 0

    # Calculate category breakdown
    category_scores = {}
    for q in request.questions:
        if q.category not in category_scores:
            category_scores[q.category] = []
        category_scores[q.category].append(q.overall_score)

    category_avg = {
        cat: sum(scores) / len(scores) 
        for cat, scores in category_scores.items()
    }

    session_doc = {
        "user_id": str(current_user["_id"]),
        "session_name": request.session_name or f"Session {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
        "role": request.role,
        "experience_level": request.experience_level,
        "company": request.company,
        "questions": [q.model_dump() for q in request.questions],
        "overall_score": round(avg_score),
        "category_scores": category_avg,
        "total_questions": len(request.questions),
        "created_at": datetime.utcnow(),
    }

    result = await db.interview_sessions.insert_one(session_doc)

    return {
        "id": str(result.inserted_id),
        "message": "Session saved successfully",
        "overall_score": round(avg_score),
        "category_scores": category_avg,
    }


@router.get("/sessions")
async def get_sessions(
    page: int = 1,
    limit: int = 20,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """Get user's interview sessions."""
    skip = (page - 1) * limit
    
    sessions = await db.interview_sessions.find(
        {"user_id": str(current_user["_id"])}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    total = await db.interview_sessions.count_documents(
        {"user_id": str(current_user["_id"])}
    )
    
    for s in sessions:
        s["_id"] = str(s["_id"])
    
    return {
        "sessions": sessions,
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.get("/session/{session_id}")
async def get_session_detail(
    session_id: str,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """Get detailed session by ID."""
    
    session = await db.interview_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": str(current_user["_id"]),
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session["_id"] = str(session["_id"])
    return session


@router.delete("/session/{session_id}")
async def delete_session(
    session_id: str,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """Delete an interview session."""
    
    result = await db.interview_sessions.delete_one({
        "_id": ObjectId(session_id),
        "user_id": str(current_user["_id"]),
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session deleted successfully"}