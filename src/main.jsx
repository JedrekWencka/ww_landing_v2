import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import { initTracking } from "./analytics.js";
// Fonts are self-hosted (no request to Google Fonts, so visitors' IPs aren't sent to Google)
import "@fontsource/eb-garamond/400.css";
import "@fontsource/eb-garamond/400-italic.css";
import "@fontsource/eb-garamond/500.css";
import "@fontsource/eb-garamond/500-italic.css";
import "@fontsource/inter-tight/400.css";
import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/inter-tight/700.css";
import "./styles.css";

const lang = document.documentElement.lang === "pl" ? "pl" : "en";
const container = document.getElementById("root");
const app = (
  <StrictMode>
    <App lang={lang} />
  </StrictMode>
);

// The production build ships pre-rendered HTML (see scripts/prerender.mjs): hydrate it.
// In `npm run dev` the root is empty, so render from scratch.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);

initTracking();
