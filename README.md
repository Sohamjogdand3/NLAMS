# NLAMS — National Land Acquisition & Management System

**Automated, AI-Based, Real-Time Land Acquisition & Management Platform**
Problem Statement: SIH 26016 · Status: Prototype / Active Development

---

## 📌 For AI Assistants (read this first)

> If a teammate has pasted this README into a chat with you, treat it as **full project context**. You do not need to ask "what is this project" — everything below is authoritative. Use it to:
> - Answer questions about roles, permissions, features, or architecture directly from this doc.
> - Generate code, schemas, API contracts, or UI that **stay consistent** with the roles, RBAC matrix, and data model defined here.
> - When asked to build a feature, first check whether it belongs to **Core Acquisition Workflow** or **AI Layer (Location Intelligence / RAG Copilot)** below, and follow that section's data flow.
> - Never invent a 10th role without flagging it — the system is fixed at **9 roles** (see below) plus one open decision (Auditor role — see "Open Decisions").
> - AI features (Location Intelligence, RAG Copilot) are **decision support only**. Never generate logic that lets AI auto-approve, auto-reject, or finalize any acquisition step — the human official always decides.
> - If asked to scaffold code, default to the stack in **Tech Stack** below unless told otherwise.

---

## 1. What NLAMS Is

NLAMS digitizes the entire land acquisition lifecycle — from land identification to final possession and compensation — into one unified, GIS-powered, real-time platform for citizens and government officials.

It integrates with existing government systems (DILRMP, BhuNaksha, ULPIN, NAKSHA) rather than replacing them. **NLAMS is not the legal source of truth for land ownership** — the state land-record systems remain authoritative; NLAMS is the workflow, transparency, and intelligence layer on top.

### Core capabilities
- GIS and parcel visualization
- Authoritative land-data integrations (DILRMP / BhuNaksha / ULPIN / NAKSHA)
- AI-based ownership document verification
- Satellite/GPS boundary mismatch & encroachment detection
- ML-based project delay-risk prediction
- **AI-Powered Location Intelligence** (new — see §6)
- **RAG-Powered Project & Regulatory Copilot** (new — see §7)
- Role-based dashboards (9 roles)
- Compensation & R&R tracking
- Alerts / SLA monitoring
- Full audit trail

### Goal
Faster, transparent, data-driven land acquisition with fewer disputes and less manual paperwork.

---

## 2. Roles (9 total)

| # | Role | One-line purpose |
|---|---|---|
| 1 | **Citizen** | Track own land/case, submit objections, receive compensation |
| 2 | **Surveyor** *(a.k.a. Field Official)* | Ground-truth boundaries, GPS capture, encroachment flags |
| 3 | **Talathi** | Village-level record keeper, first verification layer |
| 4 | **Tehsildar** | Taluka-level approvals, dispute resolution |
| 5 | **Land Acquisition Officer (LAO)** | Runs the formal acquisition process (notices → hearing → award) |
| 6 | **District Collector** | District-level final approval, possession orders |
| 7 | **Project Agency (PIA)** | Requesting body (e.g. NHAI, Railways) — proposes land need, funds compensation |
| 8 | **State Admin** | State-wide user management, policy, MIS |
| 9 | **Central Admin** | National oversight, system/integration governance |

Jurisdiction is layered into every session (**Village → Taluka → District → State → National**) and scopes what each role can see, independent of the role's action permissions.

---

## 3. Authentication Flow

```
Login (role-specific: Citizen=OTP, Official=EmpID+Pwd+OTP, PIA=OrgID+Pwd+OTP)
        │
        ▼
Credential Validation
        │
        ▼
Role Verification (role + jurisdiction extracted)
        │
        ▼
Permission Set Load (RBAC engine)
        │
        ▼
Single role → dashboard   |   Multi-role → Role Switcher → dashboard
```

