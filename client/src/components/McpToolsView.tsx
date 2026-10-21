import { useState, useEffect } from "react";
import { 
  Wrench, Server, ShieldAlert, CheckCircle2, Play, 
  RefreshCw, AlertTriangle, ExternalLink, Activity
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function McpToolsView() {
  const [tools, setTools] = useState<any[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [toolArgs, setToolArgs] = useState<string>('{"query": "pembrolizumab lung cancer"}');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [toolsRes, serversRes] = await Promise.all([
        api.getMcpTools(),
        api.getMcpServers()
      ]);
      setTools(toolsRes.tools || []);
      setServers(serversRes.servers || []);
      if (toolsRes.tools?.length > 0 && !selectedTool) {
        setSelectedTool(toolsRes.tools[0]);
      }
    } catch (err: any) {
      toast.error(`Failed to load MCP resources: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExecute = async () => {
    if (!selectedTool) return;
    try {
      setExecuting(true);
      setExecutionResult(null);
      let parsed = {};
      try {
        parsed = JSON.parse(toolArgs);
      } catch (e) {
        toast.error("Invalid JSON in tool parameters");
        setExecuting(false);
        return;
      }

      const res = await api.executeMcpTool(selectedTool.toolName, parsed);
      setExecutionResult(res.data);
      if (res.data?.status === "approval_required") {
        toast.warning("Restricted Tool: Paused pending Lead Researcher approval.");
      } else {
        toast.success(`Executed ${selectedTool.toolName} successfully`);
      }
      fetchData();
    } catch (err: any) {
      toast.error(`Execution error: ${err.message}`);
      setExecutionResult({ error: err.message });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <Wrench className="h-4 w-4" /> Model Context Protocol Ecosystem
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mt-1">MCP Tool Registry & Gateway</h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized TypeScript MCP gateway with schema validation, permission boundaries, and high-risk approval interception.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-slate-300 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Connected Servers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {servers.map((server) => (
          <div key={server.serverId} className="rounded-xl bg-white/[0.02] border border-white/8 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Server className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{server.name}</h3>
                  <p className="text-xs text-slate-400">{server.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {server.status} ({server.latencyMs}ms)
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-white/5 pt-2">
              <span>Transport: {server.transport}</span>
              <span>ID: {server.serverId}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Tools & Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tool List (Left 5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Registered MCP Tools ({tools.length})
          </div>
          <div className="space-y-2">
            {tools.map((t) => {
              const isSelected = selectedTool?.toolName === t.toolName;
              const isHighRisk = t.riskClassification === "high_approval_required";
              return (
                <div
                  key={t.toolName}
                  onClick={() => {
                    setSelectedTool(t);
                    setExecutionResult(null);
                    if (t.toolName === "pubmed_search") {
                      setToolArgs('{"query": "osimertinib EGFR NSCLC", "maxResults": 5}');
                    } else if (t.toolName === "clinical_trials_search") {
                      setToolArgs('{"condition": "Parkinson Disease DBS", "maxResults": 3}');
                    } else if (t.toolName === "export_research_report") {
                      setToolArgs('{"title": "Q3 Oncology Dossier", "reportContent": "Synthesized evidence summary", "destination": "external-portal", "classification": "restricted"}');
                    } else if (t.toolName === "knowledge_graph_query") {
                      setToolArgs('{"query": "Pembrolizumab NSCLC"}');
                    } else if (t.toolName === "provenance_verifier") {
                      setToolArgs('{"claim": "Pembrolizumab improves OS in PD-L1 high NSCLC", "sourceIds": ["NCT02142738", "PMID:27716466"]}');
                    } else {
                      setToolArgs('{"query": "clinical results"}');
                    }
                  }}
                  className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? "bg-teal-500/[0.07] border-teal-500/40 shadow-sm"
                      : "bg-white/[0.02] border-white/8 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white font-mono">{t.toolName}</div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-2">{t.description}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ml-2 ${
                        isHighRisk
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : "bg-slate-800 text-slate-300 border border-white/10"
                      }`}
                    >
                      {isHighRisk ? "Approval Required" : "Standard"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Server: {t.serverId.replace("curalink-", "")}</span>
                    <span>Calls: {t.callCount || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tool Playground (Right 7 Cols) */}
        <div className="lg:col-span-7">
          {selectedTool ? (
            <div className="rounded-xl bg-white/[0.02] border border-white/8 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <div>
                  <h3 className="text-base font-semibold text-white font-mono">{selectedTool.toolName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedTool.description}</p>
                </div>
                {selectedTool.riskClassification === "high_approval_required" && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
                    <ShieldAlert className="h-3.5 w-3.5" /> Gated by Approval Policy
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Parameters (JSON Input)
                </label>
                <textarea
                  value={toolArgs}
                  onChange={(e) => setToolArgs(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg bg-black/60 border border-white/10 p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500/60"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleExecute}
                  disabled={executing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-semibold text-xs transition-all shadow-md"
                >
                  {executing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                  Execute MCP Tool
                </button>
              </div>

              {/* Execution Output */}
              {executionResult && (
                <div className="mt-4 border-t border-white/8 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Gateway Response
                    </span>
                    {executionResult.status === "approval_required" ? (
                      <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Suspended for Approval
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Success ({executionResult.durationMs || 0}ms)
                      </span>
                    )}
                  </div>
                  <pre className="rounded-lg bg-black/80 border border-white/10 p-3 text-xs font-mono text-slate-300 max-h-72 overflow-y-auto">
                    {JSON.stringify(executionResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
              Select a tool to view parameters and test execution.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
