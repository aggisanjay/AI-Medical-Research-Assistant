import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    tailwindcss(),
    react(),
    tsconfigPaths(),
  ],
  server: {
    port: 3000,
    proxy: {
      // Forward /api calls to the Express backend during development
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
