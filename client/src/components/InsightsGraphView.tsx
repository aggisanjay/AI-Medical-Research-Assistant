import { useState } from "react";
import { 
  GitCommit, Activity, ShieldAlert, Sparkles, 
  HelpCircle, ChevronRight, CheckCircle2 
} from "lucide-react";

export function InsightsGraphView() {
  const [selectedNode, setSelectedNode] = useState<string | null>("EGFR L858R");
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);

  // Nodes for the mock SVG knowledge graph
  const nodes = [
    { id: "Lung Cancer", x: 120, y: 150, r: 24, type: "disease", label: "Lung Cancer" },
    { id: "EGFR L858R", x: 260, y: 100, r: 20, type: "mutation", label: "EGFR L858R" },
    { id: "EGFR T790M", x: 260, y: 200, r: 20, type: "mutation", label: "EGFR T790M" },
    { id: "Osimertinib", x: 420, y: 80, r: 18, type: "drug", label: "Osimertinib" },
    { id: "Afatinib", x: 420, y: 150, r: 18, type: "drug", label: "Afatinib" },
    { id: "Gefitinib", x: 420, y: 220, r: 18, type: "drug", label: "Gefitinib" },
  ];

  const links = [
    { source: "Lung Cancer", target: "EGFR L858R", confidence: 95, desc: "Found in 40% of Asian NSCLC" },
    { source: "Lung Cancer", target: "EGFR T790M", confidence: 85, desc: "Secondary resistance pathway" },
    { source: "EGFR L858R", target: "Osimertinib", confidence: 98, desc: "First-line preferred inhibitor" },
    { source: "EGFR L858R", target: "Gefitinib", confidence: 65, desc: "First-generation reversible TKI" },
    { source: "EGFR T790M", target: "Osimertinib", confidence: 90, desc: "Overcomes T790M gatekeeper block" },
    { source: "EGFR L858R", target: "Afatinib", confidence: 75, desc: "Second-generation irreversible TKI" },
  ];

  const nodeColors: Record<string, string> = {
    disease: "fill-blue-500/20 stroke-blue-500 hover:fill-blue-500/40",
    mutation: "fill-purple-500/20 stroke-purple-500 hover:fill-purple-500/40",
    drug: "fill-emerald-500/20 stroke-emerald-500 hover:fill-emerald-500/40",
  };

  const textColors: Record<string, string> = {
    disease: "text-blue-400 font-bold",
    mutation: "text-purple-400 font-semibold",
    drug: "text-emerald-400 font-semibold",
  };

  const getActiveNodeInfo = () => {
    const node = nodes.find(n => n.id === selectedNode);
    if (!node) return null;
    
    // Find linked elements
    const connections = links.filter(l => l.source === selectedNode || l.target === selectedNode);
    return {
      ...node,
      connections
    };
  };

  const activeInfo = getActiveNodeInfo();

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">
          AI Insights Graph
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Explore semantic associations between conditions, gene mutations, and targeted pharmaceutical therapeutics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Knowledge Graph Card (SVG Visualisation) */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[400px]">
          
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
              Interactive Relationship Map
            </h3>
            
            {/* Filter Slider */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500">Confidence Threshold:</span>
              <input 
                type="range" 
                min="50" 
                max="95" 
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                className="w-20 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] font-semibold text-cyan-400">{confidenceThreshold}%+</span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative flex-1 flex items-center justify-center py-6 bg-slate-950/20 rounded-xl my-4 overflow-hidden border border-slate-900">
            <svg width="550" height="320" className="max-w-full overflow-visible">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                </marker>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Draw Link Lines */}
              {links.map((link, idx) => {
                const sourceNode = nodes.find(n => n.id === link.source);
                const targetNode = nodes.find(n => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                const isFiltered = link.confidence < confidenceThreshold;
                const isSelected = selectedNode === link.source || selectedNode === link.target;

                return (
                  <g key={idx} className="transition-all duration-300">
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isSelected ? "#22d3ee" : "url(#lineGrad)"}
                      strokeWidth={isSelected ? 2 : 1.2}
                      strokeDasharray={isSelected ? "4,4" : undefined}
                      opacity={isFiltered ? 0.05 : isSelected ? 0.9 : 0.4}
                      markerEnd="url(#arrow)"
                    />
                    
                    {/* Tiny link labels on hover */}
                    {!isFiltered && isSelected && (
                      <rect 
                        x={(sourceNode.x + targetNode.x)/2 - 50}
                        y={(sourceNode.y + targetNode.y)/2 - 8}
                        width="100"
                        height="16"
                        rx="4"
                        className="fill-slate-950 stroke-slate-800"
                        strokeWidth="0.5"
                      />
                    )}
                    {!isFiltered && isSelected && (
                      <text
                        x={(sourceNode.x + targetNode.x)/2}
                        y={(sourceNode.y + targetNode.y)/2 + 4}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="8"
                        className="font-light"
                      >
                        {link.confidence}% Conf.
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {nodes.map((node) => {
                const isSelected = selectedNode === node.id;
                const colorClass = nodeColors[node.type];
                
                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node.id)}
                    className="cursor-pointer group"
                  >
                    {/* Ring for selection */}
                    {isSelected && (
                      <circle
                        r={node.r + 4}
                        className="fill-none stroke-cyan-400 stroke-1 animate-pulse"
                      />
                    )}
                    
                    {/* Core circle */}
                    <circle
                      r={node.r}
                      className={`stroke-[1.5] transition-all duration-300 ${colorClass}`}
                    />

                    {/* Label */}
                    <text
                      textAnchor="middle"
                      y="4"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight={isSelected ? "bold" : "normal"}
                      className="select-none pointer-events-none"
                    >
                      {node.id.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Node Legend */}
          <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 uppercase tracking-widest border-t border-slate-900 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500/20 border border-blue-500" />
              <span>Disease</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500/20 border border-purple-500" />
              <span>Mutations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/20 border border-emerald-500" />
              <span>Target TKIs</span>
            </div>
          </div>

        </div>

        {/* Selected Entity Details Panel */}
        <div className="lg:col-span-1 glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          {activeInfo ? (
            <div className="space-y-5">
              <div className="border-b border-white/5 pb-3">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 uppercase tracking-wide">
                  Selected Entity
                </span>
                <h3 className={`text-base font-bold font-display mt-2 ${textColors[activeInfo.type]}`}>
                  {activeInfo.id}
                </h3>
              </div>

              {/* Entity description */}
              <div className="space-y-4">
                <div className="text-xs font-light text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-200">Biomarker Actionability:</span> 
                  {activeInfo.type === "mutation" && " Identified as primary oncogenic driver. Sensitivity matches standard-of-care TKIs."}
                  {activeInfo.type === "disease" && " Primary clinical diagnosis. Characterized by cellular proliferation within bronchial epithelium."}
                  {activeInfo.type === "drug" && " Small-molecule tyrosine kinase inhibitor targeting EGFR phosphorylation domains."}
                </div>

                {/* Connections section */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Pathway Mappings ({activeInfo.connections.length})
                  </div>
                  
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {activeInfo.connections.map((c, idx) => {
                      const opposite = c.source === activeInfo.id ? c.target : c.source;
                      return (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-900/60 text-xs flex flex-col gap-1 hover:border-slate-800 transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-200">{opposite}</span>
                            <span className="text-[10px] text-cyan-400 font-semibold">{c.confidence}% Match</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-light">{c.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="text-center my-auto py-12 space-y-3">
              <HelpCircle className="h-9 w-9 text-slate-650 mx-auto" />
              <h4 className="text-xs font-bold text-slate-400">No entity selected</h4>
              <p className="text-[11px] text-slate-500 font-light max-w-[180px] mx-auto leading-relaxed">
                Click any node in the relationship graph to explore clinical pathways.
              </p>
            </div>
          )}

          <div className="border-t border-white/5 pt-4 mt-4">
            <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-200 transition-all">
              <GitCommit className="h-4 w-4 text-cyan-400" />
              Export Pathway Map
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
