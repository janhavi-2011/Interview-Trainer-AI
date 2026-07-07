from fastapi import APIRouter, Depends, HTTPException
from app.schemas.question_generator import QuestionGenerateRequest, QuestionGenerateResponse
from app.services.question_generator_service import generate_interview_questions
from app.api.deps import get_current_user
from app.core.database import get_mongo_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

router = APIRouter()


@router.post("/generate", response_model=QuestionGenerateResponse)
async def generate_questions(
    request: QuestionGenerateRequest,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """Generate interview questions based on role, experience level, and company."""
    
    # Validate experience level
    valid_levels = ["junior", "mid", "senior", "lead"]
    if request.experience_level not in valid_levels:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid experience level. Valid: {valid_levels}",
        )

    # Validate num_questions
    if request.num_questions < 1 or request.num_questions > 20:
        raise HTTPException(
            status_code=400,
            detail="num_questions must be between 1 and 20",
        )

    # Validate categories
    valid_categories = ["dsa", "hr", "behavioral", "system_design", "all"]
    for cat in request.categories:
        if cat not in valid_categories:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category: {cat}. Valid: {valid_categories}",
            )

    # Generate questions
    try:
        result = generate_interview_questions(
            role=request.role,
            experience_level=request.experience_level,
            company=request.company,
            categories=request.categories,
            num_questions=request.num_questions,
            focus_topics=request.focus_topics,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Question generation error: {str(e)}",
        )

    # Store generation in MongoDB
    gen_doc = {
        "user_id": str(current_user["_id"]),
        "role": request.role,
        "experience_level": request.experience_level,
        "company": request.company,
        "num_questions": result["total_questions"],
        "categories": request.categories,
        "created_at": datetime.utcnow(),
    }
    await db.question_generations.insert_one(gen_doc)

    return result


@router.get("/generations/history")
async def get_generation_history(
    page: int = 1,
    limit: int = 20,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """Get user's question generation history."""
    skip = (page - 1) * limit
    
    generations = await db.question_generations.find(
        {"user_id": str(current_user["_id"])}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    total = await db.question_generations.count_documents(
        {"user_id": str(current_user["_id"])}
    )
    
    for g in generations:
        g["_id"] = str(g["_id"])
    
    return {
        "generations": generations,
        "total": total,
        "page": page,
        "limit": limit,
    }

@router.get("/companies")
async def get_available_companies():
    """Get list of available companies for prep mode."""
    companies = [
        {
            "id": "google",
            "name": "Google",
            "focus": ["System Design", "Scalability", "Googliness"],
            "difficulty": "Hard",
            "description": "Focus on distributed systems, scale, and behavioral fit.",
            "icon": "🔵",
        },
        {
            "id": "amazon",
            "name": "Amazon",
            "focus": ["Leadership Principles", "System Design", "Behavioral"],
            "difficulty": "Hard",
            "description": "Heavy behavioral focus on 16 Leadership Principles.",
            "icon": "🟠",
        },
        {
            "id": "microsoft",
            "name": "Microsoft",
            "focus": ["Growth Mindset", "System Design", "DSA"],
            "difficulty": "Medium",
            "description": "Values growth mindset, collaboration, and Azure knowledge.",
            "icon": "🟢",
        },
        {
            "id": "tcs",
            "name": "TCS",
            "focus": ["Fundamentals", "Aptitude", "HR"],
            "difficulty": "Easy",
            "description": "Focus on basics, stability, and process adherence.",
            "icon": "🔵",
        },
        {
            "id": "infosys",
            "name": "Infosys",
            "focus": ["CLIFE Values", "Fundamentals", "Training"],
            "difficulty": "Easy",
            "description": "Values ethics, learning agility, and quality focus.",
            "icon": "🔷",
        },
    ]
    return {"companies": companies}