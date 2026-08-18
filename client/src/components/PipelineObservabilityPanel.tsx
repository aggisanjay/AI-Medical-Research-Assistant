import { Gauge, Clock, Zap } from "lucide-react";
import type { WorkflowStep } from "@/lib/api";

interface Props {
  steps: WorkflowStep[];
}

export function PipelineObservabilityPanel({ steps }: Props) {
  const getAgentSpeed = (durationMs: number): { label: "Fast" | "Moderate" | "Slow"; color: string; bg: string } => {
    if (!durationMs || durationMs === 0) return { label: "Fast", color: "text-slate-400", bg: "bg-white/5 border-white/10" };
    if (durationMs < 1200) {
      return { label: "Fast", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
    } else if (durationMs <= 4000) {
      return { label: "Moderate", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
    } else {
      return { label: "Slow", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" };
    }
  };

  const formatDuration = (ms: number): string => {
    if (!ms) return "0ms";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Find confidence score if present in Evidence Agent metadata
  const evidenceAgent = steps.find(s => s.agent === "Evidence Agent");
  const avgConfidence = evidenceAgent?.metadata?.avgConfidence as number | undefined;

  return (
    <div className="rounded-2xl border border-white/8 bg-black/40 p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-white/8 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-white" />
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            System Performance Diagnostics
          </h4>
        </div>
        
        {typeof avgConfidence === "number" && (
          <div className="flex items-center gap-1.5 text-[10px] bg-[#0a0a0a] border border-white/8 px-2.5 py-0.5 rounded-full text-slate-400">
            <Gauge className="h-3 w-3 text-white" />
            <span>Confidence Index: </span>
            <span className="font-bold text-white font-mono">{avgConfidence.toFixed(1)}/10</span>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {["Research Agent", "Evidence Agent", "Summary Agent"].map(agentName => {
          const step = steps.find(s => s.agent === agentName) || {
            agent: agentName,
            status: "pending",
            durationMs: 0
          };

          const speed = getAgentSpeed(step.durationMs);

          const statusConfig = {
            completed: { label: "Completed", text: "text-emerald-400" },
            running: { label: "Processing", text: "text-white animate-pulse" },
            failed: { label: "Failed", text: "text-rose-400" },
            pending: { label: "Pending", text: "text-slate-500" }
          }[step.status as "completed" | "running" | "failed" | "pending"] || { label: "Idle", text: "text-slate-500" };

          return (
            <div 
              key={agentName}
              className="p-3 rounded-xl border border-white/8 bg-black/60 space-y-2.5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start gap-1">
                <span className="text-[10px] font-medium text-white truncate">{agentName}</span>
                {step.status === "completed" && (
                  <span className={`text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.2 rounded-full border ${speed.bg} ${speed.color}`}>
                    {speed.label}
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between gap-1 pt-1">
                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                  <Clock className="h-3 w-3 text-slate-500" />
                  {formatDuration(step.durationMs)}
                </div>
                
                <span className={`text-[9px] font-medium ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
