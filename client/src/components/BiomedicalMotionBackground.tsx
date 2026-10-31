import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export function BiomedicalMotionBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    // High density particle constellation
    const NODE_COUNT = 75;
    const CONNECT_DISTANCE = 140;
    const colors = [
      "rgba(59, 130, 246, ",  // Clinical Blue (#3b82f6)
      "rgba(99, 102, 241, ",  // Neural Indigo (#6366f1)
      "rgba(147, 197, 253, ", // Ice Cyan (#93c5fd)
      "rgba(167, 139, 250, ", // Soft Violet (#a78bfa)
      "rgba(255, 255, 255, ", // Pure Signal White
    ];

    let nodes: Node[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initNodes();
    };

    const initNodes = () => {
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        const z = Math.random() * 0.8 + 0.2; // Depth 0.2 - 1.0
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          vx: (Math.random() - 0.5) * 0.45 * z,
          vy: (Math.random() - 0.5) * 0.45 * z,
          radius: (Math.random() * 2 + 1.2) * z,
          baseRadius: (Math.random() * 2 + 1.2) * z,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.45 + 0.35,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    resize();

    let time = 0;

    const render = () => {
      time += 0.015;

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle ambient fluid glow orbs
      const glow1X = width * 0.5 + Math.sin(time * 0.5) * (width * 0.15);
      const glow1Y = height * 0.35 + Math.cos(time * 0.4) * (height * 0.1);
      const radGrad1 = ctx.createRadialGradient(glow1X, glow1Y, 0, glow1X, glow1Y, width * 0.45);
      radGrad1.addColorStop(0, "rgba(37, 99, 235, 0.12)");
      radGrad1.addColorStop(0.5, "rgba(99, 102, 241, 0.05)");
      radGrad1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radGrad1;
      ctx.fillRect(0, 0, width, height);

      const glow2X = width * 0.3 + Math.cos(time * 0.35) * (width * 0.12);
      const glow2Y = height * 0.6 + Math.sin(time * 0.45) * (height * 0.12);
      const radGrad2 = ctx.createRadialGradient(glow2X, glow2Y, 0, glow2X, glow2Y, width * 0.35);
      radGrad2.addColorStop(0, "rgba(59, 130, 246, 0.08)");
      radGrad2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radGrad2;
      ctx.fillRect(0, 0, width, height);

      // 2. Update and draw nodes + synapse connections
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Move
        node.x += node.vx;
        node.y += node.vy;

        // Bounce from boundaries
        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;

        // Mouse interactive gravitational repulsion / attraction
        const dxMouse = mouseX - node.x;
        const dyMouse = mouseY - node.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 180 && distMouse > 0) {
          const force = (1 - distMouse / 180) * 1.5;
          node.x -= (dxMouse / distMouse) * force;
          node.y -= (dyMouse / distMouse) * force;
        }

        // Pulse breathing
        node.pulsePhase += node.pulseSpeed;
        const currentRadius = node.baseRadius + Math.sin(node.pulsePhase) * 0.6;

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECT_DISTANCE) {
            const lineAlpha = (1 - dist / CONNECT_DISTANCE) * 0.22 * Math.min(node.alpha, other.alpha);
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(96, 165, 250, ${lineAlpha})`;
            ctx.lineWidth = 0.85 * Math.min(node.z, other.z);
            ctx.stroke();
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(0.8, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}${node.alpha})`;
        ctx.shadowColor = "rgba(96, 165, 250, 0.6)";
        ctx.shadowBlur = 8 * node.z;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
      {/* Top and bottom subtle film blend overlays */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#020203] via-[#020203]/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#020203] via-[#020203]/80 to-transparent pointer-events-none" />
    </div>
  );
}

