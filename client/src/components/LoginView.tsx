import { useState, useEffect } from "react";
import { Activity, Shield, CheckCircle } from "lucide-react";
import { SignIn } from "@clerk/react";

export function LoginView() {
  const [particles, setParticles] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  // Generate floating background particles
  useEffect(() => {
    const list = Array.from({ length: 8 }).map((_, i) => {
      const size = Math.random() * 80 + 40;
      return {
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 80 + 10}%`,
          top: `${Math.random() * 80 + 10}%`,
          animationDuration: `${Math.random() * 15 + 15}s`,
          animationDelay: `${Math.random() * -20}s`,
        }
      };
    });
    setParticles(list);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#020617] text-slate-100 font-sans overflow-hidden">
      
      {/* LEFT PANEL */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-between p-8 lg:p-16 mesh-gradient overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/40">
        {particles.map((p) => (
          <div key={p.id} className="floating-particle" style={p.style} />
        ))}

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_20px_rgba(37,99,235,0.4)] pulse-cyan-glow">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white font-display">Curalink</span>
            <span className="ml-1.5 text-[10px] font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-950/50 border border-cyan-800/30 px-1.5 py-0.5 rounded">Enterprise</span>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12 max-w-lg">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-white font-display leading-[1.15]">
            AI Medical Research Assistant
          </h1>
          <p className="mt-4 text-base lg:text-lg text-slate-300 leading-relaxed font-light">
            Transforming Medical Knowledge Into Actionable Intelligence.
          </p>

          <div className="mt-8 glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-500" />
            <p className="text-sm italic text-slate-200 leading-relaxed font-light">
              "Every breakthrough in medicine begins with a question. Our AI helps researchers find answers faster, more accurately, and with greater confidence."
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                AI Medical Research Platform
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3.5">
            {[
              "AI-Powered Research Analysis",
              "Medical Document Intelligence",
              "Evidence-Based Insights",
              "Secure Healthcare Data Processing",
              "Enterprise Grade Security"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300 font-light">
                <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/50">
          <div>
            <div className="text-2xl font-bold text-white font-display">95%</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-light">Faster Research</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-display">50K+</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-light">Papers Parsed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-display">99.9%</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-light">Secure Infrastructure</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 bg-gradient-to-b from-[#090d16] to-[#020617] relative">
        <div className="absolute w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <SignIn
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full mx-auto",
                card: "bg-slate-950/60 backdrop-blur-xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-3xl p-2",
                headerTitle: "text-white font-display font-extrabold text-xl tracking-tight",
                headerSubtitle: "text-slate-400 text-xs font-light mt-1",
                socialButtonsBlockButton: "bg-slate-900 border border-white/5 hover:border-slate-700 text-white hover:bg-slate-800 transition-all duration-300 rounded-xl",
                formButtonPrimary: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] font-semibold transition-all duration-300 rounded-xl py-2.5",
                formFieldLabel: "text-xs font-semibold text-slate-350 uppercase tracking-wider",
                formFieldInput: "bg-slate-900/60 border border-white/5 text-white focus:border-blue-500/50 transition-colors rounded-xl py-2.5",
                footerActionText: "text-slate-400 text-xs font-light",
                footerActionLink: "text-cyan-400 hover:text-cyan-300 transition-colors font-semibold",
                dividerLine: "bg-white/5",
                dividerText: "text-slate-500 text-[10px] font-mono",
                identityPreviewText: "text-slate-300",
                identityPreviewEditButtonIcon: "text-cyan-400 hover:text-cyan-300",
              }
            }}
          />
        </div>

        {/* HIPAA Security Footer */}
        <div className="mt-8 text-center text-[10px] text-slate-500 flex items-center gap-2 justify-center">
          <Shield className="h-3.5 w-3.5 text-slate-500" />
          HIPAA & GDPR Compliant Security · SOC 2 Type II Certified
        </div>
      </div>

    </div>
  );
}
