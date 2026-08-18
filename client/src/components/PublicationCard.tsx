import { ExternalLink, Calendar, Users } from "lucide-react";
import type { Publication } from "@/lib/api";

export function PublicationCard({ pub }: { pub: Publication }) {
  return (
    <a
      href={pub.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-3xl border border-white/8 bg-[#0a0a0a] p-5 transition-all duration-200 hover:border-white/20 hover:bg-[#121212] relative overflow-hidden"
    >
      {/* Top badges */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-white">
          {pub.source || "Literature"}
        </span>
        <ExternalLink className="h-3.5 w-3.5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-white transition-all shrink-0" />
      </div>

      {/* Title */}
      <h4 className="text-xs font-serif font-bold text-white leading-snug group-hover:text-[#2563EB] transition-colors pr-2">
        {pub.title}
      </h4>

      {/* Abstract excerpt */}
      {pub.abstract && (
        <p className="mt-2 text-[11px] text-slate-400 line-clamp-3 leading-relaxed font-normal">
          {pub.abstract}
        </p>
      )}

      {/* Footer details */}
      <div className="mt-4 pt-3.5 border-t border-white/8 flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-normal">
        {pub.year && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            {pub.year}
          </span>
        )}
        {pub.authors && pub.authors.length > 0 && (
          <span className="flex items-center gap-1 truncate max-w-[65%]">
            <Users className="h-3.5 w-3.5 text-slate-500 shrink-0" />
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
