import { useState, useEffect } from "react";
import { 
  BarChart3, Play, RefreshCw, CheckCircle2, XCircle, 
  Sparkles, TrendingUp, AlertTriangle, Layers, Clock
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function EvaluationView() {
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const res = await api.getEvaluationRuns();
      setRuns(res.data || []);
      if (res.data?.length > 0 && !selectedRun) {
        setSelectedRun(res.data[0]);
      }
    } catch (err: any) {
      toast.error(`Failed to load evaluation runs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleRunBenchmark = async () => {
    try {
      setRunning(true);
      toast.info("Running automated medical benchmark suite across clinical QA references...");
      const res = await api.triggerEvaluationRun();
      toast.success("Benchmark completed successfully");
      setSelectedRun(res.data);
      fetchRuns();
    } catch (err: any) {
      toast.error(`Evaluation failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const metrics = selectedRun?.metrics;

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <BarChart3 className="h-4 w-4" /> Automated LLM & RAG Benchmarking
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mt-1">Evaluation & Regression Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized evaluation test suite measuring medical factual accuracy, groundedness, recall@k, and citation precision.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-md"
          >
            {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            Run Benchmark Suite
          </button>
          <button
            onClick={fetchRuns}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-slate-300 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Metrics Scorecards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="rounded-xl bg-white/[0.02] border border-white/8 p-3.5 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Factual Accuracy</div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {(metrics.factualAccuracy * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-slate-500">{metrics.passedTests}/{metrics.totalTests} tests passed</div>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/8 p-3.5 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Groundedness Score</div>
            <div className="text-xl font-bold font-mono text-cyan-400">
              {(metrics.groundednessScore * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-slate-500">Source attribution</div>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/8 p-3.5 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Recall @ k=5</div>
            <div className="text-xl font-bold font-mono text-purple-400">
              {(metrics.retrievalRecallAtK * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-slate-500">MRR: {metrics.mrr}</div>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/8 p-3.5 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Citation Precision</div>
            <div className="text-xl font-bold font-mono text-teal-400">
              {(metrics.citationPrecision * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-slate-500">Zero fabrication</div>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/8 p-3.5 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Unsupported Claims</div>
            <div className="text-xl font-bold font-mono text-rose-400">
              {(metrics.unsupportedClaimRate * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-slate-500">Hallucination rate</div>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/8 p-3.5 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Avg Latency</div>
            <div className="text-xl font-bold font-mono text-slate-200">
              {metrics.avgLatencyMs}ms
            </div>
            <div className="text-[10px] text-slate-500">End-to-end DAG</div>
          </div>
        </div>
      )}

      {/* Main Breakdown: Run Selection + Individual Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Past Runs (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Evaluation Runs ({runs.length})
          </div>
          <div className="space-y-2">
            {runs.map((r) => {
              const isSelected = selectedRun?.runId === r.runId;
              return (
                <div
                  key={r.runId}
                  onClick={() => setSelectedRun(r)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? "bg-cyan-500/[0.08] border-cyan-500/40"
                      : "bg-white/[0.02] border-white/8 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{r.runId}</span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {(r.metrics?.factualAccuracy * 100).toFixed(0)}% Acc
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Dataset: {r.datasetVersion}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{new Date(r.createdAt).toLocaleString()}</span>
                    <span>{r.metrics?.totalTests || 0} Cases</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Test Cases Breakdown (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Benchmark Test Cases ({selectedRun?.testResults?.length || 0})
          </div>
          <div className="space-y-3">
            {selectedRun?.testResults?.map((test: any) => (
              <div
                key={test.testId}
                className="rounded-xl bg-white/[0.02] border border-white/8 p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                        {test.domain}
                      </span>
                      <span className="text-xs font-mono font-bold text-white">{test.testId}</span>
                    </div>
                    <h4 className="text-xs font-medium text-slate-200">{test.query}</h4>
                  </div>
                  {test.passed ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="h-3 w-3" /> Passed
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-medium flex items-center gap-1 shrink-0">
                      <XCircle className="h-3 w-3" /> Regression
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 bg-black/40 rounded-lg p-2.5 border border-white/5">
                  <strong className="text-slate-300">Expected Clinical Ground Truth:</strong>
                  <div className="mt-0.5 text-slate-300">{test.actualResponse}</div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span>Groundedness: <strong className="text-slate-300 font-mono">{(test.groundedness * 100).toFixed(0)}%</strong></span>
                    <span>Precision: <strong className="text-slate-300 font-mono">{(test.citationPrecision * 100).toFixed(0)}%</strong></span>
                  </div>
                  <span className="font-mono">{test.latencyMs}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
