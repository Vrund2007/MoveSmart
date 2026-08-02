# PRD.md — MoveSmart
### The AI-Powered City Relocation Marketplace
**Version:** 2.0 (MVP scope) · **Status:** Draft · **Last updated:** July 31, 2026

> **Change log (v1.0 → v2.0):** MoveSmart has expanded from a single-sided tool (for people relocating) into a **multi-role marketplace** connecting four user types: Find Accommodation, Property Owner, Broker/Agent, and Company/HR, moderated by an internal Admin role. The original relocation-intelligence engine (area recommendation, commute, cost-of-living, AI assistant) is preserved in full as the core of the **Find Accommodation** role — it is not being replaced, it's now one of four roles served by the same platform.

---

## 1. Summary

When someone has to move to a new city, they currently jump between 8+ disconnected tools — property portals, Google Maps, WhatsApp groups, spreadsheets, ChatGPT, and brokers — to answer basic questions about housing, commute, cost, and lifestyle. At the same time, the people who could help them — **property owners, brokers, and company HR teams handling employee relocation** — have no single place to reach these movers either. Owners list flats blindly across scattered portals, brokers juggle clients and commissions in spreadsheets, and HR teams coordinate relocations manually over email.

**MoveSmart** is a relocation marketplace that connects these four sides:

1. **Find Accommodation** — the person relocating, who gets AI-driven area recommendations, real listings, commute analysis, and cost-of-living estimates.
2. **Property Owner** — lists and manages their own properties, receives enquiries.
3. **Broker/Agent** — manages listings and clients across multiple owners, tracks leads and commissions.
4. **Company/HR** — manages employee relocation at scale: bulk housing search, employee-to-housing allocation, and relocation budgets.

All listings entering the marketplace (from Owners or Brokers) pass through **Admin approval** before they become visible to anyone searching or browsing — this is what keeps the "AI relocation assistant" trustworthy: it's reasoning over vetted supply, not an open unmoderated feed.

MoveSmart is still **not** a generic property portal like 99acres/MagicBricks. It's a **decision-making layer with a moderated supply side underneath it** — the AI intelligence that answers "where should I live and what will my life cost" now sits on top of a marketplace where the listings themselves are sourced, verified, and kept current by the people who actually own or manage them.

---

## 2. Problem Statement

### For the person relocating (Find Accommodation) — unchanged from v1.0
A person relocating to a new city must answer 8 questions using 8 different disconnected tools:

| # | Question | Tool used today |
|---|----------|-----------------|
| 1 | Where should I even look for housing? | Google, word of mouth |
| 2 | Can I afford that area on my salary? | Excel / mental math |
| 3 | How far is it from my office/college? | Google Maps |
| 4 | How long will my commute be? | Google Maps |
| 5 | What is that neighbourhood actually like? | WhatsApp groups, friends |
| 6 | What will my monthly expenses be? | Excel, guesswork |
| 7 | Where's the good food/gym/transport nearby? | Local knowledge, forums |
| 8 | Is this listing real or a scam? | Local brokers, luck |

### For the other three sides of the marketplace — new in v2.0

| Role | Problem today |
|---|---|
| **Property Owner** | Lists flats across multiple disconnected portals, manages enquiries over calls/WhatsApp with no tracking, has no visibility into how the listing is performing. |
| **Broker/Agent** | Juggles multiple owners' inventory and multiple clients' needs in spreadsheets or memory; commission tracking and lead status are informal and easy to lose track of. |
| **Company/HR** | Coordinates relocations for new hires manually — emailing listings back and forth, tracking budgets in a spreadsheet, with no structured way to search housing near an office or allocate employees to homes. |

This produces stress and wasted time on the demand side, and inefficiency and lost business on the supply side — with no platform today serving both sides together, grounded in the same underlying data.

---

## 3. Goals & Non-Goals

### Goals (MVP)

**Platform-wide**
- Support four distinct roles with dedicated onboarding, dashboards, and permissions: Find Accommodation, Property Owner, Broker/Agent, Company/HR.
- Route new signups through a **"Choose Your Journey"** role-selection step before any role-specific onboarding.
- Gate all Owner/Broker-submitted listings behind **Admin approval** before they appear anywhere in search, recommendations, or browsing.

