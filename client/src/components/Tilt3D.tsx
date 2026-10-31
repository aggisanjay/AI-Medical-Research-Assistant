import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

/** Wraps any card: tilts toward the pointer in 3D and adds a moving light glare. */
export function Tilt3D({ children, max = 9, className = "" }: { children: ReactNode; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5), py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 220, damping: 20 });
  const sy = useSpring(py, { stiffness: 220, damping: 20 });
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const glare = useTransform([sx, sy], ([x, y]: number[]) =>
    `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.10), transparent 55%)`);

  const move = (e: React.PointerEvent) => {
    if (reduce || !ref.current) return;
    const b = ref.current.getBoundingClientRect();
    px.set((e.clientX - b.left) / b.width);
    py.set((e.clientY - b.top) / b.height);
  };
  const leave = () => { px.set(0.5); py.set(0.5); };

  return (
    <div style={{ perspective: 900 }} className={className}>
      <motion.div ref={ref} onPointerMove={move} onPointerLeave={leave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={reduce ? undefined : { translateZ: 18, scale: 1.015 }}
        className="relative rounded-3xl will-change-transform">
        {children}
        <motion.div aria-hidden style={{ background: glare }}
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 [div:hover>&]:opacity-100 transition-opacity" />
      </motion.div>
    </div>
  );
}
