# Curalink — AI Medical Research Assistant

Curalink searches **PubMed**, **OpenAlex** and **ClinicalTrials.gov** in parallel, ranks results by relevance, and synthesises a cited research brief — all powered by an LLM backbone.

## Project Structure

```
AI-Medical-Research-Assistant/
├── server/         ← Node.js / Express backend
└── client/         ← React + TypeScript + TanStack Router frontend
```

---

## Getting Started

### 1. Backend (Express API)

```bash
cd server
npm install
npm run dev               # starts on http://localhost:5000
```

**Required — create `server/.env`:**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/curalink
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Frontend (Vite SPA)

```bash
cd client
npm install
npm run dev               # starts on http://localhost:3000
```

Vite proxies `/api` → `http://localhost:5000` automatically — no CORS config needed.

Open **http://localhost:3000** in your browser.

---

## Frontend Tech Stack (client/)

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Build | Vite 6 |
| Icons | Lucide React |

---

## Backend Tech Stack (server/)

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express |
| Database | MongoDB (Mongoose) |
| AI | Anthropic / HuggingFace |
| Sources | PubMed, OpenAlex, ClinicalTrials.gov |

---

## Production Build

```bash
cd client && npm run build
# Serve client/dist/ as static files from Express or deploy to any CDN
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/chat/message | Send message / start query |
| GET | /api/chat/conversation/:id | Fetch conversation |
| GET | /api/chat/conversations | List all conversations |
| POST | /api/chat/conversation/new | New conversation |
| DELETE | /api/chat/conversation/:id | Delete conversation |
| GET | /api/health | Health check |
