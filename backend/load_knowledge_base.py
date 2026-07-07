"""Script to load all knowledge bases into ChromaDB."""
import sys
sys.path.insert(0, ".")

from app.services.knowledge_base_loader import load_all_knowledge_bases

if __name__ == "__main__":
    print("=" * 60)
    print("Loading Knowledge Bases into ChromaDB")
    print("=" * 60)
    
    results = load_all_knowledge_bases()
    
    for filename, result in results.items():
        print(f"\n📄 {filename}:")
        for key, value in result.items():
            print(f"   {key}: {value}")
    
    print("\n" + "=" * 60)
    print("✅ Knowledge base loading complete!")
    print("=" * 60)