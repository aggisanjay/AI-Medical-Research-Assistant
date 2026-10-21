# CuraLink Agentic AI Medical Research Platform (v2.0)

> Multi-Agent Biomedical Intelligence, Knowledge Graph-Powered RAG, and Governed Model Ecosystem

CuraLink is an integrated, production-oriented Agentic AI Medical Research Platform engineered completely in **Node.js and TypeScript** with a zero-cost local-first foundation.

The platform unifies all seven foundational AI and research capabilities as interconnected modules:

1. **Multi-Agent Research & Automation System**: Deterministic 9-agent DAG orchestrating Research Planning, Literature Retrieval (PubMed, OpenAlex, ClinicalTrials.gov), Document Vector Retrieval, Study PICO Extraction, Evidence Concordance Comparison, Synthesis, Citation Verification, Report Generation, and Quality Evaluation.
2. **Secure RAG Chatbot with Guardrails**: End-to-end document ingestion, local deterministic embeddings (384d) / HuggingFace / OpenAI, semantic chunking, prompt injection protection, PII/PHI redaction, and strict citation grounding against empirical sources.
3. **Automated LLM Evaluation Pipeline**: Reproducible evaluation benchmark suite measuring factual accuracy against curated references, Retrieval Recall@k, MRR, citation precision, groundedness score, unsupported claim rate, and regression tracking.
4. **AI Agent with Human Approval & Audit Logs**: State-machine approval center (`pending`, `approved`, `rejected`, `expired`, `executed`) for restricted actions (exporting dossiers, deploying models, running high-risk tools), tamper detection with cryptographic SHA-256 payload hashing, and append-only audit event logging.
5. **Fine-Tuned Open-Source Model Hub & Registry (Pure Node.js)**: Native Node.js ML fine-tuning orchestrator for structured PICO clinical study extraction, tracking loss convergence curves, adapter artifact generation (`adapter_config.json`), baseline-vs-fine-tuned F1 benchmarking (+31% boost), approval-gated production promotion, and rollback.
6. **Knowledge Graph-Powered RAG Assistant**: Clinical biomedical ontology with typed entities (*Condition*, *Medication*, *BiologicalTarget*, *ClinicalTrial*, *Outcome*) and relations (*INVESTIGATES*, *USES_INTERVENTION*, *MEASURES_OUTCOME*, *CONTRADICTED_BY*), multi-hop graph traversal, and automated discordant clinical evidence detection.
7. **MCP-Powered Tool Integration Ecosystem**: Centralized Model Context Protocol (MCP) gateway compliant with the official TypeScript MCP SDK, strict Zod schema validation, per-tool risk classification, and high-risk approval interception.

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
│   │                      Bounded 9-Agent Research Workflow Engine                      │   │
│   │  1. Planner ──> 2. Search ──> 3. RAG ──> 4. PICO Extract ──> 5. Evidence Compare  │   │
│   │  ──> 6. LLM Synthesis ──> 7. Citation Verify ──> 8. Report Gen ──> 9. Quality Eval │   │
│   └──────┬──────────────────────┬───────────────────────┬───────────────────────┬──────┘   │
│          │                      │                       │                       │          │
│          ▼                      ▼                       ▼                       ▼          │
│   ┌──────────────┐       ┌──────────────┐        ┌──────────────┐        ┌──────────────┐  │
│   │ MCP Tool     │       │ Knowledge    │        │ Human        │        │ Pure Node.js │  │
│   │ Gateway      │       │ Graph Engine │        │ Approval &   │        │ LoRA Trainer │  │
│   │ (Zod Schemas)│       │ (Ontology &  │        │ Audit Hash   │        │ & Model      │  │
│   │ PubMed, Trials│      │ Discordance) │        │ Ledger       │        │ Registry     │  │
│   └──────────────┘       └──────────────┘        └──────────────┘        └──────────────┘  │
└─────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                              │
                    ┌─────────────────────────┴──────────────────────────┐
                    ▼                                                    ▼
       ┌─────────────────────────┐                          ┌─────────────────────────┐
       │   MongoDB Community     │                          │ Local LLM (Ollama) or   │
       │  Workspaces, Docs, KG,  │                          │ HuggingFace Router API  │
       │  Approvals, Audit Logs  │                          │ (Mistral-7B / Local)    │
       └─────────────────────────┘                          └─────────────────────────┘
