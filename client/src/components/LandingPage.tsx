import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useClerk, useUser } from "@clerk/react";
import { useReducedMotion } from "framer-motion";
import { startLenis, stopLenis } from "@/lib/lenis";
import { LandingNav } from "./landing/LandingNav";
import { StageSection } from "./landing/StageSection";
import { AgentsSection, ClosingCta, FaqSection, LandingFooter, Manifesto, SafeguardsSection } from "./landing/Sections";

export function LandingPage() {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    startLenis();
    return () => stopLenis();
  }, [reduce]);

  const signedIn = !!isSignedIn;
  const primary = () => (signedIn ? navigate({ to: "/dashboard" }) : openSignIn());

  return (
    <div className="relative overflow-x-clip bg-[#020203] font-sans text-white selection:bg-sky-400/30">
      <LandingNav signedIn={signedIn} onPrimary={primary} onSignIn={() => openSignIn()} />
      <main>
        <StageSection signedIn={signedIn} onPrimary={primary} />
        <Manifesto />
        <AgentsSection />
        <SafeguardsSection />
        <FaqSection />
        <ClosingCta signedIn={signedIn} onPrimary={primary} />
      </main>
      <LandingFooter signedIn={signedIn} onSignIn={() => openSignIn()} />
    </div>
  );
}