- MFA mandatory for all official roles.
- Official accounts are **provisioned top-down** (State Admin creates district roles, Tehsildar creates Talathi, etc.) — no self-signup for govt roles.
- Every JWT carries `role + jurisdiction`; permission checks happen server-side on every request, not just client-side menu hiding.

---

## 4. Dashboards (summary)

Each role gets the same **shell component** (top bar + role-driven side menu + widget row + content area), populated differently:

| Role | Dashboard focus |
|---|---|
| Citizen | Land record, case tracker, objections, compensation status |
| Surveyor | Assigned tasks, GPS/boundary capture, mismatch flags |
| Talathi | Village register, mutation entries, surveyor report queue |
| Tehsildar | Approval queue, disputes, taluka overview |
| LAO | Case pipeline, notices, hearings, award drafting |
| District Collector | Award approvals, possession orders, district overview |
| Project Agency | Project proposals, fund deposits, progress tracker |
| State Admin | District overview, user management, policy config, MIS |
| Central Admin | National overview, state admin management, integrations, AI monitoring |

*(Full per-role widget/menu/action breakdown lives in `/docs/NLAMS_RBAC_Dashboard_Blueprint.md`.)*

---

## 5. RBAC Access Matrix

**Legend:** V=View · C=Create · E=Edit · A=Approve · M=Manage · –=No access. All access is additionally filtered by jurisdiction.

### 5.1 Core Workflow

| Data / Feature | Citizen | Surveyor | Talathi | Tehsildar | LAO | Collector | PIA | State Admin | Central Admin |
|---|---|---|---|---|---|---|---|---|---|
| Own land record | V | – | – | – | – | – | – | – | – |
| Village land register | – | V | V/E | V | V | V | – | V | V |
| Survey/GPS boundary data | – | C/E | V | V | V | V | – | V | V |
| Mutation entries | – | – | C/E | A | V | V | – | V | V |
| Encroachment/mismatch flags (AI) | – | C | V/E | V/A | V | V | – | V | V |
| Acquisition case file | V(own) | – | V | V | C/E/M | A | V(own) | V | V |
| Notices (Sec 4/6/11) | V(own) | – | – | V | C | V | V(own) | V | V |
| Compensation award | V(own) | – | – | V | C/E | A | V(own) | V | V |
| Fund deposit | – | – | – | – | V | V | C | V | V |
| Possession order | V(own) | – | – | V | E | C/A | V(own) | V | V |
| User/role provisioning | – | – | – | – | – | – | – | C/M(district) | C/M(state) |
| Audit logs | – | – | – | – | – | V(district) | – | V(state) | M(national) |

### 5.2 AI Features (new)

| Feature | Citizen | Surveyor | Talathi | Tehsildar | LAO | Collector | PIA | State Admin | Central Admin |
|---|---|---|---|---|---|---|---|---|---|
| **Location Intelligence** (trigger/create) | – | – | – | – | ✅ | – | ✅ | – | – |
| **Location Intelligence** (view report) | – | ✅ (own task) | – | ✅ (taluka) | ✅ (own) | ✅ (district, aggregated) | ✅ (own) | ✅ (state, aggregated) | ✅ (national, aggregated) |
| **Project-Status RAG** (Copilot) | – | – | – | ✅ (taluka) | ✅ (own cases) | ✅ (district) | ✅ (own project) | ✅ (state) | ✅ (national) |
| **Regulatory/Procedural RAG** (Copilot) | ✅ (public subset only) | ✅ (task-scoped) | ✅ (mutation-scoped) | ✅ | ✅ | ✅ | ✅ (project-relevant) | ✅ + manage KB (state docs) | ✅ + manage KB (national docs) |

> ⚠️ **Citizen Copilot must be a separate, restricted instance** from the official Copilot — never the same session/service, to prevent cross-case data leakage.

---

## 6. AI Feature: Location & Project Intelligence

**Purpose:** Given a proposed parcel (coordinates/polygon/KML/GeoJSON/map from a Project Agency), analyze what's around it and produce an evidence-backed merits/constraints report for the LAO — **not** a legal "good/bad land" verdict.

