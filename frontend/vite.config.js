import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Proxy /api requests to the FastAPI backend — eliminates all CORS issues
  server: {
    proxy: {
      "/patients": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/assessments": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/ai-analysis": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/patient-history": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});