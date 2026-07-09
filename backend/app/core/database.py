from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings
import chromadb

settings = get_settings()

# MongoDB
mongo_client = AsyncIOMotorClient(settings.mongodb_uri)
mongo_db = mongo_client["my_project_db"]

# ChromaDB (Persistent Local Database)
chroma_client = chromadb.PersistentClient(
    path="./chroma_db"
)


def get_mongo_db():
    return mongo_db


def get_chroma_client():
    return chroma_client