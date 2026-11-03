import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Bot, CheckCircle2, ChevronDown, Circle, Compass, FileSpreadsheet, FileText, Filter, Globe, Layers, Loader2, Scale, ShieldCheck, Sparkles, Award, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowStep } from "@/lib/api";

type Cfg = { icon: LucideIcon; color: string; desc: string };

// The nine agents the server actually runs, in order (server/services/multiAgentWorkflow.js)
export const PIPELINE: { name: string; cfg: Cfg }[] = [
  { name: "Research Planner", cfg: { icon: Compass, color: "#a78bfa", desc: "Plans the run and expands your question into search variants" } },
  { name: "Literature Search Agent", cfg: { icon: Globe, color: "#38bdf8", desc: "Queries PubMed, OpenAlex and ClinicalTrials.gov, then ranks results" } },
  { name: "Document Retrieval Agent", cfg: { icon: Layers, color: "#38bdf8", desc: "Finds relevant passages in documents you uploaded" } },
  { name: "Study Extraction Agent", cfg: { icon: Filter, color: "#fbbf24", desc: "Extracts study design and PICO fields from each source" } },
  { name: "Evidence Comparison Agent", cfg: { icon: Scale, color: "#fbbf24", desc: "Compares the extracted studies side by side" } },
  { name: "Research Synthesis Agent", cfg: { icon: Sparkles, color: "#a78bfa", desc: "Drafts the answer from the retrieved evidence" } },
  { name: "Citation Verification Agent", cfg: { icon: ShieldCheck, color: "#34d399", desc: "Checks every PMID, trial ID and citation against retrieved sources" } },
  { name: "Report Generation Agent", cfg: { icon: FileSpreadsheet, color: "#34d399", desc: "Assembles the structured report" } },
  { name: "Quality Evaluation Agent", cfg: { icon: Award, color: "#34d399", desc: "Reviews the finished report before it is returned" } },
];
const LEGACY: Record<string, Cfg> = {
  "Research Agent": { icon: Globe, color: "#38bdf8", desc: "Multi-source retrieval" },
  "Evidence Agent": { icon: BarChart3, color: "#34d399", desc: "Ranking and validation" },
  "Summary Agent": { icon: FileText, color: "#a78bfa", desc: "Synthesis and citations" },
};
const cfgFor = (agent: string): Cfg => PIPELINE.find((p) => p.name === agent)?.cfg ?? LEGACY[agent] ?? { icon: Bot, color: "#94a3b8", desc: "" };

