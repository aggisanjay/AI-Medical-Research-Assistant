import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { EASE_OUT } from "@/lib/motion";
import { scrollToY } from "@/lib/lenis";

const HelixCanvas = lazy(() => import("./HelixScene"));

const CHAPTERS = [
  {
    id: "retrieve",
    label: "Retrieve",
    title: "Three registries, searched at once.",
    body: "Your question is expanded into several search variants and sent to PubMed, OpenAlex and ClinicalTrials.gov together. Results are merged, de-duplicated and ranked before anything is read.",
    facts: [
      ["PubMed", "Entrez E-utilities"],
      ["OpenAlex", "REST works API"],
      ["ClinicalTrials.gov", "v2 studies API"],
    ],
    dots: ["#38bdf8", "#a78bfa", "#34d399"],
    range: [0.16, 0.22, 0.31, 0.37],
  },
  {
    id: "reason",
    label: "Reason",
    title: "Nine agents. One job each.",
    body: "A bounded pipeline plans the query, searches, reads your own documents, extracts PICO fields, compares the evidence and writes a synthesis. Entities it finds are added to your knowledge graph.",
    facts: [
      ["Plan, search, retrieve", "Agents 1 to 3"],
      ["PICO and comparison", "Agents 4 and 5"],
      ["Synthesis and graph", "Agent 6"],
    ],
    dots: ["#a78bfa", "#a78bfa", "#a78bfa"],
    range: [0.42, 0.48, 0.58, 0.64],
  },
  {
    id: "verify",
    label: "Verify",
    title: "No citation goes out unchecked.",
    body: "Every PMID, trial ID and citation in the draft is extracted and checked against what was actually retrieved. Claims that cannot point to a source are flagged before the report is generated.",
    facts: [
      ["Citation check", "PMIDs, NCT IDs, references"],
      ["Groundedness", "Claim against retrieved text"],
      ["Quality review", "Final agent, before the report"],
    ],
    dots: ["#34d399", "#34d399", "#34d399"],
    range: [0.69, 0.75, 0.97, 1.0],
  },
] as const;

type Range = readonly [number, number, number, number];

function usePanel(progress: MotionValue<number>, r: Range) {
  const opacity = useTransform(progress, [r[0], r[1], r[2], r[3]], [0, 1, 1, 0]);
  const y = useTransform(progress, [r[0], r[1], r[2], r[3]], [28, 0, 0, -28]);
  const blur = useTransform(progress, [r[0], r[1], r[2], r[3]], [10, 0, 0, 10]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? "hidden" : "visible"));
  return { opacity, y, filter, pointerEvents, visibility };
}

const Facts: React.FC<{ rows: readonly (readonly [string, string])[]; dots?: readonly string[] }> = ({ rows, dots }) => (
  <dl className="mt-7 max-w-md border-t border-white/12">
    {rows.map(([k, v], i) => (
      <div key={k} className="flex items-baseline justify-between gap-6 border-b border-white/8 py-2.5">
        <dt className="flex items-center gap-2.5 text-[13px] text-white/55">
          {dots && <i className="h-1.5 w-1.5 rounded-full" style={{ background: dots[i], boxShadow: `0 0 10px ${dots[i]}` }} />}
          {k}
        </dt>
        <dd className="text-right font-mono text-[12px] text-white/85">{v}</dd>
      </div>
    ))}
  </dl>
);

const Chapter: React.FC<{ c: (typeof CHAPTERS)[number]; index: number; progress: MotionValue<number> }> = ({ c, index, progress }) => {
  const p = usePanel(progress, c.range);
  return (
    <motion.div style={p} className="[grid-area:1/1] self-end md:self-center">
      <p className="mb-4 text-[13px] text-white/50">
        Stage {index + 1} of {CHAPTERS.length}: {c.label}
      </p>
      <h2 className="font-serif text-[clamp(36px,4.8vw,68px)] font-light leading-[1.02] tracking-[-0.025em] text-white">{c.title}</h2>
      <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-white/65">{c.body}</p>
      <Facts rows={c.facts} dots={c.dots} />
    </motion.div>
  );
};

const HERO = ["Research where", "every claim has", "a source."];

