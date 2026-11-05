// Google Analytics helpers. The production build puts gtag() and window.loadGA() into <head>
// (src/seo.js); Google's script itself is only fetched after the visitor accepts. In dev and
// preview builds `window.gtag` does not exist and every function here quietly does nothing.

import { CONSENT_KEY, GA_ID } from "./links.js";

export const CONSENT_EVENT = "ww:consent-open";

export function getConsent() {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(choice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* private mode: the choice just isn't remembered */
  }
  if (typeof window.gtag !== "function") return; // dev / preview build: no analytics at all
  if (choice === "granted") {
    window.loadGA();
    return;
  }
  // declined or withdrawn: stop collecting and remove the Analytics cookies
  if (window.__gaLoaded) window.gtag("consent", "update", { analytics_storage: "denied" });
  window[`ga-disable-${GA_ID}`] = true;
  const host = location.hostname.replace(/^www\./, "");
  document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => /^_ga/.test(n))
    .forEach((n) =>
      ["", `; domain=${host}`, `; domain=.${host}`].forEach((d) => {
        document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
      }),
    );
}

export function track(name, params = {}) {
  if (window.__gaLoaded) window.gtag("event", name, params);
}

// Where a link goes → a readable service name for the reports.
const SERVICES = [
  ["open.spotify.com", "spotify"],
  ["music.apple.com", "apple_music"],
  ["bandcamp.com", "bandcamp"],
  ["youtube.com", "youtube"],
  ["instagram.com", "instagram"],
  ["facebook.com", "facebook"],
];

function section(el) {
  return el.closest("section[id], footer[id], header")?.id || "header";
}

/** One delegated click listener: streaming/social/e-mail links and the language switch. */
export function initTracking() {
  document.addEventListener(
    "click",
    (e) => {
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!a) return;
      const href = a.getAttribute("href");

      if (href.startsWith("mailto:")) {
        track("contact_email", { location: section(a) });
        return;
      }
      if (a.hreflang && a.hreflang !== document.documentElement.lang) {
        track("language_switch", { to: a.hreflang });
        return;
      }
      let host = "";
      try {
        host = new URL(a.href).hostname;
      } catch {
        return;
      }
      const hit = SERVICES.find(([h]) => host === h || host.endsWith("." + h));
      if (hit) track("outbound_link", { service: hit[1], link_url: a.href, location: section(a) });
    },
    { capture: true },
  );
}
