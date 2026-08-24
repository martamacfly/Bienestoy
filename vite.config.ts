import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const base = process.env.GITHUB_PAGES === "true" ? "/Bienestoy/" : "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff,woff2,webmanifest}"],
        navigateFallback: `${base}index.html`,
      },
      manifest: {
        name: "Bienestoy",
        short_name: "Bienestoy",
        description: "Tu plan semanal y si se cumplió",
        theme_color: "#d35a1c",
        background_color: "#f7efe4",
        display: "standalone",
        id: base,
        scope: base,
        start_url: base,
        lang: "es",
        icons: [
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
    }),
  ],
  test: {
    environment: "node",
  },
});
