# WHITEWATER — landing page (v2)

**https://whitewaterband.com**: a split-screen redesign based on the Wix "PortfolioNewPosh" layout. English at `/`, Polish at `/pl/`. It uses React + Vite and is pre-rendered to static HTML, so search engines and link previews see the real content without running JavaScript.

All content of the old site is carried over: the EN/PL texts, the Bandcamp, Spotify, Apple Music, YouTube, Facebook and Instagram links, the contact e-mail, 28 photos, share images, structured data, sitemap, robots and the Google verification file. Google Analytics (GA4) only runs after the visitor accepts the cookie banner.

## Commands

The same `site.sh` is in every landing-page repo. Only `site.env` (names, domain, build command, preview port) differs.

| Command | What it does |
| --- | --- |
| `./site.sh build` | build the site into `dist/` |
| `./site.sh serve` | build, then open it on http://localhost:8000 |
| `./site.sh preview` | publish a copy hidden from Google on http://2.28.230.117:8081/ |
| `./site.sh deploy` | publish to production (asks first; `--yes` skips the question) |
| `./site.sh rollback` | put the previous production files back (the last 3 are kept on the server) |
| `./site.sh status` | container state and HTTP status on the server |

You need SSH key access to `root@2.28.230.117`, plus `rsync` and `python3` (both come with macOS), and Node 20+ for the Vite build. To use a different server, run `HETZNER_HOST=user@host ./site.sh …`.

Every build checks itself before anything is uploaded. A production build must not contain `noindex` and must have a canonical link. A preview build must contain `noindex`.

For live-reload while editing, use `npm install` once, then `npm run dev` (http://localhost:5173, Polish at `/pl/`).

## Where things live

| What | File |
| --- | --- |
| All copy, EN + PL | `src/i18n.js` |
| Links (Bandcamp, Spotify …, e-mail) | `src/links.js` |
| Titles, descriptions, hreflang, JSON-LD, sitemap, robots | `src/seo.js` (`SITE_ENV=preview` hides everything from search engines) |
| Analytics + consent banner | `src/analytics.js`, `src/components/CookieBanner.jsx` (Google's script loads only after Accept) |
| Privacy policy (EN `/privacy/`, PL `/pl/prywatnosc/`) | `src/privacy.json` → `scripts/privacy.py` (run by `site.sh` after the Vite build) |
| Fonts (self-hosted, no Google Fonts) | `@fontsource/eb-garamond`, `@fontsource/inter-tight`, imported in `src/main.jsx` |
| Hero slider photos | `src/data/slides.js` |
| Gallery photos (alt text = key into `i18n.js`) | `src/data/photos.js` |
| Layout components | `src/components/*` |
| Styles (colours and fonts at the top) | `src/styles.css` |
| Wordmark / W mark (regenerate with `python3 scripts/make-brand-assets.py`) | `public/wordmark.png`, `public/w-mark.png` |
| Pre-rendering after `vite build` | `scripts/prerender.mjs` |
| nginx for the preview container | `deploy/nginx.conf` |
| Build + deploy | `site.sh`, `site.env`, `docker-compose.yml`, `compose.preview.yml` |

If tracking changes (a new tool, new events), update `src/privacy.json` and its `updated` date.

Keep `public/google456df6f8bf3cad17.html`. Google Search Console uses it to verify ownership.

## Deploy

```
./site.sh preview    # http://2.28.230.117:8081/ (hidden from Google)
./site.sh deploy     # https://whitewaterband.com
```

Whitewater is the one site without a container of its own. Its files go straight into the web root of `ww-landing`, the edge container that also serves the other domains (`/opt/ww_landing/dist`). The deploy never uploads `nginx.conf` and never touches `.well-known/`, which the certificate renewal uses.

After a deploy that changes content, re-submit `sitemap.xml` in Search Console and request indexing of `/` and `/pl/`.

The preview now lives in `/opt/ww-preview`, in a container also called `ww-preview`. The first `./site.sh preview` replaces the old `/opt/ww_preview` setup, which you can then delete. To switch the preview off: `ssh root@2.28.230.117 'cd /opt/ww-preview && docker compose down'`.

## Server (shared by all the sites)

The sites run on Hetzner at `2.28.230.117`. One nginx container, **`ww-landing`**, owns ports 80/443 and handles HTTPS (Let's Encrypt). Every other site runs in its own small nginx container with no public port. `ww-landing` forwards each domain to that container by name, over the Docker network `ww_landing_default`. Preview copies are published on their own port and are hidden from search engines.

| Site | Repo | Production | Container · server folder | Preview |
| --- | --- | --- | --- | --- |
| Whitewater | `ww_landing_v2` | https://whitewaterband.com | `ww-landing` (the edge itself) · `/opt/ww_landing/dist` | `:8081` |
| Supernova | `supernova-site` | not yet (supernovaband.eu) | `supernova-site` · `/opt/supernova-site` | `:8080` |
| Impala | `impala-site` | https://impalaband.com | `impala-site` · `/opt/impala-site` | `:8082` |
| B19 | `B19LP` | https://b19studio.net | `b19-landing` · `/opt/b19-landing` | `:8083` |
| Spotify player | `SpotOnlinePlayer` | private (`127.0.0.1:8787` on the server) | `spotify-cloud-player` · `/opt/spotify-cloud-player` | — |

- Each site folder on the server holds `html/` (the files), `nginx/default.conf`, `docker-compose.yml` and an `.env` written by `site.sh`. Before every upload, a snapshot of the live files is saved as `html.bak-<date>`. These are hard links, so they cost no disk space.
- The edge config is `/opt/ww_landing/nginx.conf`. `./site.sh deploy` keeps each domain's block there between `# >>> <name>` and `# <<< <name>` markers. It only rewrites a block that has changed, backs up the file first, and restores it if nginx rejects the new config. It never touches another site's block. On the first deploy of a new domain it also gets the HTTPS certificate. Certbot renews certificates automatically and reloads `ww-landing` afterwards.
- Preview ports may need to be opened in the Hetzner Cloud firewall.
