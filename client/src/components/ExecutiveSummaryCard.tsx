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
import { Chip } from "@/components/ui/kit";
import type { LucideIcon } from "lucide-react";

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

  const lvlColor = confidenceLevel === "High" ? "#34d399" : confidenceLevel === "Medium" ? "#fbbf24" : "#f87171";
  const Block = ({ title, icon: Icon, color, items, empty }: { title: string; icon: LucideIcon; color: string; items: string[]; empty: string }) => (
    <section className="rounded-xl border border-white/10 bg-black/25 p-3.5 sm:p-4">
      <h3 className="mb-2.5 flex items-center gap-2 text-[13.5px] font-medium text-white">
        <span className="grid h-7 w-7 place-items-center rounded-md" style={{ background: color + "1c", color }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {title}
      </h3>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((b, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-white/80">
              <i className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12.5px] text-white/35">{empty}</p>
      )}
    </section>
  );

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <header className="flex flex-col justify-between gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8.5 w-8.5 place-items-center rounded-lg bg-violet-300/12 text-violet-200">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-serif text-[18px] font-light leading-none tracking-tight text-white">Executive briefing</h2>
            <p className="mt-1 text-[12px] text-white/45">Short-form summary of the evidence</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {confidenceLevel !== "Unknown" && <Chip color={lvlColor}>{confidenceLevel} confidence</Chip>}
          <Chip color="#38bdf8" dot={false}><Database className="h-3 w-3" />{metrics.sourceCount} sources</Chip>
          <Chip color="#a78bfa" dot={false}><FileText className="h-3 w-3" />{metrics.citationCount} citations</Chip>
        </div>
      </header>
      <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-2">
        <Block title="Key findings" icon={CheckCircle2} color="#34d399" items={sections.keyFindings} empty="No key findings reported." />
        <Block title="Recommended actions" icon={ArrowRight} color="#38bdf8" items={sections.recommendedActions} empty="No recommended actions reported." />
        <Block title="Risks and limitations" icon={AlertTriangle} color="#f87171" items={sections.risks} empty="No specific risks highlighted." />
        <Block title="Opportunities" icon={Sparkles} color="#a78bfa" items={sections.opportunities} empty="No opportunities highlighted." />
      </div>
      {sections.confidence.length > 0 && (
        <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-black/25 p-3.5 sm:mx-5 sm:mb-5">
          <h3 className="mb-1.5 flex items-center gap-2 text-[13.5px] font-medium text-white"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Confidence assessment</h3>
          <p className="text-[13px] leading-relaxed text-white/70">{sections.confidence.join(" ")}</p>
        </div>
      )}
    </article>
  );
}
