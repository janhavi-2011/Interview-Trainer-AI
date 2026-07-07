import json
import os
from typing import List, Dict
from app.services.chroma_service import chroma_service


KNOWLEDGE_BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "knowledge_base")


def load_json_file(filepath: str) -> List[Dict]:
    """Load a JSON knowledge base file."""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def create_chunks_from_dsa(items: List[Dict]) -> List[Dict]:
    """Convert DSA items into text chunks for embedding."""
    chunks = []
    for item in items:
        # Main concept chunk
        text = f"Category: {item['category']}\n"
        text += f"Topic: {item['topic']}\n"
        text += f"Difficulty: {item['difficulty']}\n"
        text += f"Concept: {item['concept']}\n"
        text += f"Key Points: {'; '.join(item['key_points'])}\n"
        if item.get("sample_code"):
            text += f"Sample Code:\n{item['sample_code']}\n"

        chunks.append({
            "id": item["id"],
            "text": text,
            "metadata": {
                "category": item["category"],
                "topic": item["topic"],
                "difficulty": item["difficulty"],
                "source": "dsa",
            },
        })

        # Question-specific chunks
        for i, question in enumerate(item.get("common_questions", [])):
            q_text = f"Category: {item['category']}\n"
            q_text += f"Topic: {item['topic']}\n"
            q_text += f"Question: {question}\n"
            q_text += f"Concept: {item['concept']}\n"
            q_text += f"Key Points: {'; '.join(item['key_points'])}\n"

            chunks.append({
                "id": f"{item['id']}_q{i}",
                "text": q_text,
                "metadata": {
                    "category": item["category"],
                    "topic": item["topic"],
                    "difficulty": item["difficulty"],
                    "source": "dsa",
                    "type": "question",
                },
            })

    return chunks


def create_chunks_from_hr(items: List[Dict]) -> List[Dict]:
    """Convert HR items into text chunks for embedding."""
    chunks = []
    for item in items:
        text = f"Category: {item['category']}\n"
        text += f"Topic: {item['topic']}\n"
        text += f"Difficulty: {item['difficulty']}\n"
        text += f"Concept: {item['concept']}\n"
        text += f"Key Points: {'; '.join(item['key_points'])}\n"
        if item.get("sample_answer"):
            text += f"Sample Answer: {item['sample_answer']}\n"

        chunks.append({
            "id": item["id"],
            "text": text,
            "metadata": {
                "category": item["category"],
                "topic": item["topic"],
                "difficulty": item["difficulty"],
                "source": "hr",
            },
        })

        for i, question in enumerate(item.get("common_questions", [])):
            q_text = f"Category: {item['category']}\n"
            q_text += f"Topic: {item['topic']}\n"
            q_text += f"Question: {question}\n"
            q_text += f"Concept: {item['concept']}\n"
            q_text += f"Sample Answer: {item.get('sample_answer', 'N/A')}\n"

            chunks.append({
                "id": f"{item['id']}_q{i}",
                "text": q_text,
                "metadata": {
                    "category": item["category"],
                    "topic": item["topic"],
                    "difficulty": item["difficulty"],
                    "source": "hr",
                    "type": "question",
                },
            })

    return chunks


def create_chunks_from_behavioral(items: List[Dict]) -> List[Dict]:
    """Convert behavioral items into text chunks for embedding."""
    chunks = []
    for item in items:
        text = f"Category: {item['category']}\n"
        text += f"Topic: {item['topic']}\n"
        text += f"Difficulty: {item['difficulty']}\n"
        text += f"Concept: {item['concept']}\n"
        text += f"Key Points: {'; '.join(item['key_points'])}\n"
        if item.get("sample_answer"):
            text += f"Sample Answer: {item['sample_answer']}\n"

        chunks.append({
            "id": item["id"],
            "text": text,
            "metadata": {
                "category": item["category"],
                "topic": item["topic"],
                "difficulty": item["difficulty"],
                "source": "behavioral",
            },
        })

        for i, question in enumerate(item.get("common_questions", [])):
            q_text = f"Category: {item['category']}\n"
            q_text += f"Topic: {item['topic']}\n"
            q_text += f"Question: {question}\n"
            q_text += f"Concept: {item['concept']}\n"
            q_text += f"Sample Answer: {item.get('sample_answer', 'N/A')}\n"

            chunks.append({
                "id": f"{item['id']}_q{i}",
                "text": q_text,
                "metadata": {
                    "category": item["category"],
                    "topic": item["topic"],
                    "difficulty": item["difficulty"],
                    "source": "behavioral",
                    "type": "question",
                },
            })

    return chunks


