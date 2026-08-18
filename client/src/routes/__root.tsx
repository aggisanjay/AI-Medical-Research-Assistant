import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-8xl font-serif font-bold text-slate-600">404</h1>
        <h2 className="text-2xl font-serif font-bold text-white">Page not found</h2>
        <p className="text-xs sm:text-sm text-slate-400 font-normal">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button size="default">
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-serif font-bold text-white">
          This page didn&apos;t load
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-normal">
          Something went wrong. Try refreshing or head back home.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => { router.invalidate(); reset(); }}
            size="default"
          >
            Try again
          </Button>
          <Link to="/">
            <Button variant="outline" size="default">
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
