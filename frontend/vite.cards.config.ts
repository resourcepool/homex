import { defineConfig } from "vite";

// Builds the Lovelace cards (loaded on every dashboard) into their own small
// ES module, separate from the panel bundle.
export default defineConfig({
  build: {
    lib: {
      entry: "src/homex-cards.ts",
      formats: ["es"],
      fileName: () => "homex-cards.js",
    },
    outDir: "../custom_components/homex/panel",
    emptyOutDir: false,
    target: "es2021",
    minify: true,
    rollupOptions: {
      // the 3D house card loads three.js on demand
      output: { chunkFileNames: "homex-cards-[name]-[hash].js" },
    },
  },
});
