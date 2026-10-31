import React, { useEffect, useState } from "react";

interface TelemetryHudProps {
  children: React.ReactNode;
  className?: string;
  readouts?: { label: string; value: string; accent?: boolean }[];
  status?: string;
}

export const TelemetryHud: React.FC<TelemetryHudProps> = ({
  children,
  className = "",
  readouts = [
    { label: "NIH_STREAM", value: "CONNECTED", accent: true },
    { label: "PUBMED_INDEX", value: "78.4M CITATIONS" },
    { label: "TTFT_LATENCY", value: "382ms" },
    { label: "CONSENSUS_HASH", value: "0x9F4A...B21" }
  ],
  status = "LIVE TELEMETRY ACTIVE"
}) => {
  const [coords, setCoords] = useState({ x: 124.8, y: 89.2 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCoords({
        x: +(120 + Math.random() * 10).toFixed(1),
        y: +(85 + Math.random() * 8).toFixed(1)
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative group ${className}`}>
      {/* HyperFrames Corner Brackets with Glow */}
      {/* Top Left */}
      <div className="absolute -top-3 -left-3 z-30 pointer-events-none text-blue-400/70 transition-transform duration-300 group-hover:scale-110">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M 0 16 L 0 2 C 0 0.9 0.9 0 2 0 L 16 0" />
        </svg>
      </div>

      {/* Top Right */}
      <div className="absolute -top-3 -right-3 z-30 pointer-events-none text-blue-400/70 transition-transform duration-300 group-hover:scale-110">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M 22 16 L 22 2 C 22 0.9 21.1 0 20 0 L 6 0" />
        </svg>
      </div>

      {/* Bottom Left */}
      <div className="absolute -bottom-3 -left-3 z-30 pointer-events-none text-blue-400/70 transition-transform duration-300 group-hover:scale-110">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M 0 6 L 0 20 C 0 21.1 0.9 22 2 22 L 16 22" />
        </svg>
      </div>

      {/* Bottom Right */}
      <div className="absolute -bottom-3 -right-3 z-30 pointer-events-none text-blue-400/70 transition-transform duration-300 group-hover:scale-110">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M 22 6 L 22 20 C 22 21.1 21.1 22 20 22 L 6 22" />
        </svg>
      </div>

      {/* Top Header HUD Rail */}
      <div className="absolute -top-7 inset-x-2 hidden sm:flex items-center justify-between text-[10px] font-mono text-slate-400 pointer-events-none z-20">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="tracking-wider uppercase text-slate-300 font-semibold">{status}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span>X: {coords.x}</span>
          <span>Y: {coords.y}</span>
          <span className="text-emerald-400/90 font-semibold">60.0 FPS</span>
        </div>
      </div>

      {/* Bottom Footer HUD Readouts */}
      <div className="absolute -bottom-7 inset-x-2 hidden md:flex items-center justify-between text-[9px] font-mono text-slate-400 pointer-events-none z-20">
        <div className="flex items-center gap-4">
          {readouts.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="text-slate-500">{item.label}:</span>
              <span className={item.accent ? "text-blue-400 font-bold" : "text-slate-300"}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
        <div className="text-slate-500">
          SECURE PROTOCOL v2
        </div>
      </div>

      {/* Main Slotted Frame */}
      {children}
    </div>
  );
};

