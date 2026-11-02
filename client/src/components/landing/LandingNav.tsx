import React, { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { scrollToId } from "@/lib/lenis";
import { EASE_OUT } from "@/lib/motion";

const LINKS = [
  { id: "method", label: "Method" },
  { id: "agents", label: "Agents" },
  { id: "safeguards", label: "Safeguards" },
  { id: "faq", label: "FAQ" },
];

export const LandingNav: React.FC<{ signedIn: boolean; onPrimary: () => void; onSignIn: () => void }> = ({ signedIn, onPrimary, onSignIn }) => {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 160 && !open);
  });
  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: hidden ? -90 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <div className="pointer-events-auto w-full max-w-[920px]">
        <nav aria-label="Primary" className="flex items-center justify-between gap-3 rounded-full border border-white/12 bg-black/55 py-2 pl-3 pr-2 shadow-[0_10px_40px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5 pl-1 pr-2" aria-label="CuraLink, back to top">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white font-serif text-sm font-semibold text-black">C</span>
            <span className="font-serif text-[19px] leading-none tracking-tight text-white">CuraLink</span>
          </button>
          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.id}>
                <button onClick={() => go(l.id)} className="rounded-full px-3.5 py-2 text-[13px] text-white/65 transition-colors hover:bg-white/8 hover:text-white">
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1.5">
            {!signedIn && (
              <button onClick={onSignIn} className="hidden rounded-full px-3.5 py-2 text-[13px] text-white/80 transition-colors hover:text-white sm:block">
                Sign in
              </button>
            )}
            <button onClick={onPrimary} className="group flex items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-[13px] font-medium text-black transition-colors hover:bg-sky-100 active:scale-[0.97]">
              <span className="whitespace-nowrap">{signedIn ? "Open" : "Start"}<span className="hidden sm:inline">{signedIn ? " investigation" : " researching"}</span></span>
              <span className="grid h-6 w-6 place-items-center rounded-full bg-black text-white transition-transform duration-300 group-hover:-rotate-45">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
            <button onClick={() => setOpen((o) => !o)} className="grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/10 md:hidden" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.25, ease: EASE_OUT }} className="mt-2 rounded-3xl border border-white/12 bg-black/90 p-2 backdrop-blur-xl md:hidden">
              {LINKS.map((l) => (
                <button key={l.id} onClick={() => go(l.id)} className="w-full rounded-2xl px-4 py-3 text-left text-[15px] text-white/85 hover:bg-white/8">
                  {l.label}
                </button>
              ))}
              {!signedIn && (
                <button onClick={() => { setOpen(false); onSignIn(); }} className="w-full rounded-2xl px-4 py-3 text-left text-[15px] text-white/85 hover:bg-white/8">
                  Sign in
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};
