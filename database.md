# database.md — MoveSmart
### MongoDB Database Design (MVP)
**Version:** 1.0 · **Scope:** Ahmedabad · **Derived from:** PRD.md v2.0, Architecture.md v2.0

---

## 1. Design Principles

These map directly to functional requirements in PRD.md §9, so they aren't stylistic choices — each one is load-bearing:

| Principle | Why | Traces to |
|---|---|---|
| One `users` collection, all 5 roles (`find_accommodation`, `property_owner`, `broker`, `company_hr`, `admin`), distinguished by a `role` field | Role is set once, immutable from the client, and `admin` must never be reachable via public signup | FR-1, FR-2 |
| Role-specific data lives in a single `role_profile` subdocument, shaped by `role` | Keeps a Broker's commission-adjacent fields out of a Find Accommodation user's document, and vice versa — this is what makes FR-7 enforceable at the schema level, not just in application code | FR-7 |
| Every Owner/Broker-submitted listing carries `status`, defaulting to `pending_review` | No listing may appear in search/browse/bulk-search until Admin-approved | FR-3, FR-4 |
| `rejection_reason` lives directly on the listing, not a separate audit table | It must be visible to the submitter on the same object they're editing/resubmitting | FR-5 |
| Seed-ingested listings are written with `status: approved` and `source: "seed"` at ingestion time | They predate the Admin workflow and don't retroactively pass through review | FR-6 |
| `leads` references `enquiry_id` — it does not duplicate the enquiry's message/sender/receiver | An enquiry is one record; a broker's pipeline view of it is a second, thinner record layered on top. Duplicating the message risks the two drifting apart | Architecture §6 |
| `relocation_batches.employees[]` and `.allocations[]` are embedded arrays, not a separate collection | Architecture.md §6 defines them this way — batch, employees, and allocations are read/written together as one unit in every flow (§4.4), so embedding avoids an unnecessary join | Architecture §6 |
| No `notifications`, `reviews`, or `search_history` collections in MVP | Explicitly deferred — notifications need a scheduler (Celery) not in MVP scope; reviews are Phase 2/3; search history was never scoped | Architecture §10, PRD §8 |

---

## 2. Collection Overview

| # | Collection | Purpose | New in v2.0? |
|---|---|---|---|
| 1 | `users` | All 5 roles, auth + role-specific profile | Extended |
| 2 | `listings` | Seed + Owner/Broker listings, approval-gated | Extended |
| 3 | `saved_items` | Bookmarks (Find Accommodation) | Unchanged |
| 4 | `enquiries` | Structured contact: Find Accommodation → Owner/Broker | New |
| 5 | `leads` | Broker's pipeline view of enquiries against their listings | New |
| 6 | `commissions` | Manual commission tracking per converted lead | New |
| 7 | `relocation_batches` | Company/HR batch, embeds employees + allocations | New |
| 8 | `commute_cache` | Cached Maps API results | Unchanged |
| 9 | `chat_logs` | AI assistant history (optional — see note) | Optional/Phase 2 |

**Deferred (not created in MVP):** `notifications`, `reviews`, `search_history` — see §1.

---

## 3. Collection Schemas

### 3.1 `users`

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | ✓ | |
| `email` | String | ✓ | Unique index |
| `password_hash` | String | ✓ | Never returned by any API response |
| `role` | Enum String | ✓ | `find_accommodation` \| `property_owner` \| `broker` \| `company_hr` \| `admin`. Set once at `PATCH /api/auth/role`; immutable thereafter (FR-1). `admin` excluded from the public serializer's choices (FR-2) — only reachable via manual provisioning. |
| `role_profile` | Object | ✓ | Shape depends on `role` — see below |
| `created_at` | Date | ✓ | |
| `updated_at` | Date | ✓ | |

**`role_profile` shape by role:**

| Role | Fields |
|---|---|
| `find_accommodation` | `salary`, `work_or_college_location` {name, coordinates}, `rent_budget`, `lifestyle_pref`, `commute_tolerance_minutes` |
| `property_owner` | `contact_phone`, `business_name` (optional) |
| `broker` | `contact_phone`, `agency_name` (optional) |
| `company_hr` | `company_name`, `office_locations[]` {name, coordinates} |
| `admin` | *(empty — no additional profile fields)* |

**Indexes:** `{email: 1}` unique · `{role: 1}`

