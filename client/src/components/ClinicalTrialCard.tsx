import { ExternalLink, MapPin, FlaskConical, CheckCircle2 } from "lucide-react";
import type { ClinicalTrial } from "@/lib/api";

export function ClinicalTrialCard({ trial }: { trial: ClinicalTrial }) {
  const statusColor = (() => {
    const s = (trial.status || "").toLowerCase();
    if (s.includes("recruit")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (s.includes("complet")) return "bg-slate-800 text-slate-400 border-slate-750";
    if (s.includes("active")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  })();

  const locations = trial.locations?.length ? trial.locations : trial.location ? [trial.location] : [];

  return (
    <a
      href={trial.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-900 hover:shadow-lg relative overflow-hidden"
    >
      {/* Top Meta Tag Grid */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <FlaskConical className="h-3 w-3 text-emerald-400 shrink-0" />
            Registry
          </span>
          {trial.status && (
            <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusColor}`}>
              <CheckCircle2 className="h-3 w-3 shrink-0" />
              {trial.status}
            </span>
          )}
          {trial.phase && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {trial.phase}
            </span>
          )}
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-white transition-all shrink-0" />
      </div>

      {/* Title */}
      <h4 className="text-xs font-bold text-slate-200 leading-snug group-hover:text-primary transition-colors pr-2">
        {trial.briefTitle || trial.title}
      </h4>

      {/* Eligibility summary snippet */}
      {trial.eligibility && (
        <p className="mt-2 text-[11px] text-slate-400 line-clamp-3 leading-relaxed font-light">
          {trial.eligibility}
        </p>
      )}

      {/* Footer details */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/40 flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-light">
        {trial.nctId && <span className="font-mono text-slate-400">{trial.nctId}</span>}
        {locations.length > 0 && (
          <span className="flex items-center gap-1 truncate max-w-[65%]">
            <MapPin className="h-3.5 w-3.5 text-slate-650 shrink-0" />
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
