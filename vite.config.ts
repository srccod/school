import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import deno from "@deno/vite-plugin";

export default defineConfig({
  root: "web",
  plugins: [deno(), solidPlugin(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: "esnext",
    outDir: "./dist",
  },
  worker: {
    format: "es",
  },
});
