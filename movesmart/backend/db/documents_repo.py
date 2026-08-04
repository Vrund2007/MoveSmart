"""db/documents_repo.py — PyMongo access layer for property_documents collection (Phase 10)
Documents are stored as metadata only (url/base64 is the caller's responsibility).
No file server required — owner stores external URLs or base64 strings.
"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db

ALLOWED_DOC_TYPES = [
    "title_deed",
    "property_tax",
    "ownership_proof",
    "electricity_bill",
    "water_bill",
    "other",
]


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    if doc.get("owner_id"):
        doc["owner_id"] = str(doc["owner_id"])
    return doc


def create_document(doc_data: dict) -> str:
    """Create a property document metadata record."""
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = dict(doc_data)
    doc["owner_id"] = ObjectId(doc_data["owner_id"])
    doc["created_at"] = now
    doc["updated_at"] = now
    doc.setdefault("verification_status", "unverified")
    doc.setdefault("file_size", None)
    doc.setdefault("mime_type", "application/pdf")
    result = db["property_documents"].insert_one(doc)
    return str(result.inserted_id)


def get_owner_documents(owner_id: str, property_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch all documents for an owner, optionally filtered by property."""
    db = get_db()
    try:
        o_oid = ObjectId(owner_id)
    except Exception:
        return []
    query: Dict[str, Any] = {"owner_id": o_oid}
    if property_id:
        query["property_id"] = property_id
    cursor = db["property_documents"].find(query).sort("created_at", -1)
    return [_serialize(doc) for doc in cursor]


def get_document_by_id(doc_id: str, owner_id: str) -> Optional[Dict[str, Any]]:
    """Fetch single document (ensures owner access)."""
    db = get_db()
    try:
        d_oid = ObjectId(doc_id)
        o_oid = ObjectId(owner_id)
    except Exception:
        return None
    doc = db["property_documents"].find_one({"_id": d_oid, "owner_id": o_oid})
    return _serialize(doc) if doc else None


def delete_document(doc_id: str, owner_id: str) -> bool:
    """Delete a document record (owner-scoped)."""
    db = get_db()
    try:
        d_oid = ObjectId(doc_id)
        o_oid = ObjectId(owner_id)
    except Exception:
        return False
    res = db["property_documents"].delete_one({"_id": d_oid, "owner_id": o_oid})
    return res.deleted_count > 0
