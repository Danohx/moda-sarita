import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: __dirname,

  cacheDir: path.resolve(
    __dirname,
    "../../node_modules/.vite/admin",
  ),

  plugins: [react()],

  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../../shared"),
      "@admin": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5174,
  },
});