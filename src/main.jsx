import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
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
