import { Gauge, Clock, Zap, ShieldCheck } from "lucide-react";
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

  // Find genuine groundedness or confidence score from verified steps
  const citationAgent = steps.find(s => s.agent === "Citation Verification Agent" || s.agent === "Evidence Agent");
  const claimsGrounded = citationAgent?.metadata?.claimsGroundedRate as number | undefined;
  const citationPrecision = citationAgent?.metadata?.citationPrecision as number | undefined;
  const avgConfidence = citationAgent?.metadata?.avgConfidence as number | undefined;

  const displayScore = claimsGrounded !== undefined
    ? Math.round(claimsGrounded * 100)
    : citationPrecision !== undefined
      ? Math.round(citationPrecision * 100)
      : typeof avgConfidence === "number"
        ? Math.round(avgConfidence <= 1 ? avgConfidence * 100 : avgConfidence)
        : null;

  // Use actual executed steps or fallback to canonical stages if initializing
  const displaySteps = steps && steps.length > 0 ? steps : [
    { agent: "Research Planner", status: "completed", durationMs: 90 },
    { agent: "Literature Search Agent", status: "completed", durationMs: 12000 },
    { agent: "Research Synthesis Agent", status: "completed", durationMs: 8500 }
  ];

  return (
    <div className="rounded-2xl border border-white/8 bg-black/40 p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-white/8 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-cyan-400" />
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Multi-Agent Stage Performance & Telemetry
          </h4>
        </div>
        
        {displayScore !== null && (
          <div className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-emerald-400">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>Evidence Groundedness: </span>
            <span className="font-bold text-emerald-400 font-mono">{displayScore}%</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {displaySteps.map((step, idx) => {
          const speed = getAgentSpeed(step.durationMs);

          const statusConfig = {
            completed: { label: "Completed", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            running: { label: "Active Live", text: "text-blue-400 animate-pulse font-semibold", bg: "bg-blue-500/10 border-blue-500/30" },
            failed: { label: "Failed", text: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
            pending: { label: "Pending", text: "text-slate-500", bg: "bg-white/5 border-white/5" }
          }[step.status as "completed" | "running" | "failed" | "pending"] || { label: "Idle", text: "text-slate-500", bg: "bg-white/5 border-white/5" };

          return (
            <div 
              key={step.agent || idx}
              className={`p-3 rounded-xl border transition-all duration-300 space-y-2 flex flex-col justify-between ${
                step.status === "running" 
                  ? "border-blue-500/40 bg-blue-950/20 shadow-md shadow-blue-500/5" 
                  : step.status === "completed"
                    ? "border-white/10 bg-black/60 hover:border-white/20"
                    : "border-white/5 bg-black/30 opacity-60"
              }`}
            >
              <div className="flex justify-between items-start gap-1">
                <span className="text-[10px] font-medium text-white truncate flex items-center gap-1.5" title={step.agent}>
                  {step.status === "running" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                  )}
                  {step.agent}
                </span>
                <span className={`text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                  step.status === "completed" ? `${speed.bg} ${speed.color}` : statusConfig.bg + " " + statusConfig.text
                }`}>
                  {step.status === "completed" ? speed.label : statusConfig.label}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-1 pt-0.5">
                <div className="flex items-center gap-1 text-xs text-slate-300 font-mono">
                  <Clock className="h-3 w-3 text-slate-400" />
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
