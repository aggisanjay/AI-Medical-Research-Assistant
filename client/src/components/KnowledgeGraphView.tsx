import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Network, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Btn, Chip, Empty, PageHead, Panel, PanelTitle, Skeleton, inputCls } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

const TYPE_COLOR: Record<string, string> = {
  Condition: "#f472b6",
  Medication: "#34d399",
  BiologicalTarget: "#a78bfa",
  ClinicalTrial: "#38bdf8",
  Outcome: "#fbbf24",
};
const colorOf = (t?: string) => TYPE_COLOR[t || ""] ?? "#94a3b8";
const typeLabel = (t?: string) => (t || "Entity").replace(/([a-z])([A-Z])/g, "$1 $2");

const W = 760;
const H = 480;

function layout(nodes: any[], centerId?: string) {
  const pos = new Map<string, { x: number; y: number }>();
  const cx = W / 2, cy = H / 2;
  const center = nodes.find((n) => n.entityId === centerId) ?? nodes[0];
  if (!center) return pos;
  pos.set(center.entityId, { x: cx, y: cy });
  const rest = nodes.filter((n) => n.entityId !== center.entityId);
  const inner = rest.slice(0, 8);
  const outer = rest.slice(8);
  inner.forEach((n, i) => {
    const a = (i / Math.max(1, inner.length)) * Math.PI * 2 - Math.PI / 2;
    pos.set(n.entityId, { x: cx + Math.cos(a) * 150, y: cy + Math.sin(a) * 150 });
  });
  outer.forEach((n, i) => {
    const a = (i / Math.max(1, outer.length)) * Math.PI * 2 - Math.PI / 2 + 0.3;
    pos.set(n.entityId, { x: cx + Math.cos(a) * 225, y: cy + Math.sin(a) * 205 });
  });
  return pos;
}

