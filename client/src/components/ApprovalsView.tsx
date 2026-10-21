import { useState, useEffect } from "react";
import { 
  ShieldCheck, AlertTriangle, Check, X, Clock, Play, 
  RefreshCw, FileText, Lock, ChevronDown, ChevronUp
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function ApprovalsView() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.getApprovals(statusFilter === "all" ? undefined : statusFilter);
      setApprovals(res.data || []);
    } catch (err: any) {
      toast.error(`Failed to load approvals: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter]);

  const handleDecide = async (approvalId: string, decision: "approved" | "rejected") => {
    try {
      setActionInProgress(approvalId);
      await api.decideApproval(approvalId, decision, decision === "rejected" ? rejectionReason : undefined);
      toast.success(`Request marked as ${decision}`);
      setRejectionModalId(null);
      setRejectionReason("");
      fetchApprovals();
    } catch (err: any) {
      toast.error(`Decision error: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleExecute = async (approvalId: string) => {
    try {
      setActionInProgress(approvalId);
      const res = await api.executeApproval(approvalId);
      toast.success("Action executed successfully with tamper verification passed");
      fetchApprovals();
    } catch (err: any) {
      toast.error(`Execution failed: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-medium flex items-center gap-1"><Clock className="h-3 w-3" /> Pending Review</span>;
      case "approved":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium flex items-center gap-1"><Check className="h-3 w-3" /> Approved</span>;
      case "executed":
        return <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-medium flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Executed</span>;
      case "rejected":
        return <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-medium flex items-center gap-1"><X className="h-3 w-3" /> Rejected</span>;
      case "expired":
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-400 text-[11px] font-medium">Expired</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Lock className="h-4 w-4" /> Governance & Policy Engine
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mt-1">Human Approval Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Revalidation before execution with tamper-detection, cryptographic payload hashing, and workflow resumption.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="executed">Executed</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={fetchApprovals}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-slate-300 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-3">
        {approvals.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-2xl text-center">
            <ShieldCheck className="h-8 w-8 text-slate-600 mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">No approvals found</h3>
            <p className="text-xs text-slate-500 mt-1">All sensitive operations are in policy compliance.</p>
          </div>
        ) : (
          approvals.map((appr) => {
            const isExpanded = expandedId === appr.approvalId;
            return (
              <div
                key={appr.approvalId}
                className="rounded-xl bg-white/[0.02] border border-white/8 overflow-hidden transition-all duration-200"
              >
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-white">{appr.title}</span>
                      {getStatusBadge(appr.status)}
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {appr.riskLevel} Risk
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>Action: <strong className="text-slate-300">{appr.actionType}</strong></span>
                      <span>Requester: <strong className="text-slate-300">{appr.requestedByName || appr.requestedBy}</strong></span>
                      <span>Requested: {new Date(appr.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : appr.approvalId)}
                      className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-slate-300 flex items-center gap-1 transition-all"
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      Inspect Payload
                    </button>

                    {appr.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleDecide(appr.approvalId, "approved")}
                          disabled={actionInProgress === appr.approvalId}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center gap-1 transition-all"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => setRejectionModalId(appr.approvalId)}
                          disabled={actionInProgress === appr.approvalId}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs flex items-center gap-1 transition-all"
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </button>
                      </>
                    )}

                    {appr.status === "approved" && (
                      <button
                        onClick={() => handleExecute(appr.approvalId)}
                        disabled={actionInProgress === appr.approvalId}
                        className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-semibold text-xs flex items-center gap-1 transition-all shadow-md"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" /> Execute Action
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Payload and Cryptographic Details */}
                {isExpanded && (
                  <div className="border-t border-white/8 bg-black/40 p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="font-semibold text-slate-400 mb-1">Payload Content:</div>
                        <pre className="rounded-lg bg-black/80 border border-white/10 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48">
                          {JSON.stringify(appr.payload, null, 2)}
                        </pre>
                      </div>
                      <div className="space-y-2 text-[11px] text-slate-400">
                        <div>
                          <strong className="text-slate-300">Payload Hash (SHA-256):</strong>
                          <div className="font-mono text-teal-400 break-all bg-black/60 p-2 rounded border border-white/5 mt-0.5">
                            {appr.payloadHash}
                          </div>
                        </div>
                        <div>
                          <strong className="text-slate-300">Idempotency Key:</strong>
                          <div className="font-mono text-slate-400 mt-0.5">{appr.idempotencyKey}</div>
                        </div>
                        {appr.reviewedBy && (
                          <div>
                            <strong className="text-slate-300">Reviewed By:</strong> {appr.reviewedByName || appr.reviewedBy} at {new Date(appr.reviewedAt).toLocaleString()}
                          </div>
                        )}
                        {appr.rejectionReason && (
                          <div className="text-rose-400">
                            <strong>Rejection Reason:</strong> {appr.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Modal Input */}
                {rejectionModalId === appr.approvalId && (
                  <div className="border-t border-white/8 bg-rose-500/[0.04] p-4 flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Enter specific clinical or security reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="flex-1 rounded-lg bg-black/60 border border-rose-500/30 px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleDecide(appr.approvalId, "rejected")}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-500 text-white font-semibold text-xs"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => setRejectionModalId(null)}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
