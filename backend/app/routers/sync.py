from fastapi import APIRouter
from app.database import get_field_reports_col, get_audit_logs_col
from app.schemas import SyncBatchRequest, SyncBatchResponse
from datetime import datetime

router = APIRouter(prefix="/sync", tags=["Offline Synchronization"])

@router.post("", response_model=SyncBatchResponse)
async def sync_offline_reports(batch: SyncBatchRequest):
    reports_col = get_field_reports_col()
    audit_col = get_audit_logs_col()

    synced = 0
    duplicates = 0
    errors = []

    for item in batch.items:
        try:
            client_id = item.client_id
            data = item.data

            # Duplicate check
            existing = await reports_col.find_one({
                "$or": [
                    {"client_id": client_id},
                    {
                        "village": data.get("village"),
                        "observation_date": data.get("observation_date"),
                        "latitude": data.get("latitude"),
                        "longitude": data.get("longitude")
                    }
                ]
            })

            if existing:
                duplicates += 1
                continue

            doc = dict(data)
            doc["client_id"] = client_id
            doc["status"] = "PENDING_VERIFICATION"
            doc["created_at"] = item.timestamp or datetime.utcnow().isoformat()
            doc["synced_at"] = datetime.utcnow().isoformat()

            await reports_col.insert_one(doc)
            synced += 1

        except Exception as e:
            errors.append(f"Error syncing item {item.client_id}: {str(e)}")

    if synced > 0:
        await audit_col.insert_one({
            "user": "Field Worker (Offline Sync)",
            "role": "FIELD_WORKER",
            "action": f"Synchronized {synced} offline field reports from remote field device",
            "timestamp": datetime.utcnow().isoformat(),
            "target": "sync_batch"
        })

    return SyncBatchResponse(
        synced_count=synced,
        duplicate_count=duplicates,
        errors=errors,
        server_time=datetime.utcnow().isoformat()
    )
