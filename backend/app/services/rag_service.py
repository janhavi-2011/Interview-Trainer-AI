from typing import List, Optional, Dict
from app.services.chroma_service import chroma_service
from app.services.watsonx_service import generate_response, GRANITE_3_8B


# Map category names to collection names
COLLECTION_MAP = {
    "dsa": "knowledge_dsa",
    "hr": "knowledge_hr",
    "behavioral": "knowledge_behavioral",
    "system_design": "knowledge_system_design",
    "all": None,  # search all collections
}


def retrieve_context(
    query: str,
    categories: List[str] = None,
    n_results: int = 5,
) -> Dict:
    """Retrieve relevant context from ChromaDB based on the query."""
    
    if categories is None:
        categories = ["all"]

    all_results = []
    
    # Determine which collections to search
    collections_to_search = []
    for cat in categories:
        if cat == "all":
            collections_to_search = list(COLLECTION_MAP.values())[:-1]  # exclude "all"
            break
        elif cat in COLLECTION_MAP:
            collections_to_search.append(COLLECTION_MAP[cat])

    # Query each collection
    for collection_name in collections_to_search:
        try:
            results = chroma_service.query_collection(
                collection_name=collection_name,
                query_texts=[query],
                n_results=n_results,
            )
            
            # Flatten results
            for i, doc in enumerate(results["documents"][0]):
                all_results.append({
                    "document": doc,
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "distance": results["distances"][0][i] if results["distances"] else 0,
                    "collection": collection_name,
                })
        except Exception as e:
            print(f"Error querying {collection_name}: {e}")
            continue

    # Sort by distance (lower = more relevant) and take top results
    all_results.sort(key=lambda x: x["distance"])
    top_results = all_results[:n_results]

    # Combine context
    context_text = "\n\n---\n\n".join([r["document"] for r in top_results])
    
    return {
        "context": context_text,
        "sources": top_results,
        "total_retrieved": len(all_results),
        "top_results_count": len(top_results),
    }


def rag_query(
    question: str,
    categories: List[str] = None,
    n_results: int = 5,
    max_tokens: int = 1024,
    temperature: float = 0.3,
) -> Dict:
    """Full RAG pipeline: retrieve context → generate answer."""
    
    # Step 1: Retrieve relevant context
    retrieval = retrieve_context(
        query=question,
        categories=categories,
        n_results=n_results,
    )

    # Step 2: Build the prompt with context
    prompt = f"""You are an expert interview preparation assistant. Use the following reference material to answer the question accurately and comprehensively. If the reference material doesn't contain enough information, use your general knowledge but indicate this.

Reference Material:
{retrieval['context']}

---
Question: {question}

Provide a detailed, well-structured answer:"""

    # Step 3: Generate response using Granite
    answer = generate_response(
        prompt=prompt,
        model_id=GRANITE_3_8B,
        max_tokens=max_tokens,
        temperature=temperature,
    )

    # Step 4: Return complete result
    return {
        "question": question,
        "answer": answer,
        "sources": [
            {
                "collection": s["collection"],
                "category": s["metadata"].get("category", "unknown"),
                "topic": s["metadata"].get("topic", "unknown"),
                "relevance_score": round(1 - s["distance"], 4),
            }
            for s in retrieval["sources"]
        ],
        "context_used": retrieval["context"][:500] + "...",  # truncated for response
        "total_sources_found": retrieval["total_retrieved"],
    }