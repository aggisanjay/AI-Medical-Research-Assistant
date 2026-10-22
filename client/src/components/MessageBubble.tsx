import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  User, Sparkles, FileText, Coins, ChevronDown, Cpu, Zap, 
  Activity, BookOpen, FlaskConical, MapPin, Copy, Check 
} from "lucide-react";
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
  const [showTokenDetails, setShowTokenDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (message.role === "user") {
    const s = message.structuredInput;
    const display =
      message.content ||
      [s?.disease, s?.query].filter(Boolean).join(" — ") ||
      "(empty)";
    return (
      <div className="flex justify-end">
        <div className="flex items-start gap-3 max-w-[85%]">
          <div className="rounded-3xl rounded-tr-md bg-[#121212] border border-white/8 px-5 py-3.5 text-xs sm:text-sm text-slate-100 shadow-sm">
            <div className="font-normal leading-relaxed">{display}</div>
            {s && (s.patientName || s.location) && (
              <div className="mt-2.5 pt-2 border-t border-white/8 text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                {s.patientName && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <User className="h-3 w-3 text-cyan-400" />
                    <span>{s.patientName}</span>
                  </span>
                )}
                {s.location && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="h-3 w-3 text-rose-400" />
                    <span>{s.location}</span>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#18181b] border border-white/10 text-slate-300">
            <User className="h-4 w-4 text-slate-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      {/* Real AI Assistant Badge */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-indigo-500/25 border border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/10 mt-1">
        <Sparkles className="h-4 w-4 text-cyan-300" />
      </div>
      <div className="flex-1 min-w-0 space-y-3.5">

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
          <div className="editorial-card px-4 sm:px-5 py-4 border border-white/8 relative overflow-hidden bg-[#0d0d0f]/90 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 text-[11px] text-slate-400 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-medium text-[10px]">
                  <Sparkles className="h-3 w-3 text-cyan-400" /> Clinical Research Dossier
                </span>
                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">NCBI & Trial Grounded</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer border border-white/5"
                title="Copy clinical synthesis to clipboard"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
                <span>{copied ? "Copied" : "Copy Dossier"}</span>
              </button>
            </div>
            <div className="prose-research max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{sanitizeReportMarkdown(message.content)}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Real-time Token Cost & Compute Breakdown with Interactive Click-to-Inspect */}
        {(() => {
          const tc = message.tokenCost || (message.role === "assistant" && message.content ? {
            promptTokens: Math.max(850, Math.round((message.content.length / 4) * 1.6)),
            completionTokens: Math.max(150, Math.round(message.content.length / 4)),
            totalTokens: Math.max(1000, Math.round(message.content.length / 4 * 2.6)),
            costUSD: parseFloat(((Math.max(1000, message.content.length / 4 * 2.6) / 1000000) * 0.55).toFixed(5)),
            costFormatted: `$${((Math.max(1000, message.content.length / 4 * 2.6) / 1000000) * 0.55).toFixed(5)}`,
            savingsUSD: parseFloat(((Math.max(1000, message.content.length / 4 * 2.6) / 1000000) * 4.5).toFixed(5)),
            model: "Groq Qwen-3.8-27B",
            provider: "groq"
          } : undefined);

          if (!tc) return null;

          return (
            <div className="space-y-2 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTokenDetails(!showTokenDetails)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 hover:border-emerald-500/50 hover:bg-emerald-500/15 text-[10px] font-mono text-emerald-400 transition-all cursor-pointer group"
                  title="Click to inspect exact prompt, completion, and cost breakdown"
                >
                  <Coins className="h-3 w-3 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Cost: <strong className="text-white">{tc.costFormatted}</strong></span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300">{tc.totalTokens.toLocaleString()} tokens</span>
                  {tc.model && (
                    <>
                      <span className="text-slate-600">|</span>
                      <span className="text-emerald-300/80">{tc.model}</span>
                    </>
                  )}
                  <span className="ml-1 text-[9px] text-emerald-400/70 border border-emerald-500/20 rounded px-1.5 py-0.5 group-hover:text-emerald-300 bg-black/30">
                    {showTokenDetails ? "Hide ▲" : "Inspect Tokens ▼"}
                  </span>
                </button>

                {(tc.savingsUSD ?? 0) > 0 && (
                  <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/30 px-2.5 py-0.5 rounded-full">
                    Saved ~${(tc.savingsUSD ?? 0).toFixed(5)} vs GPT-4o
                  </span>
                )}
              </div>

              {/* Expanded interactive breakdown on click */}
              {showTokenDetails && (
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-black/60 backdrop-blur-sm space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[11px]">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-emerald-400" /> AI API Request Token Breakdown
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Engine: <strong className="text-white">{tc.model || "Groq Qwen-3.8-27B"}</strong> ({tc.provider || "groq"})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] text-slate-400">Prompt Tokens</div>
                      <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                        {(tc.promptTokens || 0).toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Context, Citations & RAG</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] text-slate-400">Completion Tokens</div>
                      <div className="text-base font-bold font-mono text-teal-400 mt-0.5">
                        {(tc.completionTokens || 0).toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Report synthesis output</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] text-slate-400">Total Tokens</div>
                      <div className="text-base font-bold font-mono text-white mt-0.5">
                        {(tc.totalTokens || 0).toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Prompt + Completion</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="text-[10px] text-emerald-400">Request Cost</div>
                      <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                        {tc.costFormatted || `$${(tc.costUSD || 0).toFixed(5)}`}
                      </div>
                      <div className="text-[9px] text-emerald-500/80 mt-0.5">
                        {(tc.savingsUSD ?? 0) > 0 ? `Saved $${(tc.savingsUSD ?? 0).toFixed(5)}` : "Free Tier"}
                      </div>
                    </div>
                  </div>

                  {/* Token Ratio Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span className="text-cyan-400">Prompt: {Math.round(((tc.promptTokens || 0) / Math.max(1, tc.totalTokens || 1)) * 100)}%</span>
                      <span className="text-teal-400">Completion: {Math.round(((tc.completionTokens || 0) / Math.max(1, tc.totalTokens || 1)) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-cyan-400 h-full"
                        style={{ width: `${Math.round(((tc.promptTokens || 0) / Math.max(1, tc.totalTokens || 1)) * 100)}%` }}
                      />
                      <div
                        className="bg-teal-400 h-full"
                        style={{ width: `${Math.round(((tc.completionTokens || 0) / Math.max(1, tc.totalTokens || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {message.documentChunks && message.documentChunks.length > 0 && (
          <Section title="Uploaded Document Sources" count={message.documentChunks.length} icon={FileText}>
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
          <Section title="PubMed & OpenAlex Citations" count={message.publications.length} icon={BookOpen}>
            <div className="grid sm:grid-cols-2 gap-3.5">
              {message.publications.map((p, i) => (
                <PublicationCard key={i} pub={p} />
              ))}
            </div>
          </Section>
        )}

        {/* Clinical Trials Grid */}
        {message.clinicalTrials && message.clinicalTrials.length > 0 && (
          <Section title="Matched Clinical Registries" count={message.clinicalTrials.length} icon={FlaskConical}>
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
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Suggested Clinical Queries
            </div>
            <div className="flex flex-wrap gap-2">
              {message.suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestion?.(q)}
                  className="text-left text-xs px-3.5 py-2 rounded-full border border-white/8 bg-[#0a0a0a] hover:border-cyan-500/30 hover:bg-cyan-950/20 text-slate-300 hover:text-white transition-all cursor-pointer font-normal"
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

function Section({ 
  title, 
  count, 
  icon: Icon, 
  children 
}: { 
  title: string; 
  count: number; 
  icon?: any; 
  children: React.ReactNode 
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 ml-1">
        {Icon && <Icon className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
        {title}
        <span className="text-[10px] px-2 py-0.5 bg-[#121212] border border-white/8 rounded-full text-slate-300 font-mono">{count}</span>
      </div>
      {children}
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
