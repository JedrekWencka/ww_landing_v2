// Every page of the site. Each one is a real HTML file (pre-rendered at build time, hydrated in the browser).
// `id` is shared by the English and Polish version of the same page (used for hreflang).
export const PAGE_LIST = [
  { id: "home", lang: "en", path: "/", file: "index.html" },
  { id: "home", lang: "pl", path: "/pl/", file: "pl/index.html" },
  { id: "shop", lang: "en", path: "/shop/", file: "shop/index.html" },
  { id: "shop", lang: "pl", path: "/pl/sklep/", file: "pl/sklep/index.html" },
  { id: "terms", lang: "en", path: "/shop/terms/", file: "shop/terms/index.html" },
  { id: "terms", lang: "pl", path: "/pl/sklep/regulamin/", file: "pl/sklep/regulamin/index.html" },
  { id: "privacy", lang: "en", path: "/shop/privacy/", file: "shop/privacy/index.html" },
  { id: "privacy", lang: "pl", path: "/pl/sklep/prywatnosc/", file: "pl/sklep/prywatnosc/index.html" },
  { id: "returns", lang: "en", path: "/shop/returns/", file: "shop/returns/index.html" },
  { id: "returns", lang: "pl", path: "/pl/sklep/zwroty/", file: "pl/sklep/zwroty/index.html" },
];

export const pagePath = (id, lang) => PAGE_LIST.find((p) => p.id === id && p.lang === lang)?.path;
