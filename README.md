# CuraLink — Agentic AI Medical Research Platform 

> Multi-Agent Biomedical Intelligence, Dynamic Knowledge Graph, Resilient Document RAG, and Real-Time Token Observability

CuraLink is an integrated, production-oriented Agentic AI Medical Research Platform engineered with a **React 19 + TypeScript + Vite** frontend, a **Node.js/Express + MongoDB** backend, and a zero-cost local-first foundation.

---

## 🏛️ System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │       CuraLink Web Client (React 19 + Vite)            │
                    │  Dashboard · Research Workspace · RAG Docs · KG Hub    │
                    │  Live Token Observability · Clinical Compliance        │
                    └───────────────────────────┬────────────────────────────┘
                                                │ REST APIs + Clerk JWT
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                             CuraLink Unified Express Server                                │
│                                                                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                        Security & Guardrails Middleware                            │   │
│   │        Prompt Injection Scanner · PII/PHI Redactor · Workspace Isolation (RBAC)    │   │
│   └─────────────────────────────────────────┬──────────────────────────────────────────┘   │
│                                             │                                              │
│   ┌─────────────────────────────────────────┴──────────────────────────────────────────┐   │
│   │                    Bounded Multi-Agent Research Orchestration Engine               │   │
│   │  1. Planner ──> 2. Search ──> 3. RAG ──> 4. PICO Extract ──> 5. Evidence Compare  │   │
│   │  ──> 6. LLM Synthesis ──> 7. Citation Verify ──> 8. Report Gen ──> 9. Quality Eval │   │
│   └──────┬──────────────────────┬───────────────────────┬───────────────────────┬──────┘   │
│          │                      │                       │                       │          │
│          ▼                      ▼                       ▼                       ▼          │
│   ┌──────────────┐       ┌──────────────┐        ┌──────────────┐        ┌──────────────┐  │
│   │ Federated    │       │ Resilient    │        │ Dynamic      │        │ Real-Time    │  │
│   │ Live Search  │       │ Document RAG │        │ Knowledge    │        │ Token & Cost │  │
│   │ (PubMed,     │       │ (4-Tier PDF/ │        │ Graph Engine │        │ Observability│  │
│   │ OpenAlex,    │       │ TXT Parser)  │        │ (Live PubMed)│        │ (Ledger/Cost)│  │
│   │ Trials.gov)  │       │              │        │              │        │              │  │
│   └──────────────┘       └──────────────┘        └──────────────┘        └──────────────┘  │
└─────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                              │
                    ┌─────────────────────────┴──────────────────────────┐
                    ▼                                                    ▼
       ┌─────────────────────────┐                          ┌─────────────────────────┐
       │   MongoDB Community     │                          │ Groq / Ollama / HF      │
       │  Conversations, Docs,   │                          │ Qwen 3.8 / Mistral-7B   │
       │  TokenUsage Ledger, KG  │                          │ LLM Provider Engine     │
       └─────────────────────────┘                          └─────────────────────────┘
