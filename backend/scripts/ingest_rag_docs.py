import os
import sys
import time
from pathlib import Path

# Add app parent directory to python path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

KNOWLEDGE_BASE_DIR = Path(__file__).resolve().parent.parent / "data" / "knowledge_base"
VECTOR_DB_DIR = Path(__file__).resolve().parent.parent / "data" / "vector_db"

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run_ingestion():
    start_time = time.time()
    print("==================================================================")
    print("[SafeSlope NER] RAG Knowledge Base Document Ingestion")
    print(f"Reading documents from: {KNOWLEDGE_BASE_DIR}")
    print("==================================================================")


    if not KNOWLEDGE_BASE_DIR.exists():
        print(f"❌ Error: Knowledge base directory {KNOWLEDGE_BASE_DIR} does not exist.")
        return

    md_files = list(KNOWLEDGE_BASE_DIR.glob("*.md"))
    if not md_files:
        print("ERROR: No .md files found in knowledge base directory.")
        return

    print(f"Found {len(md_files)} knowledge base files:")
    for f in md_files:
        size_kb = f.stat().st_size / 1024
        print(f" - [FILE] {f.name} ({size_kb:.1f} KB)")

    # 1. Load documents
    print("\n[1/3] Loading documents...")
    loader = DirectoryLoader(
        str(KNOWLEDGE_BASE_DIR),
        glob="*.md",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"}
    )
    raw_documents = loader.load()
    print(f"Loaded {len(raw_documents)} full documents.")

    # 2. Chunk documents
    print("\n[2/3] Chunking text content (chunk_size=700, chunk_overlap=100)...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=100,
        separators=["\n## ", "\n### ", "\n#### ", "\n\n", "\n", " ", ""]
    )
    chunks = text_splitter.split_documents(raw_documents)
    print(f"Generated {len(chunks)} text chunks.")

    # 3. Create HuggingFace Embeddings & Persist to ChromaDB
    print("\n[3/3] Generating vector embeddings (all-MiniLM-L6-v2) & building ChromaDB index...")
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )

    # Ensure clean directory
    VECTOR_DB_DIR.mkdir(parents=True, exist_ok=True)

    vector_db = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model,
        persist_directory=str(VECTOR_DB_DIR)
    )

    elapsed = time.time() - start_time
    print("==================================================================")
    print(f"SUCCESS: RAG Knowledge Base successfully indexed in {elapsed:.2f} seconds!")
    print(f"Vector Database stored at: {VECTOR_DB_DIR}")
    print(f"Total Chunks Indexed: {len(chunks)}")
    print("==================================================================")


if __name__ == "__main__":
    run_ingestion()
