import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  define: {
    "import.meta.env.VITE_UI_VERSION": JSON.stringify(
      process.env.VITE_UI_VERSION || "dev"
    )
  },
  optimizeDeps: {
    exclude: ["sw"], // Exclude service worker from optimization
    include: ["react", "react-dom"] // Explicitly include core dependencies
  },
  server: {
    port: 3001,
    proxy: {
      "/wms-api": {
        target: "http://slim100-beta.corp.picarro.com:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace("/wms-api", "api")
      },
      "/api": {
        target: "http://fenceline-dell4.corp.picarro.com:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace("/api", "")
      },
      "/socket.io": {
        target: "ws://fenceline-dell4.corp.picarro.com:8090",
        changeOrigin: true,
        secure: false,
        ws: true
      },
      "/realms": {
        target: "http://slim100-beta.corp.picarro.com:8080",
        changeOrigin: true,
        secure: false
        // rewrite: (path) => path.replace("/realms", "")
      }
    }
  }
});

//fenceline-dell2.corp.picarro.com
// "build": "tsc -b && vite build",
