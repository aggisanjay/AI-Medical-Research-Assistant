# CuraLink — Agentic AI Medical Research Platform (v2.0)

> Multi-Agent Biomedical Intelligence, Dynamic Knowledge Graph, Governed Multi-Tool Orchestration, and Reproducible Evaluation

CuraLink is an integrated, production-oriented Agentic AI Medical Research Platform engineered with a **React 19 + TypeScript + Vite** frontend, a **Node.js/Express + MongoDB** backend, and zero-cost local-first foundation.

---

## 🏛️ System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │       CuraLink Web Client (React 19 + Vite)            │
                    │  Dashboard · Research Workspace · RAG Docs · KG Hub    │
                    │  MCP Gateway · Approvals · Audit · Evaluations · LoRA  │
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
│   │                    Bounded 9-Agent Research Orchestration Engine                   │   │
│   │  1. Planner ──> 2. Search ──> 3. RAG ──> 4. PICO Extract ──> 5. Evidence Compare  │   │
│   │  ──> 6. LLM Synthesis ──> 7. Citation Verify ──> 8. Report Gen ──> 9. Quality Eval │   │
│   └──────┬──────────────────────┬───────────────────────┬───────────────────────┬──────┘   │
│          │                      │                       │                       │          │
│          ▼                      ▼                       ▼                       ▼          │
│   ┌──────────────┐       ┌──────────────┐        ┌──────────────┐        ┌──────────────┐  │
│   │ MCP Tool     │       │ Dynamic      │        │ Cryptographic│        │ LoRA Dataset │  │
│   │ Gateway      │       │ Knowledge    │        │ Approval &   │        │ Stager &     │  │
│   │ (Zod Schemas)│       │ Graph Engine │        │ Audit Chain  │        │ Model Hub    │  │
│   │ Native/MCP   │       │ (Live PubMed)│        │ (SHA-256)    │        │ (Path B GPU) │  │
│   └──────────────┘       └──────────────┘        └──────────────┘        └──────────────┘  │
└─────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                              │
                    ┌─────────────────────────┴──────────────────────────┐
                    ▼                                                    ▼
       ┌─────────────────────────┐                          ┌─────────────────────────┐
       │   MongoDB Community     │                          │ Groq / Ollama / HF      │
       │  Workspaces, Docs, KG,  │                          │ Qwen 3.8 / Mistral-7B   │
       │  Approvals, Audit Logs  │                          │ LLM Provider Engine     │
       └─────────────────────────┘                          └─────────────────────────┘