const fmt = (ms: number) => (!ms ? "0 ms" : ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`);

// Rough pace of a typical run, in seconds. Only used to animate the live view.
const START_AT = [0, 1.5, 6, 7.5, 9, 10.5];

function LiveRun() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => setT((Date.now() - t0) / 1000), 200);
    return () => clearInterval(id);
  }, []);
  // The run can only be estimated up to synthesis; later agents wait for the server.
  let active = 0;
  START_AT.forEach((s, i) => {
    if (t >= s) active = i;
  });
  const pct = Math.min(95, (t / 14) * 100);

  return (
    <div className="rounded-xl border border-sky-300/25 bg-sky-300/[0.04] p-4 sm:p-4.5" role="status" aria-live="polite" aria-label="Research pipeline running">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative grid h-8.5 w-8.5 place-items-center rounded-lg bg-sky-300/15 text-sky-200">
            <Bot className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full bg-sky-300" />
          </span>
          <div>
            <h3 className="text-[14.5px] font-medium text-white">Running the research pipeline</h3>
            <p className="text-[12px] text-white/55">Searching registries, reading evidence and verifying citations</p>
          </div>
        </div>
        <span className="rounded-full border border-white/12 bg-black/30 px-3 py-1 font-mono text-[12px] tabular-nums text-white/85">{t.toFixed(1)} s</span>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/8">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-300 via-violet-300 to-emerald-300" animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
      </div>

      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PIPELINE.map((p, i) => {
          const done = i < active;
          const run = i === active;
          const Icon = p.cfg.icon;
          return (
            <li key={p.name} className={cn("flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-all duration-500", run ? "border-white/25 bg-white/[0.07]" : done ? "border-white/10 bg-white/[0.03]" : "border-white/8 opacity-55")}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md" style={{ background: p.cfg.color + (run || done ? "22" : "10"), color: p.cfg.color }}>
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : run ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
              </span>
              <span className="min-w-0 text-[12.5px] leading-tight text-white/85">{p.name.replace(" Agent", "")}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-[11.5px] text-white/40">Progress shown here is an estimate. Exact per-agent timings appear when the run finishes.</p>
    </div>
  );
}

function Meta({ metadata }: { metadata: Record<string, unknown> }) {
  const entries = Object.entries(metadata).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!entries.length) return null;
  return (
    <dl className="mt-3 grid gap-x-6 gap-y-2 rounded-xl border border-white/8 bg-black/30 p-3 sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-[11px] capitalize text-white/40">{k.replace(/([A-Z])/g, " $1").trim()}</dt>
          <dd className="truncate font-mono text-[12px] text-white/85">{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

interface Props {
  steps: WorkflowStep[];
  isLoading?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export function AgentWorkflowPanel({ steps, isLoading = false, collapsible = false, defaultExpanded = true, className }: Props) {
  const [open, setOpen] = useState(defaultExpanded);
  const [detail, setDetail] = useState<string | null>(null);

  if (isLoading) return <div className={className}><LiveRun /></div>;
  if (!steps.length) return null;

  const total = steps.reduce((a, s) => a + (s.durationMs || 0), 0);
  const maxMs = Math.max(1, ...steps.map((s) => s.durationMs || 0));
  const ok = steps.filter((s) => s.status === "completed").length;
  const failed = steps.some((s) => s.status === "failed");
  const cite = steps.find((s) => s.agent === "Citation Verification Agent");
  const q = [
    ["Claims grounded", cite?.metadata?.claimsGroundedRate],
    ["Citation precision", cite?.metadata?.citationPrecision],
    ["Average confidence", cite?.metadata?.avgConfidence],
  ].filter(([, v]) => typeof v === "number") as [string, number][];
  const pctOf = (v: number) => `${Math.round(v <= 1 ? v * 100 : v)}%`;

  return (
    <div className={cn("rounded-xl border border-white/10 bg-white/[0.03]", className)}>
      <button type="button" disabled={!collapsible} onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-4.5 text-left">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className={cn("grid h-7.5 w-7.5 place-items-center rounded-lg", failed ? "bg-red-400/15 text-red-300" : "bg-emerald-400/15 text-emerald-300")}>{failed ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</span>
          <span className="min-w-0">
            <span className="block text-[13.5px] font-medium text-white">Pipeline run</span>
            <span className="block text-[12px] text-white/50">
              {ok} of {steps.length} agents completed in {fmt(total)}
            </span>
          </span>
        </span>
        {collapsible && <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-white/50 transition-transform", open && "rotate-180")} />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="space-y-4 border-t border-white/8 px-5 pb-5 pt-4">
              {q.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {q.map(([l, v]) => (
                    <div key={l} className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.05] px-4 py-3">
                      <div className="text-[12.5px] text-emerald-100/60">{l}</div>
                      <div className="mt-0.5 text-[22px] font-light text-emerald-200">{pctOf(v)}</div>
                    </div>
                  ))}
                </div>
              )}
              <ol className="space-y-1.5">
                {steps.map((s, i) => {
                  const c = cfgFor(s.agent);
                  const Icon = c.icon;
                  const isOpen = detail === s.agent;
                  const hasMeta = s.metadata && Object.keys(s.metadata).length > 0;
                  return (
                    <li key={s.agent + i}>
                      <button type="button" onClick={() => hasMeta && setDetail(isOpen ? null : s.agent)} className={cn("flex w-full items-center gap-3.5 rounded-xl px-2 py-2 text-left transition-colors", hasMeta && "hover:bg-white/[0.04]")}>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: c.color + "1c", color: c.color }}>
                          {s.status === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : s.status === "failed" ? <XCircle className="h-4 w-4" /> : s.status === "pending" ? <Circle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="truncate text-[14px] text-white/90">{s.agent}</span>
                            <span className="shrink-0 font-mono text-[12.5px] tabular-nums text-white/55">{fmt(s.durationMs)}</span>
                          </span>
                          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/8">
                            <motion.span className="block h-full rounded-full" style={{ background: c.color }} initial={{ width: 0 }} animate={{ width: `${Math.max(3, ((s.durationMs || 0) / maxMs) * 100)}%` }} transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }} />
                          </span>
                        </span>
                        {hasMeta && <ChevronDown className={cn("h-4 w-4 shrink-0 text-white/35 transition-transform", isOpen && "rotate-180")} />}
                      </button>
                      {isOpen && s.metadata && <div className="pl-[3.1rem] pr-2 pb-2"><Meta metadata={s.metadata} /></div>}
                    </li>
                  );
                })}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
