// API client targeting the Curalink Express backend.
// In development, Vite proxies /api → http://localhost:5000/api.
// Set VITE_API_URL to override (e.g. for production deployments).

const API_BASE =
  ((import.meta as any).env?.VITE_API_URL as string | undefined) ?? "/api";

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

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  structuredInput?: {
    patientName?: string;
    disease?: string;
    query?: string;
    location?: string;
  };
  publications?: Publication[];
  clinicalTrials?: ClinicalTrial[];
  suggestedQuestions?: string[];
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
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  const profileStr = localStorage.getItem("curalink_user_profile");
  if (profileStr) {
    try {
      const p = JSON.parse(profileStr);
      if (p && p.email) {
        headers["X-User-Id"] = p.email;
      }
    } catch (e) {}
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  sendMessage: (payload: SendMessagePayload) =>
    http<{ success: boolean; conversationId: string; data: ChatMessage & { metadata?: unknown } }>(
      "/chat/message",
      { method: "POST", body: JSON.stringify(payload) },
    ),
  getConversation: (id: string) =>
    http<{ success: boolean; data: { conversationId: string; messages: ChatMessage[] } }>(
      `/chat/conversation/${id}`,
    ),
  listConversations: () =>
    http<{ success: boolean; data: ConversationSummary[] }>("/chat/conversations"),
  newConversation: () =>
    http<{ success: boolean; conversationId: string }>("/chat/conversation/new", {
      method: "POST",
    }),
  deleteConversation: (id: string) =>
    http<{ success: boolean }>(`/chat/conversation/${id}`, { method: "DELETE" }),
};
