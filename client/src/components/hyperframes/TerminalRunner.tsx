import React, { useEffect, useState } from "react";
import { Terminal, CheckCircle2, ShieldCheck, Cpu } from "lucide-react";

interface TerminalRunnerProps {
  command?: string;
  className?: string;
}

export const TerminalRunner: React.FC<TerminalRunnerProps> = ({
  command = "curalink protocol run --target=nih-mesh-consensus --strict-hipaa",
  className = ""
}) => {
  const [typedText, setTypedText] = useState("");
  const [stage, setStage] = useState<"typing" | "running" | "done">("typing");
  const [outputs, setOutputs] = useState<string[]>([]);

  useEffect(() => {
    let currentIdx = 0;
    setTypedText("");
    setOutputs([]);
    setStage("typing");

    const typingTimer = setInterval(() => {
      if (currentIdx < command.length) {
        setTypedText(command.slice(0, currentIdx + 1));
        currentIdx++;
      } else {
        clearInterval(typingTimer);
        setStage("running");

        // Stagger output lines
        setTimeout(() => {
          setOutputs((prev) => [...prev, "[OK] Initializing HIPAA isolated execution enclave"]);
        }, 300);

        setTimeout(() => {
          setOutputs((prev) => [...prev, "[OK] Ingested 14,280 NIH PubMed citations & CheckMate 067 registries"]);
        }, 800);

        setTimeout(() => {
          setOutputs((prev) => [...prev, "[OK] Knowledge graph mapped 2,400 entity relations across MeSH ontology"]);
        }, 1300);

        setTimeout(() => {
          setOutputs((prev) => [
            ...prev,
            "[DONE] Multi-agent consensus converged (Score: 98.4/100, Hallucination: 0.00%)"
          ]);
          setStage("done");
        }, 1800);
      }
    }, 28);

    return () => clearInterval(typingTimer);
  }, [command]);

  return (
    <div className={`rounded-2xl bg-[#050508] border border-white/12 p-4 font-mono text-xs text-slate-300 shadow-2xl space-y-3 ${className}`}>
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/8 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 font-semibold text-slate-300 flex items-center gap-1.5">
            <Terminal className="h-3 w-3 text-blue-400" />
            curalink-cli · protocol-enclave
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="h-3 w-3" />
            ENCLAVE ISOLATED
          </span>
        </div>
      </div>

      {/* Command Prompt Line */}
      <div className="flex items-center gap-2 text-white">
        <span className="text-blue-400 font-bold select-none">$</span>
        <span>{typedText}</span>
        {stage === "typing" && (
          <span className="h-4 w-1.5 bg-blue-400 inline-block animate-pulse" />
        )}
      </div>

      {/* Output Stream */}
      {outputs.length > 0 && (
        <div className="space-y-1.5 pt-2 text-[11px]">
          {outputs.map((out, idx) => {
            const isDone = out.startsWith("[DONE]");
            return (
              <div
                key={idx}
                className={`flex items-center gap-2 ${
                  isDone ? "text-emerald-300 font-semibold pt-1" : "text-slate-400"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Cpu className="h-3.5 w-3.5 text-blue-400/80 shrink-0" />
                )}
                <span>{out}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

