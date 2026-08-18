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
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
    case "running":
      return <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />;
    case "failed":
      return <XCircle className="h-3.5 w-3.5 text-red-400" />;
    default:
      return <Circle className="h-3.5 w-3.5 text-slate-600" />;
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
          <span className="text-slate-500 capitalize font-normal">
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
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10">
          <Bot className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <h3 className="text-xs font-serif font-bold text-white">Agent Workflow</h3>
          <p className="text-[10px] text-slate-500 font-normal">
            {isLoading
              ? "Agents processing your query…"
              : `${completedCount}/${displaySteps.length} agents completed`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {totalDuration > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-black/60 px-2.5 py-0.5 rounded-full border border-white/8">
            <Clock className="h-3 w-3" />
            {formatDuration(totalDuration)}
          </span>
        )}
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
    <div className="mt-4 space-y-4">
      <PipelineObservabilityPanel steps={displaySteps} />
      <div className="space-y-0">
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
                  "absolute left-[15px] top-8 w-px h-[calc(100%-8px)]",
                  step.status === "completed" ? "bg-white/20" : "bg-white/8"
                )}
              />
            )}

            <div
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                config.bg,
                config.border,
                step.status === "running" && "animate-pulse"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", config.color)} />
            </div>

            <div
              className={cn(
                "flex-1 pb-4 min-w-0 rounded-2xl border px-3.5 py-2.5 transition-all",
                step.status === "running"
                  ? "border-white/20 bg-white/5"
                  : step.status === "completed"
                    ? "border-white/8 bg-black/40"
                    : step.status === "failed"
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-white/8 bg-black/20 opacity-50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusIcon status={step.status} />
                  <span className="text-xs font-medium text-white truncate">
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
                <p className="mt-1 text-[10px] text-slate-500 font-normal leading-relaxed">
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
