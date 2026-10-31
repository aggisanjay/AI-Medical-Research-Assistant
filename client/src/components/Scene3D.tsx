import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

// Position plates on the outer flanks so the center reading column remains 100% clear
const PLATES = [
  { label: "PubMed Central", z: 70, color: "#38bdf8", x: -280, y: -70 },
  { label: "OpenAlex Knowledge", z: 50, color: "#a78bfa", x: 280, y: -50 },
  { label: "ClinicalTrials.gov", z: -40, color: "#34d399", x: 260, y: 160 },
];

/** Decorative 3D layer: source plates & DNA helix positioned strictly in the deep background and flanks. */
export function Scene3D() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 45, damping: 20 });
  const sy = useSpring(my, { stiffness: 45, damping: 20 });
  const rotateY = useTransform(sx, [-1, 1], [-14, 14]);
  const rotateX = useTransform(sy, [-1, 1], [10, -10]);

  useEffect(() => {
    if (reduce) return;
    const h = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", h);
    return () => window.removeEventListener("pointermove", h);
  }, [reduce, mx, my]);

  return (
    <div 
      aria-hidden 
      className="scene-3d-container pointer-events-none absolute inset-0 z-0 hidden lg:grid place-items-center opacity-30 overflow-hidden"
      style={{ perspective: 1400 }}
    >
      <motion.div 
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, scale: 0.85 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 1.4 }}
        className="relative h-[550px] w-full max-w-6xl mx-auto"
      >
        {/* Floating Peripheral Source Plates */}
        {PLATES.map((p, i) => (
          <motion.div 
            key={p.label}
            style={{ 
              translateZ: p.z, 
              x: p.x, 
              y: p.y, 
              borderColor: `${p.color}40`, 
              background: `${p.color}08`,
              boxShadow: `0 0 45px ${p.color}15` 
            }}
            animate={reduce ? undefined : { y: [p.y, p.y - 10, p.y] }}
            transition={{ duration: 7 + i * 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/2 -ml-[110px] -mt-[60px] h-32 w-[220px] rounded-2xl border border-white/10 backdrop-blur-[2px] p-4 pointer-events-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold" style={{ color: p.color }}>
                {p.label}
              </span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
            </div>
            {[80, 55, 35].map((w, idx) => (
              <div 
                key={idx} 
                className="mt-2.5 h-1 rounded-full bg-white/10" 
                style={{ width: `${w}%` }} 
              />
            ))}
          </motion.div>
        ))}

        {/* Bioluminescent DNA Helix - Positioned Lower Behind Dashboard Rather Than Behind Headline Text */}
        <motion.div 
          className="absolute left-1/2 top-[68%] -translate-x-1/2 -translate-y-1/2" 
          style={{ transformStyle: "preserve-3d" }}
          animate={reduce ? undefined : { rotateY: 360 }} 
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 4;
            const isCyan = i % 2 === 0;
            return (
              <span 
                key={i} 
                className={`absolute h-2 w-2 rounded-full ${
                  isCyan 
                    ? "bg-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                    : "bg-indigo-400/50 shadow-[0_0_10px_rgba(129,140,248,0.5)]"
                }`}
                style={{ 
                  transform: `translate3d(${Math.cos(a) * 110}px, ${(i - 8) * 18}px, ${Math.sin(a) * 110}px)` 
                }} 
              />
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
