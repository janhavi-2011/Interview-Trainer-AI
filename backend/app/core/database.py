from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings
import chromadb

settings = get_settings()

# MongoDB
mongo_client = AsyncIOMotorClient(settings.mongodb_uri)
mongo_db = mongo_client["my_project_db"]

# ChromaDB (will connect to Docker container)
chroma_client = chromadb.HttpClient(
    host=settings.chroma_host,
    port=settings.chroma_port,
)


def get_mongo_db():
    return mongo_db


def get_chroma_client():
    return chroma_client