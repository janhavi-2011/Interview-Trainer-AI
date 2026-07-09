import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import get_settings
import json
from typing import List, Optional


settings = get_settings()


class ChromaService:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path="./chroma_db"
        )

    def get_or_create_collection(self, collection_name: str):
        """Get or create a ChromaDB collection."""
        return self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    def list_collections(self):
        """List all collections."""
        return self.client.list_collections()

    def delete_collection(self, collection_name: str):
        """Delete a collection."""
        self.client.delete_collection(name=collection_name)

    def add_documents(
        self,
        collection_name: str,
        documents: List[str],
        ids: List[str],
        metadatas: List[dict] = None,
    ):
        """Add documents to a collection."""
        collection = self.get_or_create_collection(collection_name)
        collection.add(
            documents=documents,
            ids=ids,
            metadatas=metadatas,
        )
        return {"added": len(documents), "collection": collection_name}

    def query_collection(
        self,
        collection_name: str,
        query_texts: List[str],
        n_results: int = 5,
        where: dict = None,
    ):
        """Query a collection for similar documents."""
        collection = self.get_or_create_collection(collection_name)
        results = collection.query(
            query_texts=query_texts,
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"],
        )
        return results

    def get_collection_count(self, collection_name: str):
        """Get number of documents in a collection."""
        collection = self.get_or_create_collection(collection_name)
        return collection.count()


# Singleton instance
chroma_service = ChromaService()