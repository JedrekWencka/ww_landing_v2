import { legalDocs } from "../legal.js";
import { pagePath } from "../pages.js";

export default function Legal({ id, t, lang }) {
  const doc = legalDocs(lang)[id];
  return (
    <article className="legal" id="legal">
      <p className="legal-back">
        <a href={pagePath("shop", lang)}>← {t.shop.title}</a>
      </p>
      <h1 className="label">{doc.title}</h1>
      <p className="legal-updated">{doc.updated}</p>
      {doc.sections.map((s) => (
        <section key={s.h}>
          <h2>{s.h}</h2>
          {s.p.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </section>
      ))}
      <nav className="legal-links" aria-label={t.shop.title}>
        {["terms", "privacy", "returns"]
          .filter((x) => x !== id)
          .map((x) => (
            <a key={x} href={pagePath(x, lang)}>
              {t.shop.legalNav[x]}
            </a>
          ))}
      </nav>
    </article>
  );
}
