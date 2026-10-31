import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Scroll choreography for the landing page: smooth scroll, masked headline reveals,
 *  hero scrub, scroll progress bar. Everything is reverted on unmount. */
export function useLandingMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 1. Smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync
      const lenis = new Lenis({ lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // 2. Scroll progress bar
      const bar = document.createElement("div");
      bar.className = "fixed left-0 top-0 z-[100] h-[2px] w-full origin-left bg-white/80";
      document.body.appendChild(bar);
      gsap.fromTo(bar, { scaleX: 0 }, {
        scaleX: 1, ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });

      // 3. Headlines: lines slide up out of a mask
      document.querySelectorAll<HTMLElement>("#hero h1, section[id] h2").forEach((el) => {
        const isHero = el.closest("#hero") !== null;
        SplitText.create(el, {
          type: "lines", mask: "lines", autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110, rotate: 3, duration: 1.1, ease: "expo.out", stagger: 0.1,
              delay: isHero ? 0.3 : 0,
              scrollTrigger: isHero ? undefined : { trigger: el, start: "top 88%", once: true },
            }),
        });
      });

      // 4. Hero scrub: foreground drifts up, background 3D scene gently fades
      const hero = "#hero";
      gsap.to(`${hero} > .relative.z-10`, {
        yPercent: -18, opacity: 0.15, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(`${hero} .scene-3d-container`, {
        yPercent: 8, opacity: 0, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });

      return () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        bar.remove();
      };
    });
    return () => mm.revert();
  }, []);
}

