from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from bson import ObjectId, Decimal128
from datetime import datetime, date

client: AsyncIOMotorClient = None
db = None

def sanitize_mongo_doc(doc):
    """
    Recursively converts BSON ObjectId, Decimal128, and datetime objects
    into standard JSON-serializable Python types.
    """
    if doc is None:
        return None
    if isinstance(doc, list):
        return [sanitize_mongo_doc(item) for item in doc]
    if isinstance(doc, dict):
        sanitized = {}
        for k, v in doc.items():
            if k == "_id":
                sanitized["id"] = str(v)
            elif isinstance(v, ObjectId):
                sanitized[k] = str(v)
            elif isinstance(v, Decimal128):
                sanitized[k] = float(v.to_decimal())
            elif isinstance(v, (datetime, date)):
                sanitized[k] = v.isoformat()
            elif isinstance(v, (dict, list)):
                sanitized[k] = sanitize_mongo_doc(v)
            else:
                sanitized[k] = v
        if "_id" in doc and "id" not in sanitized:
            sanitized["id"] = str(doc["_id"])
        return sanitized
    return doc

class MockInsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id

# In-memory document cache when external MongoDB is offline or in cloud demo mode
_in_memory_storage = {}

class MongoCollectionWrapper:
    """Wrapper that ensures all query results are sanitized and provides in-memory fallback if Mongo is offline."""
    def __init__(self, raw_collection, name: str = "default"):
        self._col = raw_collection
        self._name = getattr(raw_collection, "name", name) if raw_collection is not None else name
        if self._name not in _in_memory_storage:
            _in_memory_storage[self._name] = []

    async def find_one(self, *args, **kwargs):
        try:
            if self._col is not None:
                doc = await self._col.find_one(*args, **kwargs)
                if doc is not None:
                    return sanitize_mongo_doc(doc)
        except Exception as e:
            print(f"[MongoDB] find_one fallback ({self._name}): {e}")
        
        # In-memory fallback
        mem = _in_memory_storage.get(self._name, [])
        return mem[0] if mem else None

    async def find(self, *args, **kwargs):
        try:
            if self._col is not None:
                cursor = self._col.find(*args, **kwargs)
                docs = await cursor.to_list(length=1000)
                if docs:
                    return [sanitize_mongo_doc(d) for d in docs]
        except Exception as e:
            pass
        
        # Return in-memory documents
        return list(_in_memory_storage.get(self._name, []))

    async def insert_one(self, doc, *args, **kwargs):
        new_id = doc.get("id") or doc.get("_id") or str(ObjectId())
        doc_copy = dict(doc)
        doc_copy["id"] = str(new_id)
        doc_copy["_id"] = str(new_id)
        
        # Keep in memory regardless
        if self._name in _in_memory_storage:
            _in_memory_storage[self._name].insert(0, sanitize_mongo_doc(doc_copy))

        try:
            if self._col is not None:
                res = await self._col.insert_one(doc, *args, **kwargs)
                if res:
                    return res
        except Exception as e:
            print(f"[MongoDB] insert_one fallback to in-memory ({self._name}): {e}")
        
        return MockInsertResult(new_id)

    async def insert_many(self, docs, *args, **kwargs):
        for d in docs:
            await self.insert_one(d)
        return True

    async def update_one(self, filter_dict, update_dict, *args, **kwargs):
        # Update in-memory
        mem = _in_memory_storage.get(self._name, [])
        set_vals = update_dict.get("$set", {}) if isinstance(update_dict, dict) else {}
        for item in mem:
            match = True
            for k, v in filter_dict.items():
                if str(item.get(k)) != str(v):
                    match = False
                    break
            if match:
                item.update(set_vals)
                break

        try:
            if self._col is not None:
                return await self._col.update_one(filter_dict, update_dict, *args, **kwargs)
        except Exception as e:
            pass
        return None

    async def update_many(self, *args, **kwargs):
        try:
            if self._col is not None:
                return await self._col.update_many(*args, **kwargs)
        except Exception as e:
            pass
        return None

    async def delete_one(self, filter_dict, *args, **kwargs):
        mem = _in_memory_storage.get(self._name, [])
        for i, item in enumerate(mem):
            match = True
            for k, v in filter_dict.items():
                if str(item.get(k)) != str(v):
                    match = False
                    break
            if match:
                mem.pop(i)
                break
        try:
            if self._col is not None:
                return await self._col.delete_one(filter_dict, *args, **kwargs)
        except Exception:
            pass
        return None

    async def delete_many(self, *args, **kwargs):
        _in_memory_storage[self._name] = []
        try:
            if self._col is not None:
                return await self._col.delete_many(*args, **kwargs)
        except Exception:
            pass
        return None

    async def count_documents(self, *args, **kwargs):
        try:
            if self._col is not None:
                return await self._col.count_documents(*args, **kwargs)
        except Exception:
            pass
        return len(_in_memory_storage.get(self._name, []))

def connect_db():
    global client, db
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
        db = client[settings.DATABASE_NAME]
        print(f"Connected to MongoDB database: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

def close_db():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")

def get_collection(name: str) -> MongoCollectionWrapper:
    global db
    raw_col = None
    try:
        if db is None:
            client_local = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
            db = client_local[settings.DATABASE_NAME]
        if db is not None:
            raw_col = db[name]
    except Exception:
        raw_col = None
    return MongoCollectionWrapper(raw_col, name=name)

# Explicit collection helpers for Landslide AI
def get_users_col(): return get_collection("users")
def get_locations_col(): return get_collection("locations")
def get_field_reports_col(): return get_collection("field_reports")
def get_alerts_col(): return get_collection("alerts")
def get_infrastructure_col(): return get_collection("infrastructure")
def get_evacuation_centers_col(): return get_collection("evacuation_centers")
def get_landslide_history_col(): return get_collection("landslide_history")
def get_environmental_data_col(): return get_collection("environmental_data")
def get_audit_logs_col(): return get_collection("audit_logs")
def get_system_metrics_col(): return get_collection("system_metrics")
def get_landslide_risk_col(): return get_collection("landslide_risk")
def get_visual_inspections_col(): return get_collection("visual_inspections")

