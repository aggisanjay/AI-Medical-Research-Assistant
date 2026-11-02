import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

export const RiseTitle: React.FC<{ lines: string[]; className?: string }> = ({ lines, className = "" }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduce = useReducedMotion();
  return (
    <h2 ref={ref} className={className} aria-label={lines.join(" ")}>
      {lines.map((l, i) => (
        <span key={l} className="line-mask" aria-hidden="true">
          <motion.span className="block" initial={reduce ? false : { y: "112%" }} animate={{ y: inView || reduce ? "0%" : "112%" }} transition={{ duration: 1, ease: EASE_OUT, delay: i * 0.1 }}>
            {l}
          </motion.span>
        </span>
      ))}
    </h2>
  );
};

export const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string; y?: number }> = ({ children, delay = 0, className, y = 28 }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
};

/** Glass card whose edge glow follows the cursor. */
export const Spot: React.FC<{ children: React.ReactNode; className?: string; glow?: string }> = ({ children, className = "", glow = "56,189,248" }) => {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = ref.current!.getBoundingClientRect();
    ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onPointerMove={move} className={`group/spot relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{ background: `radial-gradient(380px circle at var(--mx,50%) var(--my,50%), rgba(${glow},0.13), transparent 60%)` }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};
