# Rules.md — MoveSmart
### Guardrails for AI-Assisted Development
**Version:** 1.0 · **Applies to:** any AI tool (Claude, Copilot, Cursor, etc.) generating or editing code in this repo
**Last updated:** July 27, 2026

This document is the source of truth for how code should be written in this project. If a suggestion conflicts with this file, this file wins. If unsure, ask rather than guess.

---

## 1. Stack Lock — Do Not Substitute

| Layer | Required | Do NOT introduce |
|---|---|---|
| Frontend | React + JSX | Vue, Svelte, Angular, TypeScript conversion (unless explicitly requested) |
| Backend | Django + Django REST Framework | Flask, FastAPI, Node/Express for API logic |
| Database | MongoDB via **PyMongo** | Django ORM models (`models.Model`), `djongo`, `mongoengine` — unless this file is explicitly updated first |
| Rent prediction | XGBoost | scikit-learn `RandomForestRegressor`, LightGBM, deep learning, or any "let me try a different model" substitution |
| Suspicious listing detection | Isolation Forest | One-Class SVM, autoencoders, or any supervised classifier (we have no fraud labels — don't invent a classification approach) |
| Area/property recommendation | Rule-based scoring/ranking | Do not silently replace with a trained ranking model — no labeled "best area" ground truth exists to train on |
| AI Assistant | Gemini API | OpenAI, Claude API, or any other LLM provider, unless explicitly requested |
| Styling | Tailwind CSS | CSS-in-JS libraries (styled-components, emotion), Bootstrap, Material UI, unless explicitly requested |
| Auth | JWT (`djangorestframework-simplejwt`) | Session-based auth, OAuth-only, custom token schemes |

**Rule:** If a task seems to require a library/tool not listed in Architecture.md, stop and ask before adding a new dependency — don't add it silently to "make it work."

---

## 2. Library Policy

**Allowed without asking:**
- Anything already in `requirements.txt` / `package.json`.
- Standard library (Python `os`, `json`, `datetime`, etc.; JS built-ins).
- Well-known, narrowly-scoped utility additions that don't change architecture (e.g., `python-dotenv` for env vars, `axios` for frontend HTTP calls).

**Requires explicit approval before adding:**
- Any new ML/data library.
- Any new state-management library for React (Redux, Zustand, etc.) — start with React Context + hooks; only escalate if genuinely needed and ask first.
- Any background job/queue system (Celery, RQ) — explicitly deferred per Architecture.md §10.
- Any new external API/service integration beyond Gemini and the Maps API already scoped.

**Never add:**
- Libraries with no recent maintenance activity or unclear licensing.
- Anything that duplicates functionality already covered by the locked stack (e.g., a second HTTP client, a second CSS framework, a second charting library once one is chosen).

---

## 3. Data Handling Rules

- **Never fabricate data.** If a listing field is missing (e.g., no coordinates, no RERA status), represent it as missing/null in the response — do not guess or interpolate a plausible-looking value and present it as real.
- **Never fabricate ML outputs.** If a model hasn't been trained yet or a required feature is missing for a given listing, return an explicit "prediction unavailable" state — do not fall back to a hardcoded placeholder number.
- **Cost-of-living figures** (food, transport, utilities) are estimates, not measured data (see PRD §8/§10). Any code or UI text presenting them must make clear they are estimates — never phrase them as precise facts.
- **Source attribution stays intact.** When listings are ingested from the 4 source JSON files, preserve `source_url` and `deal_type`/`source_detail` fields all the way through the normalized schema — never strip provenance during transformation.
- **PII handling:** contact details, dealer names, and phone numbers present in raw listing data should not be exposed via the public API unless a feature explicitly requires it and that's been confirmed.

---

## 4. Error Handling

- **Never let a failed external call take down a request silently returning wrong data.** Maps API and Gemini API calls must be wrapped in explicit try/except with a clear fallback response (e.g., "commute data temporarily unavailable" — not a 0 or empty guess presented as real).
- **Gemini rate limits (free tier):** the assistant endpoint must catch quota/rate-limit errors specifically and return a graceful, user-facing message — not a raw 500 or stack trace.
- **ML inference failures** (e.g., missing feature, corrupted artifact) must be caught per-listing, not per-request — one bad listing should not break the whole listings response. Log the failure, return that listing without the prediction field.
- **Every DB write should be validated by a DRF serializer before hitting PyMongo** — do not write raw, unvalidated request bodies into MongoDB.
- **No bare `except:` blocks.** Always catch specific exceptions. If genuinely unsure what to catch, catch `Exception` once, log it with context (endpoint, user id if available, input summary), and re-raise or return a clean error — never swallow silently.
- **Frontend:** every API call must handle both the error and loading state in the UI — no unhandled promise rejections, no components that break/blank-screen on a failed fetch.

---

## 5. Security & Secrets

- No API keys, DB connection strings, or secrets committed to the repo, ever — use environment variables (`.env`, excluded via `.gitignore`) and document required vars in `.env.example`.
- Gemini and Maps API calls happen **server-side only** — the frontend never holds or calls these APIs directly with a key.
- Passwords are hashed (Django's built-in password hashing) — never stored or logged in plaintext.
- JWT secret and expiry are configured via environment/settings, not hardcoded.
- User-submitted input (chat messages to the assistant, profile fields) must be sanitized/validated before being interpolated into any prompt sent to Gemini, to avoid prompt injection affecting other users' context.

---

## 6. Code Style & Structure

- Follow the folder structure defined in `Architecture.md` — new files go in the module they logically belong to; don't create ad-hoc top-level files or bypass the `apps/` structure.
- **Backend:** PEP 8, type hints on function signatures where practical, docstrings on any non-trivial function (especially in `ml/` and `scoring.py`/`ranking.py` where logic isn't self-evident).
- **Frontend:** functional components + hooks only — no class components. Keep components focused; if a component exceeds ~200 lines or mixes clearly unrelated concerns, split it.
- **No dead code left behind.** If a suggestion replaces existing logic, remove the old logic — don't leave commented-out blocks "just in case."
- **No speculative abstraction.** Don't build generic/pluggable systems (e.g., a multi-provider LLM abstraction layer) for a single current use case (Gemini only). Build for what's needed now; Architecture.md already flags what's deferred.

---

## 7. ML-Specific Rules

- Training scripts (`train.py`) and inference code (`model.py`) stay separate — inference code must not re-train or re-fit on the fly inside a request.
- Model artifacts are loaded once at Django startup, not per-request (performance rule from Architecture.md §7).
- Any change to feature engineering (`ml/shared/feature_engineering.py`) must be applied consistently to both training and inference — a mismatch here is a silent correctness bug, treat it as high severity.
- Do not tune or replace a model's hyperparameters/algorithm as a side effect of an unrelated task ("while I was in there I also improved the model") — model changes are their own reviewed change.
- Isolation Forest output is a **flag/signal**, not a certainty — code and UI copy must never state a listing "is fake," only that it "looks unusual compared to similar listings" or similar hedged language.

---

## 8. What the AI Should Always Do

- Ask before adding a new dependency, changing the DB access pattern, or introducing a new external service.
- Point out when a request conflicts with Architecture.md or this file, rather than silently complying.
- Flag when a request would require data the current datasets don't have (e.g., "we don't have amenity/gym data — I'll stub this or ask how you want to source it").
- Default to the simplest implementation that satisfies the MVP scope in PRD.md — no premature optimization, no premature scaling (queues, caching layers, microservices) unless asked.
- Write code that fails loudly in development (clear errors/logs) and gracefully in user-facing responses.

## 9. What the AI Should Never Do

- Never invent data, predictions, or API responses to make a demo "look complete."
- Never silently swap a specified library/model/framework for a different one, even if it seems "better."
- Never commit secrets or disable auth/validation to make something work faster.
- Never claim a fake/suspicious listing "is" fraudulent — only that it's flagged for review.
- Never restructure the folder layout or introduce a new architectural pattern (e.g., microservices, GraphQL) without this file and Architecture.md being updated first.

---

## 10. When Rules Conflict With a Request

If a user request would violate this file (e.g., "just hardcode the commute time for now" or "add Redux for this one component"), the AI should:
1. Do the small, obviously-fine version if it's genuinely low-risk and clearly scoped (e.g., a temporary hardcoded value for local testing, clearly labeled as such).
2. For anything structural (new library, new service, new pattern), say so explicitly and ask for confirmation rather than proceeding — don't refuse outright, just flag the tradeoff and confirm before deviating from the locked stack.
