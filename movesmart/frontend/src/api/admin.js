// api/admin.js — API client for Admin review queue endpoints (new v2.0, Architecture.md §8)
// Admin accounts are provisioned manually — never via public signup (FR-2)
import axios from 'axios';

// TODO: implement getReviewQueue(status) → GET /api/admin/listings?status=pending_review
// TODO: implement reviewListing(listingId, decision) → PATCH /api/admin/listings/:id/review
//       decision: { decision: 'approved' } or { decision: 'rejected', reason: '...' }
//       Only an admin-role account may call this endpoint — enforced server-side (FR-4)
