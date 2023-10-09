import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@/lib": fileURLToPath(new URL("../lib/src", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    // alias: [
    //   {
    //     find: "@/lib",
    //     replacement: fileURLToPath(new URL("../lib/src", import.meta.url)),
    //   },
    //   {
    //     find: "@",
    //     replacement: fileURLToPath(new URL("./src", import.meta.url)),
    //   },
    // ],
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://backend:3000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
