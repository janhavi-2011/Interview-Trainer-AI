from fastapi import APIRouter, Depends, HTTPException
from app.schemas.roadmap import RoadmapRequest, RoadmapResponse
from app.services.roadmap_service import generate_roadmap
from app.api.deps import get_current_user
from app.core.database import get_mongo_db
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()


@router.post("/generate", response_model=RoadmapResponse)
async def generate_study_roadmap(
    request: RoadmapRequest,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """Generate a personalized study roadmap based on weak topics."""
    
    if request.duration_days not in [7, 15]:
        raise HTTPException(
            status_code=400,
            detail="duration_days must be 7 or 15",
        )

    result = await generate_roadmap(
        user_id=str(current_user["_id"]),
        db=db,
        duration_days=request.duration_days,
        focus_categories=request.focus_categories,
    )

    return result