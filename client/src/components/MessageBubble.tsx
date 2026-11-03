import { useId, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, Check, Coins, Copy, FileText, FlaskConical, MapPin, Sparkles, User } from "lucide-react";
import type { ChatMessage } from "@/lib/api";
import { PublicationCard } from "./PublicationCard";
import { ClinicalTrialCard } from "./ClinicalTrialCard";
import { AgentWorkflowPanel } from "./AgentWorkflowPanel";
import { ExecutiveSummaryCard } from "./ExecutiveSummaryCard";
import { Btn, Chip, Panel } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

interface Props {
  message: ChatMessage;
  onSuggestion?: (q: string) => void;
}

type Tab = "publications" | "trials" | "documents";

function Sources({ message }: { message: ChatMessage }) {
  const id = useId();
  const pubs = message.publications ?? [];
  const trials = message.clinicalTrials ?? [];
  const docs = message.documentChunks ?? [];
  const tabs = ([
    pubs.length > 0 && ["publications", "Publications", pubs.length, BookOpen],
    trials.length > 0 && ["trials", "Clinical trials", trials.length, FlaskConical],
    docs.length > 0 && ["documents", "Your documents", docs.length, FileText],
  ].filter(Boolean) as [Tab, string, number, typeof BookOpen][]);
  const [tab, setTab] = useState<Tab | null>(null);
  if (!tabs.length) return null;
  const active = tab ?? tabs[0][0];

  return (
    <section aria-label="Sources">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-medium text-white">Sources behind this answer</h3>
        <span className="text-[13px] text-white/40">{pubs.length + trials.length + docs.length} total</span>
      </div>
      <div role="tablist" className="mb-4 flex gap-1 overflow-x-auto border-b border-white/10">
        {tabs.map(([key, label, n, Icon]) => (
          <button key={key} role="tab" aria-selected={active === key} onClick={() => setTab(key)} className={cn("relative flex shrink-0 items-center gap-2 px-4 py-3 text-[14px] transition-colors", active === key ? "text-white" : "text-white/50 hover:text-white/80")}>
            <Icon className="h-4 w-4" />
            {label}
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[12px] tabular-nums">{n}</span>
            {active === key && <motion.span layoutId={`src-tab-${id}`} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-sky-300" />}
          </button>
        ))}
      </div>
      {active === "publications" && (
        <div className="grid gap-4 md:grid-cols-2">
          {pubs.map((p, i) => <PublicationCard key={i} pub={p} />)}
        </div>
      )}
      {active === "trials" && (
        <div className="grid gap-4 md:grid-cols-2">
          {trials.map((t, i) => <ClinicalTrialCard key={i} trial={t} />)}
        </div>
      )}
      {active === "documents" && (
        <div className="grid gap-3">
          {docs.map((c, i) => (
            <Panel key={i} className="!p-4">
              <div className="flex items-center gap-2.5 text-[14px] text-white">
                <FileText className="h-4 w-4 text-amber-300" />
                <span className="truncate">{c.filename}</span>
                <Chip color="#fbbf24" dot={false} className="ml-auto">{(c.score * 100).toFixed(0)}% match</Chip>
              </div>
              {c.excerpt && <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-white/55">{c.excerpt}…</p>}
            </Panel>
          ))}
        </div>
      )}
    </section>
  );
}

function Cost({ message }: { message: ChatMessage }) {
  const [open, setOpen] = useState(false);
  const tc = message.tokenCost;
  // Only real, server-reported usage is shown. Nothing is estimated here.
  if (!tc || tc.isFallback) return null;
  const total = Math.max(1, tc.totalTokens || 1);
  const pPct = Math.round(((tc.promptTokens || 0) / total) * 100);
  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[13px] text-white/70 transition-colors hover:border-white/25 hover:text-white">
        <Coins className="h-4 w-4 text-emerald-300" />
        <span>{tc.costFormatted ?? `$${(tc.costUSD || 0).toFixed(5)}`}</span>
        <span className="text-white/25">·</span>
        <span className="tabular-nums">{(tc.totalTokens || 0).toLocaleString()} tokens</span>
        {tc.model && (<><span className="text-white/25">·</span><span>{tc.model}</span></>)}
        <span className="text-white/40">{open ? "Hide" : "Details"}</span>
      </button>
      {open && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Prompt", (tc.promptTokens || 0).toLocaleString(), "#38bdf8"], ["Completion", (tc.completionTokens || 0).toLocaleString(), "#a78bfa"], ["Total", (tc.totalTokens || 0).toLocaleString(), "#ffffff"], ["Cost", tc.costFormatted ?? `$${(tc.costUSD || 0).toFixed(5)}`, "#34d399"]].map(([l, v, c]) => (
              <div key={l}>
                <div className="text-[12.5px] text-white/45">{l}</div>
                <div className="mt-0.5 font-mono text-[18px] tabular-nums" style={{ color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/8" aria-label={`Prompt ${pPct}%, completion ${100 - pPct}%`}>
            <div className="h-full bg-sky-300" style={{ width: `${pPct}%` }} />
            <div className="h-full bg-violet-300" style={{ width: `${100 - pPct}%` }} />
          </div>
          {(tc.savingsUSD ?? 0) > 0 && <p className="mt-3 text-[13px] text-emerald-200/80">About ${(tc.savingsUSD ?? 0).toFixed(5)} less than a GPT-4o baseline for the same tokens.</p>}
        </div>
      )}
    </div>
  );
}

export function MessageBubble({ message, onSuggestion }: Props) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === "user") {
    const s = message.structuredInput;
    const text = message.content || [s?.disease, s?.query].filter(Boolean).join(" — ") || "(empty)";
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] sm:max-w-[75%]">
          <div className="rounded-2xl rounded-tr-md border border-white/12 bg-white/[0.07] px-4 py-2.5 text-[14px] leading-relaxed text-white">{text}</div>
          {s && (s.patientName || s.location) && (
            <div className="mt-2 flex flex-wrap justify-end gap-1.5">
              {s.patientName && <Chip color="#38bdf8" dot={false}><User className="h-3.5 w-3.5" />{s.patientName}</Chip>}
              {s.location && <Chip color="#f472b6" dot={false}><MapPin className="h-3.5 w-3.5" />{s.location}</Chip>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3.5">
      <span className="mt-1 hidden h-8.5 w-8.5 shrink-0 place-items-center rounded-lg border border-sky-300/25 bg-sky-300/10 text-sky-200 sm:grid">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-4">
        {message.workflowSteps && message.workflowSteps.length > 0 && <AgentWorkflowPanel steps={message.workflowSteps} collapsible defaultExpanded={false} />}

        {message.responseMode === "executive" ? (
          <ExecutiveSummaryCard message={message} />
        ) : (
          <article className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 sm:px-5">
              <span className="flex items-center gap-2 text-[13.5px] font-medium text-white">
                <FileText className="h-4 w-4 text-sky-300" /> Research report
              </span>
              <Btn size="sm" variant="ghost" onClick={copy} icon={copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}>
                {copied ? "Copied" : "Copy report"}
              </Btn>
            </header>
            <div className="prose-research max-w-none px-4 py-4 text-[14px] leading-relaxed text-white/80 sm:px-5 sm:py-5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{sanitizeReportMarkdown(message.content)}</ReactMarkdown>
            </div>
          </article>
        )}

        <Cost message={message} />
        <Sources message={message} />

        {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
          <section aria-label="Follow-up questions">
            <h3 className="mb-2.5 text-[14px] font-medium text-white">Keep going</h3>
            <div className="flex flex-wrap gap-2">
              {message.suggestedQuestions.map((q, i) => (
                <button key={i} onClick={() => onSuggestion?.(q)} className="rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-left text-[13px] text-white/80 transition-all hover:border-sky-300/50 hover:bg-sky-300/10 hover:text-white">
                  {q}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function sanitizeReportMarkdown(content: string = ""): string {
  if (!content) return "";

  // 1. Fix multiline eligibility breaking out of table rows
  let cleaned = content.replace(
    /\|\s*\*{0,2}Eligibility\*{0,2}\s*\|\s*\n([\s\S]*?)(?:\|\|\s*Registry\s*\|\s*(\[.*?\]\(.*?\)|https?:\/\/[^\s|]+)\s*\||\|\s*\*{0,2}Registry\*{0,2}\s*\|\s*(\[.*?\]\(.*?\)|https?:\/\/[^\s|]+)\s*\|)/gi,
    (_, criteria, reg1, reg2) => {
      const reg = reg1 || reg2 || "";
      return `| **Registry** | ${reg} |\n\n**Key Eligibility Criteria:**\n${criteria.trim()}`;
    }
  );

  // 2. Fix broken double pipes like "|| Registry |"
  cleaned = cleaned.replace(/\|\|\s*Registry\s*\|/gi, "| **Registry** |");

  // 3. Fix unclosed eligibility rows before subsequent trial headings
  cleaned = cleaned.replace(
    /\|\s*\*{0,2}Eligibility\*{0,2}\s*\|\s*\n([\s\S]*?)(?=\n#{3,4}\s+|\n---|\n###)/gi,
    (_, criteria) => {
      return `\n\n**Key Eligibility Criteria:**\n${criteria.trim()}`;
    }
  );

  return cleaned;
}
