import { useState } from "react";
import {
  Search,
  BarChart3,
  FileText,
  CheckCircle2,
  Loader2,
  Circle,
  XCircle,
  ChevronDown,
  Clock,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowStep } from "@/lib/api";
import { PipelineObservabilityPanel } from "./PipelineObservabilityPanel";

const AGENT_CONFIG: Record<
  string,
  { icon: typeof Search; color: string; bg: string; border: string; description: string }
> = {
  "Research Agent": {
    icon: Search,
    color: "text-white",
    bg: "bg-white/5",
    border: "border-white/10",
    description: "Context resolution, query expansion, literature retrieval & document RAG",
  },
  "Evidence Agent": {
    icon: BarChart3,
    color: "text-white",
    bg: "bg-white/5",
    border: "border-white/10",
    description: "Ranking, confidence scoring & source validation",
  },
  "Summary Agent": {
    icon: FileText,
    color: "text-white",
    bg: "bg-white/5",
    border: "border-white/10",
    description: "LLM synthesis, citation generation & executive summary",
  },
};

function formatDuration(ms: number): string {
  if (!ms || ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function StatusIcon({ status }: { status: WorkflowStep["status"] }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
    case "running":
      return <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin shrink-0" />;
    case "failed":
      return <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />;
    default:
      return <Circle className="h-3.5 w-3.5 text-slate-600 shrink-0" />;
  }
}

function MetadataGrid({ metadata }: { metadata: Record<string, unknown> }) {
  const entries = Object.entries(metadata).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  );
  if (entries.length === 0) return null;

  return (
    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] bg-black/40 border border-white/5 rounded-xl p-2.5">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col min-w-0">
          <span className="text-slate-500 capitalize font-normal text-[9px]">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </span>
          <span className="text-slate-200 font-mono truncate text-[10px]">
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface AgentWorkflowPanelProps {
  steps: WorkflowStep[];
  isLoading?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export function AgentWorkflowPanel({
  steps,
  isLoading = false,
  collapsible = false,
  defaultExpanded = true,
  className,
}: AgentWorkflowPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const displaySteps =
    steps.length > 0
      ? steps
      : isLoading
        ? ([
            { agent: "Research Agent", status: "running" as const, durationMs: 0 },
            { agent: "Evidence Agent", status: "pending" as const, durationMs: 0 },
            { agent: "Summary Agent", status: "pending" as const, durationMs: 0 },
          ] as WorkflowStep[])
        : [];

  if (displaySteps.length === 0) return null;

  const totalDuration = displaySteps.reduce((sum, s) => sum + (s.durationMs || 0), 0);
  const completedCount = displaySteps.filter((s) => s.status === "completed").length;

  const header = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border shrink-0",
          isLoading ? "bg-blue-500/10 border-blue-500/30" : "bg-white/5 border-white/10"
        )}>
          <Bot className={cn("h-3.5 w-3.5", isLoading ? "text-blue-400" : "text-white")} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-serif font-bold text-white">Agent Workflow</h3>
            {isLoading && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                LIVE PIPELINE
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-normal truncate">
            {isLoading
              ? "Multi-agent federated search & reasoning in progress…"
              : `${completedCount}/${displaySteps.length} agents completed`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn(
          "flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full border",
          isLoading
            ? "text-blue-300 bg-blue-950/40 border-blue-500/30"
            : "text-slate-400 bg-black/60 border-white/8"
        )}>
          <Clock className="h-3 w-3 text-slate-400" />
          {formatDuration(totalDuration)}
        </span>
        {collapsible && (
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-slate-500 transition-transform",
              expanded && "rotate-180"
            )}
          />
        )}
      </div>
    </div>
  );

  const body = (
    <div className="mt-3.5 space-y-3.5">
      <PipelineObservabilityPanel steps={displaySteps} />
      <div className="space-y-2">
        {displaySteps.map((step, index) => {
        const config = AGENT_CONFIG[step.agent] || {
          icon: Bot,
          color: "text-slate-400",
          bg: "bg-white/5",
          border: "border-white/10",
          description: "",
        };
        const Icon = config.icon;
        const isLast = index === displaySteps.length - 1;

        return (
          <div key={step.agent} className="relative flex gap-3">
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[13px] top-8 w-px h-[calc(100%-4px)]",
                  step.status === "completed" ? "bg-emerald-500/30" : step.status === "running" ? "bg-blue-500/30" : "bg-white/8"
                )}
              />
            )}

            <div
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                step.status === "running" 
                  ? "border-blue-500/50 bg-blue-950/40 shadow-sm shadow-blue-500/20" 
                  : step.status === "completed"
                    ? "border-emerald-500/30 bg-emerald-950/20"
                    : cn(config.bg, config.border)
              )}
            >
              <Icon className={cn(
                "h-3.5 w-3.5",
                step.status === "running" ? "text-blue-400 animate-pulse" : step.status === "completed" ? "text-emerald-400" : config.color
              )} />
            </div>

            <div
              className={cn(
                "flex-1 min-w-0 rounded-2xl border px-3.5 py-2.5 transition-all duration-300",
                step.status === "running"
                  ? "border-blue-500/40 bg-blue-950/20 shadow-md shadow-blue-500/5"
                  : step.status === "completed"
                    ? "border-white/8 bg-black/40"
                    : step.status === "failed"
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-white/5 bg-black/20 opacity-50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusIcon status={step.status} />
                  <span className="text-xs font-medium text-white truncate">
                    {step.agent}
                  </span>
                  {step.status === "running" && (
                    <span className="text-[9px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {step.metadata?.tokens ? (
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      {Number(step.metadata.tokens).toLocaleString()} tok
                    </span>
                  ) : null}
                  {step.durationMs > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDuration(step.durationMs)}
                    </span>
                  )}
                </div>
              </div>

              {config.description && (
                <p className="mt-1 text-[10px] text-slate-400 font-normal leading-relaxed">
                  {config.description}
                </p>
              )}

              {step.metadata && Object.keys(step.metadata).length > 0 && (expanded || step.status === "running") && (
                <MetadataGrid metadata={step.metadata} />
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "editorial-card border border-white/8 p-4",
        className
      )}
    >
      {collapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="w-full text-left cursor-pointer"
        >
          {header}
        </button>
      ) : (
        header
      )}
      {(!collapsible || expanded) && body}
    </div>
  );
}
