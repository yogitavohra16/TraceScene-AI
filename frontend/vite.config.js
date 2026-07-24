import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Vite dev server proxies /api to Django so the frontend never has to know
// about CORS in local dev, and VITE_API_BASE_URL stays a single source of
// truth for both dev and prod builds (Section 38's beginner note).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.js",
  },
});
