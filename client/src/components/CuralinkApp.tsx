import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { 
  Sparkles, FlaskConical, BookOpen, 
  Globe, ShieldCheck, AlertCircle, Coins, Menu
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
import { Btn, Chip } from "@/components/ui/kit";

import { DashboardView } from "@/components/DashboardView";
import { SettingsView } from "@/components/SettingsView";
import { DocumentsView } from "@/components/DocumentsView";
import { KnowledgeGraphView } from "@/components/KnowledgeGraphView";
import { ObservabilityView } from "@/components/ObservabilityView";
import { useAuth, useUser, useClerk, Show, UserButton } from "@clerk/react";

const TAB_TITLES: Record<string, string> = {
  dashboard: "Overview",
  chat: "Research workspace",
  documents: "Documents",
  "knowledge-graph": "Knowledge graph",
  observability: "Observability",
  settings: "Settings",
};

export function CuralinkApp() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();

  const reduceMotion = useReducedMotion();
  const [mobileNav, setMobileNav] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const userName = user?.fullName || "Account";

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
    setWorkflowSteps([]);
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
            onSelectConversation={handleSelectConversation}
            onSearchSuggest={handleSearchSuggest} 
          />
        );
    }
  };

  const renderChatWorkspace = () => {
    const starters = [
      { q: "Latest immunotherapy approaches for stage IV melanoma", icon: FlaskConical, color: "#34d399" },
      { q: "Osimertinib trial outcomes in EGFR-mutant NSCLC", icon: BookOpen, color: "#38bdf8" },
      { q: "CAR-T advances in relapsed lymphoma", icon: Globe, color: "#a78bfa" },
      { q: "Trastuzumab deruxtecan in HER2-low breast cancer", icon: ShieldCheck, color: "#38bdf8" },
    ];
    return (
      <div className="flex-1 flex flex-col min-h-0 relative">
        <div ref={scrollerRef} className="flex-1 overflow-y-auto min-h-0">
          {messages.length === 0 && !sending ? (
            <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 py-12 text-center">
              <span className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-sky-300/25 bg-sky-300/10 text-sky-200">
                <Sparkles className="h-7 w-7" />
              </span>
              <h1 className="font-serif text-[clamp(32px,4.4vw,52px)] font-light leading-[1.05] tracking-[-0.02em] text-white">What would you like to investigate?</h1>
              <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-white/55">
                CuraLink searches PubMed, OpenAlex and ClinicalTrials.gov, then checks every citation against what it retrieved.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                <Chip color="#38bdf8">PubMed</Chip>
                <Chip color="#a78bfa">OpenAlex</Chip>
                <Chip color="#34d399">ClinicalTrials.gov</Chip>
              </div>
              <div className="mt-10 w-full text-left">
                <p className="mb-3 text-[14px] text-white/50">Try one of these</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {starters.map(({ q, icon: Icon, color }) => (
                    <button key={q} onClick={() => handleSubmit({ message: q })} className="group flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06]">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: color + "18", color }}>
                        <Icon className="h-[17px] w-[17px]" />
                      </span>
                      <span className="text-[14.5px] leading-snug text-white/85">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-8">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} onSuggestion={handleSuggestion} />
              ))}
              {sending && <AgentWorkflowPanel steps={[]} isLoading />}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-white/8 bg-[#050508]/90 px-4 py-4 backdrop-blur-md sm:px-8">
          <div className="mx-auto max-w-4xl">
            {error && (
              <div role="alert" className="mb-3 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-400/[0.07] px-4 py-3.5">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-medium text-red-100">The run could not finish</p>
                  <p className="mt-0.5 break-words text-[13.5px] text-red-200/80">{error}</p>
                </div>
                <Btn size="sm" variant="ghost" onClick={() => setError(null)}>Dismiss</Btn>
              </div>
            )}
            <StructuredInput
              onSubmit={handleSubmit}
              disabled={sending}
              documents={documents}
              selectedDocumentIds={selectedDocumentIds}
              onDocumentIdsChange={setSelectedDocumentIds}
            />
            <p className="mt-2.5 text-center text-[12.5px] text-white/35">
              CuraLink is a research aid, not medical advice. Verify important findings with a qualified clinician.
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
    <div className="flex h-screen w-full bg-[#050508] text-slate-100 font-sans overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden h-full lg:block">
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
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNav && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileNav(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-y-0 left-0 z-50 h-full lg:hidden">
              <Sidebar
                activeTab={activeTab}
                onTabChange={(t) => { setActiveTab(t); setMobileNav(false); }}
                activeId={conversationId}
                onSelect={(id) => { handleSelectConversation(id); setMobileNav(false); }}
                onNew={() => { handleNew(); setMobileNav(false); }}
                items={conversations}
                loading={loadingConversations}
                onDelete={handleDeleteConversation}
                onLogout={handleLogout}
                refreshKey={refreshKey}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-white/8 bg-[#050508] px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setMobileNav(true)} aria-label="Open menu" className="-ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/75 hover:bg-white/8 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="truncate text-[15px] font-medium text-white">{TAB_TITLES[activeTab] ?? "Workspace"}</h2>
            {activeTab === "chat" && messages.length > 0 && (
              <span className="hidden shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[12px] text-white/55 sm:inline">
                {messages.length} {messages.length === 1 ? "message" : "messages"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("observability")}
              title="Session usage. Open Observability for the full ledger."
              className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[12.5px] text-white/75 transition-colors hover:border-white/25 hover:text-white"
            >
              <Coins className="h-3.5 w-3.5 text-emerald-300" />
              <span className="tabular-nums">{realtimeCost}</span>
              <span className="hidden text-white/30 sm:inline">·</span>
              <span className="hidden tabular-nums text-white/55 sm:inline">{realtimeTokens.toLocaleString()} tokens</span>
            </button>
            <div className="flex items-center gap-2.5 border-l border-white/10 pl-3">
              <Show when="signed-in">
                <UserButton />
              </Show>
              <span className="hidden max-w-[140px] truncate text-[13px] text-white/75 lg:inline">{userName}</span>
            </div>
          </div>
        </header>


        <div className="flex-1 flex min-h-0 relative bg-[#050508]">
          <main className={cn(
            "flex-1 min-w-0",
            activeTab === "chat" ? "overflow-hidden flex flex-col" : "overflow-y-auto px-4 sm:px-6 lg:px-8 py-6"
          )}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className={activeTab === "chat" ? "flex-1 flex flex-col min-h-0" : "max-w-[1360px] mx-auto w-full"}
              >
                {renderContentView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