**Find Accommodation** (carried over from v1.0, unchanged)
- Let a user describe their situation (budget, work/college location, lifestyle, commute tolerance) once.
- Recommend the best-fit **localities** in Ahmedabad, with reasoning.
- Show **real, admin-approved listings** (rent + buy) within those localities.
- Estimate **commute** from a locality to the user's office/college.
- Estimate **cost of living** per locality (rent + essentials).
- Provide a **conversational AI assistant** grounded in this data.
- Flag listings that look unreliable with a basic trust signal.
- Save/bookmark listings, compare areas.

**Property Owner**
- Create, edit, and delete property listings, including photos.
- Mark availability status.
- Receive and view enquiries from prospective tenants/buyers.
- View basic listing analytics (views, enquiries).
- Manage multiple properties from one dashboard.

**Broker/Agent**
- Manage multiple owners and their listings from one dashboard.
- Manage multiple client relationships and enquiries (lead management).
- Track commission per deal.
- View property/listing analytics across their managed inventory.
- Use AI-assisted recommendations when matching clients to properties.

**Company/HR**
- Manage employee relocations from a dedicated dashboard (not a property buyer/seller role).
- Search housing in bulk for a group of incoming employees.
- Search housing near a given office location.
- Allocate specific employees to specific housing options.
- Track and manage a relocation budget.
- Generate employee relocation reports.
- Use AI recommendations for employee housing matches.
- Partner with owners and brokers (light-touch in MVP — see §8).

**Admin (internal, not a public-facing role)**
- Review and approve/reject listings submitted by Owners and Brokers before they go live.
- Admin accounts are provisioned manually — Admin is never a selectable signup option.

### Non-Goals (MVP)
- In-platform payments, rent collection, or lease/contract execution.
- Multi-city coverage (MVP is **Ahmedabad-only**, matching the available datasets).
- Real-time live scraping (seed data is a static/batch dataset refreshed periodically; Owner/Broker-submitted listings are live and admin-moderated).
- Native mobile apps (web-first).
- Legal/contract handling for leases.
- In-app messaging between roles (enquiries are structured form submissions in MVP, not a chat system).
- Automated/ML-based listing moderation — Admin approval is a manual review step in MVP (see Architecture.md; automated pre-screening using the existing Isolation Forest suspicious-listing signal is a Phase 2 assist, not a replacement for human approval).
- Role switching / multi-role accounts (a user picks one role at signup; changing roles later is Phase 2).

---

## 4. User Personas by Role

### 4.1 Find Accommodation (unchanged sub-personas from v1.0)

| User type | Core need |
|---|---|
| **Students** | Afford housing near college on a tight budget; hostel vs. flat decision |
| **Fresh graduates** | First job, first city — need commute + rent + lifestyle solved together |
| **Working professionals** | Optimize area choice around a known salary and commute tolerance |
| **Families** | Schools, hospitals, safety, more space, bigger checklist |
| **Remote workers** | Choosing a *lifestyle* area, not office-driven; internet, cafes, social scene |
| **Expats** | Need everything explained from scratch — norms, language, areas |

### 4.2 Property Owner
An individual or small landlord with one or more properties in Ahmedabad who wants direct visibility and enquiry flow without depending solely on a broker.

### 4.3 Broker/Agent
A real estate professional managing inventory across multiple property owners and fielding demand from multiple clients simultaneously; needs organization and tracking more than discovery.

### 4.4 Company/HR
An HR or People-Ops professional at a company relocating one or more new hires to Ahmedabad. **This role is not a property buyer or seller** — they source and coordinate housing on behalf of employees, against a budget, and need to report on outcomes.

### 4.5 Admin (internal)
Not a public persona. An internal operator responsible for listing quality control. Not part of the signup flow.

MVP will primarily validate the **Find Accommodation** role first (as in v1.0), since it's the clearest, most data-supported flow with the current datasets — but the **Property Owner** and **Admin approval loop** must ship alongside it in MVP, since Find Accommodation's listing supply now depends on it (see §11). Broker/Agent and Company/HR are scoped for MVP but can trail slightly if sequencing pressure requires it.

---

## 5. Core Concept: The Four Districts

*(Unchanged — this remains the reasoning framework behind area recommendations.)*

MoveSmart organizes any city into four conceptual "districts" (not literal map zones) used to score and explain each locality:

