import React from "react";

interface CinematicVignetteProps {
  className?: string;
  size?: string;
  color?: string;
}

export const CinematicVignette: React.FC<CinematicVignetteProps> = ({
  className = "",
  size = "45%",
  color = "rgba(2, 2, 3, 0.75)"
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none z-[4] ${className}`}
      style={{
        background: `radial-gradient(ellipse at center, transparent ${size}, ${color} 100%)`
      }}
      aria-hidden="true"
    />
  );
};

