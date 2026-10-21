import { useState, useEffect } from "react";
import { 
  Activity, Server, Database, Cpu, HardDrive, 
  RefreshCw, CheckCircle2, ShieldCheck, Zap,
  Coins, TrendingDown, Layers
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function ObservabilityView() {
  const [telemetry, setTelemetry] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const res = await api.getObservabilityTelemetry();
      setTelemetry(res.telemetry);
    } catch (err: any) {
      toast.error(`Failed to load telemetry: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Activity className="h-4 w-4" /> Real-time System Telemetry
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mt-1">Observability & Health Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            System latency, token estimation, memory allocation, database connectivity, and agent telemetry.
          </p>
        </div>
        <button
          onClick={fetchTelemetry}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-slate-300 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {telemetry && (
        <div className="space-y-6">
          {/* Top Scorecards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-white/[0.02] border border-white/8 p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Avg Query Latency</span>
                <Zap className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {telemetry.agentWorkflows?.avgLatencyMs || 0}ms
              </div>
              <div className="text-[11px] text-slate-500">Across 9 agent steps</div>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/8 p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Memory Allocation</span>
                <HardDrive className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-purple-400">
                {telemetry.system?.processHeapUsedMB || 0} MB
              </div>
              <div className="text-[11px] text-slate-500">Node process heap used</div>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/8 p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Pending Approvals</span>
                <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-teal-400">
                {telemetry.governanceAndApprovals?.pendingApprovalsCount || 0}
              </div>
              <div className="text-[11px] text-slate-500">
                {telemetry.governanceAndApprovals?.totalAuditEventsLogged || 0} audit events
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/8 p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Uptime</span>
                <Server className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {Math.floor(telemetry.system?.uptimeSeconds / 60)}m {telemetry.system?.uptimeSeconds % 60}s
              </div>
              <div className="text-[11px] text-slate-500">Platform operational</div>
            </div>
          </div>

          {/* Real-Time Token & Financial Cost Analytics */}
          {telemetry.tokenAndCostAnalytics && (
            <div className="rounded-xl bg-gradient-to-br from-emerald-950/20 via-black to-teal-950/20 border border-emerald-500/20 p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Coins className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      Real-Time Token & Financial Cost Analytics
                      <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Tracking
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Granular token ledger across every multi-agent query, embedding generation, tool call, and evaluation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Est. Total Spend</div>
                    <div className="text-lg font-bold font-mono text-emerald-400">
                      {telemetry.tokenAndCostAnalytics.costFormatted || "$0.00000"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-3.5 rounded-lg bg-black/60 border border-white/5">
                  <div className="text-[11px] text-slate-400">Total Tokens</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {(telemetry.tokenAndCostAnalytics.totalTokensConsumed || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Prompt + Completion</div>
                </div>

                <div className="p-3.5 rounded-lg bg-black/60 border border-white/5">
                  <div className="text-[11px] text-slate-400">Prompt Tokens</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                    {(telemetry.tokenAndCostAnalytics.totalPromptTokens || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Context & RAG input</div>
                </div>

                <div className="p-3.5 rounded-lg bg-black/60 border border-white/5">
                  <div className="text-[11px] text-slate-400">Completion Tokens</div>
                  <div className="text-xl font-bold font-mono text-teal-400 mt-1">
                    {(telemetry.tokenAndCostAnalytics.totalCompletionTokens || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Synthesis output</div>
                </div>

                <div className="p-3.5 rounded-lg bg-black/60 border border-emerald-500/20">
                  <div className="text-[11px] text-emerald-400 flex items-center justify-between">
                    <span>Saved vs GPT-4o</span>
                    <TrendingDown className="h-3 w-3 text-emerald-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {telemetry.tokenAndCostAnalytics.savingsFormatted || "$0.00000"}
                  </div>
                  <div className="text-[10px] text-emerald-500/80 mt-0.5">Open-source & local efficiency</div>
                </div>
              </div>

              {/* Recent Live Token Events Stream */}
              {telemetry.tokenAndCostAnalytics.realtimeMetrics?.cumulative?.recentQueries?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-slate-400" /> Recent Real-Time Query Ledger
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/40">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="bg-white/[0.02] text-slate-400 border-b border-white/5">
                        <tr>
                          <th className="py-2 px-3 font-normal">Timestamp</th>
                          <th className="py-2 px-3 font-normal">Model</th>
                          <th className="py-2 px-3 font-normal">Provider</th>
                          <th className="py-2 px-3 font-normal text-right">Prompt</th>
                          <th className="py-2 px-3 font-normal text-right">Completion</th>
                          <th className="py-2 px-3 font-normal text-right">Total Tok</th>
                          <th className="py-2 px-3 font-normal text-right">Cost</th>
                          <th className="py-2 px-3 font-normal text-right">Saved</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {telemetry.tokenAndCostAnalytics.realtimeMetrics.cumulative.recentQueries
                          .slice(-6)
                          .reverse()
                          .map((q: any, idx: number) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-2 px-3 text-slate-500">
                                {new Date(q.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="py-2 px-3 text-white font-medium">{q.model || "Mistral-7B"}</td>
                              <td className="py-2 px-3">
                                <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 text-[10px]">
                                  {q.provider || "local"}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right text-cyan-400">
                                {(q.promptTokens || 0).toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-right text-teal-400">
                                {(q.completionTokens || 0).toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-right text-white font-bold">
                                {(q.totalTokens || 0).toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-right text-emerald-400 font-bold">
                                {q.costFormatted || "$0.00000"}
                              </td>
                              <td className="py-2 px-3 text-right text-emerald-400/80">
                                {q.savingsUSD ? `+$${q.savingsUSD.toFixed(5)}` : "—"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Infrastructure Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white/[0.02] border border-white/8 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-teal-400" /> Data Storage & Graphs
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-xs text-slate-300 font-medium">MongoDB Cluster</div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                    {telemetry.databases?.mongodb}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-xs text-slate-300 font-medium">Clinical Knowledge Graph</div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                    Operational (Seeded)
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-xs text-slate-300 font-medium">Vector Store Embeddings</div>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[11px]">
                    Local 384d Cosine
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/8 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" /> Host System Environment
              </h3>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span>Runtime:</span>
                  <span className="font-mono text-slate-200">{telemetry.system?.nodeVersion} ({telemetry.system?.platform})</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span>CPU Cores:</span>
                  <span className="font-mono text-slate-200">{telemetry.system?.cpuCores} Cores Available</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span>Total System Memory:</span>
                  <span className="font-mono text-slate-200">{telemetry.system?.totalMemMB} MB</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Free Host Memory:</span>
                  <span className="font-mono text-slate-200">{telemetry.system?.freeMemMB} MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
