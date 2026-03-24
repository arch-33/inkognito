import tailwind from "@astrojs/tailwind";
import { defineConfig, sharpImageService } from "astro/config";

export default defineConfig({
  site: "https://arch-33.github.io",
  base: "/inkognito",
  trailingSlash: "never",
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler"
        }
      }
    }
  },
  image: {
    service: sharpImageService(),
  },
  integrations: [
    tailwind(),
  ],
});
