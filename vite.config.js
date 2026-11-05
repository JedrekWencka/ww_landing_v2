import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { PAGE_LIST } from "./src/pages.js";
import { PREVIEW, headTags, robotsTxt, sitemapXml } from "./src/seo.js";

const here = dirname(fileURLToPath(import.meta.url));

// Fills <!--seo--> in index.html (EN) and pl/index.html (PL) with title, description,
// hreflang, Open Graph and JSON-LD, and writes sitemap.xml + robots.txt into the build.
function seo() {
  return {
    name: "ww-seo",
    transformIndexHtml(html, ctx) {
      const lang = /<html lang="pl"/.test(html) ? "pl" : "en";
      const page = /data-page="([a-z]+)"/.exec(html)?.[1] ?? "home";
      // Analytics only in the production build (not in `npm run dev`, not in the preview build).
      return html.replace("<!--seo-->", headTags(lang, { analytics: !ctx.server, page }));
    },
    generateBundle() {
      if (!PREVIEW) this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemapXml() });
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robotsTxt() });
    },
  };
}

export default defineConfig({
  plugins: [react(), seo()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input: Object.fromEntries(PAGE_LIST.map((p) => [`${p.id}-${p.lang}`, resolve(here, p.file)])),
    },
  },
});