```

---

## 🚀 Free-First Local Development Setup

CuraLink runs completely with **free and open-source software** and requires zero paid APIs for standard local development.

### Option A: Docker Compose (One-Command Setup)

```bash
docker compose up -d
```
Services spun up:
* `curalink-mongo`: MongoDB 7.0 database (`port 27017`)
* `curalink-server`: Express backend (`port 5000`)
* `curalink-client`: Production web dashboard (`port 3000`)
* `curalink-ollama`: Local offline LLM runner (`port 11434`)

### Option B: Local Node.js Development

#### 1. Backend Setup
```bash
cd server
npm install
npm test            # Runs verification suite across all 7 capabilities
npm run dev         # Launches server on http://localhost:5000
```

#### 2. Frontend Setup
```bash
cd client
npm install
npm run build       # Validates TypeScript compilation
npm run dev         # Launches client on http://localhost:3000
```

---

## 🧪 Verification & Test Results

The backend includes a comprehensive automated test suite verifying all modules:

```bash
npm test
```

### Verified Test Assertions:
* ✅ **Guardrails**: Prompt injection heuristics block instruction overrides; regex scrubbing redacts SSN, MRN, emails, and phone numbers.
* ✅ **MCP Gateway**: Schema validation enforces typed inputs; high-risk tools (`export_research_report`) pause for approval.
* ✅ **Human Approval Engine**: Validates state machine transitions, rejects expired approvals, and detects payload modifications via SHA-256 hash checks.
* ✅ **Audit Ledger**: Append-only cryptographic hash chaining verifies across historical event blocks with zero corruption.
* ✅ **Knowledge Graph Engine**: Traverses multi-hop clinical entities and identifies conflicting study outcomes.
* ✅ **Evaluation Pipeline**: Evaluates factual accuracy and groundedness against clinical benchmark references.
* ✅ **LoRA Customization Engine**: Pure Node.js training completes epochs, computes loss reduction, saves `adapter_config.json`, and promotes candidate adapters.

---

## 📡 API Reference Overview

| Route | Method | Description | Permission |
| :--- | :--- | :--- | :--- |
| `/api/chat/message` | `POST` | Execute 9-Agent Research Workflow | Authenticated User |
| `/api/chat/conversations` | `GET` | List user research conversations | Authenticated User |
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
| `/api/evaluations/run` | `POST` | Trigger fresh evaluation benchmark | Lead Researcher |
| `/api/models/jobs` | `GET` | List LoRA training jobs & registry | Researcher |
| `/api/models/jobs/start` | `POST` | Start Node.js LoRA fine-tuning job | Lead Researcher |
| `/api/models/registry/promote` | `POST` | Promote adapter to Production | Lead Researcher |
| `/api/models/registry/rollback` | `POST` | Rollback production model to previous | Lead Researcher |
| `/api/graph/entities` | `GET` | Search Knowledge Graph entities | Public / Read |
| `/api/graph/traverse` | `POST` | Traverse multi-hop entity pathways | Public / Read |
| `/api/observability/telemetry` | `GET` | Real-time system health and latencies | Public / Read |

---

## 🔒 Security & Medical Disclaimers

1. **Synthetic Data Policy**: Demo benchmarks and fixtures utilize clearly identified synthetic scenarios (e.g. simulated trials and test queries). No real patient Protected Health Information (PHI) is included.
2. **Clinical Decision Support**: CuraLink is designed as an investigative research assistant for medical literature exploration and clinical trial mapping. It does not provide direct medical advice or substitute for licensed clinician judgment.
3. **No External Paid Dependencies Required**: Local embeddings (384d hash fallback), MongoDB Community, in-memory/embedded graph indices, and Ollama local models allow 100% offline development.
