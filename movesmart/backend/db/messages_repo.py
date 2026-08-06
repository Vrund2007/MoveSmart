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
    u_str = str(user_id)
    try:
        u_oid = ObjectId(user_id)
    except Exception:
        u_oid = None

    query_parts = [{"participants": u_str}]
    if u_oid:
        query_parts.append({"participants": u_oid})

    cursor = db["conversations"].find({"$or": query_parts}).sort("updated_at", -1)
    conversations = [_serialize(doc) for doc in cursor]

    # Populate listing context and participant metadata
    for c in conversations:
        l_id = c.get("listing_id")
        if l_id:
            c["listing"] = listings_repo.get_listing_by_id(l_id, include_non_approved=True)

        # Get other participant info
        other_p_ids = [p for p in c.get("participants", []) if str(p) != u_str]
        if other_p_ids:
            other_user = users_repo.get_user_by_id(other_p_ids[0])
            c["other_participant"] = {
                "id": str(other_user.get("_id")) if other_user else str(other_p_ids[0]),
                "email": other_user.get("email", "User") if other_user else "User",
                "role": other_user.get("role", "User") if other_user else "User"
            }
        else:
            c["other_participant"] = {"email": "MoveSmart Support", "role": "system"}

    return conversations


def get_or_create_conversation(participants: List[str], listing_id: Optional[str] = None) -> Dict[str, Any]:
    """Get existing conversation or create a new one."""
    db = get_db()
    p_oids = []
    p_strs = []
    for p in participants:
        p_strs.append(str(p))
        try:
            p_oids.append(ObjectId(p))
        except Exception:
            pass

    now = datetime.now(timezone.utc)

    query_parts = [{"participants": {"$all": p_strs}}]
    if p_oids:
        query_parts.append({"participants": {"$all": p_oids}})

    query = {"$or": query_parts}
    if listing_id:
        query["listing_id"] = str(listing_id)

    doc = db["conversations"].find_one(query)
    if doc:
        return _serialize(doc)

    new_doc = {
        "participants": p_oids if p_oids else p_strs,
        "listing_id": str(listing_id) if listing_id else None,
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
    u_str = str(user_id)
    try:
        c_oid = ObjectId(conversation_id)
    except Exception:
        return None

    try:
        u_oid = ObjectId(user_id)
    except Exception:
        u_oid = None

    query_parts = [{"participants": u_str}]
    if u_oid:
        query_parts.append({"participants": u_oid})

    doc = db["conversations"].find_one({"_id": c_oid, "$or": query_parts})
    if not doc:
        # Fallback to finding by _id if user has valid conversation link
        doc = db["conversations"].find_one({"_id": c_oid})

    if not doc:
        return None

    res = _serialize(doc)
    if res.get("listing_id"):
        res["listing"] = listings_repo.get_listing_by_id(res["listing_id"], include_non_approved=True)
    return res


def add_message_to_conversation(
    conversation_id: str,
    sender_id: str,
    text: str,
    media_type: str = "text",
    media_url: str = None
) -> Optional[Dict[str, Any]]:
    """Append message to embedded messages[] list inside conversation and return updated conversation."""
    db = get_db()
    c_str = str(conversation_id)
    s_str = str(sender_id)

    c_oid = None
    try:
        c_oid = ObjectId(conversation_id)
    except Exception:
        pass

    s_oid = None
    try:
        s_oid = ObjectId(sender_id)
    except Exception:
        pass

    id_query = [{"_id": c_str}]
    if c_oid:
        id_query.append({"_id": c_oid})

    # Find conversation document
    doc = db["conversations"].find_one({"$or": id_query})
    if not doc:
        return None

    target_id = doc["_id"]

    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    msg_obj = {
        "sender_id": s_str,
        "text": text or "",
        "content": text or "",
        "media_type": media_type,
        "media_url": media_url,
        "timestamp": now_iso,
        "created_at": now_iso
    }

    last_msg_display = "Photo Attachment" if media_type == "image" else ("Voice Note" if media_type == "audio" else (text or "")[:100])

    add_participants = [s_str]
    if s_oid:
        add_participants.append(s_oid)

    db["conversations"].update_one(
        {"_id": target_id},
        {
            "$push": {"messages": msg_obj},
            "$addToSet": {"participants": {"$each": add_participants}},
            "$set": {
                "last_message": last_msg_display,
                "updated_at": now
            }
        }
    )

    # Fetch updated conversation
    updated_doc = db["conversations"].find_one({"_id": target_id})
    if not updated_doc:
        return None

    res = _serialize(updated_doc)
    if res.get("listing_id"):
        res["listing"] = listings_repo.get_listing_by_id(res["listing_id"], include_non_approved=True)

    # Populate other participant metadata
    other_p_ids = [p for p in res.get("participants", []) if str(p) != s_str]
    if other_p_ids:
        other_user = users_repo.get_user_by_id(other_p_ids[0])
        other_name = (other_user.get("name") or (other_user.get("role_profile") or {}).get("name") or other_user.get("email", "User").split("@")[0]) if other_user else "User"
        res["other_participant"] = {
            "id": str(other_user.get("_id")) if other_user else str(other_p_ids[0]),
            "name": other_name,
            "email": other_user.get("email", "User") if other_user else "User",
            "role": other_user.get("role", "User") if other_user else "User"
        }
    else:
        res["other_participant"] = {"email": "MoveSmart Support", "role": "system"}

    return res


def delete_conversation(conversation_id: str, user_id: str) -> bool:
    """Delete a conversation document for a user."""
    db = get_db()
    u_str = str(user_id)
    try:
        c_oid = ObjectId(conversation_id)
    except Exception:
        return False

    try:
        u_oid = ObjectId(user_id)
    except Exception:
        u_oid = None

    query_parts = [{"participants": u_str}]
    if u_oid:
        query_parts.append({"participants": u_oid})

    res = db["conversations"].delete_one({"_id": c_oid, "$or": query_parts})
    return res.deleted_count > 0
