import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CuralinkApp } from "@/components/CuralinkApp";
import { useUser } from "@clerk/react";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardRoute,
});

function DashboardRoute() {
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: "/sign-in" });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#020617] text-white relative overflow-hidden mesh-gradient">
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-2xl flex pulse-cyan-glow animate-pulse">
            <svg
              className="h-8 w-8 text-white animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-white font-display">Curalink Terminal</h2>
            <p className="text-xs text-slate-500 font-light mt-1 animate-pulse">Establishing HIPAA-Secure Sandbox...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return <CuralinkApp />;
}