---

### 3.2 `listings`

The single most important collection — every role either writes to it, reads from it, or is gated by it (FR-3, FR-4, FR-8).

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | ✓ | |
| `title` | String | ✓ | |
| `description` | String | | |
| `deal_type` | Enum String | ✓ | `rent` \| `buy` |
| `price` | Number | ✓ | |
| `bhk` | Number | ✓ | |
| `area_sqft` | Number | | |
| `locality` | String | ✓ | Indexed — primary browse/filter dimension |
| `coordinates` | GeoJSON Point | ✓ | `{type: "Point", coordinates: [lng, lat]}` — for commute + geo-scoring |
| `amenities` | [String] | | |
| `images` | [String] | | URLs |
| `furnishing` | String | | |
| `status` | Enum String | ✓ | `pending_review` \| `approved` \| `rejected`. Default `pending_review` for Owner/Broker-created listings; `approved` for seed-ingested (FR-6). **This is the single field every browse/search/bulk-search query filters on (FR-3).** |
| `rejection_reason` | String \| null | | Set by Admin on reject (FR-5); cleared on resubmission |
| `owner_id` | ObjectId → `users._id` | ✓ | Set from JWT on create; every listing has exactly one owning Owner account |
| `submitted_by_broker_id` | ObjectId → `users._id` \| null | | Set when a Broker submits on an Owner's behalf — preserves provenance separately from `owner_id` |
| `source` | Enum String | ✓ | `seed` \| `platform` — distinguishes ingested seed data from live Owner/Broker submissions |
| `source_detail` | String \| null | | Which original dataset (99acres/buy/rent) for seed rows, per Architecture §6 |
| `verification_flags` | Object | | `{is_suspicious: Boolean, checked_at: Date}` — Isolation Forest output, cached per listing |
| `predicted_price_range` | Object \| null | | `{low: Number, high: Number}` — XGBoost fair-price output, cached per fetch |
| `view_count` | Number | ✓ | Default 0. Basic counter per FR/PRD §8 (not time-series — Phase 2) |
| `enquiry_count` | Number | ✓ | Default 0 |
| `created_at` | Date | ✓ | |
| `updated_at` | Date | ✓ | |

**Indexes:** `{status: 1, locality: 1}` compound (the FR-3 gate + primary browse filter, together) · `{owner_id: 1}` · `{coordinates: "2dsphere"}` · `{status: 1, deal_type: 1, price: 1}` (filtered search)

---

### 3.3 `saved_items`

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | ✓ | |
| `user_id` | ObjectId → `users._id` | ✓ | |
| `listing_id` | ObjectId → `listings._id` | ✓ | |
| `saved_at` | Date | ✓ | |

**Indexes:** `{user_id: 1, listing_id: 1}` unique compound (prevents duplicate saves)

---

### 3.4 `enquiries`

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | ✓ | |
| `listing_id` | ObjectId → `listings._id` | ✓ | |
| `from_user_id` | ObjectId → `users._id` | ✓ | The Find Accommodation user |
| `to_owner_or_broker_id` | ObjectId → `users._id` | ✓ | Resolved from the listing's `owner_id`/`submitted_by_broker_id` at creation |
| `message` | String | ✓ | One-shot structured submission — **not** a chat thread (deferred, Architecture §10) |
| `created_at` | Date | ✓ | |

