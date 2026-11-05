import { LINKS } from "../links.js";
import { strings } from "../i18n.js";
import { CONSENT_EVENT } from "../analytics.js";

export default function Contact({ t, lang }) {
  const rows = [
    { name: LINKS.email, href: `mailto:${LINKS.email}`, external: false, className: "row-mail" },
    { name: "Instagram", href: LINKS.instagram, external: true },
    { name: "Facebook", href: LINKS.facebook, external: true },
  ];
  const nav = [
    ["#band", t.nav.band],
    ["#listen", t.nav.listen],
    ["#tour", t.nav.tour],
    ["#gallery", t.nav.gallery],
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
        <a className="brand-line" href="#home">
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
            <a href={LINKS.bandcamp} target="_blank" rel="noopener noreferrer">
              {t.nav.shop} ↗
            </a>
          </li>
          {Object.keys(strings).map((code) => (
            <li key={code}>
              <a
                className={code === lang ? "is-here" : undefined}
                href={strings[code].home}
                hrefLang={code}
                lang={code}
                aria-current={code === lang ? "page" : undefined}
              >
                {code === "en" ? "English" : "Polski"}
              </a>
            </li>
          ))}
          <li>
            <a href={t.consent.privacyUrl}>{t.consent.privacy}</a>
          </li>
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
