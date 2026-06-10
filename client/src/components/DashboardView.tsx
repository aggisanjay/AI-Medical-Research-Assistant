import { useState, useEffect } from "react";
import { 
  BookOpen, Cpu, FileText, CheckCircle, Search, Sparkles, Plus, 
  ChevronRight, ArrowRight, ArrowUpRight, Gauge, Database, History,
  Hourglass, TrendingUp
} from "lucide-react";
import { api } from "@/lib/api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface DashboardViewProps {
  items: any[];
  loading: boolean;
  onNavigate: (tab: string) => void;
  onSelectConversation: (id: string) => void;
  onSearchSuggest: (query: string) => void;
}

export function DashboardView({ 
  items, loading, onNavigate, onSelectConversation, onSearchSuggest 
}: DashboardViewProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then((res) => {
        if (res.success) {
          setAnalytics(res.data);
        }
      })
      .catch((err) => console.error("Error loading analytics:", err))
      .finally(() => setLoadingAnalytics(false));
  }, [items]);

  const metrics = analytics?.metrics || {
    sourcesRetrieved: 0,
    citationsGenerated: 0,
    researchSessions: 0,
    documentsUploaded: 0,
    averageConfidenceScore: 0
  };

  const distributionData = analytics?.distribution || [
    { name: "PubMed", value: 0 },
    { name: "OpenAlex", value: 0 },
    { name: "ClinicalTrials", value: 0 }
  ];

  const executionTimesData = analytics?.executionTimes || [
    { name: "Research Agent", duration: 0 },
    { name: "Evidence Agent", duration: 0 },
    { name: "Summary Agent", duration: 0 }
  ];

  const timelineData = analytics?.timeline || [
    { year: 2022, count: 0 },
    { year: 2023, count: 0 },
    { year: 2024, count: 0 },
    { year: 2025, count: 0 },
    { year: 2026, count: 0 }
  ];

  // Colors mapping for charts
  const COLORS = {
    PubMed: "#a855f7",
    OpenAlex: "#ec4899",
    ClinicalTrials: "#10b981"
  };

  const statCards = [
    {
      title: "Sources Retrieved",
      value: metrics.sourcesRetrieved.toLocaleString(),
      desc: "Gross database responses",
      icon: Database,
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    },
    {
      title: "Citations Generated",
      value: metrics.citationsGenerated.toLocaleString(),
      desc: "Peer-reviewed citations mapped",
      icon: BookOpen,
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    {
      title: "Research Sessions",
      value: metrics.researchSessions.toString(),
      desc: "Investigations logged",
      icon: History,
      iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
    },
    {
      title: "Documents Uploaded",
      value: metrics.documentsUploaded.toString(),
      desc: "Ingested semantic TXT/PDFs",
      icon: FileText,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "Avg Confidence Score",
      value: `${metrics.averageConfidenceScore}/10`,
      desc: "Evidence Agent score index",
      icon: Gauge,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    }
  ];

  const quickActions = [
    {
      title: "New Investigation",
      desc: "Begin an empty clinical workspace research flow",
      icon: Plus,
      action: () => {
        onSelectConversation("");
        onNavigate("chat");
      },
      gradient: "from-blue-600/25 to-blue-500/5 hover:border-blue-500/40"
    },
    {
      title: "Query Literature",
      desc: "Ask standard questions on immunotherapy and CAR-T",
      icon: Sparkles,
      action: () => {
        onNavigate("chat");
      },
      gradient: "from-cyan-600/25 to-cyan-500/5 hover:border-cyan-500/40"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Evidence Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-400 font-light mt-1">
            Real-time tracking of multi-agent execution times, source distributions, and database metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              onSelectConversation("");
              onNavigate("chat");
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" />
            New Investigation
          </button>
        </div>
      </div>

      {/* Universal Search Box */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 flex items-center gap-3 bg-slate-950/80 border border-slate-800/60 rounded-xl px-4 py-3 focus-within:border-blue-500/40 transition-all">
          <Search className="h-4 w-4 text-slate-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Search publications, clinical trials, or ask a research question (e.g. Stage IV Melanoma CAR-T)..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none min-w-0 font-light"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                onSearchSuggest(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-500 uppercase">
            Enter
          </kbd>
        </div>
      </div>

      {/* Analytics KPI Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card p-5 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:border-white/10 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase font-display">{card.title}</span>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${card.iconColor}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="mt-4">
                <span className="text-2xl font-bold tracking-tight text-white font-display block">
                  {loadingAnalytics ? "..." : card.value}
                </span>
                <span className="text-[10px] text-slate-500 font-light mt-1 block">
                  {card.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart A: Source Distribution */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col h-[320px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display mb-4 flex items-center gap-1.5">
            <Database className="h-4 w-4 text-purple-400" />
            Source Distribution
          </h3>
          <div className="flex-1 min-h-0 relative">
            {loadingAnalytics ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">Loading charts...</div>
            ) : distributionData.reduce((sum: number, d: any) => sum + d.value, 0) === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs gap-1">
                <span>No source data retrieved yet</span>
                <span className="text-[10px] text-slate-600">Queries in Chat mode will populate this card</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry: any, index: number) => {
                      const color = COLORS[entry.name as keyof typeof COLORS] || "#64748b";
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    iconSize={8}
                    formatter={(value) => <span className="text-[10px] text-slate-300 font-light">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart B: Agent Execution Time */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col h-[320px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display mb-4 flex items-center gap-1.5">
            <Hourglass className="h-4 w-4 text-cyan-400" />
            Agent Execution Runtimes (ms)
          </h3>
          <div className="flex-1 min-h-0 relative">
            {loadingAnalytics ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">Loading charts...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={executionTimesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Bar dataKey="duration" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={45} minPointSize={5}>
                    {executionTimesData.map((entry: any, index: number) => {
                      const colors = ["#3b82f6", "#06b6d4", "#10b981"];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart C: Publication Timeline */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col h-[320px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            Publications by Year
          </h3>
          <div className="flex-1 min-h-0 relative">
            {loadingAnalytics ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">Loading charts...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#020617" }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Quick Actions & Recent Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white font-display">Recent Activity</h3>
            <button onClick={() => onNavigate("chat")} className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1">
              View Workspace
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Investigation Name</th>
                  <th className="pb-3">Scope ID</th>
                  <th className="pb-3">Updated At</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-light">
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      Loading clinical records...
                    </td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 italic">
                      No clinical research records found in this user session.
                    </td>
                  </tr>
                )}
                {!loading && items.slice(0, 5).map((conv) => (
                  <tr 
                    key={conv.conversationId} 
                    className="hover:bg-slate-900/40 transition-all cursor-pointer group"
                    onClick={() => {
                      onSelectConversation(conv.conversationId);
                      onNavigate("chat");
                    }}
                  >
                    <td className="py-3.5 font-medium text-slate-200 pr-3 max-w-[200px] truncate group-hover:text-primary transition-colors">
                      {conv.disease || conv.patientName || "Untitled Investigation"}
                    </td>
                    <td className="py-3.5 text-slate-500 font-mono text-[10px]">
                      {conv.conversationId.substring(0, 8)}...
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {new Date(conv.updatedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="text-[10px] font-semibold text-cyan-400 group-hover:underline flex items-center gap-0.5 justify-end">
                        Resume
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white font-display">Workspace Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={action.action}
                    className="w-full text-left p-3 rounded-xl border border-white/5 bg-slate-950/40 hover:border-slate-800 transition-colors flex items-center gap-3 group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-200 group-hover:text-primary transition-colors">{action.title}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{action.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-4 mt-4 text-[10px] text-slate-500 text-center font-light leading-relaxed">
            HIPAA Audit Active · Compliance logs active in session.
          </div>
        </div>

      </div>

    </div>
  );
}
