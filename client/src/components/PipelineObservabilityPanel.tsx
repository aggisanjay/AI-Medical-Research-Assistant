import React from "react";
import { Gauge, Clock, Zap, AlertCircle, Play } from "lucide-react";
import type { WorkflowStep } from "@/lib/api";

interface Props {
  steps: WorkflowStep[];
}

export function PipelineObservabilityPanel({ steps }: Props) {
  const getAgentSpeed = (durationMs: number): { label: "Fast" | "Moderate" | "Slow"; color: string; bg: string } => {
    if (!durationMs || durationMs === 0) return { label: "Fast", color: "text-slate-400", bg: "bg-slate-800" };
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
    <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4 space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-display">
            System Performance Diagnostics
          </h4>
        </div>
        
        {typeof avgConfidence === "number" && (
          <div className="flex items-center gap-1.5 text-[10px] bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded text-slate-400">
            <Gauge className="h-3.5 w-3.5 text-amber-400" />
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

          // Status custom badges
          const statusConfig = {
            completed: { label: "Completed", text: "text-emerald-400" },
            running: { label: "Processing", text: "text-cyan-450 animate-pulse" },
            failed: { label: "Failed", text: "text-rose-400" },
            pending: { label: "Pending", text: "text-slate-500" }
          }[step.status as "completed" | "running" | "failed" | "pending"] || { label: "Idle", text: "text-slate-500" };

          return (
            <div 
              key={agentName}
              className="p-3 rounded-lg border border-slate-900 bg-slate-900/20 space-y-2.5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start gap-1">
                <span className="text-[10px] font-semibold text-slate-200 truncate">{agentName}</span>
                {step.status === "completed" && (
                  <span className={`text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.2 rounded border ${speed.bg} ${speed.color}`}>
                    {speed.label}
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between gap-1 pt-1">
                <div className="flex items-center gap-1 text-xs text-slate-350 font-mono">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  {formatDuration(step.durationMs)}
                </div>
                
                <span className={`text-[9px] font-semibold ${statusConfig.text}`}>
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
