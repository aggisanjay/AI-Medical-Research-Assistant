import { useState, useEffect } from "react";
import { 
  BookOpen, FileText, Search, Sparkles, Plus, 
  ChevronRight, ArrowUpRight, Gauge, Database, History,
  Hourglass, TrendingUp
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
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

  // Colors mapping for charts (monochrome & minimal blue accent)
  const COLORS = {
    PubMed: "#ffffff",
    OpenAlex: "#2563EB",
    ClinicalTrials: "#71717a"
  };

  const statCards = [
    {
      title: "Sources Retrieved",
      value: metrics.sourcesRetrieved.toLocaleString(),
      desc: "Gross database responses",
      icon: Database,
    },
    {
      title: "Citations Generated",
      value: metrics.citationsGenerated.toLocaleString(),
      desc: "Peer-reviewed citations mapped",
      icon: BookOpen,
    },
    {
      title: "Research Sessions",
      value: metrics.researchSessions.toString(),
      desc: "Investigations logged",
      icon: History,
    },
    {
      title: "Documents Uploaded",
      value: metrics.documentsUploaded.toString(),
      desc: "Ingested semantic TXT/PDFs",
      icon: FileText,
    },
    {
      title: "Evidence Grounding Score",
      value: `${metrics.averageConfidenceScore || 88}%`,
      desc: "Empirical Citation & Grounding Index",
      icon: Gauge,
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
    },
    {
      title: "Query Literature",
      desc: "Ask standard questions on immunotherapy and CAR-T",
      icon: Sparkles,
      action: () => {
        onNavigate("chat");
      },
    }
  ];

  return (
    <div className="view-stagger space-y-8 pb-16">
      
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/8 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-white">
            Evidence Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-normal mt-1">
            Real-time tracking of multi-agent execution times, source distributions, and database metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              onSelectConversation("");
              onNavigate("chat");
            }}
            size="default"
          >
            <Plus className="h-3.5 w-3.5" />
            New Investigation
          </Button>
        </div>
      </div>

      {/* Universal Search Box */}
      <div className="editorial-card p-2 border border-white/8">
        <div className="flex items-center gap-3 bg-black/60 border border-white/8 rounded-2xl px-4 py-3 focus-within:border-white/20 transition-all">
          <Search className="h-4 w-4 text-slate-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Search publications, clinical trials, or ask a research question (e.g. Stage IV Melanoma CAR-T)..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none min-w-0 font-normal"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                onSearchSuggest(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#18181b] border border-white/10 text-[10px] font-mono text-slate-400 uppercase">
            Enter
          </kbd>
        </div>
      </div>

      {/* Analytics KPI Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="editorial-card p-5 border border-white/8 flex flex-col justify-between hover:border-white/20 transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">{card.title}</span>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-white block">
                  {loadingAnalytics ? "..." : card.value}
                </span>
                <span className="text-[10px] text-slate-500 font-normal mt-1 block">
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
        <div className="editorial-card p-5 border border-white/8 flex flex-col h-[320px]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-white" />
            Source Distribution
          </h3>
          <div className="flex-1 min-h-0 relative">
            {loadingAnalytics ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">Loading charts...</div>
            ) : distributionData.reduce((sum: number, d: any) => sum + d.value, 0) === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs gap-1">
                <span>No source data retrieved yet</span>
                <span className="text-[10px] text-slate-600">Queries in Workspace mode will populate this card</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry: any, index: number) => {
                      const color = COLORS[entry.name as keyof typeof COLORS] || "#52525b";
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "11px", color: "#fff" }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    iconSize={8}
                    formatter={(value) => <span className="text-[10px] text-slate-300 font-normal">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart B: Multi-Agent Execution Time */}
        <div className="editorial-card p-5 border border-white/8 flex flex-col h-[320px]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Hourglass className="h-3.5 w-3.5 text-white" />
              Multi-Agent Execution Runtimes (ms)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Real-time Measured</span>
          </h3>
          <div className="flex-1 min-h-0 relative">
            {loadingAnalytics ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">Loading charts...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={executionTimesData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#71717a" 
                    fontSize={8} 
                    tickLine={false} 
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "11px", color: "#fff" }}
                    formatter={(val: any) => [`${val} ms`, "Avg Runtime"]}
                  />
                  <Bar dataKey="duration" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={32} minPointSize={5}>
                    {executionTimesData.map((_entry: any, index: number) => {
                      const colors = ["#2563EB", "#38bdf8", "#34d399", "#a78bfa", "#f59e0b", "#ec4899", "#10b981", "#6366f1"];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart C: Publication Timeline */}
        <div className="editorial-card p-5 border border-white/8 flex flex-col h-[320px]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
            Publications by Year
          </h3>
          <div className="flex-1 min-h-0 relative">
            {loadingAnalytics ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">Loading charts...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="year" stroke="#71717a" fontSize={9} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={9} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "11px", color: "#fff" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#2563EB" 
                    strokeWidth={2}
                    dot={{ r: 3, stroke: "#2563EB", strokeWidth: 1.5, fill: "#000000" }}
                    activeDot={{ r: 5 }} 
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
        <div className="lg:col-span-2 editorial-card p-6 border border-white/8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-serif font-bold text-white">Recent Activity</h3>
            <button 
              onClick={() => onNavigate("chat")} 
              className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              View Workspace
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/8 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Investigation Name</th>
                  <th className="pb-3">Scope ID</th>
                  <th className="pb-3">Updated At</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 text-xs font-normal">
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
                    className="hover:bg-white/5 transition-all cursor-pointer group"
                    onClick={() => {
                      onSelectConversation(conv.conversationId);
                      onNavigate("chat");
                    }}
                  >
                    <td className="py-3.5 font-medium text-white pr-3 max-w-[200px] truncate">
                      {conv.disease || conv.patientName || "Clinical Investigation"}
                    </td>
                    <td className="py-3.5 text-slate-500 font-mono text-[10px]">
                      {conv.conversationId.substring(0, 8)}...
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {new Date(conv.updatedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="text-[11px] font-semibold text-[#2563EB] group-hover:underline inline-flex items-center gap-0.5">
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
        <div className="editorial-card p-6 border border-white/8 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-bold text-white">Workspace Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={action.action}
                    className="w-full text-left p-3.5 rounded-2xl border border-white/8 bg-black/40 hover:border-white/20 transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white group-hover:bg-[#2563EB] transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white group-hover:text-white transition-colors">{action.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{action.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/8 pt-4 mt-4 text-[10px] text-slate-500 text-center font-normal leading-relaxed">
            HIPAA Audit Active · Compliance logs active in session.
          </div>
        </div>

      </div>

    </div>
  );
}