1. **Residential** — where people live: rent ranges, safety, amenities. (Families, students, long-term renters.)
2. **Business** — where jobs are: commute time, office clusters. (Professionals, fresh grads, Company/HR relocations.)
3. **Lifestyle** — quality of daily life: restaurants, gyms, walkability. (Remote workers, young professionals.)
4. **Transit** — how you move: metro/bus/auto availability, commute cost. (Everyone.)

Each recommended locality is scored against these four dimensions, weighted by the user's stated priorities. This scoring engine is reused by the **Company/HR** bulk-search feature (scoring localities relative to an office location) and by the **Broker's** AI-assisted client-matching feature — one scoring engine, multiple consumers (see Architecture.md §7).

---

## 6. Authentication & Onboarding Flow (New in v2.0)

```
Create Account
      ↓
Choose Your Journey
  • Find Accommodation
  • Property Owner
  • Broker / Agent
  • Company / HR
      ↓
Role-specific onboarding
      ↓
Role-specific dashboard
```

- **Admin is never a selectable role at signup.** Admin accounts are created manually — not exposed via the public registration API. See Architecture.md §2 for how this is enforced server-side, not just hidden in the UI.
- Role is chosen once at signup and stored on the user record; it determines which dashboard and permissions the user gets. Switching roles later is out of scope for MVP.
- Each role's onboarding collects only what that role needs:
  - **Find Accommodation:** the 5-question profile (unchanged from v1.0, see §7.1).
  - **Property Owner:** basic contact/business info, prompt to add their first listing.
  - **Broker/Agent:** basic contact/business info, agency name (optional), prompt to add owners/listings they manage.
  - **Company/HR:** company name, office location(s), prompt to start a relocation batch.

---

## 7. User Flows by Role

### 7.1 Find Accommodation (unchanged from v1.0)

1. **Life event** — user gets a job offer / admission in Ahmedabad and needs to decide where to live.
2. **Sign up** → chooses "Find Accommodation" on the Choose Your Journey screen.
3. **Profile inputs** (5 questions): monthly salary/budget, office or college location, maximum rent budget, lifestyle preference, acceptable commute time.
4. **Analysis** (system, behind the scenes): map candidate localities, estimate commute, pull rent/price data from **admin-approved listings**, score localities, estimate cost of living.
5. **Results, delivered in layers:** District recommendations → Housing suggestions → Commute insights → Cost-of-living breakdown → Relocation plan.
6. **Decision** — user picks a locality and, optionally, a specific listing, and can raise an enquiry directly to the Owner/Broker who listed it.

### 7.2 Property Owner

1. Sign up → chooses "Property Owner."
2. Onboarding → basic profile, prompted to add a first property.
3. **Create listing** → property details, photos, price, availability → submitted with status `pending_review`.
4. **Admin review** → listing is approved (goes live, visible to Find Accommodation search) or rejected (owner is notified with a reason, can edit and resubmit).
5. **Manage** → edit/delete listings, toggle availability, view enquiries as they come in, view basic per-listing analytics (views, enquiry count).

### 7.3 Broker/Agent

1. Sign up → chooses "Broker/Agent."
2. Onboarding → basic profile, agency info.
3. **Add owners & listings** → broker can add listings on behalf of owners they represent → same `pending_review` → Admin approval flow as §7.2.
4. **Manage leads** → incoming enquiries across all their listings appear as leads with a status (new / contacted / converted / lost).
5. **Track commission** → broker records/tracks commission expected or earned per converted deal.
6. **AI-assisted client matching** → broker inputs a client's requirements (same shape as the Find Accommodation profile: budget, location, preferences) and gets the same area/property scoring used in §7.1, to help match a client to inventory faster.

### 7.4 Company/HR

1. Sign up → chooses "Company/HR."
2. Onboarding → company name, office location(s).
3. **Start a relocation batch** → HR enters a group of incoming employees (or one at a time) with basic constraints (budget per employee, office location, headcount).
4. **Bulk housing search** → system searches admin-approved listings near the specified office location(s), using the same area-scoring engine as Find Accommodation.
5. **Allocate** → HR assigns specific employees to specific housing options from the results.
6. **Track budget** → running total against the relocation budget set for the batch.
7. **Report** → generate a relocation report (who was allocated where, at what cost) for internal use.

