import { useState, useEffect } from "react";
import { 
  ShieldCheck, AlertCircle, RefreshCw, KeyRound, 
  Terminal, ShieldAlert, CheckCircle2, Filter
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function AuditView() {
  const [events, setEvents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [verifying, setVerifying] = useState(false);
  const [chainStatus, setChainStatus] = useState<any | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs({
        eventType: eventTypeFilter === "all" ? undefined : eventTypeFilter,
        limit: 50
      });
      setEvents(res.events || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      toast.error(`Failed to load audit logs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    try {
      setVerifying(true);
      const res = await api.verifyAuditIntegrity();
      setChainStatus(res);
      if (res.valid) {
        toast.success(`Cryptographic Chain Verified: ${res.checkedCount} events intact with zero tampering detected.`);
      } else {
        toast.error(`Tamper Alert! Integrity compromised at event ${res.compromisedAtEventId}`);
      }
    } catch (err: any) {
      toast.error(`Verification error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [eventTypeFilter]);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">Critical</span>;
      case "error":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/30">Error</span>;
      case "warning":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">Warning</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-slate-800 text-slate-400 border border-white/10">Info</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
            <KeyRound className="h-4 w-4" /> Cryptographic Integrity Engine
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mt-1">Audit Trail & Chain Explorer</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident append-only ledger tracking all authentication, agent execution, MCP tools, and model deployments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-semibold text-xs transition-all shadow-md"
          >
            <ShieldCheck className={`h-4 w-4 ${verifying ? "animate-spin" : ""}`} />
            Verify Hash Chain
          </button>
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-slate-300 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {chainStatus && (
        <div className={`rounded-xl border p-4 flex items-center justify-between ${
          chainStatus.valid
            ? "bg-emerald-500/[0.06] border-emerald-500/30 text-emerald-300"
            : "bg-rose-500/[0.08] border-rose-500/40 text-rose-300"
        }`}>
          <div className="flex items-center gap-3">
            {chainStatus.valid ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400" />
            )}
            <div>
              <div className="text-sm font-semibold">
                {chainStatus.valid ? "Cryptographic Chain Verified Valid" : "Tamper Alert: Inconsistency Detected"}
              </div>
              <div className="text-xs opacity-80">
                {chainStatus.valid
                  ? `${chainStatus.checkedCount} consecutive block hashes verified with zero collisions or modifications.`
                  : `Discrepancy located at block ${chainStatus.compromisedAtEventId}`}
              </div>
            </div>
          </div>
          <span className="text-xs font-mono opacity-60">Algorithm: SHA-256</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter Type:</span>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Events ({total})</option>
            <option value="agent_execution">Agent Execution</option>
            <option value="tool_invocation">MCP Tool Invocation</option>
            <option value="policy_decision">Policy Decision</option>
            <option value="approval_request">Approval Request</option>
            <option value="approval_decision">Approval Decision</option>
            <option value="model_training">Model Training</option>
            <option value="model_deployment">Model Deployment</option>
          </select>
        </div>
        <span>Showing latest {events.length} records</span>
      </div>

      {/* Events Stream Table */}
      <div className="rounded-xl bg-white/[0.02] border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/60 border-b border-white/8 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Action & Resource</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.eventId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200 font-mono">
                      {ev.eventType}
                    </td>
                    <td className="py-3 px-4">
                      {getSeverityBadge(ev.severity)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div><strong className="text-white">{ev.action}</strong></div>
                      <div className="text-[11px] text-slate-500">{ev.resourceType}: {ev.resourceId || "global"}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {ev.actorId}
                    </td>
                    <td className="py-3 px-4 text-teal-400/80 font-mono text-[11px] truncate max-w-xs" title={ev.eventHash}>
                      {ev.eventHash?.substring(0, 16)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
