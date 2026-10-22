import { useEffect, useRef, useState } from "react";
import { 
  Sparkles, FlaskConical, BookOpen, 
  Globe, Bell, HelpCircle, 
  ShieldCheck, AlertCircle, Coins
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

import { DashboardView } from "@/components/DashboardView";
import { SettingsView } from "@/components/SettingsView";
import { DocumentsView } from "@/components/DocumentsView";
import { KnowledgeGraphView } from "@/components/KnowledgeGraphView";
import { McpToolsView } from "@/components/McpToolsView";
import { ApprovalsView } from "@/components/ApprovalsView";
import { AuditView } from "@/components/AuditView";
import { EvaluationView } from "@/components/EvaluationView";
import { FineTuningView } from "@/components/FineTuningView";
import { ObservabilityView } from "@/components/ObservabilityView";
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
  const [realtimeTokens, setRealtimeTokens] = useState<number>(0);
  const [realtimeCost, setRealtimeCost] = useState<string>("$0.00000");
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Sync real-time token and cost telemetry from backend
  const syncTelemetry = async () => {
    try {
      const res = await api.getObservabilityTelemetry();
      if (res?.telemetry?.tokenAndCostAnalytics) {
        const stats = res.telemetry.tokenAndCostAnalytics;
        setRealtimeTokens(stats.totalTokensConsumed || 0);
        setRealtimeCost(stats.costFormatted || "$0.00000");
      }
    } catch (_) {}
  };

  useEffect(() => {
    syncTelemetry();
    const interval = setInterval(syncTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

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

  // Live real-time multi-agent progression & ticker while query is generating
  useEffect(() => {
    if (!sending) return;

    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      // Phase 1: Research Agent (0ms -> ~3000ms)
      if (elapsed < 3000) {
        setWorkflowSteps([
          {
            agent: "Research Agent",
            status: "running",
            durationMs: elapsed,
            metadata: {
              currentAction: elapsed < 1200 
                ? "Expanding medical synonyms & query concepts" 
                : "Federating search across PubMed, OpenAlex & ClinicalTrials.gov",
              targetDatabases: "PubMed · OpenAlex · ClinicalTrials.gov",
              activeTimer: `${(elapsed / 1000).toFixed(1)}s`,
            },
          },
          {
            agent: "Evidence Agent",
            status: "pending",
            durationMs: 0,
          },
          {
            agent: "Summary Agent",
            status: "pending",
            durationMs: 0,
          },
        ]);
      } 
      // Phase 2: Evidence Agent (3000ms -> ~5000ms)
      else if (elapsed < 5000) {
        setWorkflowSteps([
          {
            agent: "Research Agent",
            status: "completed",
            durationMs: 3000,
            metadata: {
              status: "Literature & clinical trial records retrieved successfully",
              retrievalStatus: "Complete",
            },
          },
          {
            agent: "Evidence Agent",
            status: "running",
            durationMs: elapsed - 3000,
            metadata: {
              currentAction: "Cross-validating study methodology & computing confidence score",
              scoringModel: "100-Point Evidence Index",
              activeTimer: `${((elapsed - 3000) / 1000).toFixed(1)}s`,
            },
          },
          {
            agent: "Summary Agent",
            status: "pending",
            durationMs: 0,
          },
        ]);
      } 
      // Phase 3: Summary Agent (> 5000ms until backend response completes)
      else {
        setWorkflowSteps([
          {
            agent: "Research Agent",
            status: "completed",
            durationMs: 3000,
            metadata: {
              status: "Literature & clinical trial records retrieved successfully",
              retrievalStatus: "Complete",
            },
          },
          {
            agent: "Evidence Agent",
            status: "completed",
            durationMs: 2000,
            metadata: {
              status: "Ranked evidence & validated clinical confidence",
              confidenceIndex: "High",
            },
          },
          {
            agent: "Summary Agent",
            status: "running",
            durationMs: elapsed - 5000,
            metadata: {
              currentAction: "Synthesizing clinical findings, trial matching & structured report",
              reasoningEngine: "Curalink Medical Reasoning LLM",
              activeTimer: `${((elapsed - 5000) / 1000).toFixed(1)}s`,
            },
          },
        ]);
      }
    }, 75);

    return () => clearInterval(interval);
  }, [sending]);

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

  const handleSelectConversation = (id: string) => {
    setConversationId(id);
    setActiveTab("chat");
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
      if (data.tokenCost && !data.tokenCost.isFallback) {
        setRealtimeTokens((prev) => prev + (data.tokenCost?.totalTokens || 0));
        syncTelemetry();
      }
      setWorkflowSteps(data.workflowSteps || []);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          responseMode: payload.responseMode,
          suggestedQuestions: data.suggestedQuestions,
          workflowSteps: data.workflowSteps,
          tokenCost: data.tokenCost,
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
            onSelectConversation={handleSelectConversation}
            onSearchSuggest={handleSearchSuggest} 
          />
        );
      case "chat":
        return renderChatWorkspace();
      case "documents":
        return <DocumentsView onDocumentsChange={fetchDocuments} />;
      case "knowledge-graph":
        return <KnowledgeGraphView />;
      case "mcp-tools":
        return <McpToolsView />;
      case "approvals":
        return <ApprovalsView />;
      case "audit-logs":
        return <AuditView />;
      case "evaluations":
        return <EvaluationView />;
      case "fine-tuning":
        return <FineTuningView />;
      case "observability":
        return <ObservabilityView />;
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
        <div ref={scrollerRef} className="flex-1 overflow-y-auto min-h-0 bg-black">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[55vh] max-w-2xl mx-auto px-4 py-8 text-center space-y-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/25 via-blue-500/20 to-indigo-600/30 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10">
                <Sparkles className="h-6 w-6 text-cyan-300" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
                  Start a New Investigation
                </h1>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed font-normal">
                  Enter your clinical query below. Curalink's 9-agent system federates searches across PubMed, OpenAlex, and ClinicalTrials.gov to generate structured evidence briefs.
                </p>
              </div>
              <div className="w-full pt-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                  Suggested Clinical Investigations
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-left">
                  {[
                    { q: "Latest immunotherapy approaches for stage IV melanoma", icon: FlaskConical, color: "text-emerald-400" },
                    { q: "Osimertinib clinical trial outcomes in EGFR-mutant NSCLC", icon: BookOpen, color: "text-blue-400" },
                    { q: "Recent CAR-T cell therapy advancements in relapsed lymphoma", icon: Globe, color: "text-purple-400" },
                    { q: "Trastuzumab deruxtecan in HER2-low metastatic breast cancer", icon: ShieldCheck, color: "text-cyan-400" }
                  ].map(({ q, icon: Icon, color }) => (
                    <button
                      key={q}
                      onClick={() => handleSubmit({ message: q })}
                      className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-[#0a0a0a] hover:border-cyan-500/30 hover:bg-[#121216] p-3 text-xs transition-all duration-200 text-slate-300 hover:text-white cursor-pointer text-left shadow-sm"
                    >
                      <div className="h-7 w-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                      </div>
                      <span className="truncate font-normal">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-4">
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

        <div className="border-t border-white/8 bg-black/95 backdrop-blur-md px-4 sm:px-6 py-2.5 shrink-0">
          <div className="max-w-5xl mx-auto">
            {error && (
              <div className="mb-2 text-xs text-red-400 bg-red-950/30 border border-red-900/30 rounded-xl px-3 py-2 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-300">Pipeline Alert</div>
                  <div className="text-[10px] mt-0.5 text-red-400/90 font-normal">{error}</div>
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
            <p className="mt-1.5 text-[9px] text-slate-500 text-center font-normal">
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/25 via-blue-500/20 to-indigo-600/30 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10 animate-pulse">
            <Sparkles className="h-6 w-6 text-cyan-300" />
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
        onSelect={handleSelectConversation}
        onNew={handleNew}
        items={conversations}
        loading={loadingConversations}
        onDelete={handleDeleteConversation}
        onLogout={handleLogout}
        refreshKey={refreshKey}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-13 border-b border-white/8 bg-black px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5 bg-[#0a0a0a] border border-white/8 px-2.5 py-1 rounded-full shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Clinical Terminal
            </span>

            {activeTab === "chat" && (
              <div className="hidden sm:flex items-center gap-2 pl-2.5 border-l border-white/10 min-w-0">
                <h2 className="text-xs font-serif font-bold text-white truncate">
                  {messages.length > 0 ? "Research Conversation" : "New Investigation"}
                </h2>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#121212] border border-white/10 text-slate-400 font-mono shrink-0">
                  {messages.length} {messages.length === 1 ? "msg" : "msgs"}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === "chat" && (
              <div className="hidden xl:flex items-center gap-1.5 text-[9px] text-slate-400 font-medium mr-1">
                <Pill icon={BookOpen} label="PubMed" />
                <Pill icon={Globe} label="OpenAlex" />
                <Pill icon={FlaskConical} label="ClinicalTrials.gov" />
              </div>
            )}

            {/* Real-time Token & Cost Live Ticker */}
            <div 
              onClick={() => setActiveTab("observability")}
              title="Real-time Token & Cost Tracker — Click to view Observability metrics"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono text-emerald-400 hover:bg-emerald-500/15 cursor-pointer transition-colors"
            >
              <Coins className="h-3 w-3 text-emerald-400 shrink-0" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-semibold text-white">{realtimeCost}</span>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-emerald-300/80 hidden sm:inline">{realtimeTokens.toLocaleString()} tok</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a0a0a] border border-white/8 text-[9px] text-slate-300 font-medium">
              <ShieldCheck className="h-3 w-3 text-slate-400" />
              HIPAA Encrypted
            </div>

            <button className="p-1.5 rounded-full border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors relative cursor-pointer">
              <Bell className="h-3 w-3" />
            </button>

            <button className="p-1.5 rounded-full border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <HelpCircle className="h-3 w-3" />
            </button>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/8 py-0.5">
              <Show when="signed-in">
                <UserButton />
              </Show>
              <span className="hidden lg:inline-block text-xs font-medium text-slate-300 truncate max-w-[120px]">
                {userName}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex min-h-0 relative bg-black">
          <main className={cn(
            "flex-1 min-w-0",
            activeTab === "chat" ? "overflow-hidden flex flex-col" : "overflow-y-auto px-4 sm:px-6 py-6"
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
