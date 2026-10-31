import React, { useEffect, useState } from "react";
import { Check, CircleDot, Clock } from "lucide-react";

export interface ChipState {
  id: string;
  label: string;
  badge?: string;
  time?: string;
}

interface StateChipRailProps {
  states?: ChipState[];
  activeIdx?: number;
  onStateChange?: (index: number) => void;
  className?: string;
  autoPlay?: boolean;
}

export const StateChipRail: React.FC<StateChipRailProps> = ({
  states = [
    { id: "ingest", label: "PubMed & NIH Ingest", badge: "14.2k Docs", time: "0.4s" },
    { id: "map", label: "Knowledge Graph Link", badge: "2,400 Nodes", time: "0.8s" },
    { id: "filter", label: "Contradiction Filter", badge: "0 Conflicts", time: "1.2s" },
    { id: "consensus", label: "Consensus Synthesis", badge: "98.4% Confidence", time: "1.6s" }
  ],
  activeIdx: controlledIdx,
  onStateChange,
  className = "",
  autoPlay = false
}) => {
  const [internalIdx, setInternalIdx] = useState(0);
  const currentIdx = controlledIdx !== undefined ? controlledIdx : internalIdx;

  useEffect(() => {
    if (!autoPlay || controlledIdx !== undefined) return;
    const interval = setInterval(() => {
      setInternalIdx((prev) => (prev + 1) % states.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [autoPlay, controlledIdx, states.length]);

  const handleClick = (idx: number) => {
    if (controlledIdx === undefined) {
      setInternalIdx(idx);
    }
    onStateChange?.(idx);
  };

  return (
    <div className={`w-full overflow-x-auto pb-1 scrollbar-none ${className}`}>
      <div className="flex items-center gap-2 sm:gap-3 min-w-max p-1.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md">
        {states.map((state, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <button
              key={state.id}
              onClick={() => handleClick(idx)}
              className={`group relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-blue-600/20 border border-blue-500/40 text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  : isDone
                  ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-300/90 hover:bg-emerald-500/15"
                  : "bg-white/[0.03] border border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]"
              }`}
            >
              {/* State Indicator Glyph */}
              <span className="flex items-center justify-center h-4 w-4 rounded-full">
                {isDone ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[2.5]" />
                ) : isActive ? (
                  <CircleDot className="h-3.5 w-3.5 text-blue-400 animate-spin" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                )}
              </span>

              {/* Label */}
              <span className="font-medium tracking-tight">
                {state.label}
              </span>

              {/* HyperFrames Badge Pop */}
              {state.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-all ${
                    isActive
                      ? "bg-blue-400 text-black shadow-sm"
                      : isDone
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  {state.badge}
                </span>
              )}

              {/* Micro Time Marker */}
              {state.time && (
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] text-slate-500 opacity-70">
                  <Clock className="h-2.5 w-2.5" />
                  {state.time}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

