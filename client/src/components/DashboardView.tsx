import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, BookOpen, Clock, Database, FileText, FlaskConical, Gauge, History, MessageSquare, Plus, Search, Upload } from "lucide-react";
import { api } from "@/lib/api";
import { Btn, ChartTip, Chip, Empty, Num, Panel, PanelTitle, PageHead, Skeleton, Stat, sourceColor } from "@/components/ui/kit";

interface DashboardViewProps {
  items: any[];
  loading: boolean;
  onNavigate: (tab: string) => void;
  onSelectConversation: (id: string) => void;
  onSearchSuggest: (query: string) => void;
}

const SUGGESTED = [
  { q: "Latest immunotherapy approaches for stage IV melanoma", icon: FlaskConical, color: "#34d399" },
  { q: "Osimertinib trial outcomes in EGFR-mutant NSCLC", icon: BookOpen, color: "#38bdf8" },
  { q: "CAR-T advances in relapsed lymphoma", icon: Search, color: "#a78bfa" },
  { q: "Trastuzumab deruxtecan in HER2-low breast cancer", icon: Search, color: "#38bdf8" },
];

function timeAgo(iso?: string) {
  if (!iso) return "";
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

export function DashboardView({ items, loading, onNavigate, onSelectConversation, onSearchSuggest }: DashboardViewProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .getAnalytics()
      .then((res) => alive && res.success && setAnalytics(res.data))
      .catch(() => {})
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [items]);

  const m = analytics?.metrics;
  const distribution: { name: string; value: number }[] = analytics?.distribution ?? [];
  const exec: { name: string; duration: number }[] = analytics?.executionTimes ?? [];
  const timeline: { year: number; count: number }[] = analytics?.timeline ?? [];
  const totalSources = distribution.reduce((a, d) => a + d.value, 0);
  const hasDist = totalSources > 0;
  const hasTimeline = timeline.some((t) => t.count > 0);
  const hasExec = exec.some((e) => e.duration > 0);
  const score = m?.averageConfidenceScore ? Number(m.averageConfidenceScore) : 0;

  const execData = useMemo(() => [...exec].sort((a, b) => b.duration - a.duration), [exec]);

  const go = (id: string) => {
    onSelectConversation(id);
    onNavigate("chat");
  };

  return (
    <div className="view-stagger space-y-5 pb-12">
      <PageHead
        title="Overview"
        description="Your research activity and the evidence behind it. Numbers here come from your own investigations and uploads."
        actions={
          <>
            <Btn variant="secondary" size="sm" icon={<Upload className="h-3.5 w-3.5" />} onClick={() => onNavigate("documents")}>
              Upload document
            </Btn>
            <Btn variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => go("")}>
              New investigation
            </Btn>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-5">
        <Stat loading={busy} label="Sources retrieved" icon={Database} color="#38bdf8" value={<Num value={m?.sourcesRetrieved ?? 0} />} hint="Papers and trials returned" />
        <Stat loading={busy} label="Citations generated" icon={BookOpen} color="#a78bfa" value={<Num value={m?.citationsGenerated ?? 0} />} hint="References in your reports" />
        <Stat loading={busy} label="Research sessions" icon={History} color="#34d399" value={<Num value={m?.researchSessions ?? 0} />} hint="Investigations logged" />
        <Stat loading={busy} label="Documents" icon={FileText} color="#fbbf24" value={<Num value={m?.documentsUploaded ?? 0} />} hint="Uploaded to your workspace" />
        <Stat
          loading={busy}
          label="Grounding score"
          icon={Gauge}
          color="#f472b6"
          value={score > 0 ? <Num value={score} suffix="%" /> : <span className="text-white/35">No data</span>}
          hint="Claims matched to a source"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-3.5 lg:grid-cols-12">
        <Panel className="lg:col-span-5">
          <PanelTitle title="Evidence by source" hint="Where retrieved records came from" />
          {busy ? (
            <Skeleton className="h-52 w-full" />
          ) : hasDist ? (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative h-[180px] w-[180px] shrink-0" role="img" aria-label="Evidence by source">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3} stroke="none" animationDuration={900}>
                      {distribution.map((d) => (
                        <Cell key={d.name} fill={sourceColor(d.name)} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div className="text-[22px] font-normal leading-none text-white">
                      <Num value={totalSources} />
                    </div>
                    <div className="mt-1 text-[11px] text-white/50">records</div>
                  </div>
                </div>
              </div>
              <ul className="w-full space-y-2">
                {distribution.map((d) => (
                  <li key={d.name} className="flex items-center gap-2.5 text-[13px]">
                    <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: sourceColor(d.name) }} />
                    <span className="text-white/85">{d.name}</span>
                    <span className="ml-auto tabular-nums text-white/60">{d.value.toLocaleString()}</span>
                    <span className="w-9 text-right tabular-nums text-white/35">{Math.round((d.value / totalSources) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Empty icon={Database} title="No sources yet" body="Run an investigation and the registries it searched will be broken down here." />
          )}
        </Panel>

        <Panel className="lg:col-span-7">
          <PanelTitle title="Publications by year" hint="Publication years of the literature you retrieved" />
          {busy ? (
            <Skeleton className="h-52 w-full" />
          ) : hasTimeline ? (
            <div className="h-[200px]" role="img" aria-label="Publications by year">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: "rgba(255,255,255,0.2)" }} />
                  <Area type="monotone" dataKey="count" name="Publications" stroke="#38bdf8" strokeWidth={2} fill="url(#tl)" animationDuration={1000} dot={{ r: 2.5, fill: "#38bdf8", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty icon={BookOpen} title="No publications yet" body="After your first investigation this chart shows how recent the evidence is." />
          )}
        </Panel>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-12">
        <Panel className="lg:col-span-5">
          <PanelTitle title="Where time goes" hint="Average time per pipeline stage" right={<Chip color="#94a3b8" dot={false}>ms</Chip>} />
          {busy ? (
            <Skeleton className="h-52 w-full" />
          ) : hasExec ? (
            <div className="h-[195px]" role="img" aria-label="Average time per stage in milliseconds">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={execData} layout="vertical" margin={{ top: 0, right: 14, left: 0, bottom: 0 }} barSize={13}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={124} tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 11.5 }} />
                  <Tooltip content={<ChartTip unit=" ms" />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="duration" name="Duration" radius={[0, 6, 6, 0]} animationDuration={900}>
                    {execData.map((_, i) => (
                      <Cell key={i} fill={["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#f472b6"][i % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty icon={Clock} title="No timings yet" body="Stage durations are recorded each time the pipeline runs." />
          )}
        </Panel>

        <Panel className="lg:col-span-7" padded={false}>
          <div className="px-4 pt-4 sm:px-5 sm:pt-5">
            <PanelTitle
              title="Recent investigations"
              hint="Pick up where you left off"
              right={
                items.length > 0 ? (
                  <Btn size="sm" variant="ghost" onClick={() => onNavigate("chat")} icon={<ArrowUpRight className="h-3 w-3" />}>
                    Open workspace
                  </Btn>
                ) : undefined
              }
            />
          </div>
          {loading ? (
            <div className="space-y-2.5 px-4 pb-5 sm:px-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <Empty icon={MessageSquare} title="No investigations yet" body="Start one from the suggestions below, or write your own question." action={<Btn variant="primary" size="sm" onClick={() => go("")}>Start an investigation</Btn>} />
          ) : (
            <ul className="divide-y divide-white/8 border-t border-white/8">
              {items.slice(0, 5).map((c) => (
                <li key={c.conversationId}>
                  <button onClick={() => go(c.conversationId)} className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] sm:px-5">
                    <span className="grid h-8.5 w-8.5 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-300">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] text-white">{c.disease || c.patientName || "Investigation"}</span>
                      <span className="mt-0.5 block truncate text-[12px] text-white/45">{c.lastMessage || `${c.messageCount} messages`}</span>
                    </span>
                    <span className="shrink-0 text-right text-[11.5px] text-white/40">
                      {timeAgo(c.updatedAt)}
                      <span className="block">{c.messageCount} msgs</span>
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-white/30 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Start here */}
      <div>
        <h2 className="mb-2.5 text-[14px] font-medium text-white/80">Start with a question</h2>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {SUGGESTED.map(({ q, icon: Icon, color }) => (
            <button key={q} onClick={() => onSearchSuggest(q)} className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-white/22 hover:bg-white/[0.06]">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: color + "18", color }}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[13px] leading-snug text-white/85">{q}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
