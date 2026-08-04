"""db/messages_repo.py — PyMongo access layer for conversations/messages collection"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db
from . import listings_repo, users_repo


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["participants"] = [str(p) for p in doc.get("participants", [])]
    return doc


def get_user_conversations(user_id: str) -> List[Dict[str, Any]]:
    """Fetch all active conversations for a user."""
    db = get_db()
    try:
        u_oid = ObjectId(user_id)
    except Exception:
        return []

    cursor = db["conversations"].find({"participants": u_oid}).sort("updated_at", -1)
    conversations = [_serialize(doc) for doc in cursor]

    # Populate listing context and participant metadata
    for c in conversations:
        l_id = c.get("listing_id")
        if l_id:
            c["listing"] = listings_repo.get_listing_by_id(l_id, include_non_approved=True)

        # Get other participant info
        other_p_ids = [p for p in c.get("participants", []) if p != str(user_id)]
        if other_p_ids:
            other_user = users_repo.get_user_by_id(other_p_ids[0])
            c["other_participant"] = {
                "id": str(other_user.get("_id")) if other_user else other_p_ids[0],
                "email": other_user.get("email", "User") if other_user else "User",
                "role": other_user.get("role", "User") if other_user else "User"
            }
        else:
            c["other_participant"] = {"email": "MoveSmart Support", "role": "system"}

    return conversations


def get_or_create_conversation(participants: List[str], listing_id: Optional[str] = None) -> Dict[str, Any]:
    """Get existing conversation or create a new one."""
    db = get_db()
    p_oids = [ObjectId(p) for p in participants]
    now = datetime.now(timezone.utc)

    query = {"participants": {"$all": p_oids}}
    if listing_id:
        query["listing_id"] = listing_id

    doc = db["conversations"].find_one(query)
    if doc:
        return _serialize(doc)

    new_doc = {
        "participants": p_oids,
        "listing_id": listing_id,
        "last_message": "Conversation started.",
        "messages": [],
        "created_at": now,
        "updated_at": now
    }
    res = db["conversations"].insert_one(new_doc)
    new_doc["_id"] = res.inserted_id
    return _serialize(new_doc)


def get_conversation_by_id(conversation_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """Fetch single conversation by ID."""
    db = get_db()
    try:
        c_oid = ObjectId(conversation_id)
        u_oid = ObjectId(user_id)
    except Exception:
        return None

    doc = db["conversations"].find_one({"_id": c_oid, "participants": u_oid})
    if not doc:
        return None

    res = _serialize(doc)
    if res.get("listing_id"):
        res["listing"] = listings_repo.get_listing_by_id(res["listing_id"], include_non_approved=True)
    return res


def add_message_to_conversation(conversation_id: str, sender_id: str, text: str) -> bool:
    """Append message to embedded messages[] list inside conversation."""
    db = get_db()
    try:
        c_oid = ObjectId(conversation_id)
        s_oid = ObjectId(sender_id)
    except Exception:
        return False

    now = datetime.now(timezone.utc)
    msg_obj = {
        "sender_id": str(sender_id),
        "text": text,
        "timestamp": now.isoformat()
    }

    res = db["conversations"].update_one(
        {"_id": c_oid, "participants": s_oid},
        {
            "$push": {"messages": msg_obj},
            "$set": {
                "last_message": text[:100],
                "updated_at": now
            }
        }
    )
    return res.modified_count > 0
