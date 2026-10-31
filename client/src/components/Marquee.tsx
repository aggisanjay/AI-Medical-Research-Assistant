import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ITEMS = [
  "PubMed", 
  "OpenAlex", 
  "ClinicalTrials.gov", 
  "PICO extraction", 
  "Citation verification", 
  "Knowledge graph", 
  "Document RAG", 
  "Token observability"
];

/** Endless band that speeds up (and reverses) with scroll velocity, skewing as it goes. */
export function Marquee() {
  const track = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const loop = gsap.to(track.current, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
      const skew = gsap.quickTo(band.current, "skewX", { duration: 0.4 });
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = self.getVelocity();
          gsap.to(loop, { timeScale: gsap.utils.clamp(-6, 6, v / 250) || 1, duration: 0.2, overwrite: true });
          gsap.to(loop, { timeScale: self.direction, duration: 1, delay: 0.2 });
          skew(gsap.utils.clamp(-8, 8, -v / 400));
        },
      });
    });
    return () => mm.revert();
  });

  const row = ITEMS.concat(ITEMS);
  return (
    <div ref={band} className="overflow-hidden border-y border-white/8 bg-black py-6" aria-hidden>
      <div ref={track} className="flex w-max gap-12 whitespace-nowrap will-change-transform">
        {row.concat(row).map((t, i) => (
          <span key={i} className="font-serif text-4xl italic text-white/80 sm:text-6xl">
            {t}<span className="ml-12 text-white/25">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