export const StageSection: React.FC<{ signedIn: boolean; onPrimary: () => void }> = ({ signedIn, onPrimary }) => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 2400);
    return () => window.clearTimeout(t);
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.07, 0.14], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.07, 0.14], [0, 0, -40]);
  const heroBlur = useTransform(scrollYProgress, [0, 0.07, 0.14], [0, 0, 12]);
  const heroFilter = useTransform(heroBlur, (b) => `blur(${b}px)`);
  const heroEvents = useTransform(heroOpacity, (o) => (o > 0.5 ? "auto" : "none"));
  const heroVis = useTransform(heroOpacity, (o) => (o < 0.01 ? "hidden" : "visible"));
  const hero = { opacity: heroOpacity, y: heroY, filter: heroFilter, pointerEvents: heroEvents, visibility: heroVis };
  const railFill = useTransform(scrollYProgress, [0.2, 0.78], [0, 1]);
  const show = ready || reduce;

  const seeHow = () => {
    const el = ref.current;
    if (!el) return;
    scrollToY(el.getBoundingClientRect().top + window.scrollY + (el.offsetHeight - window.innerHeight) * 0.26);
  };

  return (
    <section ref={ref} id="method" aria-label="How CuraLink turns a question into a verified answer" className="relative bg-[#020203] text-white" style={{ height: reduce ? "auto" : "520svh" }}>
      <div className="sticky top-0 overflow-hidden" style={{ height: "100svh", minHeight: 560 }}>
        <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 1.5, ease: EASE_OUT }}>
          <Suspense fallback={null}>
            <HelixCanvas progress={scrollYProgress} reduced={!!reduce} onReady={() => setReady(true)} />
          </Suspense>
        </motion.div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,#020203_8%,rgba(2,2,3,0.7)_38%,transparent_62%)] md:bg-[linear-gradient(to_right,#020203_6%,rgba(2,2,3,0.75)_34%,transparent_60%)]" />

        <div className="relative z-10 mx-auto grid h-full max-w-[1320px] items-end px-5 pb-10 sm:px-8 md:items-center md:px-12 md:pb-0">
          <div className="grid w-full pt-24 md:w-[52%] md:pt-0 lg:w-[46%]">
            <motion.div style={reduce ? undefined : hero} className="[grid-area:1/1] self-end md:self-center">
              <h1 className="font-serif text-[clamp(46px,9vw,120px)] font-light leading-[0.94] tracking-[-0.03em] md:text-[clamp(46px,6.6vw,108px)]">
                {HERO.map((line, i) => (
                  <span key={line} className="line-mask">
                    <motion.span className="block" initial={reduce ? false : { y: "112%" }} animate={{ y: show ? "0%" : "112%" }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.15 + i * 0.12 }}>
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
                animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
                transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.65 }}
                className="mt-6 max-w-[31rem] text-[16px] leading-relaxed text-white/65 md:text-[17px]"
              >
                CuraLink searches PubMed, OpenAlex and ClinicalTrials.gov, runs a nine-agent pipeline over what it finds, and verifies each citation before it writes the answer.
              </motion.p>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
                animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
                transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.8 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <button onClick={onPrimary} className="group flex items-center gap-3 rounded-full bg-white pl-6 pr-2 py-2 text-[15px] font-medium text-black transition-colors hover:bg-sky-100 active:scale-[0.97]">
                  {signedIn ? "Open investigation" : "Start researching"}
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-white transition-transform duration-300 group-hover:-rotate-45">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
                <button onClick={seeHow} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-[15px] text-white/85 backdrop-blur-md transition-colors hover:bg-white/10">
                  See the pipeline <ArrowDown className="h-4 w-4" />
                </button>
              </motion.div>
              <p className="mt-6 max-w-md text-[12.5px] text-white/40">A research aid for investigators. It does not provide medical advice or replace clinical judgement.</p>
            </motion.div>

            {!reduce && CHAPTERS.map((c, i) => <Chapter key={c.id} c={c} index={i} progress={scrollYProgress} />)}
          </div>
        </div>

        {!reduce && (
          <div aria-hidden="true" className="absolute right-10 top-1/2 z-10 hidden h-44 w-px -translate-y-1/2 bg-white/15 md:block">
            <motion.div className="absolute inset-x-0 top-0 h-full origin-top bg-sky-300" style={{ scaleY: railFill }} />
            {CHAPTERS.map((c, i) => (
              <span key={c.id} className="absolute right-4 -translate-y-1/2 whitespace-nowrap text-[12px] text-white/50" style={{ top: `${i * 50}%` }}>
                {c.label}
                <span className="absolute -right-[21px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full border border-white/40 bg-[#020203]" />
              </span>
            ))}
          </div>
        )}
      </div>

      {reduce && (
        <div className="relative z-10 mx-auto grid max-w-[1320px] gap-16 px-5 py-20 sm:px-8 md:px-12">
          {CHAPTERS.map((c, i) => (
            <div key={c.id}>
              <p className="mb-3 text-[13px] text-white/50">Stage {i + 1} of {CHAPTERS.length}: {c.label}</p>
              <h2 className="font-serif text-5xl font-light leading-none">{c.title}</h2>
              <p className="mt-4 max-w-md text-white/65">{c.body}</p>
              <Facts rows={c.facts} dots={c.dots} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
