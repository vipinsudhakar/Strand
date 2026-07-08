import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server runs on 5173; the backend (CORS-allowed) runs on 8000.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