```

---

## 📋 Feature-by-Feature Verified Status

| Capability | Module / Screen | Data Source & Execution | Persistence | Verified Status |
| :--- | :--- | :--- | :--- | :--- |
| **Multi-Agent Orchestration** | Research Workspace (`/`) | Bounded 9-agent DAG; Groq/Ollama LLM; real latency & tokens | MongoDB `WorkflowRun`, `Conversation` | **Verified End-to-End** |
| **Real Research Retrieval** | Agent 2 / MCP Gateway | PubMed (Entrez E-utilities), OpenAlex REST, ClinicalTrials.gov v2 | Live API responses with source provenance | **Verified End-to-End** |
| **Citation Verification** | Agent 7 | Real regex extractor for PMIDs/NCTs/citations; lexical groundedness checking | Provenance metadata in report & chat | **Verified End-to-End** |
| **Dynamic Knowledge Graph** | KG Hub (`/graph`) | MongoDB entity/relation store; ingests live evidence from PubMed & trials | MongoDB `GraphNode`, `GraphEdge` | **Verified End-to-End** |
| **Human Approvals** | Approvals Center (`/approvals`) | State machine: pending ➔ approved/rejected ➔ executed; payload hash binding | MongoDB `ApprovalRequest` | **Verified End-to-End** |
| **Cryptographic Audit Log** | Audit Ledger (`/audit`) | Append-only SHA-256 hash chaining; cryptographic integrity verification | MongoDB `AuditEvent` | **Verified End-to-End** |
| **Reproducible Evaluation** | Evaluation Hub (`/evaluation`) | 4-case clinical QA benchmark; Recall@k, MRR, citation precision, groundedness | MongoDB `EvaluationRun` | **Verified End-to-End** |
| **Secure RAG & Ingestion** | Documents (`/documents`) | Chunking (500-char/50 overlap); vector search; injection scan; PII redaction | MongoDB `Document`, `Chunk` | **Verified End-to-End** |
| **Model Customization** | Fine-Tuning Hub (`/fine-tuning`) | Path B: honest dataset split (`train.jsonl`/`val.jsonl`), manifest & GPU probe | MongoDB `FineTuningJob`, filesystem | **Verified (Honest Path B)** |
| **MCP Tool Ecosystem** | MCP Tools (`/mcp`) | In-process native tools with strict Zod schemas; transport hooks for external MCP | In-memory registry & audit log | **Verified End-to-End** |
| **Live Observability** | Observability (`/observability`) | Real token counters, latency tracking, stage traces, spend estimates | MongoDB `TokenUsage`, Winston/Pino | **Verified End-to-End** |

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
npm test            # Runs verification suite across all 9 platform capabilities
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
* ✅ **MCP Gateway**: Schema validation enforces strict typed inputs; high-risk tools (`export_research_report`) pause for approval.
* ✅ **Human Approval Engine**: Validates state machine transitions, rejects expired approvals, and detects payload modifications via SHA-256 hash checks.
* ✅ **Audit Ledger**: Append-only cryptographic hash chaining verifies across historical event blocks with zero corruption.
* ✅ **Knowledge Graph Engine**: Traverses multi-hop clinical entities and surfaces discordant or contradictory clinical findings.
* ✅ **Evaluation Pipeline**: Evaluates factual accuracy, Recall@k, MRR, citation precision, and lexical groundedness against clinical benchmark references.
* ✅ **LoRA Model Customization**: Honest Path B verifies dataset generation, produces validated JSONL splits and manifest, probes PyTorch/CUDA availability, and records model registry state.

---

## 📡 API Reference Overview

| Route | Method | Description | Permission |
| :--- | :--- | :--- | :--- |
| `/api/chat/message` | `POST` | Execute 9-Agent Research Workflow | Authenticated User |
| `/api/chat/conversations` | `GET` | List user research conversations with titles and token metrics | Authenticated User |
| `/api/documents/upload` | `POST` | Upload and chunk PDF/TXT for RAG | Authenticated User |
| `/api/mcp/tools` | `GET` | List registered MCP tools and schemas | Public / Read |
| `/api/mcp/execute` | `POST` | Execute tool with risk policy check | Role-checked / Approval |
| `/api/approvals` | `GET` | List pending and historical approvals | Lead / Admin |
| `/api/approvals/request` | `POST` | Request approval for sensitive action | Researcher |
| `/api/approvals/:id/decide` | `POST` | Approve or reject request with reason | Lead / Admin |
| `/api/approvals/:id/execute` | `POST` | Execute approved action with revalidation | Lead / Admin |
| `/api/audit/events` | `GET` | Stream append-only audit events | Auditor / Admin |
| `/api/audit/verify` | `GET` | Verify SHA-256 audit chain integrity | Auditor / Admin |
| `/api/evaluations/runs` | `GET` | List automated benchmark runs | Researcher / Auditor |
| `/api/evaluations/run` | `POST` | Trigger fresh reproducible evaluation benchmark | Lead Researcher |
| `/api/models/jobs` | `GET` | List LoRA training jobs & registry | Researcher |
| `/api/models/jobs/start` | `POST` | Stage dataset and initialize training job | Lead Researcher |
| `/api/models/registry/promote` | `POST` | Promote adapter to Production | Lead Researcher |
| `/api/models/registry/rollback` | `POST` | Rollback production model to previous | Lead Researcher |
| `/api/graph/entities` | `GET` | Search Knowledge Graph entities | Public / Read |
| `/api/graph/traverse` | `POST` | Traverse multi-hop entity pathways | Public / Read |
| `/api/observability/telemetry` | `GET` | Real-time system health and latencies | Public / Read |

---

## 🔒 Security & Medical Disclaimers

1. **Non-Clinical Research Platform**: CuraLink is strictly an investigative research-support tool for biomedical literature exploration and trial analysis. It does **not** provide clinical diagnosis, prescriptive treatments, or substitute for licensed clinician judgment.
2. **Honest Fine-Tuning Execution**: CuraLink does not simulate fake backpropagation in Node.js. It exports validated JSONL training splits and probes for external GPU workers running PyTorch/PEFT.
3. **Provable Citation Integrity**: Synthesis claims are verified against retrieved abstracts and document chunks. Citations link to empirical PMIDs, DOIs, and ClinicalTrials.gov identifiers.
4. **Data Isolation**: Multi-tenant workspace boundaries and user IDs are validated across document queries, graph traversals, and approval workflows.
