import { Tilt3D } from "./Tilt3D";
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

  const getConfidenceLevel = (lines: string[]): "High" | "Medium" | "Low" | "Unknown" => {
    const text = lines.join(" ").toLowerCase();
    if (text.includes("high")) return "High";
    if (text.includes("medium")) return "Medium";
    if (text.includes("low")) return "Low";
    return "Unknown";
  };

  const confidenceLevel = getConfidenceLevel(sections.confidence);

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
    <Tilt3D max={4}>
    <div className="editorial-card border border-white/8 relative overflow-hidden">
      
      {/* Header Panel */}
      <div className="px-6 py-5 border-b border-white/8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-1 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
              <ShieldCheck className="h-3 w-3" />
              Executive Synthesis
            </span>
          </div>
          <h2 className="text-base font-serif font-bold text-white">Executive Briefing</h2>
        </div>

        {/* Confidence & Sources Summary Indicators */}
        <div className="flex items-center flex-wrap gap-2.5">
          {confidenceLevel !== "Unknown" && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border border-white/10 bg-white/5 text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {confidenceLevel} Confidence
            </div>
          )}
          
          <div className="flex items-center gap-3 px-3.5 py-1 rounded-full bg-black/60 border border-white/8 text-[11px] text-slate-400 font-normal">
            <span className="flex items-center gap-1"><Database className="h-3.5 w-3.5 text-white" /> {metrics.sourceCount} Sources</span>
            <span className="h-3 w-px bg-white/10" />
            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-white" /> {metrics.citationCount} Citations</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="p-6 space-y-6">
        
        {/* Row 1: Key Findings & Recommended Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Key Findings Card */}
          <div className="rounded-2xl border border-white/8 bg-black/40 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Key Findings
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-normal leading-relaxed">
              {sections.keyFindings.length > 0 ? (
                sections.keyFindings.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-white mt-1 select-none">•</span>
                    <span>{bullet}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No key findings reported.</li>
              )}
            </ul>
          </div>

          {/* Recommended Actions Card */}
          <div className="rounded-2xl border border-white/8 bg-black/40 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <ArrowRight className="h-4 w-4 text-[#2563EB]" />
              Recommended Actions
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-normal leading-relaxed">
              {sections.recommendedActions.length > 0 ? (
                sections.recommendedActions.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#2563EB] mt-1 select-none">→</span>
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
          <div className="rounded-2xl border border-white/8 bg-black/40 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Risks & Limitations
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-normal leading-relaxed">
              {sections.risks.length > 0 ? (
                sections.risks.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1 select-none">•</span>
                    <span>{bullet}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No specific risks highlighted.</li>
              )}
            </ul>
          </div>

          {/* Opportunities Card */}
          <div className="rounded-2xl border border-white/8 bg-black/40 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Opportunities
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-normal leading-relaxed">
              {sections.opportunities.length > 0 ? (
                sections.opportunities.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1 select-none">•</span>
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
          <div className="text-[11px] text-slate-500 font-normal pt-2 border-t border-white/8">
            <span className="font-semibold text-slate-400">Confidence Assessment Justification: </span>
            {sections.confidence.join(" ")}
          </div>
        )}
      </div>
    </div>
    </Tilt3D>
  );
}
