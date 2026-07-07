from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.core.database import get_mongo_db
from app.models.user import create_user_document
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "is_active": current_user["is_active"],
    }


@router.post("/register", response_model=AuthResponse)
async def register(
    request: RegisterRequest,
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    # Check if user already exists
    existing = await db.users.find_one({"email": request.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Validate password length
    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters",
        )

    # Create user
    user_doc = create_user_document(
        email=request.email,
        hashed_password=hash_password(request.password),
        full_name=request.full_name,
    )

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    # Generate JWT
    token = create_access_token(
        data={"sub": str(result.inserted_id), "email": request.email}
    )

    return AuthResponse(
        access_token=token,
        user={
            "id": str(result.inserted_id),
            "email": request.email,
            "full_name": request.full_name,
        },
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_mongo_db),
):
    # Find user
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password
    if not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check if active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Generate JWT
    token = create_access_token(
        data={"sub": str(user["_id"]), "email": user["email"]}
    )

    return AuthResponse(
        access_token=token,
        user={
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
        },
    )