import { useState, useEffect } from "react";
import { 
  FileUp, FileText, CheckCircle, AlertCircle, RefreshCw, 
  Trash2, Search, ArrowRight, ShieldCheck, Sparkles, 
  ChevronRight, Calendar, Users, MapPin, FlaskConical 
} from "lucide-react";

interface DocumentAnalysisViewProps {
  onSendToWorkspace: (query: string) => void;
}

interface MockFile {
  name: string;
  size: string;
}

export function DocumentAnalysisView({ onSendToWorkspace }: DocumentAnalysisViewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<MockFile | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile({
        name: dropped.name,
        size: `${(dropped.size / (1024 * 1024)).toFixed(2)} MB`
      });
    }
  };

  const selectMockFile = () => {
    setFile({
      name: "patient_case_ref_309_lung_adenocarcinoma.pdf",
      size: "2.8 MB"
    });
  };

  const startAnalysis = () => {
    if (!file) return;
    setAnalyzing(true);
    setProgress(0);
    setProcessingStep(0);
    setShowResults(false);
  };

  // Simulate upload progress & step-by-step extraction timeline
  useEffect(() => {
    if (!analyzing) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [analyzing]);

  useEffect(() => {
    if (!analyzing || progress < 100) return;

    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev >= 4) {
          clearInterval(stepInterval);
          setTimeout(() => {
            setAnalyzing(false);
            setShowResults(true);
          }, 800);
          return 4;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(stepInterval);
  }, [analyzing, progress]);

  const removeFile = () => {
    setFile(null);
    setShowResults(false);
  };

  const processingSteps = [
    "Extracting clinical entities and patient demographics...",
    "Scanning PubMed and OpenAlex database for gene mutations (EGFR T790M)...",
    "Filtering active trials matching inclusion/exclusion criteria...",
    "Synthesizing customized evidence briefs & patient options summary..."
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">
          Document Intelligence
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Upload medical case reports, pathology scans, or research papers for instant semantic breakdown.
        </p>
      </div>

      {!analyzing && !showResults && (
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Drag & Drop Zone */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[300px] relative ${
              dragActive 
                ? "border-cyan-500 bg-cyan-950/15 shadow-[0_0_30px_rgba(6,182,212,0.1)]" 
                : "border-slate-800 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-900/10"
            }`}
          >
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              HIPAA Compliant Sandbox
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-primary mb-6 shadow-inner">
              <FileUp className="h-8 w-8 text-cyan-400" />
            </div>

            <h3 className="text-lg font-bold text-white font-display">Drag & Drop case report or paper</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-sm font-light">
              Supported file types: PDF, DOCX, XML, TXT, or JSON. Files are processed locally and never stored.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 items-center justify-center">
              <label className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-4 py-2 text-xs font-semibold text-white transition-all">
                Browse Files
                <input type="file" className="hidden" onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile({
                      name: e.target.files[0].name,
                      size: `${(e.target.files[0].size / (1024 * 1024)).toFixed(2)} MB`
                    });
                  }
                }} />
              </label>

              <button 
                onClick={selectMockFile}
                className="inline-flex items-center justify-center rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 px-4 py-2 text-xs font-semibold text-cyan-400 transition-all"
              >
                Use Patient Case Sample
              </button>
            </div>
          </div>

          {/* Selected File Details */}
          {file && (
            <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between animate-slide-up">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">{file.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{file.size}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={removeFile}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-red-950/30 hover:border-red-900 hover:text-red-400 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={startAnalysis}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-all"
                >
                  Start AI Document Analysis
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* AI Processing Screen */}
      {analyzing && (
        <div className="max-w-2xl mx-auto glass-card p-8 rounded-3xl border border-white/5 text-center space-y-8 animate-pulse-slow">
          
          <div className="relative flex justify-center items-center my-6">
            {/* Spinning scanner rings */}
            <div className="absolute h-24 w-24 rounded-full border border-cyan-500/20 animate-ping" />
            <div className="absolute h-16 w-16 rounded-full border-t-2 border-cyan-400 animate-spin" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-cyan-400 border border-cyan-500/30">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white font-display">
              {progress < 100 ? `Uploading to secure HIPAA sandbox... ${progress}%` : "Curalink AI is analyzing your document"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-light leading-relaxed">
              Extracting clinical terms, matching gene structures, and preparing citations summary.
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Live Step Tracker */}
          {progress === 100 && (
            <div className="text-left bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2">
                Processing Timeline
              </div>
              <div className="space-y-3.5">
                {processingSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 shrink-0">
                      {processingStep > idx ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      ) : processingStep === idx ? (
                        <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-slate-800" />
                      )}
                    </div>
                    <span className={`text-xs ${
                      processingStep > idx 
                        ? "text-slate-400 font-light line-through" 
                        : processingStep === idx 
                          ? "text-white font-medium" 
                          : "text-slate-600 font-light"
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Analysis Results Display */}
      {showResults && file && (
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
          
          {/* Top Panel Actions & Alert */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/60 border border-slate-900 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-cyan-400 shrink-0" />
              <span className="text-xs text-slate-300 font-light">
                Successfully parsed <strong className="font-semibold text-white">{file.name}</strong>. Extracted demographics & gene variants.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={removeFile}
                className="text-xs px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:text-white transition-all"
              >
                Clear Document
              </button>
              <button 
                onClick={() => onSendToWorkspace("Synthesized treatment options for Stage IV Adenocarcinoma with EGFR L858R mutation")}
                className="flex items-center gap-1 text-xs px-3.5 py-2 rounded-xl bg-primary text-white font-semibold shadow-lg hover:opacity-95 transition-all"
              >
                Send to Workspace Chat
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Panel: Patient Entity Extraction Cards */}
            <div className="space-y-4 lg:col-span-1">
              
              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-display">
                  Extracted Demographics
                </h3>
                
                <div className="space-y-3.5 text-xs font-light">
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-500">Patient Identifier</span>
                    <span className="text-slate-200 font-semibold">REF-30912</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-500">Age / Gender</span>
                    <span className="text-slate-200">62 / Female</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-500">Histology</span>
                    <span className="text-slate-200">Lung Adenocarcinoma</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-500">Clinical Stage</span>
                    <span className="text-slate-200">Stage IV Metastatic</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-display">
                  Genomic Markers
                </h3>
                
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#c084fc]">EGFR Mutation</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#a855f7] text-white">L858R (+)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#ec4899]/10 border border-[#ec4899]/20 flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#f472b6]">EGFR Resistance</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ec4899] text-white">T790M (-)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex justify-between items-center text-slate-400">
                    <span className="text-xs">ALK Fusion</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500">Not Detected</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Panel: Synthesis Summary & Citations */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Brief Summary */}
              <div className="glass-card p-6 rounded-2xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5 font-display">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  Clinical Findings Synthesis
                </h3>
                <div className="text-sm text-slate-300 font-light leading-relaxed space-y-3.5">
                  <p>
                    The case outlines a 62-year-old female presenting with stage IV metastatic lung adenocarcinoma, harboring the EGFR L858R mutation. There is no evidence of the T790M gatekeeper mutation or ALK/ROS1 translocations.
                  </p>
                  <p>
                    Based on current standard of care and recent clinical publications, first-line tyrosine kinase inhibitor (TKI) therapy with osimertinib shows a superior progression-free survival (PFS) margin compared to older generation TKIs (gefitinib/erlotinib) in the L858R cohort. Additionally, active clinical trials are exploring osimertinib in combination with chemotherapy or novel MET inhibitors to delay potential resistance pathways.
                  </p>
                </div>
              </div>

              {/* Citations Grid */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Matched Literature & Trials briefs (3)
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  
                  <a 
                    href="https://pubmed.ncbi.nlm.nih.gov" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-4 rounded-xl border border-white/5 bg-slate-900/60 hover:bg-slate-900 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        PUBMED
                      </span>
                      <span className="text-[10px] text-slate-500">2023 · Article</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-primary transition-colors line-clamp-2">
                      Osimertinib in untreated EGFR-mutated advanced Non-Small-Cell Lung Cancer
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      FLAURA trial outcome details progression free survival benefits in metastatic cohorts.
                    </p>
                  </a>

                  <a 
                    href="https://clinicaltrials.gov" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-4 rounded-xl border border-white/5 bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        TRIAL
                      </span>
                      <span className="text-[10px] text-slate-500">NCT04035486 · Phase 3</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-primary transition-colors line-clamp-2">
                      Study of Osimertinib with or without Chemotherapy in EGFR-mutated Lung Cancer
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      Recruiting · 14 locations · Assessing combination therapy vs osimertinib monotherapy.
                    </p>
                  </a>

                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