def create_chunks_from_system_design(items: List[Dict]) -> List[Dict]:
    """Convert system design items into text chunks for embedding."""
    chunks = []
    for item in items:
        text = f"Category: {item['category']}\n"
        text += f"Topic: {item['topic']}\n"
        text += f"Difficulty: {item['difficulty']}\n"
        text += f"Concept: {item['concept']}\n"
        text += f"Key Points: {'; '.join(item['key_points'])}\n"
        if item.get("sample_answer"):
            text += f"Sample Answer: {item['sample_answer']}\n"

        chunks.append({
            "id": item["id"],
            "text": text,
            "metadata": {
                "category": item["category"],
                "topic": item["topic"],
                "difficulty": item["difficulty"],
                "source": "system_design",
            },
        })

        for i, question in enumerate(item.get("common_questions", [])):
            q_text = f"Category: {item['category']}\n"
            q_q_text = q_text  # fix: use q_text consistently
            q_text += f"Topic: {item['topic']}\n"
            q_text += f"Question: {question}\n"
            q_text += f"Concept: {item['concept']}\n"
            q_text += f"Sample Answer: {item.get('sample_answer', 'N/A')}\n"

            chunks.append({
                "id": f"{item['id']}_q{i}",
                "text": q_text,
                "metadata": {
                    "category": item["category"],
                    "topic": item["topic"],
                    "difficulty": item["difficulty"],
                    "source": "system_design",
                    "type": "question",
                },
            })

    return chunks


def load_all_knowledge_bases():
    """Load all knowledge base files and insert into ChromaDB."""
    results = {}

    file_processors = {
        "dsa.json": ("knowledge_dsa", create_chunks_from_dsa),
        "hr.json": ("knowledge_hr", create_chunks_from_hr),
        "behavioral.json": ("knowledge_behavioral", create_chunks_from_behavioral),
        "system_design.json": ("knowledge_system_design", create_chunks_from_system_design),
        "companies.json": ("knowledge_companies", create_chunks_from_companies),
    }

    for filename, (collection_name, processor) in file_processors.items():
        filepath = os.path.join(KNOWLEDGE_BASE_DIR, filename)
        if not os.path.exists(filepath):
            results[filename] = {"status": "skipped", "reason": "file not found"}
            continue

        # Load and process
        items = load_json_file(filepath)
        chunks = processor(items)

        # Prepare batch data
        documents = [chunk["text"] for chunk in chunks]
        ids = [chunk["id"] for chunk in chunks]
        metadatas = [chunk["metadata"] for chunk in chunks]

        # Delete existing collection to avoid duplicates
        try:
            chroma_service.delete_collection(collection_name)
        except Exception:
            pass

        # Add to ChromaDB
        chroma_service.add_documents(
            collection_name=collection_name,
            documents=documents,
            ids=ids,
            metadatas=metadatas,
        )

        count = chroma_service.get_collection_count(collection_name)
        results[filename] = {
            "status": "loaded",
            "collection": collection_name,
            "items": len(items),
            "chunks": len(chunks),
            "stored": count,
        }

    return results

def create_chunks_from_companies(items: List[Dict]) -> List[Dict]:
    """Convert company items into text chunks for embedding."""
    chunks = []
    for item in items:
        text = f"Company: {item['company']}\n"
        text += f"Category: {item['category']}\n"
        text += f"Topic: {item['topic']}\n"
        text += f"Difficulty: {item['difficulty']}\n"
        text += f"Concept: {item['concept']}\n"
        text += f"Key Points: {'; '.join(item['key_points'])}\n"
        if item.get("sample_answer"):
            text += f"Sample Answer: {item['sample_answer']}\n"

        chunks.append({
            "id": item["id"],
            "text": text,
            "metadata": {
                "company": item["company"],
                "category": item["category"],
                "topic": item["topic"],
                "difficulty": item["difficulty"],
                "source": "companies",
            },
        })

        for i, question in enumerate(item.get("common_questions", [])):
            q_text = f"Company: {item['company']}\n"
            q_text += f"Category: {item['category']}\n"
            q_text += f"Question: {question}\n"
            q_text += f"Concept: {item['concept']}\n"
            q_text += f"Key Points: {'; '.join(item['key_points'])}\n"
            q_text += f"Sample Answer: {item.get('sample_answer', 'N/A')}\n"

            chunks.append({
                "id": f"{item['id']}_q{i}",
                "text": q_text,
                "metadata": {
                    "company": item["company"],
                    "category": item["category"],
                    "topic": item["topic"],
                    "difficulty": item["difficulty"],
                    "source": "companies",
                    "type": "question",
                },
            })

    return chunks    