export function KnowledgeGraphView() {
  const [entities, setEntities] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<any | null>(null);
  const [sub, setSub] = useState<{ nodes: any[]; edges: any[]; contradictions: any[] }>({ nodes: [], edges: [], contradictions: [] });
  const [loading, setLoading] = useState(true);
  const [hot, setHot] = useState<string | null>(null);

  const select = async (e: any) => {
    setSel(e);
    try {
      const res = await api.traverseGraph([e.entityId], 2);
      setSub(res.data);
    } catch (err: any) {
      toast.error(`Failed to traverse graph: ${err.message}`);
    }
  };

  const fetchEntities = async (query = "") => {
    try {
      setLoading(true);
      const res = await api.searchGraphEntities(query);
      setEntities(res.data || []);
      if (res.data?.length > 0 && !sel) select(res.data[0]);
    } catch (err: any) {
      toast.error(`Failed to load knowledge graph: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEntities();
  }, []); // eslint-disable-line

  const pos = useMemo(() => layout(sub.nodes, sel?.entityId), [sub.nodes, sel]);
  const types = useMemo(() => Array.from(new Set(sub.nodes.map((n) => n.type))), [sub.nodes]);
  const linked = (id: string) => !hot || hot === id || sub.edges.some((e) => (e.fromEntityId === hot && e.toEntityId === id) || (e.toEntityId === hot && e.fromEntityId === id));
  const nameOf = (id: string) => sub.nodes.find((n) => n.entityId === id)?.label || id;

  return (
    <div className="view-stagger space-y-5 pb-12">
      <PageHead
        title="Knowledge graph"
        description="Entities and relations extracted from the evidence you have researched. Choose an entity to explore what it connects to."
        actions={<Btn variant="secondary" size="sm" icon={<RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />} onClick={() => fetchEntities(q)}>Refresh</Btn>}
      />

      <div className="grid gap-3.5 lg:grid-cols-12">
        <Panel padded={false} className="flex max-h-[640px] flex-col lg:col-span-4">
          <div className="p-3.5 sm:p-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-white/35" />
              <input value={q} onChange={(e) => { setQ(e.target.value); fetchEntities(e.target.value); }} placeholder="Search entities" aria-label="Search entities" className={cn(inputCls, "pl-9")} />
            </label>
            <p className="mt-2.5 text-[12px] text-white/45">{entities.length} {entities.length === 1 ? "entity" : "entities"}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto border-t border-white/8">
            {loading && entities.length === 0 ? (
              <div className="space-y-2 p-3.5">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : entities.length === 0 ? (
              <Empty icon={Network} title="Nothing here yet" body="Entities appear after investigations extract them from the evidence." />
            ) : (
              <ul className="p-2 space-y-0.5">
                {entities.map((e) => {
                  const on = sel?.entityId === e.entityId;
                  return (
                    <li key={e.entityId}>
                      <button onClick={() => select(e)} aria-pressed={on} className={cn("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors", on ? "bg-white/[0.09]" : "hover:bg-white/[0.05]")}>
                        <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colorOf(e.type), boxShadow: on ? `0 0 10px ${colorOf(e.type)}` : "none" }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] text-white">{e.label || e.name}</span>
                          <span className="block text-[11.5px] text-white/45">{typeLabel(e.type)}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Panel>

        <Panel padded={false} className="lg:col-span-8">
          <div className="px-4 pt-4 sm:px-5 sm:pt-5">
            <PanelTitle
              title={sel ? sel.label || sel.name : "Select an entity"}
              hint={sel ? `${typeLabel(sel.type)} · ${sub.nodes.length} nodes · ${sub.edges.length} relations` : "The graph around it appears here"}
              right={sub.contradictions.length > 0 ? <Chip color="#f87171"><ShieldAlert className="h-3.5 w-3.5" />{sub.contradictions.length} conflicting</Chip> : undefined}
            />
          </div>
          {sub.nodes.length === 0 ? (
            <Empty icon={Network} title="No graph to show" body="Pick an entity from the list to see its neighbourhood." className="py-20" />
          ) : (
            <>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Relationship graph around ${sel?.label || "entity"}`}>
                {sub.edges.map((e) => {
                  const a = pos.get(e.fromEntityId), b = pos.get(e.toEntityId);
                  if (!a || !b) return null;
                  const on = hot && (e.fromEntityId === hot || e.toEntityId === hot);
                  return <line key={e.relationId} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={e.isContradiction ? "#f87171" : on ? "#ffffff" : "rgba(255,255,255,0.18)"} strokeWidth={on ? 1.8 : 1.1} strokeDasharray={e.isContradiction ? "5 4" : undefined} style={{ transition: "all .25s" }} />;
                })}
                {sub.nodes.map((n) => {
                  const p = pos.get(n.entityId);
                  if (!p) return null;
                  const isCenter = n.entityId === sel?.entityId;
                  const c = colorOf(n.type);
                  const dim = !linked(n.entityId);
                  return (
                    <g key={n.entityId} transform={`translate(${p.x} ${p.y})`} onPointerEnter={() => setHot(n.entityId)} onPointerLeave={() => setHot(null)} onClick={() => select(n)} onFocus={() => setHot(n.entityId)} onBlur={() => setHot(null)} tabIndex={0} role="button" aria-label={`${n.label}, ${typeLabel(n.type)}`} className="cursor-pointer outline-none" opacity={dim ? 0.25 : 1} style={{ transition: "opacity .25s" }}>
                      <circle r={isCenter ? 22 : 14} fill={c} fillOpacity={0.22} stroke={c} strokeWidth={isCenter ? 2.5 : 1.8} />
                      <circle r={isCenter ? 7 : 4.5} fill={c} style={{ filter: `drop-shadow(0 0 6px ${c})` }} />
                      <text y={isCenter ? 38 : 28} textAnchor="middle" fontSize={isCenter ? 13 : 11.5} fill="rgba(255,255,255,0.9)" style={{ paintOrder: "stroke", stroke: "#050508", strokeWidth: 4 }}>
                        {String(n.label).length > 22 ? String(n.label).slice(0, 21) + "…" : n.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/8 px-4 py-3 text-[12px] text-white/55 sm:px-5">
                {types.map((t) => <span key={t} className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: colorOf(t) }} />{typeLabel(t)}</span>)}
                <span className="ml-auto flex items-center gap-2"><i className="h-0 w-4 border-t-2 border-dashed border-red-400" />Conflicting evidence</span>
              </div>
            </>
          )}
        </Panel>
      </div>

      {sub.contradictions.length > 0 && (
        <Panel className="border-red-400/25 bg-red-400/[0.04]">
          <PanelTitle title="Conflicting evidence" hint="Findings in the graph that point in opposite directions" right={<AlertTriangle className="h-4 w-4 text-red-300" />} />
          <ul className="space-y-2">
            {sub.contradictions.map((c: any) => (
              <li key={c.relationId} className="flex gap-2.5 text-[13px] leading-relaxed text-red-100/90"><i className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-300" />{c.contradictionNotes || "Opposing findings were identified between trials."}</li>
            ))}
          </ul>
        </Panel>
      )}

      {sub.edges.length > 0 && (
        <Panel padded={false}>
          <div className="px-4 pt-4 sm:px-5 sm:pt-5"><PanelTitle title="Relations" hint="Every connection in the view above" /></div>
          <ul className="divide-y divide-white/8 border-t border-white/8">
            {sub.edges.map((e: any) => (
              <li key={e.relationId} className="px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13px]">
                  <span className="text-white">{nameOf(e.fromEntityId)}</span>
                  <Chip color={e.isContradiction ? "#f87171" : "#38bdf8"} dot={false}>{typeLabel(e.type)}</Chip>
                  <span className="text-white">{nameOf(e.toEntityId)}</span>
                </div>
                {e.evidenceSnippet && <p className="mt-1.5 text-[12px] italic leading-relaxed text-white/45">“{e.evidenceSnippet}”</p>}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
