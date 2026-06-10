import React from "react";
import { 
  Sparkles, ShieldCheck, Zap, Database, Cpu, 
  FileSearch, Activity, LayoutGrid, CheckCircle2,
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
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-16 animate-fade-in text-slate-350">
      
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-6 pt-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl mb-2 pulse-cyan-glow">
          <Activity className="h-6 w-6" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
          Curalink <span className="text-gradient-primary">AI Research Copilot</span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
          "Multi-Agent Research Intelligence for Evidence-Based Decision Making"
        </p>

        {/* Call to Action Seed Queries */}
        <div className="pt-6">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            Quick-Start Clinical Investigations
          </div>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
            {seedQueries.map((q) => (
              <button
                key={q}
                onClick={() => onSuggest(q)}
                className="group flex items-start gap-2.5 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-900 hover:border-blue-500/30 p-3.5 text-xs hover:shadow-lg transition-all duration-300"
              >
                <Sparkles className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                <span className="text-slate-300 group-hover:text-white transition-colors">{q}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="space-y-6">
        <div className="text-center border-b border-white/5 pb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-display">Core Capabilities</h2>
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
              <div key={i} className="glass-card p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{feat.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. AGENT WORKFLOW */}
      <section className="grid md:grid-cols-2 gap-8 items-center border-t border-white/5 pt-12">
        <div className="space-y-4">
          <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            Multi-Agent Reasoning
          </span>
          <h3 className="text-lg font-bold text-white font-display">Automated Agent Pipelines</h3>
          <p className="text-xs leading-relaxed text-slate-400 font-light">
            Curalink operates an orchestrated pipeline of three specialized, consecutive agents:
          </p>
          <ul className="space-y-3 text-xs font-light text-slate-350">
            <li className="flex gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-blue-400 shrink-0" />
              <span><strong>Research Agent</strong>: Expands queries and conducts parallel database searches.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
              <span><strong>Evidence Agent</strong>: Ranks citations, validates sources, and scores evidence strength.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              <span><strong>Summary Agent</strong>: Synthesizes data into structured research briefs.</span>
            </li>
          </ul>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-slate-950/20 space-y-4 text-xs font-light">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider pb-2 border-b border-white/5">
            <span>Orchestration Diagnostics</span>
            <span className="text-emerald-400">Online</span>
          </div>
          <div className="space-y-3">
            {[
              { name: "Research Agent", time: "320ms", status: "Active" },
              { name: "Evidence Agent", time: "110ms", status: "Active" },
              { name: "Summary Agent", time: "1.45s", status: "Active" }
            ].map((a, i) => (
              <div key={i} className="flex justify-between p-2 rounded bg-slate-900/30 border border-white/5 font-mono text-[10px]">
                <span className="text-slate-300">{a.name}</span>
                <span className="text-slate-500">{a.time} ({a.status})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DOCUMENT INTELLIGENCE */}
      <section className="grid md:grid-cols-2 gap-8 items-center border-t border-white/5 pt-12">
        <div className="order-2 md:order-1 glass-card p-5 rounded-2xl border border-white/5 bg-slate-950/20 space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">RAG Semantic Store</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400 font-light">
            Uploaded clinical reports, genomic panel results, or institutional guidelines are parsed, chunked, and embedded to serve as local RAG context.
          </p>
          <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between text-xs">
            <span className="font-mono text-purple-300">patient_case_profile.pdf</span>
            <span className="text-[10px] text-slate-500">24 chunks ingested</span>
          </div>
        </div>
        <div className="order-1 md:order-2 space-y-4">
          <span className="text-[9px] uppercase font-bold tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            Document Ingestion
          </span>
          <h3 className="text-lg font-bold text-white font-display">Document Intelligence</h3>
          <p className="text-xs leading-relaxed text-slate-400 font-light">
            Upload institutional standards or case documentation to immediately ground summaries. Ingested datasets are securely partitioned using Clerk JWT user scopes.
          </p>
        </div>
      </section>

      {/* 5. EXECUTIVE MODE */}
      <section className="grid md:grid-cols-2 gap-8 items-center border-t border-white/5 pt-12">
        <div className="space-y-4">
          <span className="text-[9px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            Strategic Mode
          </span>
          <h3 className="text-lg font-bold text-white font-display">Executive Mode</h3>
          <p className="text-xs leading-relaxed text-slate-400 font-light">
            Diverges from academic reporting to generate high-level strategic summaries focusing on opportunities, clinical risks, and recommended actions.
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-blue-950/5 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white font-display">Executive Brief</span>
            <span className="text-blue-400 font-mono text-[9px]">CEO Persona</span>
          </div>
          <div className="space-y-1 bg-slate-950/40 p-2.5 rounded border border-white/5 font-mono text-[10px] text-slate-400">
            <div><strong>Findings:</strong> Anti-PD-1 efficacy confirmed...</div>
            <div><strong>Risks:</strong> Mutation resistance challenges...</div>
            <div><strong>Actions:</strong> Expand local trial cohorts...</div>
          </div>
        </div>
      </section>

      {/* 6. RESEARCH ANALYTICS */}
      <section className="grid md:grid-cols-2 gap-8 items-center border-t border-white/5 pt-12">
        <div className="order-2 md:order-1 glass-card p-5 rounded-2xl border border-white/5 bg-slate-950/20 space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visual Insights</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400 font-light">
            Frontend analytics dashboard widgets render charts of agent latency, source databases, and publication trends.
          </p>
          <div className="h-16 w-full flex items-end gap-1.5 px-2 bg-slate-900/40 rounded-xl border border-white/5">
            {[40, 70, 50, 90, 60, 80, 75].map((val, idx) => (
              <div 
                key={idx} 
                className="bg-blue-600/60 rounded-t w-full transition-all duration-500 hover:bg-blue-500" 
                style={{ height: `${val}%` }} 
              />
            ))}
          </div>
        </div>
        <div className="order-1 md:order-2 space-y-4">
          <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Analytics Summary
          </span>
          <h3 className="text-lg font-bold text-white font-display">Research Analytics</h3>
          <p className="text-xs leading-relaxed text-slate-400 font-light">
            Dynamically aggregates metadata across all sessions. Review database totals and distribution timelines to evaluate research activity.
          </p>
        </div>
      </section>

      {/* 7. CALL TO ACTION */}
      <section className="text-center border-t border-white/5 pt-12 pb-6 space-y-4">
        <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
          Ready to Begin Your Investigation?
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Input your query above or click one of the quick-start query suggestions to test Curalink's multi-agent compilation.
        </p>
      </section>

    </div>
  );
}
