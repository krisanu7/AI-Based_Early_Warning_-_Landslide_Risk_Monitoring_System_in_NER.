import os
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from bson import ObjectId, Decimal128
from pymongo import MongoClient
import motor.motor_asyncio
from app.config import settings

# Active MongoDB Connection URL
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "swasthya_jal_db")

print(f"Connecting to MongoDB at: {MONGODB_URL} [Database: {DATABASE_NAME}]")

# Motor Async Client for FastAPI
motor_client = motor.motor_asyncio.AsyncIOMotorClient(
    MONGODB_URL,
    serverSelectionTimeoutMS=3000
)
db_instance = motor_client[DATABASE_NAME]

# Synchronous PyMongo Client for metadata and stats
sync_client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=3000)
sync_db = sync_client[DATABASE_NAME]

def sanitize_mongo_doc(doc: Any) -> Any:
    """Recursively converts BSON ObjectId, Decimal128, and nested types to JSON-serializable primitives."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [sanitize_mongo_doc(item) for item in doc]
    if isinstance(doc, dict):
        new_doc = {}
        for k, v in doc.items():
            if k == "_id":
                str_id = str(v)
                new_doc["_id"] = str_id
                if "id" not in doc:
                    new_doc["id"] = str_id
            elif isinstance(v, (ObjectId, Decimal128)):
                new_doc[k] = str(v)
            else:
                new_doc[k] = sanitize_mongo_doc(v)
        if "id" not in new_doc and "_id" in new_doc:
            new_doc["id"] = new_doc["_id"]
        return new_doc
    if isinstance(doc, (ObjectId, Decimal128)):
        return str(doc)
    return doc

# Clean wrapper to ensure consistent dict format with string IDs
class MongoCollectionWrapper:
    def __init__(self, collection):
        self.collection = collection
        self.name = collection.name

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        q = dict(query)
        if "id" in q and "_id" not in q:
            val = q.pop("id")
            q["$or"] = [{"id": val}, {"_id": val}]
            
        doc = await self.collection.find_one(q)
        return sanitize_mongo_doc(doc)

    async def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List] = None, limit: int = 0) -> List[Dict[str, Any]]:
        q = dict(query) if query else {}
        cursor = self.collection.find(q)
        if sort:
            cursor = cursor.sort(sort)
        if limit > 0:
            cursor = cursor.limit(limit)
            
        results = []
        async for doc in cursor:
            results.append(sanitize_mongo_doc(doc))
        return results

    async def insert_one(self, document: Dict[str, Any]):
        doc = dict(document)
        if "id" not in doc:
            doc["id"] = str(uuid.uuid4())
        if "_id" not in doc:
            doc["_id"] = doc["id"]
        if "created_at" not in doc:
            doc["created_at"] = datetime.utcnow().isoformat()
            
        await self.collection.insert_one(doc)
        class InsertResult:
            inserted_id = doc["id"]
        return InsertResult()

    async def insert_many(self, documents: List[Dict[str, Any]]):
        docs = []
        ids = []
        for d in documents:
            doc = dict(d)
            if "id" not in doc:
                doc["id"] = str(uuid.uuid4())
            if "_id" not in doc:
                doc["_id"] = doc["id"]
            if "created_at" not in doc:
                doc["created_at"] = datetime.utcnow().isoformat()
            docs.append(doc)
            ids.append(doc["id"])
        if docs:
            await self.collection.insert_many(docs)
        return ids

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        q = dict(query)
        if "id" in q and "_id" not in q:
            val = q.pop("id")
            q["$or"] = [{"id": val}, {"_id": val}]
        return await self.collection.update_one(q, update, upsert=True)

    async def delete_one(self, query: Dict[str, Any]):
        q = dict(query)
        if "id" in q and "_id" not in q:
            val = q.pop("id")
            q["$or"] = [{"id": val}, {"_id": val}]
        res = await self.collection.delete_one(q)
        return res.deleted_count > 0

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        q = dict(query) if query else {}
        return await self.collection.count_documents(q)

def get_db():
    return db_instance

def get_collection(name: str) -> MongoCollectionWrapper:
    return MongoCollectionWrapper(db_instance[name])

def get_mongodb_stats() -> Dict[str, Any]:
    """Inspects live MongoDB server health, connection status, and collection statistics."""
    try:
        server_info = sync_client.server_info()
        db_stats = sync_db.command("dbstats")
        collections = sync_db.list_collection_names()
        
        col_details = []
        for col_name in collections:
            cnt = sync_db[col_name].count_documents({})
            col_details.append({"name": col_name, "count": int(cnt)})
            
        return {
            "status": "CONNECTED",
            "mongodb_url": MONGODB_URL,
            "database_name": DATABASE_NAME,
            "version": str(server_info.get("version", "8.0")),
            "collections_count": int(len(collections)),
            "total_documents": int(sum(c["count"] for c in col_details)),
            "storage_size_bytes": float(db_stats.get("storageSize", 0)),
            "data_size_bytes": float(db_stats.get("dataSize", 0)),
            "collections": col_details
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "mongodb_url": MONGODB_URL,
            "error": str(e)
        }
