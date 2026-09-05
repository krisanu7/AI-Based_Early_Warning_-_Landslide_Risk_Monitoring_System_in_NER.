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

class MongoCollectionWrapper:
    """Wrapper that ensures all query results are sanitized."""
    def __init__(self, raw_collection):
        self._col = raw_collection

    async def find_one(self, *args, **kwargs):
        doc = await self._col.find_one(*args, **kwargs)
        return sanitize_mongo_doc(doc)

    async def find(self, *args, **kwargs):
        cursor = self._col.find(*args, **kwargs)
        docs = await cursor.to_list(length=1000)
        return [sanitize_mongo_doc(d) for d in docs]

    async def insert_one(self, doc, *args, **kwargs):
        return await self._col.insert_one(doc, *args, **kwargs)

    async def insert_many(self, docs, *args, **kwargs):
        return await self._col.insert_many(docs, *args, **kwargs)

    async def update_one(self, *args, **kwargs):
        return await self._col.update_one(*args, **kwargs)

    async def update_many(self, *args, **kwargs):
        return await self._col.update_many(*args, **kwargs)

    async def delete_one(self, *args, **kwargs):
        return await self._col.delete_one(*args, **kwargs)

    async def delete_many(self, *args, **kwargs):
        return await self._col.delete_many(*args, **kwargs)

    async def count_documents(self, *args, **kwargs):
        return await self._col.count_documents(*args, **kwargs)

def connect_db():
    global client, db
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
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
    if db is None:
        client_local = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client_local[settings.DATABASE_NAME]
    return MongoCollectionWrapper(db[name])

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

