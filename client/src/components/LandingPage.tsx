import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useUser, useClerk } from "@clerk/react";
import { 
  Activity, ShieldCheck, Zap, Database, Cpu, 
  FileSearch, Sparkles, LayoutGrid, CheckCircle2, 
  FileSpreadsheet, ArrowRight, Play, FileText, Check, 
  Server, BarChart3, Brain, ArrowUpRight, ChevronRight,
  TrendingUp, Globe, BookOpen, Layers
} from "lucide-react";

export function LandingPage() {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const [activeAgentTab, setActiveAgentTab] = useState(0);
  const [executiveMode, setExecutiveMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // Auto-rotate agent workflow visualizer tabs
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAgentTab((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Demo step simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleScrollToDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("product-demo")?.scrollIntoView({ behavior: "smooth" });
  };

  const trustStack = [
    { name: "PubMed", desc: "NIH library database federation", icon: BookOpen, color: "text-purple-400" },
    { name: "OpenAlex", desc: "Global index of scholarly papers", icon: Globe, color: "text-pink-400" },
    { name: "ClinicalTrials.gov", desc: "Registry of human clinical studies", icon: Activity, color: "text-emerald-400" },
    { name: "Clerk Auth", desc: "Enterprise JWT identity scope", icon: ShieldCheck, color: "text-blue-400" },
    { name: "Vite + React", desc: "High-performance SPA engine", icon: Zap, color: "text-cyan-400" },
    { name: "Tailwind v4", desc: "Modern styling framework", icon: LayoutGrid, color: "text-indigo-400" }
  ];

  const problemPoints = [
    {
      title: "Data Fragmentation",
      desc: "Clinical trials, published papers, and genomic indexes are isolated across distinct endpoints, stalling critical research aggregation."
    },
    {
      title: "Citation Noise",
      desc: "Querying raw databases returns thousands of results. Researchers spend over 70% of their workflows manually sorting low-impact citations."
    },
    {
      title: "Lack of Contextual Ingestion",
      desc: "Generic LLMs cannot reference specific patient charts or local institutional guidelines safely under HIPAA bounds."
    }
  ];

  const coreFeatures = [
    {
      title: "Federated Query Expansion",
      desc: "Execute queries simultaneously across PubMed, OpenAlex, and ClinicalTrials.gov with automated medical synonym expansion.",
      icon: Database
    },
    {
      title: "Multi-Parametric Score Engine",
      desc: "Our custom 100-point algorithm ranks papers based on publication timeline recency, journal impact factor, and exact title congruence.",
      icon: Cpu
    },
    {
      title: "RAG Semantic Store",
      desc: "Upload institutional standards or case records to partition local vector databases, grounding summarization in factual clinical files.",
      icon: FileSearch
    },
    {
      title: "Executive Synthesis Mode",
      desc: "Generate high-level strategic briefings, clinical risks, and recommended actions customized for medical directors and principal investigators.",
      icon: FileSpreadsheet
    },
    {
      title: "HIPAA Compliant Sandbox",
      desc: "All queries, RAG data stores, and user context are isolated via Clerk session token auth, keeping client-side operations highly secure.",
      icon: ShieldCheck
    },
    {
      title: "Observability Pipeline",
      desc: "Track execution times, agent telemetry logs, and query distribution metrics live as they happen in our analytics database.",
      icon: BarChart3
    }
  ];

  const agentSteps = [
    {
      name: "Research Agent",
      role: "Federated Database Aggregator",
      status: "Active",
      duration: "320ms",
      details: "Queries PubMed, OpenAlex, and ClinicalTrials.gov concurrently. Normalizes data structures and fetches absolute metadata.",
      color: "border-blue-500 text-blue-400",
      bg: "bg-blue-950/20",
      actions: ["Translates query synonyms", "Aggregates publication metrics", "Normalizes structural records"]
    },
    {
      name: "Evidence Agent",
      role: "Parametric Scoring & Selection",
      status: "Active",
      duration: "110ms",
      details: "Evaluates citations against relevance parameters. Scores each study from 0 to 100 based on recency, relevance, and journal impact.",
      color: "border-cyan-500 text-cyan-400",
      bg: "bg-cyan-950/20",
      actions: ["Computes 100-point scores", "Filters outlying documents", "Injects RAG vector matches"]
    },
    {
      name: "Summary Agent",
      role: "Generative Abstract Synthesizer",
      status: "Active",
      duration: "1.45s",
      details: "Synthesizes final research reports. Implements academic precision or pivots to executive-focused strategic findings.",
      color: "border-purple-500 text-purple-400",
      bg: "bg-purple-950/20",
      actions: ["Extracts clinical insights", "Formulates actionable risks", "Compiles executive briefings"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-200 overflow-x-hidden relative">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[800px] right-1/4 w-[600px] h-[600px] rounded-full bg-cyan-600/5 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[200px] left-1/3 w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[160px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="border-b border-white/5 bg-slate-950/45 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] pulse-cyan-glow">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white font-display">Curalink</span>
              <span className="ml-1.5 text-[9px] font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-950/50 border border-cyan-800/30 px-1.5 py-0.5 rounded">
                Enterprise AI
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Platform Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Agent Pipelines</a>
            <a href="#executive" className="hover:text-white transition-colors">Executive Synthesizer</a>
            <a href="#product-demo" className="hover:text-white transition-colors">Product Preview</a>
          </nav>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <Link
                to="/dashboard"
                className="text-xs font-semibold text-slate-350 hover:text-white transition-colors"
              >
                Workspace
              </Link>
            ) : (
              <button
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                className="text-xs font-semibold text-slate-350 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
            {isSignedIn ? (
              <Link
                to="/dashboard"
                className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-xs font-semibold text-white shadow-[0_4px_15px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <button
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-xs font-semibold text-white shadow-[0_4px_15px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-white/5 text-[11px] font-semibold text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Next-Generation Clinical Research Workspace</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-display max-w-4xl mx-auto leading-[1.1]">
          AI Research Copilot for <span className="text-gradient-primary">Evidence-Based</span> Decision Making
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-400 font-light max-w-3xl mx-auto leading-relaxed">
          Multi-agent AI workflows, document intelligence, evidence ranking, and executive summaries that transform complex research into actionable insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {isSignedIn ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-sm font-semibold text-white shadow-[0_4px_25px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_30px_rgba(37,99,235,0.45)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-sm font-semibold text-white shadow-[0_4px_25px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_30px_rgba(37,99,235,0.45)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <a
            href="#product-demo"
            onClick={handleScrollToDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-slate-800 hover:bg-slate-900/50 text-sm font-semibold text-slate-350 hover:text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="h-4 w-4 text-cyan-400 shrink-0 fill-cyan-400/10" />
            <span>View Interactive Demo</span>
          </a>
        </div>
      </section>

      {/* 2. TRUST / TECHNOLOGY STACK */}
      <section className="py-12 border-y border-white/5 bg-slate-950/20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] uppercase font-bold text-slate-500 text-center tracking-widest mb-8">
            Federated Scientific Indexes & Tech Stack Integrations
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {trustStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <div 
                  key={tech.name} 
                  className="glass-card p-4 rounded-xl border border-white/5 hover:border-slate-800 hover:bg-slate-900/30 flex flex-col items-center text-center transition-all duration-300 group"
                >
                  <Icon className={`h-6 w-6 ${tech.color} mb-2.5 transition-transform duration-300 group-hover:scale-110`} />
                  <span className="text-xs font-bold text-slate-200">{tech.name}</span>
                  <span className="text-[9px] text-slate-500 font-light mt-1 leading-normal">{tech.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. PROBLEM STATEMENT */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-red-400 bg-red-950/20 border border-red-900/30 px-3 py-1 rounded-full">
            The Current Bottleneck
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            The Medical Research Bottleneck
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
            Medical discovery happens fast, but human consolidation is slow. Research workspaces are fragmented.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-4">
          {problemPoints.map((item, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-red-950/40 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-600 to-orange-500 opacity-20 group-hover:opacity-60 transition-opacity" />
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="h-5 w-5 rounded-lg bg-red-950/30 text-red-400 flex items-center justify-center font-mono text-[10px]">
                  0{idx + 1}
                </span>
                {item.title}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CORE FEATURES */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto space-y-12 border-t border-white/5">
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/30 border border-cyan-800/30 px-3 py-1 rounded-full">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Core Features of Curalink
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
            A secure clinical research sandbox tailored for developers, clinical investigators, and medical innovators.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {coreFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div 
                key={feat.title} 
                className="glass-card p-6 rounded-2xl border border-white/5 hover:border-slate-800 hover:bg-slate-900/20 space-y-4 hover:shadow-elegant transition-all duration-300 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform duration-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. MULTI-AGENT WORKFLOW */}
      <section id="workflow" className="py-20 px-6 max-w-7xl mx-auto space-y-12 border-t border-white/5">
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-blue-450 text-blue-400 bg-blue-950/30 border border-blue-900/30 px-3 py-1 rounded-full">
            Pipeline Orchestration
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Orchestrated Multi-Agent Reasoning
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
            Watch how specialized autonomous sub-agents operate consecutively to build structured findings.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch pt-4">
          {/* Timeline tabs */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-4">
            {agentSteps.map((agent, index) => {
              const active = activeAgentTab === index;
              return (
                <button
                  key={agent.name}
                  onClick={() => setActiveAgentTab(index)}
                  className={`w-full flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-300 ${
                    active 
                      ? "bg-slate-900 border-blue-500/30 shadow-[0_4px_20px_rgba(37,99,235,0.15)]" 
                      : "bg-slate-950/40 border-white/5 opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 font-mono text-xs font-semibold ${
                    active ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-900 border-white/10 text-slate-400"
                  }`}>
                    0{index + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{agent.name}</h4>
                    <p className="text-[10px] text-cyan-400 font-mono mt-0.5">{agent.role}</p>
                    <p className="text-xs text-slate-400 mt-2 font-light line-clamp-2">{agent.details}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Visualization panel */}
          <div className="lg:col-span-7">
            <div className="glass-card p-6 rounded-2xl border border-white/5 h-full flex flex-col justify-between space-y-6 relative overflow-hidden bg-slate-950/20">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-blue-500/5 blur-[80px]" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-350 font-mono">
                    Agent Context Diagnostics
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
                    Orchestrator Active
                  </span>
                </div>
              </div>

              {/* Active Agent Box */}
              <div className={`p-6 rounded-2xl border ${agentSteps[activeAgentTab].color} ${agentSteps[activeAgentTab].bg} transition-all duration-500 space-y-4`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">
                      {agentSteps[activeAgentTab].name}
                    </h3>
                    <span className="text-[10px] font-mono opacity-80">{agentSteps[activeAgentTab].role}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono bg-slate-950/45 px-2 py-0.5 rounded border border-white/5">
                    <span>Latency:</span>
                    <span className="text-white font-bold">{agentSteps[activeAgentTab].duration}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {agentSteps[activeAgentTab].details}
                </p>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                    Pipeline Execution Actions:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
                    {agentSteps[activeAgentTab].actions.map((act, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-slate-950/30 p-1.5 rounded border border-white/5">
                        <Check className="h-3 w-3 text-cyan-400" />
                        <span className="truncate">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center py-2 bg-slate-950/40 rounded-xl border border-white/5 text-[9px] text-slate-400 font-mono">
                <Server className="h-3.5 w-3.5 text-slate-500" />
                <span>Synchronized with NIH endpoints via clerk_session_token_exchange</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DOCUMENT INTELLIGENCE */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 bg-purple-950/30 border border-purple-900/30 px-3 py-1 rounded-full">
              Structured RAG
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
              Document Intelligence & secure RAG context
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
              Ground your multi-agent query compiler by uploading local hospital files, trial results, or private clinical documentation. Curalink parses and chunks documents securely, isolating vectors by individual Clerk scopes to assure absolute tenant isolation.
            </p>
            <div className="space-y-3 text-xs font-light text-slate-300">
              <div className="flex gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-purple-400 shrink-0" />
                <span>Automatic PDF text extraction and semantic chunking.</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-purple-400 shrink-0" />
                <span>Secure local data injection to override generic model parameters.</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-purple-400 shrink-0" />
                <span>JWT-bound Clerk tenancy logic prohibiting multi-tenant leakage.</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 bg-slate-950/20 relative">
            <div className="absolute top-0 left-0 w-[150px] h-[150px] rounded-full bg-purple-500/5 blur-[60px]" />
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-455 text-slate-400 font-mono">
                Ingested Clinical Repositories
              </span>
              <span className="text-[9px] bg-purple-950/60 text-purple-300 px-2 py-0.5 rounded border border-purple-800/30 font-mono">
                SECURE STORAGE
              </span>
            </div>
            
            <div className="space-y-3">
              {[
                { name: "patient_melanoma_panel_final.pdf", chunks: 28, status: "Ingested" },
                { name: "hosp_immunotherapy_protocol_v4.pdf", chunks: 42, status: "Ingested" },
                { name: "mutational_cohort_ratios.csv", chunks: 16, status: "Ingested" }
              ].map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-slate-800 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="text-xs font-mono text-slate-200 truncate">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono">{doc.chunks} chunks</span>
                    <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-1.5 py-0.5 rounded font-mono">
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. EXECUTIVE MODE SECTION */}
      <section id="executive" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 bg-slate-950/20 order-2 lg:order-1">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Brief Synthesis Preview
              </span>
              <button 
                onClick={() => setExecutiveMode(!executiveMode)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/80 text-[10px] font-bold text-white transition-all"
              >
                <span>Toggle Output:</span>
                <span className={`font-mono px-1.5 py-0.5 rounded text-[9px] ${
                  executiveMode ? "bg-cyan-950 text-cyan-400" : "bg-purple-950 text-purple-400"
                }`}>
                  {executiveMode ? "Executive" : "Academic"}
                </span>
              </button>
            </div>

            <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 font-mono text-xs space-y-3 text-slate-300 min-h-[160px] flex flex-col justify-center">
              {executiveMode ? (
                <div className="space-y-2 animate-fade-in">
                  <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                    Executive Strategic Action Summary (CEO PERSONA)
                  </div>
                  <div>
                    <strong>• Findings:</strong> Efficacy in PD-1 immune combinations exceeds baseline standards for metastatic Melanoma.
                  </div>
                  <div>
                    <strong>• Critical Risks:</strong> Severe autoimmune toxicities reported in combinations; high cost barrier for public deployment.
                  </div>
                  <div>
                    <strong>• Strategic Action:</strong> Initialize pilot clinical trial for cohort validation; allocate funding resources.
                  </div>
                </div>
              ) : (
                <div className="space-y-2 animate-fade-in">
                  <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                    Scientific Academic Synthesis (MED-LINE PARSER)
                  </div>
                  <div>
                    <strong>• Abstract:</strong> Evaluated studies show significant progression-free survival (PFS) enhancement in patients receiving combination nivolumab + ipilimumab.
                  </div>
                  <div>
                    <strong>• Hazard Ratio:</strong> Pooled HR 0.44 (95% CI 0.32-0.61) p &lt; 0.001.
                  </div>
                  <div>
                    <strong>• Side Effects:</strong> High occurrence of Grade 3/4 immune-mediated adverse events.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/30 border border-cyan-800/30 px-3 py-1 rounded-full">
              Custom Personas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
              Executive Mode for Strategic Briefs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
              Scientific literature is dense. Curalink allows users to toggle between detailed academic citations and high-level Executive briefings. Focus immediately on key clinical outcomes, risk assessments, and programmatic next-steps.
            </p>
          </div>
        </div>
      </section>

      {/* 8. PRODUCT SCREENSHOTS / INTERACTIVE MOCKUP */}
      <section id="product-demo" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-3 py-1 rounded-full">
            Product Showcase
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            The Curalink Workspace Interface
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
            A secure terminal environment showing real-time agent workflow logs and evidence metrics.
          </p>
        </div>

        {/* Premium CSS-Rendered App Mockup */}
        <div className="glass-card rounded-[20px] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.7)] overflow-hidden bg-slate-950/40 relative">
          
          {/* Header Bar */}
          <div className="h-12 border-b border-white/5 bg-slate-950/80 px-4 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <span className="h-4 w-[1px] bg-slate-800 mx-2" />
              <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1.5 bg-slate-900/60 border border-slate-850 px-2 py-0.5 rounded">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Clinical Terminal (Active Session)
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 font-semibold text-[10px]">
              <span className="hidden md:inline-flex items-center gap-1 text-cyan-400 bg-cyan-950/35 border border-cyan-900/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-3 w-3" />
                HIPAA Secure
              </span>
              <span>Dr. Sarah Jenkins</span>
            </div>
          </div>

          {/* Main App Grid Mock */}
          <div className="grid md:grid-cols-12 min-h-[420px]">
            {/* Sidebar Mock */}
            <div className="md:col-span-3 border-r border-white/5 bg-slate-950/60 p-4 space-y-4 select-none hidden md:block">
              <div className="space-y-1.5">
                <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider px-2">Navigation</div>
                <div className="flex items-center gap-2 bg-primary text-white text-[11px] font-semibold px-3 py-2 rounded-xl">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Research Workspace</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px] px-3 py-2 rounded-xl">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Documents Store</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-white/5">
                <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider px-2">Recent Research</div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-350 p-2 rounded-lg bg-slate-900/40 border border-white/5 truncate">
                    • Melanoma immunotherapy approaches
                  </div>
                  <div className="text-[10px] text-slate-500 p-2 rounded-lg truncate">
                    • AD biomarker analysis
                  </div>
                </div>
              </div>
            </div>

            {/* Workspace Area Mock */}
            <div className="md:col-span-9 p-6 flex flex-col justify-between space-y-6">
              {/* Question Bubble */}
              <div className="flex items-start gap-3 justify-end">
                <div className="p-3 bg-slate-900 border border-white/5 rounded-2xl max-w-md">
                  <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider mb-1">USER QUERY</div>
                  <p className="text-xs text-slate-200">
                    Latest immunotherapy approaches for stage IV melanoma patients with BRAF mutations.
                  </p>
                </div>
              </div>

              {/* Agent workflow stages simulate */}
              <div className="space-y-3 bg-slate-950/20 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider pb-2 border-b border-white/5">
                  <span>Agent Execution Pipeline Log</span>
                  <span className="text-cyan-400">Simulation Status</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Research Agent", action: "Federating PubMed & OpenAlex databases...", time: "320ms", status: "completed" },
                    { name: "Evidence Agent", action: "Evaluating citation relevance and BRAF mutations...", time: "110ms", status: "completed" },
                    { name: "Summary Agent", action: "Generating executive risk/action briefs...", time: "1.45s", status: demoStep >= 2 ? "completed" : "running" }
                  ].map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] font-mono bg-slate-900/30 p-2 rounded border border-white/5">
                      <div className="flex items-center gap-2">
                        {s.status === "completed" ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                        )}
                        <span className="text-white font-bold">{s.name}</span>
                        <span className="text-slate-500 hidden sm:inline">| {s.action}</span>
                      </div>
                      <span className="text-slate-500">{s.time} ({s.status})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Synthesis preview box */}
              {demoStep >= 2 ? (
                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-950/5 text-xs space-y-2 animate-slide-up">
                  <div className="flex justify-between items-center text-[10px] text-blue-400 font-bold font-mono">
                    <span>SYNTHESIS COMPLETE</span>
                    <span>14 relevant publications scored</span>
                  </div>
                  <p className="text-[11px] text-slate-350 leading-relaxed font-light">
                    PD-1 checkpoint combination inhibitors (Nivolumab + Ipilimumab) demonstrate an elevated 5-year survival score of 52% in BRAF-mutated metastatic cohorts compared to monotherapy. Clinical recommendation involves local mutation genotyping before initial dosing.
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 italic font-light animate-pulse">
                  Analyzing database nodes and executing cross-reference queries...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 9. RESEARCH ANALYTICS */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-3 py-1 rounded-full">
            Real-time Metrics
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Live Research Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
            Curalink tracks metrics behind clinical queries, charting latency, database totals, and publication timelines.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-4">
          {/* Latency Widget */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 bg-slate-950/20">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                System Latency Trend
              </span>
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="h-28 flex items-end gap-2 px-2 pt-2 bg-slate-900/40 rounded-xl border border-white/5 relative">
              <div className="absolute top-2 left-2 text-[9px] text-slate-500 font-mono">Average: 1.88s</div>
              {[30, 42, 38, 55, 62, 50, 78, 65, 88].map((val, idx) => (
                <div 
                  key={idx} 
                  className="bg-blue-600/40 rounded-t w-full transition-all duration-500 hover:bg-blue-500 hover:shadow-cyan-glow" 
                  style={{ height: `${val}%` }} 
                />
              ))}
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-light">
              Aggregates latency across all Research, Evidence, and Summary generation processes live.
            </p>
          </div>

          {/* Database Distribution */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 bg-slate-950/20">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Indexed Publications
              </span>
              <Database className="h-4 w-4 text-purple-400" />
            </div>
            <div className="space-y-2">
              {[
                { name: "PubMed Articles", count: "36.2M", percent: 90 },
                { name: "OpenAlex Works", count: "250.4M", percent: 98 },
                { name: "ClinicalTrials.gov", count: "485K", percent: 45 }
              ].map((db, idx) => (
                <div key={idx} className="space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between text-slate-350">
                    <span>{db.name}</span>
                    <span className="text-white font-bold">{db.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                      style={{ width: `${db.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-light">
              Total federated search footprint accessible on-demand within any user query sandbox.
            </p>
          </div>

          {/* Publication Trends */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 bg-slate-950/20">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Decadal Research Growth
              </span>
              <Layers className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="h-28 flex items-end justify-between px-2 pt-2 bg-slate-900/40 rounded-xl border border-white/5 relative">
              <div className="absolute top-2 left-2 text-[9px] text-slate-500 font-mono">Scope: oncology</div>
              {[15, 25, 30, 48, 52, 60, 75, 82, 95].map((val, idx) => (
                <div 
                  key={idx} 
                  className="bg-emerald-600/40 rounded-t w-full mx-0.5 transition-all duration-500 hover:bg-emerald-500" 
                  style={{ height: `${val}%` }} 
                />
              ))}
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-light">
              Visualizes exponential publications scale regarding immunotherapy interventions over recent years.
            </p>
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="py-24 px-6 border-t border-white/5 text-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-display leading-[1.1]">
            Ready to Begin Your Investigation?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed font-light">
            Access Curalink's HIPAA-secure sandbox and run multi-agent query compilations across PubMed, OpenAlex, and ClinicalTrials.gov instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isSignedIn ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)] hover:shadow-[0_8px_40px_rgba(37,99,235,0.55)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Get Started Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)] hover:shadow-[0_8px_40px_rgba(37,99,235,0.55)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6 bg-slate-950/60 text-slate-500 text-[11px] font-light">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400" />
            <span className="font-bold text-slate-350">Curalink Systems</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Curalink. All rights reserved. HIPAA & GDPR Compliant infrastructure.</span>
          </div>
          <div className="flex items-center gap-4 font-semibold text-slate-455 text-slate-400">
            <span>Security Statement</span>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
