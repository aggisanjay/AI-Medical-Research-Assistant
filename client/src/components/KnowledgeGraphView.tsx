import { useState, useEffect } from "react";
import { 
  Network, Search, AlertTriangle, ArrowRight, ShieldAlert, 
  RefreshCw, CheckCircle2, ChevronRight, Layers, Database
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function KnowledgeGraphView() {
  const [entities, setEntities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [subgraph, setSubgraph] = useState<{ nodes: any[]; edges: any[]; contradictions: any[] }>({
    nodes: [],
    edges: [],
    contradictions: []
  });
  const [loading, setLoading] = useState(true);

  const fetchEntities = async (query = "") => {
    try {
      setLoading(true);
      const res = await api.searchGraphEntities(query);
      setEntities(res.data || []);
      if (res.data?.length > 0 && !selectedEntity) {
        handleSelectEntity(res.data[0]);
      }
    } catch (err: any) {
      toast.error(`Failed to load knowledge graph: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEntity = async (entity: any) => {
    setSelectedEntity(entity);
    try {
      const res = await api.traverseGraph([entity.entityId], 2);
      setSubgraph(res.data);
    } catch (err: any) {
      toast.error(`Failed to traverse graph: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Condition":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "Medication":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "BiologicalTarget":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "ClinicalTrial":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "Outcome":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-white/10";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Network className="h-4 w-4" /> Biomedical Knowledge Graph Engine
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mt-1">Clinical Entity & Relationship Graph</h1>
          <p className="text-xs text-slate-400 mt-1">
            Typed ontology nodes, multi-hop evidence pathways, and discordant study contradiction detection.
          </p>
        </div>
        <button
          onClick={() => fetchEntities(searchQuery)}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-slate-300 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search clinical entities, targets, drugs, trials..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            fetchEntities(e.target.value);
          }}
          className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
        />
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Entities Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Entities in Ontology ({entities.length})
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {entities.map((ent) => {
              const isSelected = selectedEntity?.entityId === ent.entityId;
              return (
                <div
                  key={ent.entityId}
                  onClick={() => handleSelectEntity(ent)}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all duration-200 ${
                    isSelected
                      ? "bg-emerald-500/[0.08] border-emerald-500/40"
                      : "bg-white/[0.02] border-white/8 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">{ent.label}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getTypeColor(ent.type)}`}>
                      {ent.type}
                    </span>
                  </div>
                  {ent.aliases?.length > 0 && (
                    <div className="text-[11px] text-slate-400 mt-1">
                      Aliases: {ent.aliases.slice(0, 2).join(", ")}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ent.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traversal & Contradictions (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedEntity && (
            <div className="rounded-xl bg-white/[0.02] border border-white/8 p-5 space-y-4">
              <div className="flex items-start justify-between border-b border-white/8 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedEntity.label}</h2>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getTypeColor(selectedEntity.type)}`}>
                      {selectedEntity.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedEntity.description}</p>
                </div>
              </div>

              {/* Contradiction Alert Card */}
              {subgraph.contradictions?.length > 0 && (
                <div className="rounded-xl bg-amber-500/[0.08] border border-amber-500/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4" /> Discordant Medical Evidence Detected
                  </div>
                  {subgraph.contradictions.map((c: any) => (
                    <div key={c.relationId} className="text-xs text-amber-200/90 leading-relaxed">
                      • {c.contradictionNotes || "Opposing findings identified between trials in knowledge graph."}
                    </div>
                  ))}
                </div>
              )}

              {/* Traversed Multi-Hop Relationships */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Evidence Relationship Pathways ({subgraph.edges?.length || 0})
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {subgraph.edges?.map((edge: any) => {
                    const fromNode = subgraph.nodes.find((n: any) => n.entityId === edge.fromEntityId);
                    const toNode = subgraph.nodes.find((n: any) => n.entityId === edge.toEntityId);
                    return (
                      <div
                        key={edge.relationId}
                        className={`rounded-xl border p-3.5 space-y-1.5 ${
                          edge.isContradiction
                            ? "bg-rose-500/[0.04] border-rose-500/30"
                            : "bg-black/40 border-white/8"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="font-bold text-white">{fromNode?.label || edge.fromEntityId}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            edge.isContradiction ? "text-rose-400 bg-rose-500/10" : "text-teal-400 bg-teal-500/10"
                          }`}>
                            {edge.type}
                          </span>
                          <ArrowRight className="h-3 w-3 text-slate-500" />
                          <span className="font-bold text-white">{toNode?.label || edge.toEntityId}</span>
                        </div>
                        {edge.evidenceSnippet && (
                          <div className="text-[11px] text-slate-400 italic bg-black/60 p-2 rounded border border-white/5">
                            "{edge.evidenceSnippet}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
