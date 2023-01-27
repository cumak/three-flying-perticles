import { defineConfig } from "astro/config";
import glslify from "vite-plugin-glslify";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      // glsl({
      //   watch: false,
      // }),
      glslify(),
    ],
    build: {
      rollupOptions: {
        output: {
          entryFileNames: "js/app.js",
        },
      },
      minify: false,
    },
  },
  server: {
    host: true,
  },
});
