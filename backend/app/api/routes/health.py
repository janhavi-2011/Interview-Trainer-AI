from fastapi import APIRouter
from app.core.database import get_chroma_client
from app.services.watsonx_service import generate_response

router = APIRouter()


@router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}


@router.get("/health/detailed")
async def detailed_health_check():
    checks = {
        "api": "healthy",
        "watsonx": "unknown",
        "chromadb": "unknown",
        "mongodb": "unknown",
    }

    # Check watsonx.ai
    try:
        response = generate_response(
            prompt="Say OK",
            max_tokens=10,
            temperature=0.1,
        )
        checks["watsonx"] = "healthy" if response else "unhealthy"
    except Exception as e:
        checks["watsonx"] = f"unhealthy: {str(e)[:50]}"

    # Check ChromaDB
    try:
        chroma = get_chroma_client()
        chroma.heartbeat()
        checks["chromadb"] = "healthy"
    except Exception as e:
        checks["chromadb"] = f"unhealthy: {str(e)[:50]}"

    # Check MongoDB
    try:
        from app.core.database import mongo_client
        mongo_client.admin.command("ping")
        checks["mongodb"] = "healthy"
    except Exception as e:
        checks["mongodb"] = f"unhealthy: {str(e)[:50]}"

    all_healthy = all(v == "healthy" for v in checks.values())
    
    return {
        "status": "healthy" if all_healthy else "degraded",
        "services": checks,
    }