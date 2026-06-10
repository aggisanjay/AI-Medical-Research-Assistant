import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Activity, User, Sparkles, FileText } from "lucide-react";
import type { ChatMessage } from "@/lib/api";
import { PublicationCard } from "./PublicationCard";
import { ClinicalTrialCard } from "./ClinicalTrialCard";
import { AgentWorkflowPanel } from "./AgentWorkflowPanel";
import { ExecutiveSummaryCard } from "./ExecutiveSummaryCard";

interface Props {
  message: ChatMessage;
  onSuggestion?: (q: string) => void;
}

export function MessageBubble({ message, onSuggestion }: Props) {
  if (message.role === "user") {
    const s = message.structuredInput;
    const display =
      message.content ||
      [s?.disease, s?.query].filter(Boolean).join(" — ") ||
      "(empty)";
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="flex items-start gap-3.5 max-w-[85%]">
          <div className="rounded-2xl rounded-tr-sm bg-slate-900 border border-slate-800 px-4.5 py-3 text-sm text-slate-100 shadow-md">
            <div className="font-light leading-relaxed">{display}</div>
            {s && (s.patientName || s.location) && (
              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-3">
                {s.patientName && <span className="flex items-center gap-1">👤 {s.patientName}</span>}
                {s.location && <span className="flex items-center gap-1">📍 {s.location}</span>}
              </div>
            )}
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-350 shadow-inner">
            <User className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3.5 animate-slide-up">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[0_0_15px_rgba(37,99,235,0.35)] pulse-cyan-glow">
        <Activity className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0 space-y-5">

        {message.workflowSteps && message.workflowSteps.length > 0 && (
          <AgentWorkflowPanel
            steps={message.workflowSteps}
            collapsible
            defaultExpanded={false}
          />
        )}

        {/* Main AI Answer Bubble */}
        {message.role === "assistant" && message.responseMode === "executive" ? (
          <ExecutiveSummaryCard message={message} />
        ) : (
          <div className="rounded-2xl rounded-tl-sm border border-white/5 bg-slate-900/60 backdrop-blur-md px-6 py-5 shadow-2xl relative overflow-hidden">
            <div className={`absolute left-0 top-0 w-1 h-full ${
              message.responseMode === "document" 
                ? "bg-gradient-to-b from-purple-500 to-indigo-500" 
                : "bg-gradient-to-b from-blue-500 to-cyan-500"
            }`} />
            <div className="prose-research max-w-none text-sm text-slate-300 leading-relaxed font-light">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          </div>
        )}

        {message.documentChunks && message.documentChunks.length > 0 && (
          <Section title="Uploaded Document Sources" count={message.documentChunks.length}>
            <div className="space-y-2">
              {message.documentChunks.map((chunk, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-purple-300">
                    <FileText className="h-3.5 w-3.5" />
                    {chunk.filename}
                    <span className="text-purple-400/70 font-mono ml-auto">
                      {(chunk.score * 100).toFixed(0)}% match
                    </span>
                  </div>
                  {chunk.excerpt && (
                    <p className="mt-1.5 text-[11px] text-slate-400 font-light leading-relaxed line-clamp-2">
                      {chunk.excerpt}…
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Publications Grid */}
        {message.publications && message.publications.length > 0 && (
          <Section title="PubMed & OpenAlex Citations" count={message.publications.length}>
            <div className="grid sm:grid-cols-2 gap-3.5">
              {message.publications.map((p, i) => (
                <PublicationCard key={i} pub={p} />
              ))}
            </div>
          </Section>
        )}

        {/* Clinical Trials Grid */}
        {message.clinicalTrials && message.clinicalTrials.length > 0 && (
          <Section title="Matched Clinical Registries" count={message.clinicalTrials.length}>
            <div className="grid sm:grid-cols-2 gap-3.5">
              {message.clinicalTrials.map((t, i) => (
                <ClinicalTrialCard key={i} trial={t} />
              ))}
            </div>
          </Section>
        )}

        {/* Suggested Follow-up Questions */}
        {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
          <div className="animate-fade-in pt-1">
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Suggested Clinical Queries
            </div>
            <div className="flex flex-wrap gap-2">
              {message.suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestion?.(q)}
                  className="text-left text-xs px-3.5 py-2 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-900 hover:border-blue-500/30 text-slate-300 hover:text-white transition-all cursor-pointer font-light hover:scale-[1.01]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-500 ml-1">
        {title}
        <span className="text-[10px] px-1.5 py-0.2 bg-slate-900 border border-slate-850 rounded text-slate-400 font-mono">{count}</span>
      </div>
      {children}
    </div>
  );
}
