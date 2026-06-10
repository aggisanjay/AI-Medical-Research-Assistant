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
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    description: "Context resolution, query expansion, literature retrieval & document RAG",
  },
  "Evidence Agent": {
    icon: BarChart3,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/25",
    description: "Ranking, confidence scoring & source validation",
  },
  "Summary Agent": {
    icon: FileText,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
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
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case "running":
      return <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-400" />;
    default:
      return <Circle className="h-4 w-4 text-slate-600" />;
  }
}

function MetadataGrid({ metadata }: { metadata: Record<string, unknown> }) {
  const entries = Object.entries(metadata).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  );
  if (entries.length === 0) return null;

  return (
    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <span className="text-slate-500 capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </span>
          <span className="text-slate-300 font-mono truncate">
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
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/25">
          <Bot className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-white font-display">Agent Workflow</h3>
          <p className="text-[10px] text-slate-500 font-light">
            {isLoading
              ? "Agents processing your query…"
              : `${completedCount}/${displaySteps.length} agents completed`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {totalDuration > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
            <Clock className="h-3 w-3" />
            {formatDuration(totalDuration)}
          </span>
        )}
        {collapsible && (
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-500 transition-transform",
              expanded && "rotate-180"
            )}
          />
        )}
      </div>
    </div>
  );

  const body = (
    <div className="mt-4 space-y-4">
      <PipelineObservabilityPanel steps={displaySteps} />
      <div className="space-y-0">
        {displaySteps.map((step, index) => {
        const config = AGENT_CONFIG[step.agent] || {
          icon: Bot,
          color: "text-slate-400",
          bg: "bg-slate-500/10",
          border: "border-slate-500/25",
          description: "",
        };
        const Icon = config.icon;
        const isLast = index === displaySteps.length - 1;

        return (
          <div key={step.agent} className="relative flex gap-3">
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[15px] top-8 w-px h-[calc(100%-8px)]",
                  step.status === "completed" ? "bg-emerald-500/30" : "bg-slate-800"
                )}
              />
            )}

            <div
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                config.bg,
                config.border,
                step.status === "running" && "animate-pulse"
              )}
            >
              <Icon className={cn("h-4 w-4", config.color)} />
            </div>

            <div
              className={cn(
                "flex-1 pb-4 min-w-0 rounded-xl border px-3.5 py-2.5 transition-all",
                step.status === "running"
                  ? "border-cyan-500/30 bg-cyan-500/5"
                  : step.status === "completed"
                    ? "border-white/5 bg-slate-900/40"
                    : step.status === "failed"
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-white/5 bg-slate-950/40 opacity-60"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusIcon status={step.status} />
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {step.agent}
                  </span>
                </div>
                {step.durationMs > 0 && (
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {formatDuration(step.durationMs)}
                  </span>
                )}
              </div>

              {config.description && (
                <p className="mt-1 text-[10px] text-slate-500 font-light leading-relaxed">
                  {config.description}
                </p>
              )}

              {step.metadata && Object.keys(step.metadata).length > 0 && expanded && (
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
        "rounded-2xl border border-white/5 bg-slate-950/60 backdrop-blur-md p-4 shadow-xl",
        isLoading && "border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.08)]",
        className
      )}
    >
      {collapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="w-full text-left"
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
