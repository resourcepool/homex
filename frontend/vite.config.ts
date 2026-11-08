import { defineConfig } from "vite";

// Builds the panel into a single ES module that `panel_custom` loads.
export default defineConfig({
  build: {
    lib: {
      entry: "src/homex-panel.ts",
      formats: ["es"],
      fileName: () => "homex-panel.js",
    },
    outDir: "../custom_components/homex/panel",
    emptyOutDir: false,
    target: "es2021",
    minify: true,
    rollupOptions: {
      // three.js (Rendering tab) is loaded on demand, from a fixed file name.
      output: { chunkFileNames: "homex-[name]-[hash].js" },
    },
  },
});
