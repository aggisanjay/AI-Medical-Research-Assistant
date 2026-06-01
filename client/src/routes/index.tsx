import { createFileRoute } from "@tanstack/react-router";
import { CuralinkApp } from "@/components/CuralinkApp";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <CuralinkApp />;
}