### 7.5 Admin (internal)

1. Admin logs in via a separate, non-public flow (see Architecture.md §2).
2. **Review queue** → sees all `pending_review` listings submitted by Owners/Brokers.
3. **Approve or reject** → approving makes a listing visible platform-wide (Find Accommodation search, Company/HR bulk search, Broker inventory); rejecting returns it to the submitter with a reason field.
4. This gate applies to **every** Owner/Broker-submitted listing — there is no path for a listing to go live without passing through Admin.

---

## 8. Feature List (MVP-tagged, by role)

### Platform / Auth
- [MVP] "Choose Your Journey" role selection at signup
- [MVP] Role-specific onboarding flows (4 roles)
- [MVP] Role-based dashboards and permissions
- [MVP] Admin listing approval/rejection workflow (manual review)
- [Phase 2] Automated pre-screening assist for Admin using the existing Isolation Forest suspicious-listing signal (still human-approved, not auto-decided)
- [Phase 2] Role switching / multi-role accounts

### Find Accommodation
- [MVP] Registration/profile (salary, budget, work/college location, lifestyle, commute tolerance)
- [MVP] Locality recommendation (ranked, explained)
- [MVP] Cost-of-living estimation (itemized, per locality)
- [MVP] Commute estimation (time by mode)
- [MVP] Housing listing browse & filter, sourced from seed datasets + admin-approved Owner/Broker listings
- [MVP] Save/bookmark listings
- [MVP] Conversational AI assistant, grounded in locality/listing/commute data
- [MVP] Send an enquiry to a listing's Owner/Broker
- [Phase 2] Area comparison (side-by-side 2–3 localities)
- [Phase 2] Rent prediction model (ML-based fair price range)
- [Phase 2] Personalized recommendations based on behavior (preference learning)

### Property Owner
- [MVP] Create/edit/delete listings, upload photos
- [MVP] Mark availability
- [MVP] Receive and view enquiries
- [MVP] Manage multiple properties from one dashboard
- [Phase 2] Listing analytics (views, enquiry trends over time)

