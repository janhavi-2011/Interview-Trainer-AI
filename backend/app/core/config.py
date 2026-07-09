from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # IBM watsonx.ai
    wx_api_key: str
    wx_url: str = "https://us-south.ml.cloud.ibm.com"
    wx_project_id: str

    # IBM COS
    cos_access_key: str
    cos_secret_key: str
    cos_bucket_name: str
    cos_region: str = "us-south"
    cos_endpoint: str
    cos_instance_id: str

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 60

    # MongoDB
    mongodb_uri: str

    # # ChromaDB
    # chroma_host: str = "localhost"
    # chroma_port: int = 8000
    # chroma_ssl: bool = False

    # App
    app_env: str = "development"
    cors_origin: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()