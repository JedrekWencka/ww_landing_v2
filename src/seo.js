// Search / share metadata for each language. Used at build time by vite.config.js
// to fill the <head> of index.html (EN) and pl/index.html (PL), and to write
// sitemap.xml and robots.txt.

import { CONSENT_KEY, GA_ID, LINKS, SITE } from "./links.js";

export { LINKS, SITE };

// Consent Mode v2: everything starts "denied" (no cookies, no identifiers). The visitor's
// earlier choice, saved by src/analytics.js under CONSENT_KEY, is applied before the first hit.

function analyticsTags() {
  return `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', {
        analytics_storage: 'denied', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied'
      });
      try { if (localStorage.getItem('${CONSENT_KEY}') === 'granted') gtag('consent', 'update', { analytics_storage: 'granted' }); } catch (e) {}
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
    </script>`;
}

// Build-time switch: `SITE_ENV=preview` makes the whole site invisible to search engines.
export const PREVIEW = process.env.SITE_ENV === "preview";

export const PAGES = {
  en: {
    path: "/",
    locale: "en_US",
    title: "WHITEWATER — Afterlife | Stoner rock band from Poland",
    description:
      "WHITEWATER is a stoner, grunge and heavy rock four-piece from Greater Poland. Their album Afterlife is out now on Bandcamp, Spotify and Apple Music.",
    ogImage: "/og-image.jpg",
    ogImageAlt: "WHITEWATER — Afterlife, out now",
    genre: ["Stoner rock", "Grunge", "Heavy rock"],
    area: "Greater Poland, Poland",
  },
  pl: {
    path: "/pl/",
    locale: "pl_PL",
    title: "WHITEWATER — Afterlife | Zespół stoner rockowy z Wielkopolski",
    description:
      "WHITEWATER to czteroosobowy zespół z Wielkopolski grający stoner rocka, grunge i ciężkiego rocka. Album Afterlife już dostępny na Bandcampie, Spotify i Apple Music.",
    ogImage: "/og-image-pl.jpg",
    ogImageAlt: "WHITEWATER — Afterlife, już dostępny",
    genre: ["Stoner rock", "Grunge", "Heavy rock"],
    area: "Wielkopolska, Polska",
  },
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function jsonLd(lang) {
  const p = PAGES[lang];
  const url = SITE + p.path;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MusicGroup",
        "@id": `${SITE}/#band`,
        name: "WHITEWATER",
        url,
        logo: `${SITE}/logo.jpg`,
        image: `${SITE}${p.ogImage}`,
        description: p.description,
        genre: p.genre,
        foundingLocation: { "@type": "Place", name: p.area },
        email: `mailto:${LINKS.email}`,
        sameAs: [
          LINKS.bandcamp,
          LINKS.spotify,
          LINKS.facebook,
          LINKS.instagram,
          LINKS.youtube,
        ],
        album: [{ "@id": `${SITE}/#afterlife` }, { "@id": `${SITE}/#blackfire` }],
      },
      {
        "@type": "MusicAlbum",
        "@id": `${SITE}/#afterlife`,
        name: "Afterlife",
        byArtist: { "@id": `${SITE}/#band` },
        image: `${SITE}/afterlife.jpg`,
        url: LINKS.album,
        sameAs: [LINKS.album, LINKS.appleMusic],
        genre: p.genre,
        albumProductionType: "https://schema.org/StudioAlbum",
        datePublished: "2024-01-26",
      },
      {
        "@type": "MusicAlbum",
        "@id": `${SITE}/#blackfire`,
        name: "Blackfire",
        byArtist: { "@id": `${SITE}/#band` },
        url: LINKS.blackfire,
        sameAs: [LINKS.blackfire],
        datePublished: "2019",
        image: `${SITE}/gallery/album/IMG_20190220_113840.jpg`,
        genre: p.genre,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: SITE + "/",
        name: "WHITEWATER",
        alternateName: ["Whitewater", "WHITEWATER band"],
        inLanguage: ["en", "pl"],
        publisher: { "@id": `${SITE}/#band` },
      },
      {
        // The page's main image (Afterlife), so search and link previews don't pick another photo.
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: p.title,
        description: p.description,
        inLanguage: lang,
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": `${SITE}/#band` },
        primaryImageOfPage: { "@type": "ImageObject", url: `${SITE}${p.ogImage}`, width: 1200, height: 630 },
        image: `${SITE}${p.ogImage}`,
      },
    ],
  };
  return JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
}

/** Everything that goes into <head> for one language, apart from charset/viewport/fonts. */
export function headTags(lang, { analytics = false } = {}) {
  const p = PAGES[lang];
  const other = lang === "en" ? "pl" : "en";
  const url = SITE + p.path;
  const img = SITE + p.ogImage;
  return `
    <title>${esc(p.title)}</title>
    <meta name="description" content="${esc(p.description)}" />
    <meta name="robots" content="${PREVIEW ? "noindex, nofollow" : "index, follow, max-image-preview:large"}" />
    <meta name="theme-color" content="#1a1a1a" />
${PREVIEW ? "" : `    <link rel="canonical" href="${url}" />
    <link rel="alternate" hreflang="en" href="${SITE}${PAGES.en.path}" />
    <link rel="alternate" hreflang="pl" href="${SITE}${PAGES.pl.path}" />
    <link rel="alternate" hreflang="x-default" href="${SITE}${PAGES.en.path}" />`}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="WHITEWATER" />
    <meta property="og:title" content="${esc(p.title)}" />
    <meta property="og:description" content="${esc(p.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:locale" content="${p.locale}" />
    <meta property="og:locale:alternate" content="${PAGES[other].locale}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(p.ogImageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(p.title)}" />
    <meta name="twitter:description" content="${esc(p.description)}" />
    <meta name="twitter:image" content="${img}" />
    <script type="application/ld+json">
${jsonLd(lang)}
    </script>${analytics && !PREVIEW ? analyticsTags() : ""}`;
}

export function sitemapXml() {
  const today = new Date().toISOString().slice(0, 10);
  const alts = Object.entries(PAGES)
    .map(([l, p]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${p.path}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${PAGES.en.path}"/>`)
    .join("\n");
  const urls = Object.values(PAGES)
    .map(
      (p) => `  <url>
    <loc>${SITE}${p.path}</loc>
    <lastmod>${today}</lastmod>
${alts}
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

export function robotsTxt() {
  if (PREVIEW) return `User-agent: *\nDisallow: /\n`;
  return `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
}
