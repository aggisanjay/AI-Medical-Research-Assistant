import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Clock, Coins, Cpu, Database, Gauge, HardDrive, Layers, RefreshCw, TrendingDown } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Btn, ChartTip, Chip, Empty, Num, PageHead, Panel, PanelTitle, Skeleton, Stat } from "@/components/ui/kit";

const dur = (s: number) => (s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} m` : `${Math.floor(s / 60)} m ${s % 60} s`);

export function ObservabilityView() {
  const [t, setT] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [at, setAt] = useState<Date | null>(null);

  const load = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const res = await api.getObservabilityTelemetry();
      setT(res.telemetry);
      setAt(new Date());
    } catch (err: any) {
      toast.error(`Failed to load telemetry: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    const id = setInterval(() => load(true), 15000);
    return () => clearInterval(id);
  }, []);

  const tok = t?.tokenAndCostAnalytics;
  const sys = t?.system;
  const wf = t?.agentWorkflows;
  const recent: any[] = tok?.realtimeMetrics?.cumulative?.recentQueries ?? [];
  const split = tok ? [{ name: "Prompt", value: tok.totalPromptTokens || 0, fill: "#38bdf8" }, { name: "Completion", value: tok.totalCompletionTokens || 0, fill: "#a78bfa" }] : [];
  const hasTok = split.some((s) => s.value > 0);
  const bars = recent.slice(-8).map((q, i) => ({ n: `#${i + 1}`, Prompt: q.promptTokens || 0, Completion: q.completionTokens || 0 }));
  const heapPct = sys ? Math.round((sys.processHeapUsedMB / Math.max(1, sys.processHeapTotalMB)) * 100) : 0;
  const memUsed = sys ? sys.totalMemMB - sys.freeMemMB : 0;
  const memPct = sys ? Math.round((memUsed / Math.max(1, sys.totalMemMB)) * 100) : 0;

  return (
    <div className="view-stagger space-y-5 pb-12">
      <PageHead
        title="Observability"
        description="Latency, token usage and system health. Refreshes every 15 seconds."
        actions={
          <>
            {at && <span className="text-[12px] text-white/40">Updated {at.toLocaleTimeString()}</span>}
            <Btn variant="secondary" size="sm" disabled={loading} onClick={() => load()} icon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}>Refresh</Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4">
        <Stat loading={!t} label="Average latency" icon={Clock} color="#38bdf8" value={<><Num value={wf?.avgLatencyMs || 0} /><span className="ml-1 text-[13px] text-white/45">ms</span></>} hint="Per research query" />
        <Stat loading={!t} label="Queries processed" icon={Gauge} color="#34d399" value={<Num value={wf?.totalProcessed || 0} />} hint="Since the server started or from the ledger" />
        <Stat loading={!t} label="Error rate" icon={AlertTriangle} color={(wf?.errorRate || 0) > 0.05 ? "#f87171" : "#fbbf24"} value={<Num value={(wf?.errorRate || 0) * 100} decimals={1} suffix="%" />} hint={`${wf?.totalErrors || 0} failed runs`} />
        <Stat loading={!t} label="Uptime" icon={Cpu} color="#a78bfa" value={<span className="text-[20px]">{sys ? dur(sys.uptimeSeconds) : "—"}</span>} hint="API process" />
      </div>

      <div className="grid gap-3.5 lg:grid-cols-12">
        <Panel className="lg:col-span-4">
          <PanelTitle title="Token usage" hint="All recorded model calls" />
          {!t ? <Skeleton className="h-48 w-full" /> : hasTok ? (
            <>
              <div className="relative mx-auto h-[160px] w-[160px]" role="img" aria-label="Prompt versus completion tokens">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={split} dataKey="value" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={3} stroke="none" animationDuration={900}>
                      {split.map((s) => <Cell key={s.name} fill={s.fill} />)}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <div><div className="text-[20px] font-normal leading-none text-white"><Num value={tok.totalTokensConsumed || 0} /></div><div className="mt-1 text-[11px] text-white/50">tokens</div></div>
                </div>
              </div>
              <ul className="mt-3 space-y-2 text-[12.5px]">
                {split.map((s) => (
                  <li key={s.name} className="flex items-center gap-2.5"><i className="h-2 w-2 rounded-full" style={{ background: s.fill }} /><span className="text-white/80">{s.name}</span><span className="ml-auto tabular-nums text-white/60">{s.value.toLocaleString()}</span></li>
                ))}
              </ul>
            </>
          ) : <Empty icon={Coins} title="No usage yet" body="Token counts appear after the first model call." />}
        </Panel>

        <Panel className="lg:col-span-8">
          <PanelTitle title="Cost" hint="Priced from the server's model catalog" right={tok && <Chip color="#34d399" dot={false}><TrendingDown className="h-3 w-3" />{tok.savingsFormatted} vs GPT-4o</Chip>} />
          {!t ? <Skeleton className="h-48 w-full" /> : (
            <>
              <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
                <div><div className="text-[12px] text-white/50">Total spend</div><div className="font-serif text-[28px] sm:text-[32px] font-light leading-none text-white">{tok?.costFormatted || "$0.00000"}</div></div>
                <div><div className="text-[12px] text-white/50">Model calls</div><div className="text-[20px] font-normal text-white tabular-nums">{(tok?.realtimeMetrics?.cumulative?.queryCount ?? wf?.totalProcessed ?? 0).toLocaleString()}</div></div>
              </div>
              {bars.length > 0 ? (
                <div className="h-[150px]" role="img" aria-label="Tokens for the most recent queries">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bars} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barSize={18}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="n" tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                      <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="Prompt" stackId="a" fill="#38bdf8" />
                      <Bar dataKey="Completion" stackId="a" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="text-[13px] text-white/40">Per-query bars appear after a few runs.</p>}
            </>
          )}
        </Panel>
      </div>

      <Panel padded={false}>
        <div className="px-4 pt-4 sm:px-5 sm:pt-5"><PanelTitle title="Recent model calls" hint="Most recent first" right={<Layers className="h-4 w-4 text-white/30" />} /></div>
        {recent.length === 0 ? <Empty icon={Layers} title="No calls recorded" body="Each model call is logged with its tokens and exact cost." /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[12.5px]">
              <thead><tr className="border-y border-white/8 text-white/45">
                {["Time", "Model", "Prompt", "Completion", "Cost", "Saved"].map((h, i) => <th key={h} className={`px-4 py-2.5 font-medium sm:px-5 ${i > 1 ? "text-right" : ""}`}>{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-white/6">
                {[...recent].slice(-8).reverse().map((q, i) => (
                  <tr key={q.id || i} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-2.5 text-white/50 sm:px-5">{new Date(q.timestamp).toLocaleTimeString()}</td>
                    <td className="px-4 py-2.5 text-white sm:px-5">{q.model || "Not reported"} {q.provider && <span className="ml-2 rounded-md bg-white/8 px-1.5 py-0.5 text-[11px] text-white/55">{q.provider}</span>}</td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-sky-300 sm:px-6">{(q.promptTokens || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-violet-300 sm:px-6">{(q.completionTokens || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-white sm:px-6">{q.costFormatted}</td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-emerald-300 sm:px-6">{q.savingsFormatted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelTitle title="Services" hint="Connectivity" />
          {!t ? <Skeleton className="h-24 w-full" /> : (
            <ul className="space-y-3">
              {[["MongoDB", t.databases?.mongodb], ["Knowledge graph", t.databases?.knowledgeGraph]].map(([n, v]) => {
                const ok = /connected|operational|ok|ready/i.test(String(v));
                return (
                  <li key={n} className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-3">
                    <Database className="h-[18px] w-[18px] text-white/45" />
                    <span className="text-[14.5px] text-white">{n}</span>
                    <Chip color={ok ? "#34d399" : "#f87171"} className="ml-auto">{String(v)}</Chip>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
        <Panel>
          <PanelTitle title="Runtime" hint="Server resources" right={<HardDrive className="h-5 w-5 text-white/30" />} />
          {!sys ? <Skeleton className="h-28 w-full" /> : (
            <div className="space-y-5">
              {[["Process heap", `${sys.processHeapUsedMB} of ${sys.processHeapTotalMB} MB`, heapPct, "#38bdf8"], ["System memory", `${memUsed} of ${sys.totalMemMB} MB`, memPct, "#a78bfa"]].map(([l, v, p, c]) => (
                <div key={l as string}>
                  <div className="mb-1.5 flex justify-between text-[13.5px]"><span className="text-white/70">{l}</span><span className="tabular-nums text-white/50">{v}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${p}%`, background: c as string }} /></div>
                </div>
              ))}
              <p className="text-[13px] text-white/40">Node {sys.nodeVersion} on {sys.platform} · {sys.cpuCores} cores</p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
