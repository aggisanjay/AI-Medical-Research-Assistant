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
      navigate({ to: "/" });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-serif font-bold text-lg animate-pulse">
            C
          </div>
          <div className="text-center">
            <h2 className="text-base font-serif font-bold text-white">Curalink Terminal</h2>
            <p className="text-xs text-slate-500 font-normal mt-1">Establishing HIPAA-Secure Sandbox...</p>
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
