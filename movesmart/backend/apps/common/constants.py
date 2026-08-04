"""apps/common/constants.py — System wide constants and enums derived from Architecture.md & database.md."""

class UserRoles:
    FIND_ACCOMMODATION = "find_accommodation"
    PROPERTY_OWNER = "property_owner"
    BROKER = "broker"
    COMPANY_HR = "company_hr"
    ADMIN = "admin"

    PUBLIC_ROLES = [
        FIND_ACCOMMODATION,
        PROPERTY_OWNER,
        BROKER,
        COMPANY_HR,
    ]
    ALL = PUBLIC_ROLES + [ADMIN]


class ListingStatus:
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    ALL = [PENDING_REVIEW, APPROVED, REJECTED]


class DealType:
    RENT = "rent"
    BUY = "buy"
    ALL = [RENT, BUY]


class LeadStatus:
    NEW = "new"
    CONTACTED = "contacted"
    CONVERTED = "converted"
    LOST = "lost"
    ALL = [NEW, CONTACTED, CONVERTED, LOST]


class RelocationBatchStatus:
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ALL = [OPEN, IN_PROGRESS, COMPLETED]
