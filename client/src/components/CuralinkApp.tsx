import { useEffect, useRef, useState } from "react";
import { 
  Activity, Loader2, Sparkles, FlaskConical, BookOpen, 
  Globe, Bell, HelpCircle, ChevronDown, 
  ShieldCheck, ArrowUpRight, Cpu, LogOut
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { StructuredInput } from "@/components/StructuredInput";
import { MessageBubble } from "@/components/MessageBubble";
import { api, type ChatMessage, type SendMessagePayload } from "@/lib/api";
import { cn } from "@/lib/utils";

// Import view components
import { LoginView } from "@/components/LoginView";
import { DashboardView } from "@/components/DashboardView";
import { SettingsView } from "@/components/SettingsView";
import { useUser, useClerk, Show, UserButton } from "@clerk/react";

export function CuralinkApp() {
  const { isLoaded, isSignedIn, user } = useUser();
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
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Sync scroll on chat
  useEffect(() => {
    if (activeTab === "chat") {
      scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, sending, activeTab]);

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

  useEffect(() => {
    fetchConversations();
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
    const optimistic: ChatMessage = {
      role: "user",
      content:
        payload.message ||
        [payload.disease, payload.query].filter(Boolean).join(" — "),
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
      const assistant = res.data as unknown as ChatMessage;
      setMessages((prev) => [...prev, { ...assistant, role: "assistant" }]);
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      setError(e.message || "Request failed");
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
            <EmptyState onSuggest={(q) => handleSubmit({ message: q })} />
          ) : (
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} onSuggestion={handleSuggestion} />
              ))}
              {sending && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg animate-pulse-slow">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 rounded-2xl rounded-tl-sm border border-white/5 bg-slate-900 px-4 py-3 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                    Searching PubMed, OpenAlex & ClinicalTrials.gov…
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/5 bg-slate-950/40 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3.5 py-2.5">
                {error}
              </div>
            )}
            <StructuredInput onSubmit={handleSubmit} disabled={sending} />
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
      <div className="flex h-screen w-full items-center justify-center bg-[#020617] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <span className="text-sm font-semibold tracking-wide text-slate-400">Loading Workspace...</span>
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

          {(activeTab === "dashboard") && (
            <aside className="hidden xl:flex w-80 border-l border-white/5 bg-slate-950/40 p-6 flex-col justify-between shrink-0">
              <div className="space-y-6">
                <div className="border-b border-slate-800/80 pb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
                    AI Clinical Insights
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-light">Real-time target actionability mapping</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-cyan-400" />
                    <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">Marker Spotlight</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">EGFR L858R Mutation</h4>
                  <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                    Sensitivity assays indicate maximum actionability for third-generation TKI osimertinib in primary non-small cell metastatic trials.
                  </p>
                  <button 
                    onClick={() => handleSearchSuggest("EGFR L858R mutation oncology guidelines")}
                    className="text-[9px] font-bold text-cyan-400 hover:underline flex items-center gap-0.5"
                  >
                    Query Guidelines
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Clinical Metrics
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl">
                      <div className="font-bold text-white font-display">99.8%</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Synth. Accuracy</div>
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl">
                      <div className="font-bold text-white font-display">1.2s</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Avg Query Speed</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-[9px] text-slate-500 flex items-center gap-1.5 justify-center leading-relaxed text-center font-light">
                🔒 HIPAA / GDPR Sandbox Secured
              </div>
            </aside>
          )}
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

function EmptyState({ onSuggest }: { onSuggest: (q: string) => void }) {
  const examples = [
    "Latest immunotherapy approaches for stage IV melanoma",
    "Recent CAR-T trials for relapsed lymphoma in Europe",
    "Long COVID cognitive treatment evidence 2024",
    "Pediatric type 1 diabetes — beta cell regeneration research",
  ];
  return (
    <div className="h-full flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl mb-5 pulse-cyan-glow">
          <Activity className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-display">
          Curalink Research Assistant
        </h2>
        <p className="mt-3 text-xs text-slate-400 leading-relaxed max-w-md mx-auto font-light">
          Input any clinical search query. We scan PubMed, OpenAlex, and ClinicalTrials.gov simultaneously to compile structured briefs with full citations.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-3 text-left">
          {examples.map((q) => (
            <button
              key={q}
              onClick={() => onSuggest(q)}
              className="group flex items-start gap-2.5 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500/30 p-3.5 text-xs hover:shadow-lg transition-all duration-300"
            >
              <Sparkles className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
              <span className="text-slate-300 group-hover:text-white transition-colors">{q}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
