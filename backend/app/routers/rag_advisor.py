import os
import time
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel, Field

from app.config import settings

router = APIRouter(prefix="/rag", tags=["RAG AI Disaster Assistant"])

# Directory paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
KNOWLEDGE_BASE_DIR = BASE_DIR / "data" / "knowledge_base"
VECTOR_DB_DIR = BASE_DIR / "data" / "vector_db"

logger = logging.getLogger("rag_advisor")

# Dynamic Lazy Load for LangChain / ChromaDB to avoid import delays on cold start
_vector_db = None
_embedding_model = None

def get_vector_db():
    global _vector_db, _embedding_model
    if _vector_db is not None:
        return _vector_db

    if not VECTOR_DB_DIR.exists():
        logger.warning(f"Vector DB directory {VECTOR_DB_DIR} does not exist. Triggering ingestion.")
        from scripts.ingest_rag_docs import run_ingestion
        run_ingestion()

    try:
        from langchain_community.embeddings import HuggingFaceEmbeddings
        from langchain_community.vectorstores import Chroma

        _embedding_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        _vector_db = Chroma(
            persist_directory=str(VECTOR_DB_DIR),
            embedding_function=_embedding_model
        )
        return _vector_db
    except Exception as e:
        logger.error(f"Failed to load Chroma vector database: {str(e)}")
        raise HTTPException(status_code=500, detail=f"RAG Vector Database Error: {str(e)}")


class RAGQueryRequest(BaseModel):
    query: str = Field(..., description="User's query about landslide SOP, NDMA guidelines, or highway safety")
    alert_level: Optional[str] = Field("NORMAL", description="Current disaster alert level: NORMAL, WATCH, WARNING, CRITICAL")
    district: Optional[str] = Field(None, description="Target district or state in Northeast India (e.g. Dima Hasao, Assam)")
    language: Optional[str] = Field("en", description="Preferred response language: en, as, bn, hi")


class SourceChunk(BaseModel):
    source_file: str
    content_snippet: str
    relevance_score: Optional[float] = None


class RAGQueryResponse(BaseModel):
    answer: str
    sources: List[str]
    context_snippets: List[SourceChunk]
    alert_level: str
    language: str
    execution_time_ms: float
    model_used: str


@router.get("/status")
def get_rag_status():
    """Check status of knowledge base files and vector index"""
    md_files = []
    if KNOWLEDGE_BASE_DIR.exists():
        for f in KNOWLEDGE_BASE_DIR.glob("*.md"):
            md_files.append({
                "filename": f.name,
                "size_bytes": f.stat().st_size,
                "size_kb": round(f.stat().st_size / 1024, 2)
            })

    db_exists = VECTOR_DB_DIR.exists()
    total_chunks = 0
    if db_exists:
        try:
            db = get_vector_db()
            total_chunks = db._collection.count()
        except Exception:
            total_chunks = 0

    has_gemini_key = bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("YOUR_"))

    return {
        "status": "OPERATIONAL" if (db_exists and total_chunks > 0) else "NEEDS_INDEXING",
        "knowledge_base_files": md_files,
        "total_knowledge_files": len(md_files),
        "vector_db_exists": db_exists,
        "total_chunks_indexed": total_chunks,
        "gemini_api_configured": has_gemini_key,
        "embedding_model": "sentence-transformers/all-MiniLM-L6-v2"
    }


@router.post("/reindex")
def trigger_reindex(background_tasks: BackgroundTasks):
    """Trigger background re-indexing of knowledge base files"""
    from scripts.ingest_rag_docs import run_ingestion
    background_tasks.add_task(run_ingestion)
    return {"message": "RAG Knowledge base re-indexing started in background."}