```

---

## 📋 Feature-by-Feature Verified Status

| Capability | Module / Screen | Data Source & Execution | Persistence | Verified Status |
| :--- | :--- | :--- | :--- | :--- |
| **Multi-Agent Orchestration** | Research Workspace (`/`) | Bounded multi-agent DAG; Groq/Ollama/HF inference; real latency & tokens | MongoDB `Conversation`, `TokenUsage` | **Verified End-to-End** |
| **Real Research Retrieval** | Live Evidence Retrieval | PubMed (Entrez E-utilities), OpenAlex REST, ClinicalTrials.gov v2 | Live API responses with source provenance | **Verified End-to-End** |
| **Citation Verification** | Evidence Verification | Regex extractor for PMIDs/NCTs/citations; lexical groundedness checking | Provenance metadata in report & chat | **Verified End-to-End** |
| **Dynamic Knowledge Graph** | Knowledge Graph (`/graph`) | MongoDB entity/relation store; ingests live evidence from PubMed & trials | MongoDB `GraphEntity`, `GraphRelation` | **Verified End-to-End** |
| **Resilient Document RAG** | Secure RAG Docs (`/documents`) | 4-tier PDF/TXT extraction (pdf-parse ➔ pdf2json ➔ zlib streams ➔ text salvage) | MongoDB `Document`, `DocumentChunk` | **Verified End-to-End** |
| **Clinical Guardrails** | Security Middleware | Prompt injection scanner; regex-based PII/PHI redaction (SSN, MRN, Email) | Enforced on every ingress/egress | **Verified End-to-End** |
| **Real Token & Cost Observability** | Observability (`/observability`) | Authoritative MongoDB TokenUsage ledger, exact prompt/completion pricing catalog, and savings vs GPT-4o | MongoDB `TokenUsage`, Pino Logger | **Verified End-to-End** |

---

## 🚀 Free-First Local Development Setup

CuraLink runs with **free and open-source software** and requires zero paid APIs for standard local development.

### Option A: Docker Compose (One-Command Setup)

```bash
docker compose up -d
```
Services spun up:
* `curalink-mongo`: MongoDB database (`port 27017`)
* `curalink-server`: Express backend (`port 5000`)
* `curalink-client`: Production web dashboard (`port 3000`)
* `curalink-ollama`: Local offline LLM runner (`port 11434`)

### Option B: Local Node.js Development

#### 1. Backend Setup
```bash
cd server
npm install
npm test            # Runs verification test suite
npm run dev         # Launches server on http://localhost:5000
```

#### 2. Frontend Setup
```bash
cd client
npm install
npm run build       # Validates TypeScript compilation and builds production bundle
npm run dev         # Launches client on http://localhost:3000
```

---

## 🧪 Verification & Test Results

The backend includes an automated test suite verifying all modules:

```bash
cd server && npm test
```

### Verified Platform Test Assertions:
* ✅ **Guardrails**: Prompt injection scanner blocks instruction overrides; regex redacts SSN, MRN, email, and phone identifiers.
* ✅ **Knowledge Graph Traversal**: Traverses multi-hop clinical entities and surfaces discordant or contradictory clinical findings.
* ✅ **Knowledge Graph Dynamic Ingestion**: Dynamically ingests and links live PubMed and Clinical Trial evidence nodes to clinical condition entities.
* ✅ **Document Parser**: Multi-tier resilient parser extracts text from TXT and complex PDFs without token length limits or parsing crashes.
* ✅ **Token & Cost Engine**: Accurately calculates pricing and savings vs proprietary baselines (GPT-4o) using real prompt and completion token counts.
* ✅ **Observability Service**: Aggregates real-time system metrics, latency distribution, and the MongoDB TokenUsage ledger.

---

## 📡 API Reference Overview

| Route | Method | Description | Permission |
| :--- | :--- | :--- | :--- |
| `/api/chat/message` | `POST` | Execute Multi-Agent Research Workflow | Authenticated User |
| `/api/chat/conversations` | `GET` | List user research conversations with titles and token metrics | Authenticated User |
| `/api/chat/conversations/:id` | `GET` | Retrieve investigation history and messages | Authenticated User |
| `/api/chat/conversations/:id` | `DELETE` | Delete research conversation | Authenticated User |
| `/api/documents/upload` | `POST` | Upload and chunk PDF/TXT for RAG | Authenticated User |
| `/api/documents` | `GET` | List user ingested documents | Authenticated User |
| `/api/documents/:id` | `DELETE` | Delete ingested document and vector chunks | Authenticated User |
| `/api/graph/entities` | `GET` | Search Knowledge Graph entities | Public / Read |
| `/api/graph/traverse` | `POST` | Traverse multi-hop entity pathways | Public / Read |
| `/api/observability/telemetry` | `GET` | Real-time system health, token ledger, and cost metrics | Public / Read |
| `/api/health` | `GET` | System health check and platform capabilities | Public / Read |

---

## 🔒 Security & Medical Disclaimers

1. **Non-Clinical Research Platform**: CuraLink is strictly an investigative research-support tool for biomedical literature exploration and trial analysis. It does **not** provide clinical diagnosis, prescriptive treatments, or substitute for licensed clinician judgment.
2. **Provable Citation Integrity**: Synthesis claims are verified against retrieved abstracts and document chunks. Citations link to empirical PMIDs, DOIs, and ClinicalTrials.gov identifiers.
3. **Data Isolation & HIPAA Privacy**: Multi-tenant workspace boundaries and user IDs are validated across document queries and graph traversals. Automated regex scans redact sensitive patient PII/PHI (SSNs, MRNs, emails, phone numbers) before processing.
