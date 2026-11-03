import { ExternalLink, MapPin } from "lucide-react";
import type { ClinicalTrial } from "@/lib/api";
import { Chip, SRC } from "@/components/ui/kit";

const statusColor = (s?: string) => {
  const v = (s || "").toLowerCase();
  if (v.includes("recruit") && !v.includes("not")) return "#34d399";
  if (v.includes("complete")) return "#38bdf8";
  if (v.includes("terminat") || v.includes("withdraw") || v.includes("suspend")) return "#f87171";
  return "#fbbf24";
};

export function ClinicalTrialCard({ trial }: { trial: ClinicalTrial }) {
  const locations = trial.locations?.length ? trial.locations : trial.location ? [trial.location] : [];
  return (
    <a href={trial.url} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06]">
      <div className="mb-2.5 flex items-start justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip color={SRC.ClinicalTrials.color}>ClinicalTrials.gov</Chip>
          {trial.status && <Chip color={statusColor(trial.status)}>{trial.status}</Chip>}
          {trial.phase && <Chip color="#94a3b8" dot={false}>{trial.phase}</Chip>}
        </div>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/30 transition-colors group-hover:text-white" />
      </div>
      <h4 className="text-[13.5px] font-medium leading-snug text-white transition-colors group-hover:text-emerald-200">{trial.briefTitle || trial.title}</h4>
      {trial.eligibility && <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-white/55">{trial.eligibility}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-x-3.5 gap-y-1.5 pt-3 text-[11.5px] text-white/45">
        {trial.nctId && <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-white/70">{trial.nctId}</span>}
        {locations.length > 0 && (
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {locations.slice(0, 2).join(" · ")}
              {locations.length > 2 ? ` +${locations.length - 2}` : ""}
            </span>
          </span>
        )}
      </div>
    </a>
  );
}
