import sys
import time
import requests
from pathlib import Path

# Add app parent directory to python path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.config import settings

def test_rag():
    print("==================================================================")
    print("[TEST] SafeSlope NER -- RAG Advisor Pipeline Test")
    print(f"Gemini API Key Configured: {'YES' if settings.GEMINI_API_KEY else 'NO'}")
    print("==================================================================")

    from app.routers.rag_advisor import get_vector_db
    
    print("\n[1/2] Connecting to Chroma Vector DB...")
    db = get_vector_db()
    count = db._collection.count()
    print(f"[SUCCESS] Vector DB loaded. Total chunks in index: {count}")

    test_queries = [
        "What is the SOP when visible tension cracks and mudflow indicators appear on NH-27 slope?",
        "What are the mandated daily relief ration, clean drinking water, and sanitation quotas per person in designated evacuation shelters?",
        "What immediate response actions must District Incident Commanders (DDMA) take when alert level reaches WARNING or CRITICAL?"
    ]

    for idx, q in enumerate(test_queries, 1):
        print(f"\n------------------------------------------------------------------")
        print(f"Query #{idx}: {q}")
        print("------------------------------------------------------------------")

        docs = db.similarity_search(q, k=3)
        print(f"Retrieved {len(docs)} relevant context chunks:")
        for doc_i, doc in enumerate(docs, 1):
            src = doc.metadata.get("source", "Unknown")
            snippet = doc.page_content.strip()[:180].replace("\n", " ")
            print(f"  [{doc_i}] Source: {Path(src).name}")
            print(f"      Snippet: {snippet}...")

        # Test Gemini REST call
        gemini_key = settings.GEMINI_API_KEY
        if gemini_key:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={gemini_key}"
            context_str = "\n\n".join([d.page_content for d in docs])
            prompt = f"Use ONLY the following context to answer: {context_str}\n\nQuestion: {q}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            
            t0 = time.time()
            res = requests.post(url, json=payload, timeout=20)
            elapsed = round((time.time() - t0) * 1000, 2)
            
            if res.status_code == 200:
                answer = res.json()['candidates'][0]['content']['parts'][0]['text']
                print(f"\n[GEMINI 3.1 FLASH LITE ANSWER] ({elapsed} ms):\n{answer[:400]}...\n")
            else:
                print(f"API Error: {res.status_code} - {res.text}")



if __name__ == "__main__":
    test_rag()
