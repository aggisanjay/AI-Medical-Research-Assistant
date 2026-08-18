import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useUser, useClerk } from "@clerk/react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  Activity, ArrowRight, Check, ChevronDown, ChevronRight, 
  Menu, X, Star, Sparkles, Database, Cpu, FileSearch, 
  ShieldCheck, BarChart3, Globe, BookOpen, Layers,
  ExternalLink, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-100 overflow-x-hidden">
      
      {/* 1. STICKY NAV */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-black/90 backdrop-blur-md border-b border-white/8 py-3.5" 
          : "bg-black border-b border-white/8 py-4"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black font-serif font-bold text-base transition-transform duration-200 group-hover:scale-105">
              C
            </div>
            <span className="text-lg font-serif font-semibold tracking-tight text-white">
              Curalink
            </span>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a 
              href="#platform" 
              onClick={(e) => handleScrollTo(e, "platform")}
              className="hover:text-white transition-colors"
            >
              Platform
            </a>
            <a 
              href="#features" 
              onClick={(e) => handleScrollTo(e, "features")}
              className="hover:text-white transition-colors"
            >
              Research
            </a>
            <a 
              href="#matching" 
              onClick={(e) => handleScrollTo(e, "matching")}
              className="hover:text-white transition-colors"
            >
              Trials
            </a>
            
            {/* Resources Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setResourcesOpen(!resourcesOpen)}
                onBlur={() => setTimeout(() => setResourcesOpen(false), 200)}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                <span>Resources</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              <AnimatePresence>
                {resourcesOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 mt-2 w-48 rounded-2xl bg-[#0a0a0a] border border-white/10 p-2 shadow-2xl z-50 text-left"
                  >
                    <a 
                      href="#pricing" 
                      onClick={(e) => handleScrollTo(e, "pricing")}
                      className="block px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Pricing Plans
                    </a>
                    <a 
                      href="#insights" 
                      onClick={(e) => handleScrollTo(e, "insights")}
                      className="block px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Insights & Articles
                    </a>
                    <a 
                      href="#impact" 
                      onClick={(e) => handleScrollTo(e, "impact")}
                      className="block px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Clinical Impact
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isSignedIn ? (
              <Link
                to="/dashboard"
                className="text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                className="text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Log in
              </button>
            )}

            {isSignedIn ? (
              <Link to="/dashboard">
                <Button variant="white" size="sm">
                  Go to Workspace
                </Button>
              </Link>
            ) : (
              <Button 
                variant="white" 
                size="sm"
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
              >
                Sign up
              </Button>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Slide-Down Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black border-b border-white/8 px-6 py-6 space-y-4"
            >
              <div className="flex flex-col gap-3 text-sm font-medium text-slate-300">
                <a href="#platform" onClick={(e) => handleScrollTo(e, "platform")}>Platform</a>
                <a href="#features" onClick={(e) => handleScrollTo(e, "features")}>Research</a>
                <a href="#matching" onClick={(e) => handleScrollTo(e, "matching")}>Trials</a>
                <a href="#pricing" onClick={(e) => handleScrollTo(e, "pricing")}>Pricing</a>
                <a href="#insights" onClick={(e) => handleScrollTo(e, "insights")}>Insights</a>
              </div>
              <div className="pt-4 border-t border-white/8 flex flex-col gap-2">
                {isSignedIn ? (
                  <Link to="/dashboard" className="w-full">
                    <Button variant="white" className="w-full">
                      Open Workspace
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                    >
                      Log in
                    </Button>
                    <Button 
                      variant="white" 
                      className="w-full"
                      onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                    >
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-8 max-w-4xl mx-auto"
        >
          {/* Main Serif H1 */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight leading-[1.08] max-w-3xl mx-auto">
            Accelerate medical research with AI
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-slate-400 font-normal max-w-2xl mx-auto leading-relaxed">
            Curalink Enterprise synthesizes clinical publications, powers real-time analysis, and matches patients to trials. The work gets done faster and with more certainty.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-row items-center justify-center gap-3 pt-2">
            {isSignedIn ? (
              <Link to="/dashboard">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg" 
                className="px-8"
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
              >
                Request
              </Button>
            )}
            <a href="#process" onClick={(e) => handleScrollTo(e, "process")}>
              <Button variant="outline" size="lg" className="px-8">
                Explore
              </Button>
            </a>
          </div>

          {/* Hero Image Container with generous top margin */}
          <div className="pt-8">
            <div className="editorial-img-container shadow-2xl max-w-5xl mx-auto">
              <img 
                src="/images/hero_team.jpg" 
                alt="Medical researchers collaborating with Curalink"
                className="w-full h-auto object-cover max-h-[580px] rounded-3xl"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. HOW IT WORKS (Process) */}
      <section id="process" className="py-24 px-6 bg-[#0a0a0a] border-y border-white/8">
        <div className="max-w-7xl mx-auto space-y-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Process
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              How Curalink Enterprise works
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed pt-1">
              The platform takes the heavy lifting out of medical research. It reads the data, finds the patterns, and hands you the answers.
            </p>
          </motion.div>

          {/* 3-Column Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Ingest clinical data and records",
                desc: "Connect your research repositories, uploaded PDF trial data, and EHR documentation securely."
              },
              {
                num: "02",
                title: "AI synthesizes and scores evidence",
                desc: "Federated multi-agent pipelines score studies on 100-point recency, methodology, and relevance criteria."
              },
              {
                num: "03",
                title: "Generate insights and match trials",
                desc: "Receive actionable executive synthesis briefs and automatically match qualifying patient cohorts to active clinical trials."
              }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="editorial-card p-8 space-y-4 hover:border-white/20 transition-all duration-200"
              >
                <div className="font-serif text-3xl font-bold text-slate-500">
                  {step.num}
                </div>
                <h3 className="text-lg font-serif font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ALTERNATING FEATURE BLOCKS */}

      {/* Block 1: Clinical Analysis (Image Right) */}
      <section id="platform" className="py-24 px-6 bg-black border-b border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="space-y-6"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Analysis
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-[1.15]">
                Clinical analysis that finds the signal in the noise
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
                The engine reads patient data, lab results, and historical records in real time. It surfaces the actionable insights that matter.
              </p>
              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300 font-normal">
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Real-time patient data analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Lab result interpretation</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Historical record mining</span>
                </li>
              </ul>
              <div className="flex items-center gap-4 pt-4">
                <Button 
                  size="default" 
                  onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                >
                  Request
                </Button>
                <a 
                  href="#capabilities" 
                  onClick={(e) => handleScrollTo(e, "capabilities")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>More</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="editorial-img-container"
            >
              <img 
                src="/images/feature_analysis.jpg" 
                alt="Doctor performing clinical analysis"
                className="w-full h-auto object-cover rounded-3xl"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Block 2: Publication Synthesis (Image Left) */}
      <section id="features" className="py-24 px-6 bg-[#0a0a0a] border-b border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Image on left for desktop */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="editorial-img-container order-2 lg:order-1"
            >
              <img 
                src="/images/feature_synthesis.jpg" 
                alt="Scientists reviewing scientific publications"
                className="w-full h-auto object-cover rounded-3xl"
              />
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="space-y-6 order-1 lg:order-2"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Synthesis
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-[1.15]">
                Publication synthesis that cuts through thousands of papers
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
                The platform summarizes and extracts key findings from medical papers and journals. The work of weeks becomes the work of minutes.
              </p>
              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300 font-normal">
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Automatic paper summarization</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Key finding extraction</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Journal and paper coverage across PubMed & OpenAlex</span>
                </li>
              </ul>
              <div className="flex items-center gap-4 pt-4">
                <Button 
                  size="default" 
                  onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                >
                  Request
                </Button>
                <a 
                  href="#capabilities" 
                  onClick={(e) => handleScrollTo(e, "capabilities")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>More</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Block 3: Trial Matching (Image Right) */}
      <section id="matching" className="py-24 px-6 bg-black border-b border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="space-y-6"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Matching
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-[1.15]">
                Trial matching that puts the right patients in the right trials
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
                The algorithm matches patients to relevant clinical trials using inclusion criteria and medical history. Enrollment moves faster.
              </p>
              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300 font-normal">
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Inclusion criteria matching</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Medical history analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>Relevant trial discovery via ClinicalTrials.gov</span>
                </li>
              </ul>
              <div className="flex items-center gap-4 pt-4">
                <Button 
                  size="default" 
                  onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                >
                  Request
                </Button>
                <a 
                  href="#capabilities" 
                  onClick={(e) => handleScrollTo(e, "capabilities")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>More</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="editorial-img-container"
            >
              <img 
                src="/images/feature_matching.jpg" 
                alt="Clinical team matching trial candidates"
                className="w-full h-auto object-cover rounded-3xl"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* 5. CAPABILITIES GRID */}
      <section id="capabilities" className="py-24 px-6 bg-[#0a0a0a] border-b border-white/8">
        <div className="max-w-7xl mx-auto space-y-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end"
          >
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                Built for the demands of modern medical research
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
                Curalink Enterprise is more than analysis and matching. It is a complete intelligence platform with the security, integration, and flexibility your team needs.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[
              {
                icon: Database,
                title: "Federated Search Indexing",
                desc: "Queries PubMed, OpenAlex, and ClinicalTrials.gov concurrently with medical synonym resolution."
              },
              {
                icon: Cpu,
                title: "Multi-Parametric Score Engine",
                desc: "Custom 100-point algorithm ranking studies on publication recency, methodology, and journal authority."
              },
              {
                icon: FileSearch,
                title: "RAG Contextual Store",
                desc: "Upload institutional standards or case records to ground synthesis in factual, localized clinical files."
              },
              {
                icon: Layers,
                title: "Executive Synthesis Mode",
                desc: "Generate high-level strategic findings, clinical risks, and next-steps tailored for Principal Investigators."
              },
              {
                icon: ShieldCheck,
                title: "HIPAA Compliant Sandbox",
                desc: "All queries, vector stores, and sessions are encrypted and tenant-isolated via secure Clerk authentication."
              },
              {
                icon: BarChart3,
                title: "Observability Pipeline",
                desc: "Live analytics tracking agent runtimes, query distributions, and historical research metrics in real time."
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
                  className="editorial-card p-6 space-y-4 hover:border-white/20 transition-all duration-200"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-serif font-bold text-white">
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

      {/* 6. IMPACT STATS */}
      <section id="impact" className="py-24 px-6 bg-black border-b border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:col-span-5 space-y-6"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Impact
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                Measurable outcomes for clinical investigators
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
                By federating research repositories and automating multi-agent evidence synthesis, Curalink cuts months of literature investigation down to minutes.
              </p>
              <div className="pt-2">
                <Button 
                  size="default"
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
              className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6"
            >
              {[
                { stat: "78M+", label: "Indexed scientific publications across NIH & global repositories" },
                { stat: "94%", label: "Reduction in manual citation review & literature synthesis time" },
                { stat: "100-pt", label: "Objective multi-parametric evidence evaluation engine" },
                { stat: "100%", label: "Tenant isolation under HIPAA-compliant session encryption" }
              ].map((item, idx) => (
                <div key={idx} className="editorial-card p-6 space-y-2 border border-white/8">
                  <div className="text-3xl sm:text-4xl font-serif font-bold text-white">
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

      {/* 7. TESTIMONIAL */}
      <section className="py-24 px-6 bg-[#0a0a0a] border-b border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:col-span-5 editorial-img-container"
            >
              <img 
                src="/images/testimonial_doctor.jpg" 
                alt="Dr. Eleanor Vance, Chief Medical Officer"
                className="w-full h-auto object-cover rounded-3xl"
              />
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:col-span-7 space-y-6"
            >
              {/* 5-Star Row */}
              <div className="flex items-center gap-1 text-white">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-white text-white" />
                ))}
              </div>

              {/* Large Serif Italic Quote */}
              <blockquote className="text-xl sm:text-2xl md:text-3xl font-serif italic text-white leading-relaxed">
                “Curalink transformed how our oncology department synthesizes clinical trials. What used to take two weeks of manual literature review is now synthesized with empirical precision in under three minutes.”
              </blockquote>

              {/* Name & Title */}
              <div className="pt-2">
                <div className="text-sm font-semibold text-white">
                  Dr. Eleanor Vance, MD
                </div>
                <div className="text-xs text-slate-400 font-normal mt-0.5">
                  Chief Medical Officer, Advanced Oncology Institute
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 8. PRICING SECTION */}
      <section id="pricing" className="py-24 px-6 bg-black border-b border-white/8">
        <div className="max-w-7xl mx-auto space-y-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center space-y-4 max-w-2xl mx-auto"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              Pricing plans
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
                <div className={`h-4.5 w-4.5 rounded-full bg-white transition-transform ${
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
              className="editorial-card p-8 flex flex-col justify-between space-y-8"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Starter</h3>
                  <p className="text-xs text-slate-400 mt-1">For independent investigators and medical students.</p>
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
                    <span>Community support</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
              >
                Get started
              </Button>
            </motion.div>

            {/* Professional (Highlighted) */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="editorial-card p-8 flex flex-col justify-between space-y-8 border-white/30 relative bg-[#0e0e0e] shadow-2xl"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white text-black text-[10px] font-bold tracking-wider uppercase">
                Recommended
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Professional</h3>
                  <p className="text-xs text-slate-400 mt-1">For active clinical researchers and departmental teams.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-white">
                    {annualBilling ? "$64" : "$79"}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <div className="space-y-3 pt-4 border-t border-white/8 text-xs text-slate-300 font-normal">
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Unlimited federated queries</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Full ClinicalTrials.gov matching engine</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Executive synthesis generator</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Custom PDF chunking & RAG stores</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Priority email & chat support</span>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
              >
                Get started
              </Button>
            </motion.div>

            {/* Enterprise */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="editorial-card p-8 flex flex-col justify-between space-y-8"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Enterprise</h3>
                  <p className="text-xs text-slate-400 mt-1">For hospital networks, CROs, and pharmaceutical leaders.</p>
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
                    <span>BAA agreement signed for HIPAA</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>EHR / Epic / Cerner integration</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>Custom agent workflow orchestration</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>Dedicated clinical solutions architect</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
              >
                Contact sales
              </Button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 9. BLOG / INSIGHTS */}
      <section id="insights" className="py-24 px-6 bg-[#0a0a0a] border-b border-white/8">
        <div className="max-w-7xl mx-auto space-y-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Blog
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              Insights from the field
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
              Perspectives on clinical AI, oncology trials, and evidence synthesis methodologies.
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
                className="editorial-card overflow-hidden group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="overflow-hidden aspect-video border-b border-white/8">
                    <img 
                      src={post.img} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
                      <span className="text-white uppercase tracking-wider font-semibold">{post.category}</span>
                      <span>•</span>
                      <span>{post.time}</span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-normal leading-relaxed">
                      {post.desc}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] group-hover:underline">
                    Read more <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button variant="outline" size="default">
              View all articles
            </Button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-20 px-6 bg-black text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            
            {/* Logo + Tagline + Newsletter */}
            <div className="md:col-span-5 space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black font-serif font-bold text-sm">
                  C
                </div>
                <span className="text-base font-serif font-semibold tracking-tight text-white">
                  Curalink
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-normal">
                Enterprise AI research copilot for evidence-based decision making. Synthesize publications, analyze trials, and accelerate discovery.
              </p>

              {/* Newsletter Input */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Subscribe to our research newsletter
                </span>
                <div className="flex items-center gap-2 max-w-sm">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30"
                  />
                  <Button size="sm" variant="white">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>

            {/* 3 Link Columns */}
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
                  Company
                </div>
                <ul className="space-y-2 text-xs text-slate-400 font-normal">
                  <li><a href="#process" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#insights" className="hover:text-white transition-colors">Research Blog</a></li>
                  <li><a href="#impact" className="hover:text-white transition-colors">Case Studies</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-white uppercase tracking-wider">
                  Follow Us
                </div>
                <ul className="space-y-2 text-xs text-slate-400 font-normal">
                  <li><a href="#" className="hover:text-white transition-colors">Twitter / X</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                </ul>
              </div>

            </div>

          </div>

          <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-normal">
            <div>
              © {new Date().getFullYear()} Curalink Systems, Inc. All rights reserved. HIPAA & GDPR compliant.
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Security Statement</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
