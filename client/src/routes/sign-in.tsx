import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginView } from "@/components/LoginView";
import { useUser } from "@clerk/react";
import { useEffect } from "react";

export const Route = createFileRoute("/sign-in")({
  component: SignInRoute,
});

function SignInRoute() {
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate({ to: "/dashboard" });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#020617] text-white">
        <div className="text-center animate-pulse">
          <p className="text-xs text-slate-500">Redirecting to session...</p>
        </div>
      </div>
    );
  }

  return <LoginView />;
}
