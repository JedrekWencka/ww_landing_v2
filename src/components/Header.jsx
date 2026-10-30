import { useEffect, useState } from "react";
import { LINKS } from "../links.js";
import { strings } from "../i18n.js";
import Icon from "./Icon.jsx";

const LANG_NAMES = { en: "English", pl: "Polski" };
const SECTION_IDS = ["home", "band", "listen", "tour", "gallery", "contact"];

function LangSwitch({ lang, t }) {
  return (
    <nav className="lang" aria-label={t.langLabel}>
      {Object.keys(strings).map((code, i) => (
        <span key={code}>
          {i > 0 && (
            <span className="lang-sep" aria-hidden="true">
              /
            </span>
          )}
          <a
            href={strings[code].home}
            hrefLang={code}
            lang={code}
            title={LANG_NAMES[code]}
            className={code === lang ? "is-here" : undefined}
            aria-current={code === lang ? "page" : undefined}
          >
            {code.toUpperCase()}
          </a>
        </span>
      ))}
    </nav>
  );
}

function Socials({ t }) {
  const items = ["spotify", "appleMusic", "facebook", "instagram", "youtube"];
  return (
    <nav className="icons" aria-label={t.iconsLabel}>
      {items.map((name) => (
        <a key={name} href={LINKS[name]} target="_blank" rel="noopener noreferrer" aria-label={nameLabel(name)} className={`icon icon-${name}`}>
          <Icon name={name} />
        </a>
      ))}
    </nav>
  );
}

const nameLabel = (name) =>
  ({ spotify: "Spotify", appleMusic: "Apple Music", facebook: "Facebook", instagram: "Instagram", youtube: "YouTube" })[name];

export default function Header({ t, lang }) {
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  // Highlight the menu item of the section being read: the last section whose top has passed
  // 40% of the screen height; at the very bottom of the page it is always Contact.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = SECTION_IDS[0];
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = id;
      }
      setActive(atBottom ? "contact" : current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const items = [
    { id: "band", label: t.nav.band },
    { id: "listen", label: t.nav.listen },
    { id: "shop", label: t.nav.shop, href: LINKS.bandcamp, external: true },
    { id: "tour", label: t.nav.tour },
    { id: "gallery", label: t.nav.gallery },
  ];

  const link = (item, extra = {}) =>
    item.external ? (
      <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" {...extra}>
        {item.label}
      </a>
    ) : (
      <a key={item.id} href={`#${item.id}`} className={active === item.id ? "is-here" : undefined} {...extra}>
        {item.label}
      </a>
    );

  return (
    <>
      <header className="top">
        <div className="top-left">
          <a className="brand pill" href="#home" aria-label={`WHITEWATER — ${t.nav.home}`}>
            <img src="/w-mark.png" width="228" height="236" alt="" />
            <span className="brand-name">
              WHITE<em>WATER</em>
            </span>
          </a>
          <span className="top-lang">
            <LangSwitch lang={lang} t={t} />
          </span>
        </div>

        <div className="top-right">
          <nav className="menu pill" aria-label={t.nav.label}>
            {items.map((item) => link(item))}
          </nav>
          <a className={`pill pill-dashed top-contact${active === "contact" ? " is-here" : ""}`} href="#contact">
            {t.nav.contact}
          </a>
          <Socials t={t} />
          <button
            type="button"
            className="menu-btn pill"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            {t.nav.menu}
          </button>
        </div>
      </header>

      {open && (
        <div className="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label={t.nav.menu}>
          <button type="button" className="pill pill-dashed mobile-close" onClick={close}>
            {t.nav.close}
          </button>
          <nav aria-label={t.nav.label}>
            {[{ id: "home", label: t.nav.home }, ...items].map((item) => link(item, { onClick: close }))}
            <a href="#contact" className={active === "contact" ? "is-here" : undefined} onClick={close}>
              {t.nav.contact}
            </a>
          </nav>
          <Socials t={t} />
          <LangSwitch lang={lang} t={t} />
        </div>
      )}
    </>
  );
}
