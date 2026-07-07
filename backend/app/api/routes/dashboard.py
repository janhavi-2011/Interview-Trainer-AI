from fastapi import APIRouter, Depends
from app.services.dashboard_service import get_dashboard_stats
from app.api.deps import get_current_user
from app.core.database import get_mongo_db
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()


@router.get("/stats")
async def get_dashboard(
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    """Get aggregated dashboard statistics for the current user."""
    
    stats = await get_dashboard_stats(
        user_id=str(current_user["_id"]),
        db=db,
    )
    return stats