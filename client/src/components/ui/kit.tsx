import React, { forwardRef, useEffect, useRef, useState } from "react";
import { animate, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Workspace kit: one set of cards, buttons, stats and tags so every
 * screen reads the same. Body text is 14px+, meta text is 12.5px+.
 * ------------------------------------------------------------------ */

export const SRC = {
  PubMed: { color: "#38bdf8", label: "PubMed" },
  OpenAlex: { color: "#a78bfa", label: "OpenAlex" },
  ClinicalTrials: { color: "#34d399", label: "ClinicalTrials.gov" },
} as const;

export function sourceColor(name?: string) {
  const n = (name || "").toLowerCase();
  if (n.includes("pubmed")) return SRC.PubMed.color;
  if (n.includes("openalex")) return SRC.OpenAlex.color;
  if (n.includes("trial")) return SRC.ClinicalTrials.color;
  return "#94a3b8";
}

export const Panel: React.FC<React.HTMLAttributes<HTMLDivElement> & { padded?: boolean; interactive?: boolean }> = ({
  className,
  padded = true,
  interactive,
  children,
  ...rest
}) => (
  <div
    {...rest}
    className={cn(
      "rounded-xl border border-white/10 bg-white/[0.03]",
      padded && "p-4 sm:p-5",
      interactive && "transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.05]",
      className,
    )}
  >
    {children}
  </div>
);

export const PanelTitle: React.FC<{ title: string; hint?: string; right?: React.ReactNode; className?: string }> = ({ title, hint, right, className }) => (
  <div className={cn("mb-3.5 flex items-start justify-between gap-3", className)}>
    <div className="min-w-0">
      <h3 className="text-[14.5px] font-medium leading-tight text-white">{title}</h3>
      {hint && <p className="mt-1 text-[12px] leading-snug text-white/50">{hint}</p>}
    </div>
    {right}
  </div>
);

export const PageHead: React.FC<{ title: string; description?: React.ReactNode; actions?: React.ReactNode }> = ({ title, description, actions }) => (
  <div className="mb-5 sm:mb-6 flex flex-col justify-between gap-3.5 sm:flex-row sm:items-end">
    <div className="min-w-0">
      <h1 className="font-serif text-[24px] sm:text-[28px] font-light leading-[1.1] tracking-[-0.02em] text-white">{title}</h1>
      {description && <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-white/55">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
};
export const Btn = forwardRef<HTMLButtonElement, BtnProps>(({ variant = "secondary", size = "md", icon, className, children, ...rest }, ref) => (
  <button
    ref={ref}
    {...rest}
    className={cn(
      "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45",
      size === "sm" && "h-8 px-3 text-[12px]",
      size === "md" && "h-8.5 px-3.5 text-[13px]",
      size === "lg" && "h-9.5 px-5 text-[13.5px]",
      variant === "primary" && "bg-white text-black hover:bg-sky-100",
      variant === "secondary" && "border border-white/14 bg-white/[0.04] text-white hover:border-white/28 hover:bg-white/[0.09]",
      variant === "ghost" && "text-white/65 hover:bg-white/8 hover:text-white",
      variant === "danger" && "border border-red-400/30 bg-red-400/10 text-red-200 hover:bg-red-400/20",
      className,
    )}
  >
    {icon}
    {children}
  </button>
));
Btn.displayName = "Btn";

export const IconBtn = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>(({ label, className, children, ...rest }, ref) => (
  <button
    ref={ref}
    aria-label={label}
    title={label}
    {...rest}
    className={cn("grid h-8.5 w-8.5 place-items-center rounded-full border border-white/12 text-white/65 transition-colors hover:border-white/25 hover:bg-white/8 hover:text-white", className)}
  >
    {children}
  </button>
));
IconBtn.displayName = "IconBtn";

export const Chip: React.FC<{ color?: string; children: React.ReactNode; className?: string; dot?: boolean }> = ({ color = "#94a3b8", children, className, dot = true }) => (
  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none", className)} style={{ borderColor: color + "44", color, background: color + "14" }}>
    {dot && <i className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
    {children}
  </span>
);

export function useCountUp(target: number, decimals = 0) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? target : 0);
  const fmt = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const [text, setText] = useState(fmt(reduce ? target : 0));
  useEffect(() => mv.on("change", (v) => setText(fmt(v))), [mv]); // eslint-disable-line
  useEffect(() => {
    if (reduce) {
      mv.set(target);
      return;
    }
    if (!inView) return;
    const c = animate(mv, target, { duration: 1.1, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [target, inView, reduce, mv]);
  return { ref, text };
}

export const Num: React.FC<{ value: number; decimals?: number; suffix?: string; prefix?: string; className?: string }> = ({ value, decimals = 0, suffix = "", prefix = "", className }) => {
  const { ref, text } = useCountUp(value, decimals);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
};

export const Stat: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ElementType;
  color?: string;
  loading?: boolean;
}> = ({ label, value, hint, icon: Icon, color = "#38bdf8", loading }) => (
  <Panel className="relative overflow-hidden p-3.5 sm:p-4" interactive>
    <div className="flex items-start justify-between">
      <p className="text-[12px] font-medium text-white/60">{label}</p>
      <span className="grid h-7.5 w-7.5 place-items-center rounded-lg" style={{ background: color + "18", color }}>
        <Icon className="h-3.5 w-3.5" />
      </span>
    </div>
    <div className="mt-2 text-[22px] sm:text-[24px] font-normal leading-none tracking-tight text-white">{loading ? <Skeleton className="h-7 w-20" /> : value}</div>
    {hint && <p className="mt-1.5 text-[11px] leading-snug text-white/45">{hint}</p>}
    <span aria-hidden className="absolute inset-x-0 bottom-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}88, transparent)` }} />
  </Panel>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = "h-5 w-full" }) => (
  <div aria-hidden className={cn("relative overflow-hidden rounded-lg bg-white/[0.06]", className)}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);

export const Empty: React.FC<{ icon: React.ElementType; title: string; body?: string; action?: React.ReactNode; className?: string }> = ({ icon: Icon, title, body, action, className }) => (
  <div className={cn("flex flex-col items-center justify-center px-4 py-8 text-center", className)}>
    <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55">
      <Icon className="h-4 w-4" />
    </span>
    <p className="text-[14px] font-medium text-white">{title}</p>
    {body && <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-white/50">{body}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ChartTip: React.FC<{ active?: boolean; payload?: any[]; label?: string | number; unit?: string }> = ({ active, payload, label, unit }) =>
  active && payload?.length ? (
    <div className="rounded-lg border border-white/12 bg-[#0b0b10] px-3 py-2 text-[12px] shadow-2xl">
      {label !== undefined && <p className="mb-1 text-white/55">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-white">
          <i className="h-1.5 w-1.5 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          {p.name ?? p.dataKey}: <b className="font-medium tabular-nums">{Number(p.value).toLocaleString()}</b>
          {unit}
        </p>
      ))}
    </div>
  ) : null;

export const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1 block text-[12px] font-medium text-white/70">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-[11.5px] text-white/40">{hint}</span>}
  </label>
);

export const inputCls =
  "h-9 w-full rounded-lg border border-white/12 bg-black/40 px-3 text-[13px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-sky-300/60 focus:ring-1 focus:ring-sky-300/15";
