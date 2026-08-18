import { useEffect, useRef, useState } from "react";
import { 
  Sparkles, FlaskConical, BookOpen, 
  Globe, Bell, HelpCircle, 
  ShieldCheck, AlertCircle
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { StructuredInput } from "@/components/StructuredInput";
import { MessageBubble } from "@/components/MessageBubble";
import { AgentWorkflowPanel } from "@/components/AgentWorkflowPanel";
import {
  api,
  setAuthTokenGetter,
  type ChatMessage,
  type SendMessagePayload,
  type WorkflowStep,
  type DocumentSummary,
} from "@/lib/api";
import { cn } from "@/lib/utils";

// Import view components
import { DashboardView } from "@/components/DashboardView";
import { SettingsView } from "@/components/SettingsView";
import { DocumentsView } from "@/components/DocumentsView";
import { useAuth, useUser, useClerk, Show, UserButton } from "@clerk/react";

export function CuralinkApp() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();

  const [activeTab, setActiveTab] = useState("dashboard");
  const userName = user?.fullName || "Dr. Sarah Jenkins";

  // Centralized History States
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);

  // Chat/API States
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Attach Clerk session token to all API requests
  useEffect(() => {
    if (isSignedIn) {
      setAuthTokenGetter(() => getToken());
    }
  }, [isSignedIn, getToken]);

  // Sync scroll on chat
  useEffect(() => {
    if (activeTab === "chat") {
      scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, sending, activeTab, workflowSteps]);

  // Centralized fetch conversations list
  const fetchConversations = () => {
    if (!isSignedIn) return;
    setLoadingConversations(true);
    api.listConversations()
      .then((res) => setConversations(res.data || []))
      .catch(() => setConversations([]))
      .finally(() => setLoadingConversations(false));
  };

  const fetchDocuments = () => {
    if (!isSignedIn) return;
    api.listDocuments()
      .then((res) => setDocuments(res.data || []))
      .catch(() => setDocuments([]));
  };

  useEffect(() => {
    fetchConversations();
    fetchDocuments();
  }, [isSignedIn, refreshKey]);

  useEffect(() => {
    if (!isSignedIn) return;
    if (!conversationId) {
      setMessages([]);
      return;
    }
    api
      .getConversation(conversationId)
      .then((res) => setMessages(res.data?.messages || []))
      .catch(() => setMessages([]));
  }, [conversationId, isSignedIn]);

  const handleLogout = async () => {
    setConversationId(null);
    setMessages([]);
    setActiveTab("dashboard");
    await signOut();
    setRefreshKey((k) => k + 1);
  };

  const handleNew = () => {
    setConversationId(null);
    setMessages([]);
    setWorkflowSteps([]);
    setSelectedDocumentIds([]);
    setError(null);
    setActiveTab("chat");
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.conversationId !== id));
      if (conversationId === id) handleNew();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (payload: SendMessagePayload) => {
    setSending(true);
    setError(null);
    setWorkflowSteps([
      { agent: "Research Agent", status: "running", durationMs: 0 },
      { agent: "Evidence Agent", status: "pending", durationMs: 0 },
      { agent: "Summary Agent", status: "pending", durationMs: 0 },
    ]);
    const optimistic: ChatMessage = {
      role: "user",
      content:
        payload.message ||
        [payload.disease, payload.query].filter(Boolean).join(" — "),
      responseMode: payload.responseMode,
      structuredInput: {
        patientName: payload.patientName,
        disease: payload.disease,
        query: payload.query,
        location: payload.location,
      },
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await api.sendMessage({
        ...payload,
        conversationId: conversationId ?? undefined,
      });
      if (!conversationId) {
        setConversationId(res.conversationId);
      }
      const data = res.data;
      setWorkflowSteps(data.workflowSteps || []);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          responseMode: payload.responseMode,
          suggestedQuestions: data.suggestedQuestions,
          workflowSteps: data.workflowSteps,
          publications: data.publications?.map((p) => ({
            ...p,
            relevanceScore: p.relevanceScore ?? (p as { totalScore?: number }).totalScore,
          })),
          clinicalTrials: data.clinicalTrials,
          documentChunks: data.documentChunks,
        },
      ]);
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      setError(e.message || "Request failed");
      setWorkflowSteps([]);
    } finally {
      setSending(false);
    }
  };

  const handleSuggestion = (q: string) => {
    handleSubmit({ message: q });
  };

  const handleSearchSuggest = (query: string) => {
    setActiveTab("chat");
    handleSubmit({ message: query });
  };

  const renderContentView = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView 
            items={conversations}
            loading={loadingConversations}
            onNavigate={setActiveTab} 
            onSelectConversation={setConversationId}
            onSearchSuggest={handleSearchSuggest} 
          />
        );
      case "chat":
        return renderChatWorkspace();
      case "documents":
        return <DocumentsView onDocumentsChange={fetchDocuments} />;
      case "settings":
        return <SettingsView />;
      default:
        return (
          <DashboardView 
            items={conversations}
            loading={loadingConversations}
            onNavigate={setActiveTab} 
            onSelectConversation={setConversationId}
            onSearchSuggest={handleSearchSuggest} 
          />
        );
    }
  };

  const renderChatWorkspace = () => {
    return (
      <div className="flex-1 flex flex-col min-h-0 relative">
        <header className="border-b border-white/8 bg-black px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-serif font-bold text-white">
              {messages.length > 0 ? "Research Conversation" : "New Clinical Investigation"}
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#121212] border border-white/10 text-slate-400 font-mono">
              {messages.length} {messages.length === 1 ? "message" : "messages"}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] text-slate-400 font-medium">
            <Pill icon={BookOpen} label="PubMed" />
            <Pill icon={Globe} label="OpenAlex" />
            <Pill icon={FlaskConical} label="ClinicalTrials.gov" />
          </div>
        </header>

        <div ref={scrollerRef} className="flex-1 overflow-y-auto min-h-0 bg-black">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-6 text-center space-y-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black font-serif font-bold text-lg">
                C
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-serif font-bold tracking-tight text-white">
                  Start a New Investigation
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed font-normal">
                  Enter your clinical query below. Curalink's multi-agent system federates searches across PubMed, OpenAlex, and ClinicalTrials.gov to generate structured evidence briefs.
                </p>
              </div>
              <div className="w-full pt-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Quick-Start Queries
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5 text-left">
                  {[
                    "Latest immunotherapy approaches for stage IV melanoma",
                    "Emerging cancer immunotherapy approaches",
                    "Latest treatments for Alzheimer's",
                    "Long COVID clinical findings"
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSubmit({ message: q })}
                      className="group flex items-center gap-2.5 rounded-2xl border border-white/8 bg-[#0a0a0a] hover:border-white/20 p-3.5 text-xs transition-all duration-200 text-slate-300 hover:text-white cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span className="truncate font-normal">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} onSuggestion={handleSuggestion} />
              ))}
              {sending && (
                <div>
                  <AgentWorkflowPanel steps={workflowSteps} isLoading />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/8 bg-black px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-3 text-xs text-red-400 bg-red-950/30 border border-red-900/30 rounded-2xl px-4 py-3 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-300">Pipeline Alert</div>
                  <div className="text-[11px] mt-0.5 text-red-400/90 font-normal">{error}</div>
                </div>
              </div>
            )}
            <StructuredInput
              onSubmit={handleSubmit}
              disabled={sending}
              documents={documents}
              selectedDocumentIds={selectedDocumentIds}
              onDocumentIdsChange={setSelectedDocumentIds}
            />
            <p className="mt-2 text-[10px] text-slate-500 text-center font-normal">
              Curalink aggregates open access data. Validate critical mutations with peer-reviewed oncology teams.
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-serif font-bold text-lg animate-pulse">
            C
          </div>
          <div className="text-center">
            <h2 className="text-base font-serif font-bold text-white">Curalink Enterprise</h2>
            <p className="text-xs text-slate-500 font-normal mt-1">Initializing Secure Sandbox...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-black text-slate-100 font-sans overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeId={conversationId}
        onSelect={setConversationId}
        onNew={handleNew}
        items={conversations}
        loading={loadingConversations}
        onDelete={handleDeleteConversation}
        onLogout={handleLogout}
        refreshKey={refreshKey}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/8 bg-black px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-400 font-normal flex items-center gap-2 bg-[#0a0a0a] border border-white/8 px-3 py-1 rounded-full shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Clinical Terminal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0a0a] border border-white/8 text-[10px] text-slate-300 font-medium">
              <ShieldCheck className="h-3 w-3 text-slate-400" />
              HIPAA Encrypted
            </div>

            <button className="p-2 rounded-full border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors relative cursor-pointer">
              <Bell className="h-3.5 w-3.5" />
            </button>

            <button className="p-2 rounded-full border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <HelpCircle className="h-3.5 w-3.5" />
            </button>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/8 py-1">
              <Show when="signed-in">
                <UserButton />
              </Show>
              <span className="hidden md:inline-block text-xs font-medium text-slate-300">
                {userName}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex min-h-0 relative bg-black">
          <main className={cn(
            "flex-1 min-w-0",
            activeTab === "chat" ? "overflow-hidden flex flex-col" : "overflow-y-auto px-6 py-8"
          )}>
            <div className={activeTab === "chat" ? "flex-1 flex flex-col min-h-0" : "max-w-6xl mx-auto"}>
              {renderContentView()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Pill({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0a0a] border border-white/8 text-slate-400">
      <Icon className="h-3 w-3 text-white" />
      {label}
    </span>
  );
}