@router.post("/query", response_model=RAGQueryResponse)
async def query_rag_advisor(req: RAGQueryRequest):
    """Query RAG disaster advisor using NDMA, Highway, and Evacuation SOP manuals + Gemini AI"""
    start_time = time.time()
    
    if not req.query.trim() if hasattr(req.query, 'trim') else not req.query.strip():
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")

    # 1. Similarity Search in ChromaDB
    try:
        db = get_vector_db()
        retrieved_docs = db.similarity_search(req.query, k=5)
    except Exception as e:
        logger.error(f"Error during RAG similarity search: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to query vector database: {str(e)}")

    if not retrieved_docs:
        raise HTTPException(status_code=404, detail="No relevant knowledge base content found.")

    # Extract source snippets and filenames
    snippets: List[SourceChunk] = []
    sources_set = set()

    context_text_blocks = []
    for idx, doc in enumerate(retrieved_docs):
        src_file = os.path.basename(doc.metadata.get("source", "NDMA SOP Manual"))
        sources_set.add(src_file)
        snippet_text = doc.page_content.strip()
        context_text_blocks.append(f"[Source {idx+1}: {src_file}]\n{snippet_text}")
        snippets.append(SourceChunk(
            source_file=src_file,
            content_snippet=snippet_text[:250] + "..." if len(snippet_text) > 250 else snippet_text
        ))

    context_str = "\n\n---\n\n".join(context_text_blocks)
    sources_list = sorted(list(sources_set))

    # 2. Language localization instruction
    lang_instructions = {
        "en": "Respond in clear English.",
        "as": "Respond in clear Assamese (অসমীয়া). Also provide key bullet points in English if needed.",
        "bn": "Respond in clear Bengali (বাংলা). Also provide key bullet points in English if needed.",
        "hi": "Respond in clear Hindi (हिंदी). Also provide key bullet points in English if needed."
    }
    lang_prompt = lang_instructions.get(req.language, lang_instructions["en"])

    # 3. Construct Gemini Prompt
    system_prompt = f"""
You are SafeSlope NER AI, an authoritative disaster response AI copilot designed for Northeast India (SIH 2026).
Your job is to provide clear, practical, step-by-step guidance to disaster management officers, field teams, and citizens based STRICTLY on official government SOP manuals and guidelines provided below.

CONTEXT METADATA:
- Current Landslide Alert Level: {req.alert_level}
- Target Location / District: {req.district or 'Northeast India Region'}
- Requested Language: {lang_prompt}

OFFICIAL RETRIEVED KNOWLEDGE BASE CONTEXT:
{context_str}

USER QUESTION:
"{req.query}"

GUIDELINES FOR YOUR RESPONSE:
1. Base your answer on the retrieved context documents above.
2. If the user asks for emergency action or SOP steps, present them in clean, bulleted steps.
3. Explicitly mention key safety precautions, evacuation advice, or highway engineer protocols if relevant.
4. Cite which manual (e.g. NDMA Landslide Guidelines, NE Highway Pocketbook, or Evacuation Logistics Manual) the info comes from.
5. If the context doesn't fully cover a minor detail, rely on standard NDMA disaster safety practices without hallucinating false local facts.
"""

    model_name = "Gemini 3.1 Flash Lite (Grounded RAG)"
    ai_answer = ""

    # 4. Invoke Google Gemini API via REST
    gemini_key = settings.GEMINI_API_KEY
    if gemini_key and not gemini_key.startswith("YOUR_"):
        try:
            import requests
            # Target Models in order of availability: gemini-3.1-flash-lite, gemini-3.5-flash-lite, gemini-2.5-flash
            target_models = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-flash-latest", "gemini-flash-lite-latest"]

            call_success = False

            for m in target_models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={gemini_key}"
                payload = {
                    "contents": [{
                        "parts": [{"text": system_prompt}]
                    }]
                }
                res = requests.post(url, json=payload, timeout=35)

                if res.status_code == 200:
                    res_data = res.json()
                    candidates = res_data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            ai_answer = parts[0].get("text", "")
                            model_name = f"Google {m} (Grounded RAG)"
                            call_success = True
                            break
            
            if not call_success:
                raise Exception("Gemini REST API endpoint returned non-200 or empty response")

        except Exception as gemini_err:
            logger.error(f"Gemini API invocation failed: {gemini_err}")
            # Graceful Fallback if API key has quota issue or network error
            ai_answer = (
                f"### 📋 Retrieved Official SOP Guidance ({req.alert_level} Alert)\n\n"
                f"Based on **{', '.join(sources_list)}**:\n\n"
                + "\n\n".join([f"• **{s.source_file}**: {s.content_snippet}" for s in snippets])
            )
            model_name = "Retrieved Context Fallback (Gemini API Error)"
    else:
        # Fallback if no API Key
        ai_answer = (
            f"### 📋 Retrieved Official SOP Guidance ({req.alert_level} Alert)\n\n"
            f"Based on official documents (**{', '.join(sources_list)}**):\n\n"
            + "\n\n".join([f"• **{s.source_file}**: {s.content_snippet}" for s in snippets])
        )
        model_name = "Retrieved Vector Context (No Gemini Key)"


    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    return RAGQueryResponse(
        answer=ai_answer,
        sources=sources_list,
        context_snippets=snippets,
        alert_level=req.alert_level,
        language=req.language or "en",
        execution_time_ms=elapsed_ms,
        model_used=model_name
    )
