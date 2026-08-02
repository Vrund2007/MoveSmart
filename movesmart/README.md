# MoveSmart — AI-Powered City Relocation Marketplace

MoveSmart is a relocation marketplace that connects four sides of the housing market in Ahmedabad: people relocating who need AI-driven area recommendations, real listings, commute analysis, and cost-of-living estimates (**Find Accommodation**); landlords and small property owners who want a managed channel to list their properties and receive enquiries (**Property Owner**); real estate professionals managing inventory across multiple owners and clients (**Broker/Agent**); and HR teams coordinating employee relocations at scale with bulk housing search, employee-to-housing allocation, and budget tracking (**Company/HR**). All listings submitted by Owners and Brokers pass through a manual **Admin** approval step before they become visible to anyone searching, ensuring the relocation intelligence engine reasons over vetted supply. The platform is Ahmedabad-only for MVP, web-first, and built on a Django + MongoDB + React stack with XGBoost rent prediction, Isolation Forest listing trust signals, and a Gemini-powered conversational assistant. See PRD.md §1 for the full product summary.

---

## Docs

| Document | Purpose |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product requirements — what is being built and why |
| [docs/Architecture.md](docs/Architecture.md) | System architecture, stack choices, folder structure, API surface |
| [docs/Design.md](docs/Design.md) | Visual design system — color palette, typography, Tailwind mapping |
| [docs/Rules.md](docs/Rules.md) | AI-assisted development guardrails — stack lock, library policy, code style |
| [docs/database.md](docs/database.md) | MongoDB collection schemas, indexes, relationships |
| [docs/API_Spec.md](docs/API_Spec.md) | API request/response contracts (placeholder — not yet written) |

---

## Getting Started

> **Note:** These are placeholder commands. Nothing has been installed or migrated yet — this section will be verified and updated as each layer is implemented.

### Prerequisites

- Python 3.11+
- Node.js 20+
- MongoDB (local or Atlas URI)
- A `.env` file based on `.env.example`

### Backend (Django + DRF)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

### Frontend (React + Tailwind)

```bash
cd frontend
npm install
npm start
```

### Data Ingestion (seed listings)

```bash
# Run after backend is up and MONGO_URI is set in .env
python backend/data_ingestion/load_99acres_condensed.py
python backend/data_ingestion/load_buy_listings.py
python backend/data_ingestion/load_rent_listings.py
```