### Inputs (from Project Agency)
Lat/long, point(s), polygon, KML/KMZ, GeoJSON, shapefile, uploaded map, or project alignment/corridor.

### Workflow

```
PIA provides coordinates/polygon/map
        │
        ▼
GIS Intake → validate geometry → reverse geocode → create Area of Interest (AOI)
        │
        ▼
Spatial Analysis → airports/rail/bus/govt offices, roads, nearby projects, context layers
        │
        ▼
Information Retrieval → recent news, public project info, authorized govt sources/APIs
        │
        ▼
Evidence Normalization → date filter, distance filter, dedup, source validation, ranking
        │
        ▼
GenAI Analysis → summarize location, identify merits, identify constraints, explain why
        │
        ▼
Land Location Intelligence Report
        │
        ▼
LAO Review → inspect evidence → compare with GIS records → continue authorized workflow
```

### Report contents
Proposed-land map · location summary · nearby infrastructure · nearby projects · recent news · potential merits · potential constraints · evidence/source refs · data freshness · confidence/limitations · AI executive summary.

### Default analysis radii (configurable, not legal thresholds)

| Analysis | Default |
|---|---|
| Immediate infrastructure | 1 km |
| Major infrastructure | 5 km |
| Major projects | 10 km |
| News | 10–25 km (source-dependent) |

### Non-negotiable design rules
- GenAI output must separate **FACT → INFERENCE → CONSIDERATION**, with a confidence label.
- News is never treated as authoritative fact; UI must distinguish official vs. media-reported sources.
- The AI must **never** state land is legally/objectively "good" or "bad."
- Every place/project/news item shows distance, source, and last-updated time.

---

## 7. AI Feature: RAG-Powered Project & Regulatory Copilot

Two distinct knowledge domains, fused through GenAI — **never blended into one embedding store**.

| Domain | Source of truth | Answers questions like |
|---|---|---|
| **A. Project Intelligence** | Structured PostgreSQL data (never model memory) | Current status, land acquired/remaining, pending parcels, compensation, R&R, delay bottleneck |
| **B. Regulatory/Procedural** | Governed document KB (pgvector) — Acts, Rules, Notifications, Circulars, SOPs, Checklists | Required documents for current stage, applicable procedure, responsible authority |

### Hybrid architecture

```
USER QUESTION → Query Classifier
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
 Structured Data           Document RAG
 (PostgreSQL)               (pgvector)
        │                        │
        └───────────┬────────────┘
                     ▼
              Evidence Pack
                     │
                     ▼
                  GenAI
                     │
                     ▼
         Grounded Response + Sources + Last Updated
```

### Regulatory KB document metadata (required per doc)
Document ID, title, authority, document type, jurisdiction, effective date, version, status (approved/current/obsolete), project type, section/page, source, storage location, checksum. **Only approved/current documents** are used for answers.

### Trust rules
- Numbers in any answer must come from structured data, not model memory.
- Authority/responsibility answers say "*configured/applicable authority*," never presented as a legal determination.
- Every AI answer exposes: structured data used, documents used, source references, last updated, confidence/limitations.

---

## 8. Development Order (MVP → Full)

| Phase | Scope |
|---|---|
| 0 | Auth, RBAC engine, jurisdiction model, dashboard shell |
| 1 | Core case lifecycle: Citizen + Talathi + Tehsildar + LAO (create → notice → award, no AI) |
| 2 | District Collector, possession flow, State Admin (users + MIS) |
| 3 | Project Agency, fund deposits, Surveyor + GPS capture |
| 4 | **AI layer**: document verification, boundary/encroachment detection, delay prediction |
| 5 | **Location Intelligence + RAG Copilot** (needs real case/survey data from 1–3 to be meaningful) |
| 6 | Integration layer: live DILRMP / BhuNaksha / ULPIN / NAKSHA |
| 7 | Central Admin + national rollout |

---

