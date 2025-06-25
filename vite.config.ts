import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.VITE_UI_VERSION": JSON.stringify(
      process.env.VITE_UI_VERSION || "dev"
    ),
  },
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://fenceline-dell3.corp.picarro.com:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace("/api", ""),
      },
      "/socket.io": {
        target: "ws://fenceline-dell3.corp.picarro.com:8090",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});

//fenceline-dell2.corp.picarro.com
// "build": "tsc -b && vite build",
