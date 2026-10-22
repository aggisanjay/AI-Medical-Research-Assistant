// API client targeting the Curalink Express backend.
// In development, Vite proxies /api → http://localhost:5000/api.
// Set VITE_API_URL to override (e.g. for production deployments).

const API_BASE =
  ((import.meta as any).env?.VITE_API_URL as string | undefined) ?? "/api";

type TokenGetter = () => Promise<string | null>;

let authTokenGetter: TokenGetter | null = null;

/** Register Clerk session token provider (call once from authenticated app shell). */
export function setAuthTokenGetter(getter: TokenGetter) {
  authTokenGetter = getter;
}

export interface Publication {
  title: string;
  abstract?: string;
  authors?: string[];
  year?: number;
  source?: string;
  url?: string;
  relevanceScore?: number;
}

export interface ClinicalTrial {
  title?: string;
  briefTitle?: string;
  status?: string;
  phase?: string;
  eligibility?: string;
  location?: string;
  locations?: string[];
  contact?: string;
  nctId?: string;
  url?: string;
}

export interface WorkflowStep {
  agent: string;
  status: "pending" | "running" | "completed" | "failed";
  durationMs: number;
  metadata?: Record<string, unknown>;
}

export interface DocumentChunkRef {
  filename: string;
  score: number;
  excerpt?: string;
}

export interface DocumentSummary {
  documentId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  status: "processing" | "ready" | "failed";
  chunkCount: number;
  charCount: number;
  embeddingModel?: string;
  embeddingDimensions?: number;
  createdAt: string;
}

export interface TokenCost {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUSD: number;
  costFormatted: string;
  model: string;
  provider: string;
  savingsUSD?: number;
  isFallback?: boolean;
  fallbackReason?: string;
}

export interface ResearchResponse {
  response: string;
  tokenCost?: TokenCost;
  suggestedQuestions?: string[];
  workflowSteps?: WorkflowStep[];
  publications?: Publication[];
  clinicalTrials?: ClinicalTrial[];
  documentChunks?: DocumentChunkRef[];
  metadata?: Record<string, unknown>;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  responseMode?: "standard" | "executive" | "document";
  tokenCost?: TokenCost;
  structuredInput?: {
    patientName?: string;
    disease?: string;
    query?: string;
    location?: string;
  };
  publications?: Publication[];
  clinicalTrials?: ClinicalTrial[];
  suggestedQuestions?: string[];
  workflowSteps?: WorkflowStep[];
  documentChunks?: DocumentChunkRef[];
  timestamp?: string;
}

export interface ConversationSummary {
  conversationId: string;
  disease?: string;
  patientName?: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string;
}

export interface SendMessagePayload {
  conversationId?: string;
  message?: string;
  patientName?: string;
  disease?: string;
  query?: string;
  location?: string;
  isStructured?: boolean;
  documentIds?: string[];
  responseMode?: "standard" | "executive" | "document";
}

async function authHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...extra };
  if (authTokenGetter) {
    const token = await authTokenGetter();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders({ "Content-Type": "application/json" });

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string>) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  sendMessage: (payload: SendMessagePayload) =>
    http<{ success: boolean; conversationId: string; data: ResearchResponse }>(
      "/chat/message",
      { method: "POST", body: JSON.stringify(payload) },
    ),
  getConversation: (id: string) =>
    http<{ success: boolean; data: { conversationId: string; messages: ChatMessage[] } }>(
      `/chat/conversation/${id}`,
    ),
  listConversations: () =>
    http<{ success: boolean; data: ConversationSummary[] }>("/chat/conversations"),
  getAnalytics: () =>
    http<{
      success: boolean;
      data: {
        metrics: {
          sourcesRetrieved: number;
          citationsGenerated: number;
          researchSessions: number;
          documentsUploaded: number;
          averageConfidenceScore: number;
        };
        distribution: { name: string; value: number }[];
        executionTimes: { name: string; duration: number }[];
        timeline: { year: number; count: number }[];
      };
    }>("/chat/analytics"),
  newConversation: () =>
    http<{ success: boolean; conversationId: string }>("/chat/conversation/new", {
      method: "POST",
    }),
  deleteConversation: (id: string) =>
    http<{ success: boolean }>(`/chat/conversation/${id}`, { method: "DELETE" }),

  listDocuments: () =>
    http<{ success: boolean; data: DocumentSummary[] }>("/documents"),

  uploadDocument: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      headers,
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error || "Upload failed");
    }
    return res.json() as Promise<{ success: boolean; data: DocumentSummary }>;
  },

  deleteDocument: (documentId: string) =>
    http<{ success: boolean }>(`/documents/${documentId}`, { method: "DELETE" }),

  // ── Knowledge Graph ──
  searchGraphEntities: (query?: string) =>
    http<{ success: boolean; count: number; data: any[] }>(
      query ? `/graph/entities?query=${encodeURIComponent(query)}` : "/graph/entities",
    ),
  traverseGraph: (entityIds: string[], maxDepth?: number) =>
    http<{ success: boolean; data: { nodes: any[]; edges: any[]; contradictions: any[] } }>("/graph/traverse", {
      method: "POST",
      body: JSON.stringify({ entityIds, maxDepth }),
    }),

  // ── Observability & Telemetry ──
  getObservabilityTelemetry: () =>
    http<{ success: boolean; telemetry: any }>("/observability/telemetry"),
};
