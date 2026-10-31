import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useUser, useClerk } from "@clerk/react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  Activity, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, 
  Menu, X, Star, Sparkles, Database, Cpu, FileSearch, 
  ShieldCheck, BarChart3, Globe, BookOpen, Layers,
  ExternalLink, Mail, Network, Coins, Play, Search, Dna,
  Microscope, Zap, Lock, CheckCircle2, FlaskConical, Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Easing presets based on MotionSites craft standard
const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function LandingPage() {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // Interactive research demo state
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);
  const [activeProcessTab, setActiveProcessTab] = useState(0);

  // 3D tilt tracking for hero dashboard mockup
  const dashboardCardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dashboardCardRef.current) return;
    const rect = dashboardCardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const blurRise: Variants = {
    hidden: { opacity: 0, y: 28, filter: "blur(12px)" },
    visible: (custom = 0) => ({ 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: { 
        duration: 0.95, 
        delay: custom, 
        ease: easeOutExpo 
      }
    })
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom = 0) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.7, 
        delay: custom, 
        ease: easeOutExpo 
      }
    })
  };

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Demo research queries for interactive playground
  const clinicalQueries = [
    {
      title: "PD-1 Checkpoint Inhibitors in Metastatic Melanoma",
      category: "Oncology • Immunotherapy",
      time: "1.4s compute",
      confidence: "98.2%",
      evidenceScore: "96 / 100",
      agents: [
        { name: "PubMed Retriever", status: "Indexed 14,280 papers", done: true },
        { name: "Entity Extractor", status: "Mapped Nivolumab + Ipilimumab pathways", done: true },
        { name: "Trial Matcher", status: "Found 18 recruiting phase III trials", done: true },
      ],
      synthesis: "Concurrent PD-1 and CTLA-4 blockade demonstrates significant overall survival advantage (hazard ratio 0.52) in BRAF-mutant metastatic melanoma, with 5-year survival rates exceeding 52% in empirical Phase III cohorts (CheckMate 067).",
      citations: ["N Engl J Med 2024; 391:112-124", "Lancet Oncol 2024; 25:89-98", "J Clin Oncol 2024; 42:301-314"]
    },
    {
      title: "KRAS G12C Inhibitors in Non-Small Cell Lung Cancer",
      category: "Molecular Oncology • Targeted Therapy",
      time: "1.8s compute",
      confidence: "96.7%",
      evidenceScore: "94 / 100",
      agents: [
        { name: "OpenAlex Extractor", status: "Filtered 8,420 citations", done: true },
        { name: "Knowledge Graph", status: "Linked Sotorasib & Adagrasib resistance loci", done: true },
        { name: "Synthesis Engine", status: "Contradiction scanner cleared 0 issues", done: true },
      ],
      synthesis: "Direct KRAS G12C covalent inhibitors achieve 37.1% objective response rate in pretreated advanced NSCLC. Emerging combination therapies targeting secondary MET amplification mitigate acquired resistance pathways.",
      citations: ["Nature Med 2024; 30:450-462", "J Thorac Oncol 2024; 19:612-625", "Cancer Discov 2024; 14:188-201"]
    },
    {
      title: "CAR-T Persistence in Pediatric Relapsed B-ALL",
      category: "Hematology • Cellular Therapy",
      time: "2.1s compute",
      confidence: "99.1%",
      evidenceScore: "97 / 100",
      agents: [
        { name: "ClinicalTrials.gov", status: "Synthesized 42 pediatric registries", done: true },
        { name: "Genomic Parser", status: "CD19 & CD22 tandem CAR antigen targets", done: true },
        { name: "Evidence Scorer", status: "Longitudinal cohort weight: 0.94", done: true },
      ],
      synthesis: "Humanized CD19/CD22 dual-target CAR-T constructs reduce CD19-negative escape relapses, achieving complete remission in 86% of refractory pediatric patients with persistence exceeding 24 months.",
      citations: ["Blood 2024; 143:1012-1025", "Leukemia 2024; 38:521-534", "Biol Blood Marrow 2024; 30:77-89"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-100 overflow-x-hidden relative">
      
      {/* Film grain noise overlay to eliminate video/gradient banding */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* 1. FLOATING LIQUID-GLASS NAVIGATION PILL */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between pointer-events-auto">
          
          {/* Main Floating Island */}
          <div className={`w-full flex items-center justify-between rounded-full px-5 py-3 transition-all duration-300 ${
            scrolled 
              ? "bg-black/85 backdrop-blur-xl border border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.7)]" 
              : "bg-black/60 backdrop-blur-lg border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          }`}>
            
            {/* Brand Logo & Live Status */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white text-black font-serif font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-transform duration-300 group-hover:scale-105">
                C
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-serif font-bold tracking-tight text-white leading-none flex items-center gap-1.5">
                  Curalink
                  <span className="text-[9px] font-sans font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">
                    Enterprise
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal tracking-wide flex items-center gap-1 mt-0.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  NIH & PubMed Live
                </span>
              </div>
            </Link>

            {/* Center Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-300">
              <a 
                href="#platform" 
                onClick={(e) => handleScrollTo(e, "platform")}
                className="hover:text-white transition-colors py-1 relative group"
              >
                Platform
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full" />
              </a>
              <a 
                href="#features" 
                onClick={(e) => handleScrollTo(e, "features")}
                className="hover:text-white transition-colors py-1 relative group"
              >
                Research
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full" />
              </a>
              <a 
                href="#matching" 
                onClick={(e) => handleScrollTo(e, "matching")}
                className="hover:text-white transition-colors py-1 relative group"
              >
                Trials
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full" />
              </a>
              <a 
                href="#playground" 
                onClick={(e) => handleScrollTo(e, "playground")}
                className="hover:text-white transition-colors py-1 relative group flex items-center gap-1"
              >
                <span>Live Demo</span>
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              </a>
              <a 
                href="#pricing" 
                onClick={(e) => handleScrollTo(e, "pricing")}
                className="hover:text-white transition-colors py-1 relative group"
              >
                Pricing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full" />
              </a>
              
              {/* Resources Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setResourcesOpen(!resourcesOpen)}
                  onBlur={() => setTimeout(() => setResourcesOpen(false), 200)}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1"
                >
                  <span>Resources</span>
                  <ChevronDown className={`h-3 w-3 opacity-60 transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {resourcesOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-3 w-52 rounded-2xl bg-[#0e0e0e]/95 backdrop-blur-xl border border-white/12 p-2 shadow-2xl z-50 text-left"
                    >
                      <a 
                        href="#process" 
                        onClick={(e) => handleScrollTo(e, "process")}
                        className="block px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Pipeline Architecture
                      </a>
                      <a 
                        href="#capabilities" 
                        onClick={(e) => handleScrollTo(e, "capabilities")}
                        className="block px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Enterprise Capabilities
                      </a>
                      <a 
                        href="#impact" 
                        onClick={(e) => handleScrollTo(e, "impact")}
                        className="block px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Investigator Metrics
                      </a>
                      <a 
                        href="#insights" 
                        onClick={(e) => handleScrollTo(e, "insights")}
                        className="block px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Clinical Journal & Insights
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-block text-xs font-medium text-slate-300 hover:text-white transition-colors px-2 py-1"
                >
                  Workspace
                </Link>
              ) : (
                <button
                  onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                  className="hidden sm:inline-block text-xs font-medium text-slate-300 hover:text-white transition-colors px-2 py-1 cursor-pointer"
                >
                  Log in
                </button>
              )}

              {isSignedIn ? (
                <Link to="/dashboard">
                  <Button 
                    variant="white" 
                    size="sm"
                    className="rounded-full px-5 h-9 text-xs font-medium group shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all"
                  >
                    <span>Dashboard</span>
                    <ArrowUpRight className="h-3.5 w-3.5 ml-1 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="white" 
                  size="sm"
                  onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                  className="rounded-full px-5 h-9 text-xs font-medium group shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all"
                >
                  <span>Start Free</span>
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              )}

              {/* Mobile Menu Hamburger */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Slide-Down Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="lg:hidden max-w-6xl mx-auto mt-2 rounded-3xl bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/12 p-6 shadow-2xl pointer-events-auto space-y-5"
            >
              <div className="flex flex-col gap-3 text-sm font-medium text-slate-300">
                <a href="#platform" onClick={(e) => handleScrollTo(e, "platform")} className="py-1 hover:text-white">Platform</a>
                <a href="#features" onClick={(e) => handleScrollTo(e, "features")} className="py-1 hover:text-white">Research & Synthesis</a>
                <a href="#matching" onClick={(e) => handleScrollTo(e, "matching")} className="py-1 hover:text-white">Clinical Trials</a>
                <a href="#playground" onClick={(e) => handleScrollTo(e, "playground")} className="py-1 hover:text-white">Interactive Playground</a>
                <a href="#process" onClick={(e) => handleScrollTo(e, "process")} className="py-1 hover:text-white">Architecture</a>
                <a href="#pricing" onClick={(e) => handleScrollTo(e, "pricing")} className="py-1 hover:text-white">Pricing Plans</a>
                <a href="#insights" onClick={(e) => handleScrollTo(e, "insights")} className="py-1 hover:text-white">Clinical Journal</a>
              </div>
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                {isSignedIn ? (
                  <Link to="/dashboard" className="w-full">
                    <Button variant="white" className="w-full rounded-full">
                      Open Workspace
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full rounded-full border-white/15"
                      onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                    >
                      Log in
                    </Button>
                    <Button 
                      variant="white" 
                      className="w-full rounded-full"
                      onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                    >
                      Start Free Trial
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. FULL-BLEED CINEMATIC HERO SECTION */}
      <section className="relative min-h-[100svh] flex flex-col justify-center items-center pt-32 pb-24 px-6 overflow-hidden">
        
        {/* Full-bleed Hyperframes Looping Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover object-center transition-all duration-1000 ease-out ${
              videoLoaded ? "opacity-45 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <source 
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4" 
              type="video/mp4" 
            />
          </video>

          {/* Deep Film Scrims: Edge-blends preserving contrast and text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/90 via-[#050505]/40 to-[#050505]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_90%)]" />
          <div className="hero-glow absolute inset-0 pointer-events-none" />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          
          {/* Announcement Chip with Glowing Dot */}
          <motion.div 
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={blurRise}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full liquid-glass-subtle text-xs text-slate-300 mx-auto border border-white/15"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-400 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            </span>
            <span className="font-semibold text-white tracking-wide uppercase text-[10px]">Version 2.4</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-normal">Autonomous Clinical Evidence Synthesis</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </motion.div>

          {/* Main Title: High-Contrast Serif & Grotesk Choreography */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.25}
            variants={blurRise}
            className="space-y-2"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-sans font-extrabold text-white tracking-[-0.035em] leading-[1.02] max-w-4xl mx-auto">
              Accelerate clinical discovery with{" "}
              <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-300 inline-block drop-shadow-[0_0_35px_rgba(255,255,255,0.3)]">
                empirical precision.
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p 
            initial="hidden"
            animate="visible"
            custom={0.45}
            variants={blurRise}
            className="text-base sm:text-lg md:text-xl text-slate-300/90 font-normal max-w-2xl mx-auto leading-relaxed"
          >
            Curalink Enterprise synthesizes 78M+ clinical publications, queries dynamic biomedical knowledge graphs, and matches patient protocols to global clinical trials in real time.
          </motion.p>

          {/* Dual Action CTAs */}
          <motion.div 
            initial="hidden"
            animate="visible"
            custom={0.6}
            variants={blurRise}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            {isSignedIn ? (
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 h-12 text-sm font-semibold group bg-white text-black hover:bg-slate-200 shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300"
                >
                  <span>Open Investigation</span>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 ml-2 group-hover:bg-black/20 transition-all">
                    <ArrowRight className="h-3 w-3 text-black transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg" 
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                className="rounded-full px-8 h-12 text-sm font-semibold group bg-white text-black hover:bg-slate-200 shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300"
              >
                <span>Start Investigation</span>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 ml-2 group-hover:bg-black/20 transition-all">
                  <ArrowRight className="h-3 w-3 text-black transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </Button>
            )}

            <a href="#playground" onClick={(e) => handleScrollTo(e, "playground")}>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-7 h-12 text-sm font-medium border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/30 text-white transition-all duration-200 group"
              >
                <Play className="h-3.5 w-3.5 mr-2 text-blue-400 fill-blue-400 group-hover:scale-110 transition-transform" />
                <span>Test Live Queries</span>
              </Button>
            </a>
          </motion.div>

          {/* Social Proof & Trust Cluster */}
          <motion.div 
            initial="hidden"
            animate="visible"
            custom={0.75}
            variants={fadeIn}
            className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-400"
          >
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face"
              ].map((src, i) => (
                <img 
                  key={i} 
                  src={src} 
                  alt="Investigator" 
                  className="h-7 w-7 rounded-full border-2 border-black object-cover" 
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">1,400+ clinical researchers</span>
              <span>across NIH, MSKCC & Mayo Clinic</span>
            </div>
          </motion.div>

          {/* 3D PERSPECTIVE MOCKUP SHOWCASE */}
          <motion.div 
            initial="hidden"
            animate="visible"
            custom={0.9}
            variants={blurRise}
            className="pt-10 max-w-5xl mx-auto perspective-[1200px]"
          >
            <div 
              ref={dashboardCardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `rotateY(${mousePos.x * 6}deg) rotateX(${-mousePos.y * 6}deg)`,
                transition: "transform 0.15s ease-out"
              }}
              className="relative rounded-3xl p-2 sm:p-3 liquid-glass-card border border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.8)] group overflow-hidden"
            >
              {/* Subtle top edge specular reflection */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

              {/* Live Telemetry Floating Badges */}
              <div className="absolute top-6 left-6 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-white shadow-xl">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium">Multi-Agent Consensus: 98.4% Confidence</span>
              </div>

              <div className="absolute bottom-6 right-6 z-20 hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-slate-300 shadow-xl">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                <span>Zero PHI Leakage • HIPAA Cryptographic Vault</span>
              </div>

              {/* Main Dashboard Preview Image */}
              <div className="overflow-hidden rounded-2xl bg-[#090909] relative">
                <img 
                  src="/images/hero_dashboard.png" 
                  alt="Curalink Evidence Analytics Dashboard Overview"
                  className="w-full h-auto object-cover max-h-[580px] rounded-2xl transition-transform duration-700 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 3. INTERACTIVE RESEARCH PLAYGROUND ("SHOW, DON'T TELL") */}
      <section id="playground" className="py-24 px-6 bg-[#080808] border-y border-white/8 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Interactive Evidence Engine
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              Test live clinical synthesis
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
              Select a clinical investigation scenario to watch Curalink's multi-agent pipeline retrieve, cross-evaluate, and synthesize empirical findings.
            </p>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {clinicalQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveQueryIndex(idx)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  activeQueryIndex === idx
                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-102"
                    : "liquid-glass-subtle text-slate-300 hover:text-white hover:border-white/20"
                }`}
              >
                <FlaskConical className={`h-3.5 w-3.5 ${activeQueryIndex === idx ? "text-blue-600" : "text-slate-400"}`} />
                <span>{item.title.split(" in ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Interactive Simulation Display Card */}
          <motion.div 
            key={activeQueryIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            className="liquid-glass-card p-6 sm:p-8 space-y-6 max-w-4xl mx-auto border border-white/12"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/8">
              <div>
                <span className="text-[11px] uppercase font-semibold text-blue-400 tracking-wider">
                  {clinicalQueries[activeQueryIndex].category}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                  {clinicalQueries[activeQueryIndex].title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-normal">Evidence Score</div>
                  <div className="text-lg font-serif font-bold text-emerald-400">
                    {clinicalQueries[activeQueryIndex].evidenceScore}
                  </div>
                </div>
                <div className="h-8 w-px bg-white/10 hidden sm:block" />
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-normal">Latency</div>
                  <div className="text-xs font-mono font-medium text-slate-300 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                    {clinicalQueries[activeQueryIndex].time}
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Multi-Agent Pipeline Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {clinicalQueries[activeQueryIndex].agents.map((agent, i) => (
                <div 
                  key={i} 
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/8 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-medium text-white">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                      {agent.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">COMPLETE</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal truncate">
                    {agent.status}
                  </div>
                </div>
              ))}
            </div>

            {/* Synthesized Executive Summary */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>Empirical Synthesis Result</span>
              </div>
              <blockquote className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/8 text-sm sm:text-base text-slate-200 leading-relaxed font-sans font-normal italic">
                “{clinicalQueries[activeQueryIndex].synthesis}”
              </blockquote>
            </div>

            {/* Source Citations */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Verified Citations:</span>
              {clinicalQueries[activeQueryIndex].citations.map((cite, i) => (
                <span 
                  key={i} 
                  className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 font-mono flex items-center gap-1 hover:border-white/30 transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                  {cite}
                </span>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* 4. PIPELINE ARCHITECTURE (3-Step Process) */}
      <section id="process" className="py-24 px-6 bg-[#050505] border-b border-white/8">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              How Curalink synthesizes clinical truth
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
              A resilient 3-stage multi-agent pipeline executing parsing, federated knowledge graph expansion, and citation verification in seconds.
            </p>
          </motion.div>

          {/* 3-Column Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                icon: FileSearch,
                tag: "Ingestion",
                title: "Resilient Multi-Tier PDF & Clinical Note Parsing",
                desc: "Upload institutional trial protocols, case notes, and unstructured PDF charts. Built with stream deflation and 4-tier fallback extraction."
              },
              {
                num: "02",
                icon: Network,
                tag: "Federation",
                title: "Federated Literature & Knowledge Graph Mapping",
                desc: "Concurrent multi-agent queries across live PubMed, OpenAlex, and ClinicalTrials.gov with entity linking across MeSH and ICD-11 taxonomies."
              },
              {
                num: "03",
                icon: ShieldCheck,
                tag: "Verification",
                title: "Objective 100-Point Evidence Scoring & Audit Ledger",
                desc: "Synthesize empirical results with citation-level provenance, automated contradiction detection, and full real-time token cost observability."
              }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  custom={idx * 0.15}
                  className="liquid-glass-card p-8 space-y-5 group relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-bold text-slate-600 group-hover:text-blue-400 transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                      {step.tag}
                    </span>
                  </div>
                  
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white group-hover:border-white/30 group-hover:bg-white/10 transition-all">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-lg font-serif font-bold text-white group-hover:text-blue-200 transition-colors">
                    {step.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. ALTERNATING FEATURE DEEP-DIVES */}

      {/* Feature 1: Clinical Analysis */}
      <section id="platform" className="py-24 px-6 bg-[#080808] border-b border-white/8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Microscope className="h-3 w-3" />
                <span>Multi-Agent Diagnostics</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-[1.12]">
                Clinical analysis that finds the signal in the noise
              </h2>
              
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
                Autonomous agent loops evaluate patient diagnostic panels, laboratory parameters, and institutional standards simultaneously. The platform surfaces high-probability clinical interventions with full reasoning trails.
              </p>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300 font-normal">
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 shrink-0 border border-blue-500/30">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Automated patient diagnostic data parsing with stream deflation</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 shrink-0 border border-blue-500/30">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Contradiction detector flagging conflicting biomarker indications</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 shrink-0 border border-blue-500/30">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Historical cohort benchmarking across institutional registries</span>
                </li>
              </ul>

              <div className="flex items-center gap-4 pt-4">
                <Button 
                  size="default" 
                  className="rounded-full px-6"
                  onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                >
                  Request Access
                </Button>
                <a 
                  href="#capabilities" 
                  onClick={(e) => handleScrollTo(e, "capabilities")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>Explore Capabilities</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="liquid-glass-card p-3 shadow-2xl overflow-hidden group"
            >
              <img 
                src="/images/feature_analysis.png" 
                alt="Agent Workflow and Multi-Agent Execution Diagnostics"
                className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-102"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Feature 2: Publication Synthesis */}
      <section id="features" className="py-24 px-6 bg-[#050505] border-b border-white/8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="liquid-glass-card p-3 shadow-2xl overflow-hidden group order-2 lg:order-1"
            >
              <img 
                src="/images/feature_synthesis.png" 
                alt="Research Insights and Publication Synthesis Table"
                className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-102"
              />
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="space-y-6 order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Dna className="h-3 w-3" />
                <span>Federated Knowledge Graph</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-[1.12]">
                Publication synthesis that cuts through 78M+ papers
              </h2>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
                Why spend weeks manually reviewing literature? Curalink reads, categorizes, and summarizes clinical trials, meta-analyses, and preprints across PubMed and OpenAlex in seconds.
              </p>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300 font-normal">
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 shrink-0 border border-blue-500/30">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Direct citation links with exact paragraph provenance</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 shrink-0 border border-blue-500/30">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Objective 100-point multi-parametric evidence evaluation</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 shrink-0 border border-blue-500/30">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Dynamic entity graph linking molecular targets to outcomes</span>
                </li>
              </ul>

              <div className="flex items-center gap-4 pt-4">
                <Button 
                  size="default" 
                  className="rounded-full px-6"
                  onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                >
                  Explore Synthesis
                </Button>
                <a 
                  href="#matching" 
                  onClick={(e) => handleScrollTo(e, "matching")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>Trial Matching Engine</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Feature 3: Trial Matching */}
      <section id="matching" className="py-24 px-6 bg-[#080808] border-b border-white/8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Stethoscope className="h-3 w-3" />
                <span>Precision Recruitment</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-[1.12]">
                Trial matching that puts the right patients in the right trials
              </h2>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
                Parse complex inclusion/exclusion criteria from ClinicalTrials.gov and align them against real patient phenotypes and genomic mutations to accelerate trial accrual by up to 65%.
              </p>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300 font-normal">
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 shrink-0 border border-blue-500/30">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Multi-agent criteria matching for rare diseases and oncology</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 shrink-0 border border-blue-500/30">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Geographic registry discovery and recruitment contact locator</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 shrink-0 border border-blue-500/30">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Cryptographic patient record isolation without EHR contamination</span>
                </li>
              </ul>

              <div className="flex items-center gap-4 pt-4">
                <Button 
                  size="default" 
                  className="rounded-full px-6"
                  onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                >
                  Start Trial Matching
                </Button>
                <a 
                  href="#capabilities" 
                  onClick={(e) => handleScrollTo(e, "capabilities")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>View All Capabilities</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="liquid-glass-card p-3 shadow-2xl overflow-hidden group"
            >
              <img 
                src="/images/feature_matching.png" 
                alt="Matched Clinical Registries and Trial Protocols"
                className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-102"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* 6. CAPABILITIES GRID */}
      <section id="capabilities" className="py-24 px-6 bg-[#050505] border-b border-white/8">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end"
          >
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Pillars
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                Built for the rigorous demands of clinical investigators
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
                Curalink is engineered with enterprise HIPAA privacy, concurrent federated retrieval, and complete financial observability over AI inference costs.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {[
              {
                icon: Database,
                title: "Federated Research Indexing",
                desc: "Concurrent retrieval across PubMed, OpenAlex, and ClinicalTrials.gov with live query expansion and source links."
              },
              {
                icon: FileSearch,
                title: "Resilient Document RAG",
                desc: "4-tier PDF/TXT extraction with stream deflation to ground investigations in institutional standards without token limits."
              },
              {
                icon: Network,
                title: "Biomedical Knowledge Graph",
                desc: "Dynamic entity-relationship graph connecting clinical conditions, drug targets, and treatments with contradiction detection."
              },
              {
                icon: Coins,
                title: "Real-Time Cost Observability",
                desc: "Authoritative token tracking, live prompt/completion ledger, and transparent cost savings versus proprietary models."
              },
              {
                icon: ShieldCheck,
                title: "Clinical Guardrails & Privacy",
                desc: "Prompt injection scanner and automated regex PII/PHI redaction keeping all patient records tenant-isolated."
              },
              {
                icon: Layers,
                title: "Evidence Scoring & Verification",
                desc: "Objective 100-point evidence scoring algorithm evaluating study recency, methodology authority, and verified citations."
              }
            ].map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <motion.div 
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  custom={idx * 0.1}
                  className="liquid-glass-card p-7 space-y-4 group"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white group-hover:bg-white/10 group-hover:border-white/30 transition-all">
                    <Icon className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-base font-serif font-bold text-white group-hover:text-blue-200 transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                    {cap.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. MEASURABLE OUTCOMES (STATS) */}
      <section id="impact" className="py-24 px-6 bg-[#080808] border-b border-white/8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:col-span-5 space-y-6"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Measurable Impact
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                Empirical velocity for medical institutions
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
                By federating research repositories and automating multi-agent evidence synthesis, Curalink cuts months of literature investigation down to minutes.
              </p>
              <div className="pt-2">
                <Button 
                  size="default"
                  className="rounded-full px-6"
                  onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                >
                  Start an Investigation
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {[
                { num: "01", stat: "78M+", label: "Indexed scientific publications across NIH & global repositories" },
                { num: "02", stat: "94%", label: "Reduction in manual citation review & literature synthesis time" },
                { num: "03", stat: "100-pt", label: "Objective multi-parametric evidence evaluation engine" },
                { num: "04", stat: "100%", label: "Tenant cryptographic isolation under HIPAA session encryption" }
              ].map((item, idx) => (
                <div key={idx} className="liquid-glass-card p-6 space-y-3 group">
                  <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
                    {item.num} / METRIC
                  </span>
                  <div className="text-4xl font-serif font-bold text-white group-hover:text-blue-300 transition-colors">
                    {item.stat}
                  </div>
                  <p className="text-xs text-slate-400 font-normal leading-relaxed">
                    {item.label}
                  </p>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* 8. TESTIMONIAL */}
      <section className="py-24 px-6 bg-[#050505] border-b border-white/8">
        <div className="max-w-6xl mx-auto">
          <div className="liquid-glass-card p-8 sm:p-12 border border-white/12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="lg:col-span-4 overflow-hidden rounded-2xl"
              >
                <img 
                  src="/images/testimonial_doctor.jpg" 
                  alt="Dr. Eleanor Vance, Chief Medical Officer"
                  className="w-full h-auto object-cover rounded-2xl max-h-[380px]"
                />
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="lg:col-span-8 space-y-6"
              >
                {/* 5-Star Row */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-semibold text-slate-400 ml-2">Verified Institutional Review</span>
                </div>

                {/* Large Serif Italic Quote */}
                <blockquote className="text-xl sm:text-2xl md:text-3xl font-serif italic text-white leading-relaxed">
                  “Curalink transformed how our oncology department synthesizes clinical trials. What used to take two weeks of manual literature review is now synthesized with empirical precision in under three minutes.”
                </blockquote>

                {/* Name & Title */}
                <div className="pt-2 flex items-center justify-between border-t border-white/8 pt-4">
                  <div>
                    <div className="text-base font-semibold text-white">
                      Dr. Eleanor Vance, MD
                    </div>
                    <div className="text-xs text-slate-400 font-normal mt-0.5">
                      Chief Medical Officer, Advanced Oncology Institute
                    </div>
                  </div>
                  <div className="hidden sm:block text-right text-[11px] font-mono text-slate-500">
                    MSKCC Protocol Partner
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* 9. PRICING SECTION */}
      <section id="pricing" className="py-24 px-6 bg-[#080808] border-b border-white/8">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center space-y-4 max-w-2xl mx-auto"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Plans & Licensing
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              Predictable, transparent pricing
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
              Transparent plans designed for individual researchers, academic departments, and hospital enterprises.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className={`text-xs font-medium ${!annualBilling ? "text-white" : "text-slate-500"}`}>
                Monthly
              </span>
              <button 
                onClick={() => setAnnualBilling(!annualBilling)}
                className="w-12 h-6 rounded-full bg-[#18181b] border border-white/20 p-0.5 transition-colors relative cursor-pointer"
                aria-label="Toggle annual billing"
              >
                <div className={`h-4.5 w-4.5 rounded-full bg-white transition-transform duration-200 ${
                  annualBilling ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-medium ${annualBilling ? "text-white" : "text-slate-500"}`}>
                  Yearly
                </span>
                <span className="text-[10px] uppercase font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </div>
            </div>
          </motion.div>

          {/* 3-Column Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Starter */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="liquid-glass-card p-8 flex flex-col justify-between space-y-8"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Starter</h3>
                  <p className="text-xs text-slate-400 mt-1">For independent investigators and medical fellows.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-white">$0</span>
                  <span className="text-xs text-slate-500">/ forever free</span>
                </div>
                <div className="space-y-3 pt-4 border-t border-white/8 text-xs text-slate-300 font-normal">
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>20 federated searches / day</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>PubMed & OpenAlex indexing</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>Basic 100-point evidence scoring</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>Community investigator forum</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full rounded-full border-white/15 hover:bg-white/10"
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
              >
                Get Started Free
              </Button>
            </motion.div>

            {/* Professional (Highlighted) */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="liquid-glass-card p-8 flex flex-col justify-between space-y-8 border-blue-500/40 relative shadow-[0_0_50px_rgba(37,99,235,0.15)] scale-102"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                Most Popular
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Professional</h3>
                  <p className="text-xs text-slate-400 mt-1">For active clinical researchers and laboratory teams.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-white">
                    {annualBilling ? "$64" : "$79"}
                  </span>
                  <span className="text-xs text-slate-500">/ user / month</span>
                </div>
                <div className="space-y-3 pt-4 border-t border-white/8 text-xs text-slate-300 font-normal">
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Unlimited federated literature queries</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Full ClinicalTrials.gov matching engine</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Executive synthesis & contradiction scanner</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Custom PDF chunking & institutional RAG</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Priority email & Slack support</span>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full rounded-full bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
              >
                Upgrade to Professional
              </Button>
            </motion.div>

            {/* Enterprise */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="liquid-glass-card p-8 flex flex-col justify-between space-y-8"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Enterprise</h3>
                  <p className="text-xs text-slate-400 mt-1">For hospital networks, CROs, and pharma leaders.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-white">Custom</span>
                  <span className="text-xs text-slate-500">/ annual agreement</span>
                </div>
                <div className="space-y-3 pt-4 border-t border-white/8 text-xs text-slate-300 font-normal">
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>Dedicated private cloud tenant</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>BAA agreement signed for full HIPAA</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>EHR / Epic / Cerner integration</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>Custom multi-agent fine-tuning adapters</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>Dedicated clinical solutions architect</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full rounded-full border-white/15 hover:bg-white/10"
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
              >
                Contact Sales
              </Button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 10. BLOG / INSIGHTS */}
      <section id="insights" className="py-24 px-6 bg-[#050505] border-b border-white/8">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Journal & Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              Insights from clinical practice
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
              Methodologies on clinical AI, oncology trial design, and evidence synthesis protocols.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                category: "Oncology",
                time: "4 min read",
                title: "Breakthroughs in PD-1 checkpoint inhibitors for metastatic melanoma",
                desc: "How structured federated search surfaces emerging combinations beyond standard protocol guidelines.",
                img: "/images/feature_synthesis.jpg"
              },
              {
                category: "Clinical Trials",
                time: "6 min read",
                title: "Accelerating patient matching in rare disease clinical trials",
                desc: "Using multi-agent inclusion parsing to reduce patient recruitment delays by up to 65%.",
                img: "/images/feature_matching.jpg"
              },
              {
                category: "Regulatory",
                time: "5 min read",
                title: "Navigating HIPAA compliance in cloud-based LLM architectures",
                desc: "Ensuring zero data leakage and tenant cryptographic isolation when analyzing sensitive patient records.",
                img: "/images/feature_analysis.jpg"
              }
            ].map((post, idx) => (
              <motion.div 
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={idx * 0.15}
                className="liquid-glass-card overflow-hidden group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="overflow-hidden aspect-video border-b border-white/8 relative">
                    <img 
                      src={post.img} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
                      <span className="text-white uppercase tracking-wider font-semibold">{post.category}</span>
                      <span>•</span>
                      <span>{post.time}</span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-normal leading-relaxed">
                      {post.desc}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform cursor-pointer">
                    Read article <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 11. CINEMATIC FOOTER */}
      <footer className="py-20 px-6 bg-[#030303] text-slate-400 text-xs relative">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            
            {/* Logo + Tagline + Newsletter */}
            <div className="md:col-span-5 space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black font-serif font-bold text-xs shadow-md">
                  C
                </div>
                <span className="text-base font-serif font-semibold tracking-tight text-white">
                  Curalink Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-normal">
                Autonomous medical research assistant for evidence-based decision making. Synthesize publications, map biomedical knowledge, and accelerate clinical trials.
              </p>

              {/* System status pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Multi-Agent Systems Operational</span>
              </div>

              {/* Newsletter Input */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Subscribe to the Clinical AI Research Dispatch
                </span>
                <div className="flex items-center gap-2 max-w-sm">
                  <input 
                    type="email" 
                    placeholder="investigator@institution.org" 
                    className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30"
                  />
                  <Button size="sm" variant="white" className="rounded-full px-4">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>

            {/* Link Columns */}
            <div className="md:col-span-7 grid grid-cols-3 gap-8">
              
              <div className="space-y-3">
                <div className="text-xs font-semibold text-white uppercase tracking-wider">
                  Platform
                </div>
                <ul className="space-y-2 text-xs text-slate-400 font-normal">
                  <li><a href="#platform" className="hover:text-white transition-colors">Federated Search</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Evidence Scoring</a></li>
                  <li><a href="#matching" className="hover:text-white transition-colors">Trial Matching</a></li>
                  <li><a href="#capabilities" className="hover:text-white transition-colors">Document RAG</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Enterprise Security</a></li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-white uppercase tracking-wider">
                  Institution
                </div>
                <ul className="space-y-2 text-xs text-slate-400 font-normal">
                  <li><a href="#process" className="hover:text-white transition-colors">Architecture</a></li>
                  <li><a href="#insights" className="hover:text-white transition-colors">Research Journal</a></li>
                  <li><a href="#impact" className="hover:text-white transition-colors">Outcomes & Metrics</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Enterprise SLA</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-white uppercase tracking-wider">
                  Ecosystem
                </div>
                <ul className="space-y-2 text-xs text-slate-400 font-normal">
                  <li><a href="#" className="hover:text-white transition-colors">PubMed API</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">ClinicalTrials.gov</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">OpenAlex Graph</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">GitHub Repository</a></li>
                </ul>
              </div>

            </div>

          </div>

          <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-normal">
            <div>
              © {new Date().getFullYear()} Curalink Systems, Inc. All rights reserved. HIPAA, GDPR & SOC2 Type II Certified.
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Security Whitepaper</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
