import { ExternalLink, Calendar, Users } from "lucide-react";
import type { Publication } from "@/lib/api";

export function PublicationCard({ pub }: { pub: Publication }) {
  const sourceColor =
    pub.source === "PubMed"
      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
      : "bg-pink-500/10 text-pink-400 border-pink-500/20";

  return (
    <a
      href={pub.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-white/5 bg-slate-900/40 p-4.5 transition-all duration-300 hover:border-blue-500/30 hover:bg-slate-900 hover:shadow-lg relative overflow-hidden"
    >
      {/* Top badges */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${sourceColor}`}>
          {pub.source || "Literature"}
        </span>
        <ExternalLink className="h-3.5 w-3.5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-white transition-all shrink-0" />
      </div>

      {/* Title */}
      <h4 className="text-xs font-bold text-slate-200 leading-snug group-hover:text-primary transition-colors pr-2">
        {pub.title}
      </h4>

      {/* Abstract excerpt */}
      {pub.abstract && (
        <p className="mt-2 text-[11px] text-slate-400 line-clamp-3 leading-relaxed font-light">
          {pub.abstract}
        </p>
      )}

      {/* Footer details */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/40 flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-light">
        {pub.year && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-600" />
            {pub.year}
          </span>
        )}
        {pub.authors && pub.authors.length > 0 && (
          <span className="flex items-center gap-1 truncate max-w-[65%]">
            <Users className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <span className="truncate">
              {pub.authors.slice(0, 2).join(", ")}
              {pub.authors.length > 2 ? ` +${pub.authors.length - 2}` : ""}
            </span>
          </span>
        )}
      </div>
    </a>
  );
}
