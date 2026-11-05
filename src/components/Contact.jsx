import { LINKS } from "../links.js";
import { strings } from "../i18n.js";
import { CONSENT_EVENT } from "../analytics.js";
import { pagePath } from "../pages.js";

export default function Contact({ t, lang, page = "home" }) {
  const base = page === "home" ? "" : t.home;
  const rows = [
    { name: LINKS.email, href: `mailto:${LINKS.email}`, external: false, className: "row-mail" },
    { name: "Instagram", href: LINKS.instagram, external: true },
    { name: "Facebook", href: LINKS.facebook, external: true },
  ];
  const nav = [
    [`${base}#band`, t.nav.band],
    [`${base}#listen`, t.nav.listen],
    [`${base}#tour`, t.nav.tour],
    [`${base}#gallery`, t.nav.gallery],
  ];

  return (
    <footer className="contact" id="contact">
      <div className="contact-main">
        <h2 className="contact-title">{t.contact.title}</h2>
        <ul className="rows rows-big">
          {rows.map((row) => (
            <li key={row.name} className={row.className}>
              <a href={row.href} {...(row.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {row.name}
                <span className="rows-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <aside className="contact-side">
        <a className="brand-line" href={`${base}#home`}>
          <img src="/w-mark.png" width="228" height="236" alt="" />
          <span>
            WHITE<em>WATER</em>
          </span>
        </a>
        <ul className="foot-links">
          {nav.map(([href, label]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
          <li>
            <a href={t.shop.path}>{t.nav.shop}</a>
          </li>
          {["terms", "privacy", "returns"].map((id) => (
            <li key={id}>
              <a href={pagePath(id, lang)}>{t.shop.legalNav[id]}</a>
            </li>
          ))}
          {Object.keys(strings).map((code) => (
            <li key={code}>
              <a
                className={code === lang ? "is-here" : undefined}
                href={pagePath(page, code)}
                hrefLang={code}
                lang={code}
                aria-current={code === lang ? "page" : undefined}
              >
                {code === "en" ? "English" : "Polski"}
              </a>
            </li>
          ))}
          <li>
            <button type="button" className="foot-btn" onClick={() => window.dispatchEvent(new Event(CONSENT_EVENT))}>
              {t.consent.settings}
            </button>
          </li>
        </ul>
      </aside>
    </footer>
  );
}
