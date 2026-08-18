import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const appIcon = new URL("./src/Asset/images.png", import.meta.url).href;

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Field CRM",
        short_name: "CRM",
        description: "Customer relationship manager for field sales",
        theme_color: "#eff2ec",
        background_color: "#eff2ec",
        display: "standalone",
        start_url: "./",
        scope: "./",
        icons: [
          {
            src: appIcon,
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: appIcon,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp}"],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  optimizeDeps: {
    include: ["react", "react-dom", "lucide-react"],
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("lucide-react")) {
              return "ui-vendor";
            }
            return "vendor";
          }

          if (id.includes("/hooks/")) {
            return "crm-data";
          }

          if (id.includes("/components/")) {
            return "crm-ui";
          }
        },
      },
    },
  },
});
