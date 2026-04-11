import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,               // REQUIRED
    strictPort: true,
    allowedHosts: "all",      // 🔥 THIS is the key
    proxy: {
      "/api": {
        target: "https://oadiscussion.onrender.com",
        changeOrigin: true,
        secure: false,
      },
      "/auth": {
        target: "https://oadiscussion.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
