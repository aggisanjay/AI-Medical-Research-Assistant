import { useState } from "react";
import { 
  FileText, BookOpen, Download, Printer, CheckCircle, 
  RefreshCw, ArrowRight, UserCheck, ShieldAlert 
} from "lucide-react";

export function ReportsView() {
  const [reportType, setReportType] = useState("clinical_trial");
  const [patientId, setPatientId] = useState("REF-30912");
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledReport, setCompiledReport] = useState<boolean>(false);

  const handleCompile = () => {
    setIsCompiling(true);
    setCompiledReport(false);
    setTimeout(() => {
      setIsCompiling(false);
      setCompiledReport(true);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">
          Clinical Reports
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Compile publication-ready summaries, trial briefs, and medical research documentation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Report Options & Inputs */}
        <div className="lg:col-span-1 glass-card p-5 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
            Report Parameters
          </h3>

          {/* Template Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider ml-1">Template Type</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "clinical_trial", label: "Clinical Trial Match", icon: FileText },
                { id: "lit_synthesis", label: "Literature Synthesis", icon: BookOpen },
              ].map((tmpl) => {
                const Icon = tmpl.icon;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setReportType(tmpl.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      reportType === tmpl.id 
                        ? "border-primary bg-primary/10 text-white" 
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-semibold">{tmpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Context ID */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider ml-1">Patient context ID</label>
            <input 
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="e.g. PATIENT-882"
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-blue-500/40"
            />
          </div>

          {/* Settings */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Exclude patient name</span>
              <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/20" />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Include full reference list</span>
              <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/20" />
            </div>
          </div>

          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-[0_4px_12px_rgba(37,99,235,0.25)] disabled:opacity-50"
          >
            {isCompiling ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Compiling Clinical Data...
              </>
            ) : (
              <>
                Compile Structured Report
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Right Side: PDF Preview */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="flex justify-between items-center bg-slate-950/50 border border-slate-900 px-4 py-2.5 rounded-2xl">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">
              Report preview
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={!compiledReport}
                onClick={() => window.print()}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Printer className="h-3.5 w-3.5" />
              </button>
              <button 
                disabled={!compiledReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-semibold text-slate-300 transition-colors disabled:opacity-30"
              >
                <Download className="h-3.5 w-3.5 shrink-0" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Compiled Output Container */}
          {!isCompiling && !compiledReport && (
            <div className="border border-white/5 rounded-2xl p-16 text-center space-y-4 bg-slate-950/20 min-h-[400px] flex flex-col justify-center items-center">
              <FileText className="h-10 w-10 text-slate-650" />
              <h3 className="text-sm font-bold text-slate-350">Report not generated yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto font-light leading-relaxed">
                Adjust the clinical settings on the left panel and click "Compile" to build a structured report brief.
              </p>
            </div>
          )}

          {isCompiling && (
            <div className="border border-white/5 rounded-2xl p-16 text-center space-y-4 bg-slate-950/20 min-h-[400px] flex flex-col justify-center items-center shimmer-bg">
              <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin" />
              <h3 className="text-sm font-bold text-white">Aggregating evidence briefs...</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto font-light">
                Fetching details from PubMed, matching trials registries, and formatting bibliography structure.
              </p>
            </div>
          )}

          {compiledReport && (
            <div className="border border-slate-800/80 rounded-2xl p-8 bg-slate-950/70 text-slate-300 font-sans shadow-2xl relative overflow-hidden animate-slide-up text-left leading-relaxed">
              {/* Board Header style */}
              <div className="flex justify-between items-start border-b border-slate-850 pb-6 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white font-display uppercase tracking-wider">
                    CURALINK CLINICAL RESEARCH REPORT
                  </h2>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-3">
                    <span>Date: 2026-06-01</span>
                    <span>Patient Identifier: {patientId}</span>
                    <span>Security: HIPAA Restricted</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                    <UserCheck className="h-3.5 w-3.5" />
                    Compiled
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 block">Curalink Synthesis v2.1</span>
                </div>
              </div>

              {/* Case Brief info */}
              <div className="space-y-6 text-xs font-light">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    1. Demographics & Biomarker Summary
                  </h4>
                  <p>
                    Patient {patientId} exhibits histologically confirmed metastatic lung adenocarcinoma. Molecular assays identify a high-frequency EGFR L858R point mutation in exon 21. No resistance pathway biomarkers (EGFR T790M, ALK, or ROS1 translocations) were detected.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    2. Recommended Active Trials Matches
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>
                      <strong className="text-slate-200">FLAURA-2 Equivalent Combinations</strong>: Osimertinib + Pemetrexed/Platin chemotherapy regimens. Showed 29.4 months progression-free survival (PFS) in Phase 3 trials.
                    </li>
                    <li>
                      <strong className="text-slate-200">NCT04035486 (Study of Osimertinib)</strong>: Active recruiting sites matching demographic profiles in the European and North American sectors.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    3. Bibliography Sources
                  </h4>
                  <div className="text-[10px] text-slate-500 font-mono space-y-1">
                    <div>[1] Sarris et al. Journal of Thoracic Oncology 2024;19(4):612-622. DOI: 10.1016/j.jtho.2024</div>
                    <div>[2] ClinicalTrials.gov Registry ID: NCT04035486 [Last Access Date: June 2026]</div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-8 pt-4 border-t border-slate-900 text-[9px] text-slate-500 flex items-start gap-2 leading-relaxed">
                <ShieldAlert className="h-4 w-4 text-slate-650 shrink-0 mt-0.5" />
                <span>
                  Disclaimers: Curalink is an evidence aggregator assisting medical researchers. All findings must be validated and approved by qualified board-certified clinicians prior to active oncology treatment administration.
                </span>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
