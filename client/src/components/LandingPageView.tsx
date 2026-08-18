import { 
  Sparkles, Database, Cpu, 
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";

interface Props {
  onSuggest: (query: string) => void;
}

export function LandingPageView({ onSuggest }: Props) {
  const seedQueries = [
    "Latest immunotherapy approaches for stage IV melanoma",
    "Emerging cancer immunotherapy approaches",
    "Latest treatments for Alzheimer's",
    "Long COVID clinical findings"
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-16 text-slate-300">
      
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-6 pt-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-serif font-bold text-base mb-2">
          C
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
          Curalink AI Research Copilot
        </h1>
        
        <p className="text-sm sm:text-base text-slate-400 font-normal max-w-2xl mx-auto leading-relaxed">
          Multi-agent research intelligence for evidence-based decision making.
        </p>

        {/* Call to Action Seed Queries */}
        <div className="pt-6">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-4">
            <Sparkles className="h-3 w-3 text-blue-400" />
            Quick-Start Clinical Investigations
          </div>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
            {seedQueries.map((q) => (
              <button
                key={q}
                onClick={() => onSuggest(q)}
                className="group flex items-start gap-2.5 rounded-2xl border border-white/8 bg-[#0a0a0a] hover:border-white/20 p-4 text-xs transition-all duration-200 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                <span className="text-slate-300 group-hover:text-white transition-colors">{q}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="space-y-6">
        <div className="text-center border-b border-white/8 pb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Core Capabilities</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Unified Knowledge Base",
              desc: "Simultaneous federated searches across PubMed, OpenAlex, and ClinicalTrials.gov.",
              icon: Database
            },
            {
              title: "Scoring & Ranking Engine",
              desc: "100-point multi-parametric relevance scoring based on publication year, author impact, and title congruence.",
              icon: Cpu
            },
            {
              title: "Executive Summarization",
              desc: "CEO-ready strategic briefings with structured opportunities, risks, and recommendations.",
              icon: FileSpreadsheet
            }
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="editorial-card p-6 border border-white/8 space-y-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-serif font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. AGENT WORKFLOW */}
      <section className="grid md:grid-cols-2 gap-8 items-center border-t border-white/8 pt-12">
        <div className="space-y-4">
          <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">
            Multi-Agent Reasoning
          </span>
          <h3 className="text-2xl font-serif font-bold text-white">Automated Agent Pipelines</h3>
          <p className="text-xs leading-relaxed text-slate-400 font-normal">
            Curalink operates an orchestrated pipeline of three specialized, consecutive agents:
          </p>
          <ul className="space-y-3 text-xs font-normal text-slate-300">
            <li className="flex gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-white shrink-0 mt-0.5" />
              <span><strong>Research Agent</strong>: Expands queries and conducts parallel database searches.</span>
            </li>
            <li className="flex gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-white shrink-0 mt-0.5" />
              <span><strong>Evidence Agent</strong>: Ranks citations, validates sources, and scores evidence strength.</span>
            </li>
            <li className="flex gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-white shrink-0 mt-0.5" />
              <span><strong>Summary Agent</strong>: Synthesizes data into structured research briefs.</span>
            </li>
          </ul>
        </div>
        <div className="editorial-card p-6 border border-white/8 space-y-4 text-xs font-normal">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider pb-2 border-b border-white/8">
            <span>Orchestration Diagnostics</span>
            <span className="text-emerald-400">Online</span>
          </div>
          <div className="space-y-2.5">
            {[
              { name: "Research Agent", time: "320ms", status: "Active" },
              { name: "Evidence Agent", time: "110ms", status: "Active" },
              { name: "Summary Agent", time: "1.45s", status: "Active" }
            ].map((a, i) => (
              <div key={i} className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/8 font-mono text-[10px]">
                <span className="text-white">{a.name}</span>
                <span className="text-slate-500">{a.time} ({a.status})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section className="text-center border-t border-white/8 pt-12 pb-6 space-y-3">
        <h3 className="text-lg font-serif font-bold text-white">
          Ready to Begin Your Investigation?
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Input your query above or click one of the quick-start query suggestions to test Curalink's multi-agent compilation.
        </p>
      </section>

    </div>
  );
}
