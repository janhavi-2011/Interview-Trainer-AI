from datetime import datetime

def create_user_document(email: str, hashed_password: str, full_name: str) -> dict:
    return {
        "email": email,
        "hashed_password": hashed_password,
        "full_name": full_name,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }