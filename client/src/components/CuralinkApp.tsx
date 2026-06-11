import { useEffect, useRef, useState } from "react";
import { 
  Activity, Loader2, Sparkles, FlaskConical, BookOpen, 
  Globe, Bell, HelpCircle, ChevronDown, 
  ShieldCheck, ArrowUpRight, Cpu, LogOut, AlertCircle
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
import { LoginView } from "@/components/LoginView";
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

  // Chat/API States (Original logic preserved)
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

  const initials = userName
    ? userName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "SJ";

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
      <div className="flex-1 flex flex-col min-h-0 relative animate-fade-in">
        <header className="border-b border-white/5 bg-slate-950/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white font-display">
              {messages.length > 0 ? "Research Conversation" : "New Clinical Investigation"}
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 font-mono">
              {messages.length} {messages.length === 1 ? "message" : "messages"}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
            <Pill icon={BookOpen} label="PubMed" color="text-purple-400" />
            <Pill icon={Globe} label="OpenAlex" color="text-pink-400" />
            <Pill icon={FlaskConical} label="ClinicalTrials.gov" color="text-emerald-400" />
          </div>
        </header>

        <div ref={scrollerRef} className="flex-1 overflow-y-auto min-h-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-6 text-center space-y-6 animate-fade-in">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl pulse-cyan-glow">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-white font-display">
                  Start a New Investigation
                </h1>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Enter your clinical query below. Curalink's multi-agent system will federate searches across PubMed, OpenAlex, and ClinicalTrials.gov to generate structured evidence briefs.
                </p>
              </div>
              <div className="w-full pt-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Quick-Start Queries
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-left">
                  {[
                    "Latest immunotherapy approaches for stage IV melanoma",
                    "Emerging cancer immunotherapy approaches",
                    "Latest treatments for Alzheimer's",
                    "Long COVID clinical findings"
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSubmit({ message: q })}
                      className="group flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/35 hover:bg-slate-900 hover:border-blue-500/30 p-3 text-xs hover:shadow-lg transition-all duration-300 text-slate-350 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span className="text-slate-300 group-hover:text-white transition-colors truncate">{q}</span>
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
                <div className="animate-slide-up">
                  <AgentWorkflowPanel steps={workflowSteps} isLoading />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/5 bg-slate-950/40 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-3 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-xl px-4 py-3 flex items-start gap-2.5 shadow-[0_4px_12px_rgba(239,68,68,0.08)]">
                <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-300">Pipeline Diagnostic Alert</div>
                  <div className="text-[11px] mt-0.5 text-red-400/90 font-light">{error}</div>
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
            <p className="mt-2 text-[10px] text-slate-500 text-center font-light">
              Curalink aggregates open access data. Validate critical mutations with peer-reviewed oncology teams.
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#020617] text-white relative overflow-hidden mesh-gradient">
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-2xl flex pulse-cyan-glow animate-pulse">
            <Activity className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-white font-display">Curalink Terminal</h2>
            <p className="text-xs text-slate-500 font-light mt-1 animate-pulse">Establishing HIPAA-Secure Sandbox...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-100 font-sans overflow-hidden">
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
        <header className="h-16 border-b border-white/5 bg-slate-950/40 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-400 font-light flex items-center gap-1.5 bg-slate-900/60 border border-slate-850 px-3 py-1 rounded-full shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Clinical Terminal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/20 border border-cyan-900/30 text-[10px] text-cyan-400 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              HIPAA Encrypted
            </div>

            <button className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 hover:text-white text-slate-400 transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </button>

            <button className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 hover:text-white text-slate-400 transition-colors">
              <HelpCircle className="h-4 w-4" />
            </button>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800/80 py-2">
              <Show when="signed-in">
                <UserButton />
              </Show>
              <span className="hidden md:inline-block text-xs font-semibold text-slate-350">
                {userName}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex min-h-0 relative">
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

function Pill({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
      <Icon className={color + " h-3.5 w-3.5"} />
      {label}
    </span>
  );
}
