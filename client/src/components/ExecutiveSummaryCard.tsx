import React from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Database,
  FileText
} from "lucide-react";
import type { ChatMessage } from "@/lib/api";

interface Props {
  message: ChatMessage;
}

export function ExecutiveSummaryCard({ message }: Props) {
  // Simple expected section headers parser
  const parseSections = (content: string) => {
    const sections: Record<string, string[]> = {
      keyFindings: [],
      risks: [],
      opportunities: [],
      recommendedActions: [],
      confidence: [],
      sourcesUsed: []
    };

    const parts = content.split("### ");
    parts.forEach(part => {
      const lines = part.split("\n");
      const heading = lines[0].trim().toLowerCase();
      const bodyLines = lines
        .slice(1)
        .map(l => l.trim())
        .filter(l => l.length > 0);

      const cleanBullets = bodyLines
        .filter(line => line.startsWith("-") || line.startsWith("*") || line.startsWith("•") || /^\d+\./.test(line))
        .map(line => line.replace(/^([-*•]|\d+\.)\s*/, "").trim());

      // Fallback: If no bullet points are found, treat the whole trimmed text as lines
      const displayLines = cleanBullets.length > 0 ? cleanBullets : bodyLines.map(line => line.trim());

      if (heading.includes("key findings")) {
        sections.keyFindings = displayLines;
      } else if (heading.includes("risks")) {
        sections.risks = displayLines;
      } else if (heading.includes("opportunities")) {
        sections.opportunities = displayLines;
      } else if (heading.includes("recommended actions") || heading.includes("recommendations")) {
        sections.recommendedActions = displayLines;
      } else if (heading.includes("confidence assessment")) {
        sections.confidence = displayLines;
      } else if (heading.includes("sources used")) {
        sections.sourcesUsed = displayLines;
      }
    });

    return sections;
  };

  const sections = parseSections(message.content);

  // Helper to extract a single word confidence level (High/Medium/Low)
  const getConfidenceLevel = (lines: string[]): "High" | "Medium" | "Low" | "Unknown" => {
    const text = lines.join(" ").toLowerCase();
    if (text.includes("high")) return "High";
    if (text.includes("medium")) return "Medium";
    if (text.includes("low")) return "Low";
    return "Unknown";
  };

  const confidenceLevel = getConfidenceLevel(sections.confidence);
  
  // Style config for confidence level
  const confidenceStyles = {
    High: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/25",
      dot: "bg-emerald-500"
    },
    Medium: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/25",
      dot: "bg-amber-500"
    },
    Low: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/25",
      dot: "bg-rose-500"
    },
    Unknown: {
      bg: "bg-slate-500/10",
      text: "text-slate-400",
      border: "border-slate-500/25",
      dot: "bg-slate-500"
    }
  }[confidenceLevel];

  // Helper to extract numeric metrics from sources used
  const extractSourcesMetrics = (lines: string[]) => {
    let sourceCount = message.publications?.length || 0;
    let citationCount = message.clinicalTrials?.length || 0;

    lines.forEach(line => {
      const sourceMatch = line.match(/source\s+count:\s*(\d+)/i);
      const citationMatch = line.match(/citation\s+count:\s*(\d+)/i);
      if (sourceMatch) {
        sourceCount = parseInt(sourceMatch[1], 10);
      }
      if (citationMatch) {
        citationCount = parseInt(citationMatch[1], 10);
      }
    });

    return { sourceCount, citationCount };
  };

  const metrics = extractSourcesMetrics(sections.sourcesUsed);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-lg shadow-2xl relative overflow-hidden animate-slide-up">
      {/* SaaS Dashboard Accent Line */}
      <div className="absolute left-0 top-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600" />
      
      {/* Header Panel */}
      <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              <ShieldCheck className="h-3 w-3" />
              Executive Support
            </span>
          </div>
          <h2 className="text-lg font-bold text-white font-display">Executive Briefing</h2>
        </div>

        {/* Confidence & Sources Summary Indicators */}
        <div className="flex items-center flex-wrap gap-2.5">
          {confidenceLevel !== "Unknown" && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${confidenceStyles.bg} ${confidenceStyles.text} ${confidenceStyles.border}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${confidenceStyles.dot} animate-pulse`} />
              {confidenceLevel} Confidence
            </div>
          )}
          
          <div className="flex items-center gap-3 px-3.5 py-1 rounded-full bg-slate-950/40 border border-white/5 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1"><Database className="h-3.5 w-3.5 text-cyan-400" /> {metrics.sourceCount} Sources</span>
            <span className="h-3 w-px bg-slate-800" />
            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-purple-400" /> {metrics.citationCount} Citations</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="p-6 space-y-6">
        
        {/* Row 1: Key Findings & Recommended Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Key Findings Card */}
          <div className="rounded-xl border border-white/5 bg-slate-950/20 p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
              Key Findings
            </div>
            <ul className="space-y-2.5 text-xs text-slate-350 font-light leading-relaxed">
              {sections.keyFindings.length > 0 ? (
                sections.keyFindings.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1 select-none">•</span>
                    <span>{bullet}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No key findings reported.</li>
              )}
            </ul>
          </div>

          {/* Recommended Actions Card */}
          <div className="rounded-xl border border-white/5 bg-slate-950/20 p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <ArrowRight className="h-4.5 w-4.5 text-blue-400" />
              Recommended Actions
            </div>
            <ul className="space-y-2.5 text-xs text-slate-350 font-light leading-relaxed">
              {sections.recommendedActions.length > 0 ? (
                sections.recommendedActions.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1 select-none">→</span>
                    <span>{bullet}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No recommended actions reported.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Row 2: Risks & Opportunities */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Risks & Gaps Card */}
          <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
              <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
              Risks & Limitations
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 font-light leading-relaxed">
              {sections.risks.length > 0 ? (
                sections.risks.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400/80 mt-1 select-none">•</span>
                    <span>{bullet}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No specific risks highlighted.</li>
              )}
            </ul>
          </div>

          {/* Opportunities Card */}
          <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
              <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
              Opportunities
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 font-light leading-relaxed">
              {sections.opportunities.length > 0 ? (
                sections.opportunities.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400/80 mt-1 select-none">•</span>
                    <span>{bullet}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No opportunities highlighted.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Confidence Explanation Block */}
        {sections.confidence.length > 0 && sections.confidence[0] && (
          <div className="text-[11px] text-slate-500 font-light pt-2 border-t border-white/5">
            <span className="font-semibold text-slate-400">Confidence Assessment Justification: </span>
            {sections.confidence.join(" ")}
          </div>
        )}
      </div>
    </div>
  );
}
