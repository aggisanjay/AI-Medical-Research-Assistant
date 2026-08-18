import { ExternalLink, MapPin, FlaskConical, CheckCircle2 } from "lucide-react";
import type { ClinicalTrial } from "@/lib/api";

export function ClinicalTrialCard({ trial }: { trial: ClinicalTrial }) {
  const locations = trial.locations?.length ? trial.locations : trial.location ? [trial.location] : [];

  return (
    <a
      href={trial.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-3xl border border-white/8 bg-[#0a0a0a] p-5 transition-all duration-200 hover:border-white/20 hover:bg-[#121212] relative overflow-hidden"
    >
      {/* Top Meta Tag Grid */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-white">
            <FlaskConical className="h-3 w-3 text-slate-400 shrink-0" />
            Registry
          </span>
          {trial.status && (
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/8 bg-white/5 text-slate-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
              {trial.status}
            </span>
          )}
          {trial.phase && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#18181b] border border-white/10 text-slate-400">
              {trial.phase}
            </span>
          )}
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-white transition-all shrink-0" />
      </div>

      {/* Title */}
      <h4 className="text-xs font-serif font-bold text-white leading-snug group-hover:text-[#2563EB] transition-colors pr-2">
        {trial.briefTitle || trial.title}
      </h4>

      {/* Eligibility summary snippet */}
      {trial.eligibility && (
        <p className="mt-2 text-[11px] text-slate-400 line-clamp-3 leading-relaxed font-normal">
          {trial.eligibility}
        </p>
      )}

      {/* Footer details */}
      <div className="mt-4 pt-3.5 border-t border-white/8 flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-normal">
        {trial.nctId && <span className="font-mono text-slate-400">{trial.nctId}</span>}
        {locations.length > 0 && (
          <span className="flex items-center gap-1 truncate max-w-[65%]">
            <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
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