**Indexes:** `{to_owner_or_broker_id: 1, created_at: -1}` (Owner's "my enquiries" view) · `{listing_id: 1}`

---

### 3.5 `leads`

A Broker's pipeline view layered on top of `enquiries` — deliberately thin, not a duplicate of the enquiry itself.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | ✓ | |
| `broker_id` | ObjectId → `users._id` | ✓ | |
| `enquiry_id` | ObjectId → `enquiries._id` | ✓ | The underlying enquiry — message/sender/listing details are read via this reference, never copied |
| `lead_status` | Enum String | ✓ | `new` \| `contacted` \| `converted` \| `lost` |
| `updated_at` | Date | ✓ | |

**Indexes:** `{broker_id: 1, lead_status: 1}` (lead board view) · `{enquiry_id: 1}` unique (one lead per enquiry)

---

### 3.6 `commissions`

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | ✓ | |
| `broker_id` | ObjectId → `users._id` | ✓ | |
| `lead_id` | ObjectId → `leads._id` | ✓ | Must reference a `converted` lead |
| `amount` | Number | ✓ | |
| `payment_status` | Enum String | ✓ | `pending` \| `received` |
| `deal_date` | Date | ✓ | |

**Indexes:** `{broker_id: 1, deal_date: -1}` — never queryable by any other role (FR-7)

---

### 3.7 `relocation_batches`

Embeds `employees[]` and `allocations[]` per Architecture §6 — these are always read/written together with the batch, so no separate collection.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | ✓ | |
| `company_id` | ObjectId → `users._id` | ✓ | The Company/HR account |
| `office_locations` | [Object] | ✓ | `{name, coordinates}` |
| `headcount` | Number | ✓ | |
| `budget` | Number | ✓ | Total batch budget |
| `employees` | [Object] | ✓ | `{employee_id (String, batch-local), name, constraints: {budget, preferences}}` |
| `allocations` | [Object] | | `{employee_id, listing_id, allocated_by (users._id), allocated_at, cost}` |
| `status` | Enum String | ✓ | `open` \| `in_progress` \| `completed` |
| `created_at` | Date | ✓ | |

**Derived (not stored, computed server-side on read):** budget-used = sum of `allocations[].cost`; budget-remaining = `budget` − budget-used. Per Architecture §4.4, this is computed in `GET .../:id`, not persisted, to avoid drift.

**Indexes:** `{company_id: 1, created_at: -1}`

---

### 3.8 `commute_cache`

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | ✓ | |
| `origin_locality` | String | ✓ | |
| `destination` | GeoJSON Point | ✓ | |
| `mode` | Enum String | ✓ | `driving` \| `transit` \| `walking` \| `auto` |
| `duration_minutes` | Number | ✓ | |
| `distance_km` | Number | | |
| `fetched_at` | Date | ✓ | |
| `expires_at` | Date | ✓ | TTL index — commute data doesn't change often but shouldn't be stale indefinitely |

**Indexes:** `{origin_locality: 1, destination: 1, mode: 1}` compound (cache lookup) · `{expires_at: 1}` TTL index

---

### 3.9 `chat_logs` *(optional — Architecture.md marks this Phase 2)*

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | ✓ | |
| `user_id` | ObjectId → `users._id` | ✓ | |
| `messages` | [Object] | ✓ | `{role: "user"\|"assistant", text, timestamp}` |
| `created_at` | Date | ✓ | |

If the assistant is stateless per-session in MVP, this collection can be skipped entirely at launch and added without migration cost later — nothing else references it.

---

## 4. Relationships

```
users (role: find_accommodation)
   │
   ├──< saved_items >── listings
   │
   └──< enquiries >──── listings
            │                │
            │                └── owner_id / submitted_by_broker_id ──> users (role: property_owner / broker)
            │
            └──(1:1)── leads ──< commissions
                          │
                          └── broker_id ──> users (role: broker)

users (role: company_hr)
   │
   └──< relocation_batches
            (embeds employees[], allocations[] → listings)

listings.owner_id ──────> users (role: property_owner)
listings.submitted_by_broker_id ──> users (role: broker)  [nullable]
```

Note the two independent role chains hanging off `listings.owner_id` and `submitted_by_broker_id` — this is what lets FR-7 hold (an Owner sees only their own listings' enquiries/analytics) even when a Broker submitted the listing on the Owner's behalf.

---

## 5. Collections Table Removed From Your Draft (and why)

| Removed | Reason |
|---|---|
| `employee_allocations` | Architecture.md §6 embeds allocations inside `relocation_batches`, not a separate collection — this was the one structural inconsistency with your own architecture doc |
| `notifications` | Explicitly deferred to Phase 2 in Architecture.md §10 (needs Celery/scheduler, not in MVP) |
| `reviews` | PRD §8 tags this Phase 2/3 |
| `search_history` | Never scoped anywhere in PRD or Architecture for MVP |

---

## 6. Summary: Final MVP Collection Count

**9 collections** (down from your draft's 11, with `chat_logs` optional): `users`, `listings`, `saved_items`, `enquiries`, `leads`, `commissions`, `relocation_batches`, `commute_cache`, and optionally `chat_logs`.

This matches Architecture.md §6's collection list exactly, with the field-level detail your draft was missing (status/approval fields, provenance fields, and the `leads`-references-`enquiries` relationship) filled in.
