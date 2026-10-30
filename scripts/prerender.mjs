// After `vite build`: render the React app to static HTML for each language and put it
// inside <div id="root"> of dist/index.html and dist/pl/index.html, so search engines and
// link previews see the real content without running JavaScript. The browser then hydrates it.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const here = dirname(fileURLToPath(import.meta.url));

const root = resolve(here, "..");
const pages = { en: "dist/index.html", pl: "dist/pl/index.html" };

const vite = await createServer({
  root,
  logLevel: "error",
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});

try {
  const { render } = await vite.ssrLoadModule("/src/entry-server.jsx");
  for (const [lang, file] of Object.entries(pages)) {
    const path = resolve(root, file);
    const html = await readFile(path, "utf8");
    if (!html.includes("<!--app-->")) throw new Error(`${file}: <!--app--> placeholder missing`);
    await writeFile(path, html.replace("<!--app-->", render(lang)));
    console.log(`prerendered ${file}`);
  }
} finally {
  await vite.close();
}
