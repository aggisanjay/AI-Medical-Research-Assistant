import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Sparkles, FileText } from "lucide-react";
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
      <div className="flex justify-end">
        <div className="flex items-start gap-3 max-w-[85%]">
          <div className="rounded-3xl rounded-tr-md bg-[#121212] border border-white/8 px-5 py-3.5 text-xs sm:text-sm text-slate-100">
            <div className="font-normal leading-relaxed">{display}</div>
            {s && (s.patientName || s.location) && (
              <div className="mt-2.5 pt-2 border-t border-white/8 text-[10px] text-slate-500 flex items-center gap-3">
                {s.patientName && <span className="flex items-center gap-1">👤 {s.patientName}</span>}
                {s.location && <span className="flex items-center gap-1">📍 {s.location}</span>}
              </div>
            )}
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#18181b] border border-white/10 text-slate-300">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black font-serif font-bold text-sm">
        C
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
          <div className="editorial-card px-6 py-5 border border-white/8 relative overflow-hidden">
            <div className="prose-research max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
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
                  className="rounded-2xl border border-white/8 bg-[#0a0a0a] px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-white">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    {chunk.filename}
                    <span className="text-slate-400 font-mono ml-auto">
                      {(chunk.score * 100).toFixed(0)}% match
                    </span>
                  </div>
                  {chunk.excerpt && (
                    <p className="mt-1.5 text-[11px] text-slate-400 font-normal leading-relaxed line-clamp-2">
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
          <div className="pt-1">
            <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
              <Sparkles className="h-3 w-3 text-blue-400" />
              Suggested Clinical Queries
            </div>
            <div className="flex flex-wrap gap-2">
              {message.suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestion?.(q)}
                  className="text-left text-xs px-3.5 py-2 rounded-full border border-white/8 bg-[#0a0a0a] hover:border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer font-normal"
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
      <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wider text-slate-500 ml-1">
        {title}
        <span className="text-[10px] px-2 py-0.2 bg-[#121212] border border-white/8 rounded-full text-slate-400 font-mono">{count}</span>
      </div>
      {children}
    </div>
  );
}