### Broker/Agent
- [MVP] Manage multiple owners and listings
- [MVP] Handle customer enquiries / lead list
- [MVP] Lead status tracking (new / contacted / converted / lost)
- [MVP] Commission tracking (manual entry per deal)
- [MVP] AI-assisted recommendation for matching a client to properties (reuses Find Accommodation's scoring engine)
- [Phase 2] Property/portfolio analytics dashboard

### Company/HR
- [MVP] Employee relocation dashboard
- [MVP] Bulk accommodation search near a given office location
- [MVP] Allocate employees to housing
- [MVP] Relocation budget tracking
- [MVP] Employee relocation reports (basic export/summary)
- [MVP] AI recommendations for employee housing (reuses area-scoring engine)
- [Phase 2] Structured partnering workflow with specific Owners/Brokers (preferred-partner relationships)

### Admin
- [MVP] Listing approval/rejection queue
- [MVP] Rejection reason capture, visible to the submitting Owner/Broker
- [Phase 2] Full admin dashboard (user management, platform-wide analytics)
- [Phase 3] Review sentiment analysis on user-submitted area reviews

---

## 9. Functional Requirements (New Section in v2.0)

- **FR-1:** The system must persist a `role` on every user account, set once at signup, from a fixed enum: `find_accommodation`, `property_owner`, `broker`, `company_hr`, `admin`.
- **FR-2:** `admin` must not be selectable through the public registration flow under any input — this must be enforced server-side (not just hidden in the UI), since a hidden-but-reachable option is not a real control.
- **FR-3:** Every listing created by a `property_owner` or `broker` must be created with status `pending_review` and must not appear in any Find Accommodation search, Company/HR bulk search, or public browse endpoint until its status is `approved`.
- **FR-4:** Only an `admin`-role account may transition a listing from `pending_review` to `approved` or `rejected`.
- **FR-5:** A `rejected` listing must carry a reason, visible to the submitting Owner/Broker, and must be editable/resubmittable (returns to `pending_review`).
- **FR-6:** Seed listings (from the 4 original datasets) are treated as pre-approved at ingestion — they do not retroactively pass through the Admin queue, since they predate this workflow. Whether an Owner can later "claim" a seed listing (and whether that claim re-triggers review) is a Phase 2 decision, flagged but not resolved here.
- **FR-7:** Role-based dashboards must only expose data relevant to that role — e.g., a Broker's commission data must never be visible to a Find Accommodation user, and an Owner must only see enquiries/analytics for their own listings, not another Owner's.
- **FR-8:** The area-scoring engine (§5) is a shared service consumed by three different features (Find Accommodation recommendations, Broker client-matching, Company/HR bulk search) — it must not be duplicated per-role; see Architecture.md §7 for the shared-service design.

---

## 10. Success Metrics

**Find Accommodation** (unchanged from v1.0)
- Activation: % of signed-up users who complete the 5-question profile.
- Time-to-decision: median time from profile completion to a saved/bookmarked listing.
- Recommendation usefulness: % of users who view listings in a recommended locality.
- Assistant engagement: % of sessions using the AI assistant.
- Retention: % of users who return to compare a second locality or update their profile.

**Property Owner / Broker** (new)
- Listings submitted vs. approved vs. rejected (approval rate — also a proxy for listing quality over time).
- Median time from listing submission to Admin decision (approval turnaround).
- Median time from listing going live to first enquiry.
- Broker: leads converted / leads total; commission tracked per period.

**Company/HR** (new)
- Number of employees successfully allocated to housing per relocation batch.
- Median time from batch creation to full allocation.
- Budget adherence (allocated cost vs. planned budget).

**Admin** (new)
- Approval queue turnaround time (median time a listing spends in `pending_review`).
- Rejection rate and most common rejection reasons (signal for what Owner/Broker guidance to improve).

---

## 11. Sequencing Note (MVP Build Order)

Because Find Accommodation's listing supply now depends on the Owner/Broker/Admin loop, a sensible build order is:
1. Auth + Choose Your Journey + role-based routing (foundation for everything else).
2. Property Owner listing creation + Admin approval queue (unblocks real supply).
3. Find Accommodation (as in v1.0, now reading from approved listings).
4. Broker/Agent (extends Owner's listing model to multi-owner management + leads/commission).
5. Company/HR (reuses the scoring engine + approved listings, adds batch/allocation/budget on top).

This is a suggested sequence, not a hard phase gate — Broker and Company/HR can be built in parallel with Find Accommodation once the listing + approval foundation exists, if resourcing allows.

---

## 12. Risks & Open Questions

- **Data freshness:** seed dataset is a point-in-time scrape (July 2026); need a policy for how it coexists with live Owner/Broker-submitted listings over time.
- **Trust/legal:** seed listings are sourced from 99acres — confirm terms of use before public launch; Owner/Broker-submitted listings raise new questions around listing ownership verification (out of scope for MVP — Admin review is manual judgment, not identity/document verification).
- **Cost-of-living accuracy:** still directional estimates, not measured data — must stay clearly labeled (unchanged from v1.0).
- **Admin bottleneck:** a single manual approval queue could become a bottleneck as Owner/Broker submissions grow — flagged for Phase 2 (automated pre-screening assist), not solved in MVP.
- **Role ambiguity:** some real users may plausibly fit two roles (e.g., someone relocating themselves who also owns a property elsewhere) — MVP forces one role per account; revisit if this proves too restrictive.
- **Single-city scope:** unchanged — validate in Ahmedabad first.
- **Commute API dependency:** unchanged, now used by three features (Find Accommodation, Broker matching, Company/HR bulk search) instead of one — cost/rate-limit exposure grows accordingly.

---

## 13. Future Roadmap (beyond MVP)

- Automated pre-screening assist for Admin (Isolation Forest signal surfaced in the review queue).
- Role switching / multi-role accounts.
- In-app messaging between Find Accommodation users and Owners/Brokers (replacing structured-enquiry-only contact).
- Owner claiming of seed listings.
- Structured Owner/Broker ↔ Company/HR partnership workflows.
- Multi-city expansion once the four-district framework is validated in Ahmedabad.
- Review sentiment analysis on user-submitted area reviews.
- Full platform-wide Admin analytics dashboard.

---

## 14. Out of Scope for This Document

Technical architecture, API design, ML model specs, and UI/visual design are covered in Architecture.md and Design.md. This PRD defines **what** is being built and **why**, not **how**.
