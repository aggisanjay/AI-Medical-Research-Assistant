import { Calendar, ExternalLink, Users } from "lucide-react";
import type { Publication } from "@/lib/api";
import { Chip, sourceColor } from "@/components/ui/kit";

export function PublicationCard({ pub }: { pub: Publication }) {
  const color = sourceColor(pub.source);
  const rel = typeof pub.relevanceScore === "number" ? Math.round(pub.relevanceScore <= 1 ? pub.relevanceScore * 100 : Math.min(100, pub.relevanceScore)) : null;
  return (
    <a href={pub.url} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06]">
      <div className="mb-2.5 flex items-center justify-between gap-2.5">
        <Chip color={color}>{pub.source || "Literature"}</Chip>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/30 transition-colors group-hover:text-white" />
      </div>
      <h4 className="text-[13.5px] font-medium leading-snug text-white transition-colors group-hover:text-sky-200">{pub.title}</h4>
      {pub.abstract && <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-white/55">{pub.abstract}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-x-3.5 gap-y-1.5 pt-3 text-[11.5px] text-white/45">
        {pub.year && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {pub.year}
          </span>
        )}
        {pub.authors && pub.authors.length > 0 && (
          <span className="flex min-w-0 items-center gap-1.5">
            <Users className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {pub.authors.slice(0, 2).join(", ")}
              {pub.authors.length > 2 ? ` +${pub.authors.length - 2}` : ""}
            </span>
          </span>
        )}
        {rel !== null && (
          <span className="ml-auto flex items-center gap-2" title="Relevance to your question">
            <span className="h-1.5 w-12 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-sky-300" style={{ width: `${rel}%` }} />
            </span>
            <span className="tabular-nums text-white/60">{rel}%</span>
          </span>
        )}
      </div>
    </a>
  );
}
