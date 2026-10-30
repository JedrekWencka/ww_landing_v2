# WHITEWATER landing — v2 (redesign)

Split-screen redesign of whitewaterband.com, based on the Wix "PortfolioNewPosh" layout.
React + Vite, pre-rendered to static HTML. English at `/`, Polish at `/pl/`.

All content of the current site is carried over: texts (EN/PL), Bandcamp/Spotify/Apple Music/
YouTube/Facebook/Instagram links, contact e-mail, 28 photos, share images, structured data,
sitemap/robots and the Google verification file.

## Where things live

| What | File |
| --- | --- |
| All copy, EN + PL | `src/i18n.js` |
| Links (Bandcamp, Spotify …, e-mail) | `src/links.js` |
| Titles, descriptions, hreflang, JSON-LD, sitemap, robots | `src/seo.js` |
| Hero slider photos | `src/data/slides.js` |
| Gallery photos (alt text = key into `i18n.js`) | `src/data/photos.js` |
| Layout components | `src/components/*` |
| Styles (colours, fonts: top of `src/styles.css`) | `src/styles.css` |
| Wordmark / W mark (regenerate: `python3 scripts/make-brand-assets.py`) | `public/wordmark.png`, `public/w-mark.png` |

## Local

```bash
npm install
npm run dev          # http://localhost:5173  (Polish at /pl/)
```

## Preview on the server (hidden from Google)

```bash
./deploy/preview.sh  # builds with SITE_ENV=preview and uploads to /opt/ww_preview
```

Result: **http://2.28.230.117:8081/** (Polish: `/pl/`). It runs in its own container (`ww-preview`),
so the live site on ports 80/443 is not touched. The preview build has `noindex` in every page,
`Disallow: /` in robots.txt, no sitemap, no canonical/hreflang, and nginx adds `X-Robots-Tag: noindex`.

## Production (whitewaterband.com)

```bash
./deploy/hetzner.sh          # asks first; add --yes to skip the question
```

It builds the indexable production site (canonical + hreflang + sitemap + robots.txt), refuses to
publish anything that contains `noindex`, keeps a backup of the live files on the server
(`/opt/ww_landing/dist.bak-…`, last 3) and prints the one-line roll-back command.
It never uploads `nginx.conf` — the server's copy also serves b19studio.net.

Keep `public/google456df6f8bf3cad17.html`: Google Search Console uses it to verify ownership.
After a deploy, in Search Console re-submit `sitemap.xml` and request indexing of `/` and `/pl/`.

The preview (`./deploy/preview.sh`, port 8081) can stay running for trying out changes before
they go live, or be switched off on the server with `cd /opt/ww_preview && docker compose down`.