## 9. Tech Stack (prototype)

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite, Tailwind CSS + shadcn/ui |
| Maps | Leaflet + React-Leaflet |
| Charts | Recharts |
| Backend | FastAPI, SQLAlchemy |
| Database | PostgreSQL + PostGIS |
| Vector store | pgvector |
| ML | scikit-learn / XGBoost (delay-risk) |
| RAG / GenAI | LangChain, Sentence Transformers, approved LLM API |
| Auth | JWT + RBAC |
| File storage | MinIO |
| Infra | Docker Compose |

> External government integrations (land records, cadastral/GIS, treasury, news/POI) use **mock/controlled adapters** unless a live authorized API is available.

### Service breakdown

```
React Frontend
      │
   FastAPI
      ├── Workflow Service
      ├── GIS Service
      ├── Document Service
      ├── Location Intelligence Service
      ├── RAG Service
      └── AI/Copilot Service
      │
PostgreSQL + PostGIS
      ├── Project/Parcel Data, Compensation/R&R, Workflow/SLA, Audit
      ├── pgvector (RAG embeddings)
      ├── ML/Risk Engine
      └── Integration Layer → Land Records, Cadastral/GIS, Treasury, News/POI
```

### New DB tables (AI layer)
`location_analysis`, `nearby_place`, `nearby_project`, `news_item`, `intelligence_finding`, `rag_document`, `rag_chunk` — see `/docs/` for full field lists.

### New API endpoints
```
POST /api/location/analyze
GET  /api/location/{analysis_id}/report
GET  /api/location/{analysis_id}/projects
GET  /api/location/{analysis_id}/news
POST /api/copilot/query
POST /api/rag/query
GET  /api/ai/{answer_id}/evidence
```

---

## 10. Repo Structure

```
nlams/
├── frontend/            # React + Vite app, role-based dashboard shell
├── backend/              # FastAPI services (workflow, GIS, document, location-intel, RAG, copilot)
├── db/                   # PostgreSQL/PostGIS migrations, seed data
├── ml/                   # Delay-risk model training/inference
├── rag/                  # Knowledge base ingestion, embeddings, retrieval
├── docs/                 # Planning docs, RBAC blueprint, this feature spec
└── docker-compose.yml
```
*(Adjust to match actual repo layout once scaffolded.)*

---

## 11. Guardrails (do not violate)

1. NLAMS is **never** the legal source of truth for ownership — state land-record systems are.
2. AI (Location Intelligence + Copilot) is **decision support only** — it cannot approve, reject, or finalize any acquisition step.
3. Every AI-generated claim must be traceable to a source/evidence reference.
4. Regulatory RAG answers only from **approved/current** documents — never draft/obsolete ones.
5. RBAC checks happen server-side on every request — never rely on frontend route-hiding alone.
6. Citizen-facing AI must run in an isolated context from official Copilot sessions.

---

## 12. Open Decisions

- **Auditor role**: the AI-features spec references a separate "Auditor" persona (AI/evidence history, source trail, user actions) not in the fixed 9-role list. Pending decision: add as a 10th role, or fold into existing audit-log access already granted to Tehsildar/District Collector/State Admin/Central Admin.
- Exact SIH demo scenario / judge walkthrough: see `/docs/` for the 24-step definition-of-done checklist.

---

## 13. Getting Started

```bash
git clone <repo-url>
cd nlams
docker-compose up --build
```
*(Fill in actual env vars, seed scripts, and local setup once backend/frontend scaffolding lands.)*

## 14. Contributing

1. Check which phase (§8) your task belongs to before starting.
2. New roles, permissions, or dashboard sections must be reflected in the RBAC matrix (§5) in the same PR.
3. Any new AI-surfaced data must expose its evidence/source per the Trust rules (§6, §7).
4. Open a PR against `main`, tag the relevant service owner.

---

*Maintained as the single source of truth for project scope, roles, and architecture. Update this file whenever roles, RBAC, or the AI feature set change.*
