import { useEffect, useState } from "react";
import { productById } from "../data/products.js";
import { ZONES, currencyForLang } from "../../server/shipping.mjs";
import { cart, money, totals, useCart } from "../shop/cart.js";
import { track } from "../analytics.js";
import { pagePath } from "../pages.js";

export default function CartDrawer({ t, lang }) {
  const s = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [names, setNames] = useState(null);
  const c = t.shop.cart;
  const sum = totals(s, currencyForLang(lang));

  useEffect(() => setNames(new Intl.DisplayNames([lang], { type: "region" })), [lang]);

  useEffect(() => {
    if (!s.open) return undefined;
    const onKey = (e) => e.key === "Escape" && cart.close();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [s.open]);

  if (!s.open) return null;

  const checkout = async () => {
    setBusy(true);
    setError("");
    try {
      track("begin_checkout", { currency: sum.currency, value: sum.total / 100 });
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: s.lines, country: s.country, lang }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(t.shop.errors[data.error] || t.shop.errors.generic);
        setBusy(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError(t.shop.errors.generic);
      setBusy(false);
    }
  };

  const terms = (
    <a key="t" href={pagePath("terms", lang)}>
      {t.shop.legalNav.terms}
    </a>
  );
  const returns = (
    <a key="r" href={pagePath("returns", lang)}>
      {t.shop.legalNav.returns}
    </a>
  );
  const [pre, mid, post] = c.terms.split(/\{terms\}|\{returns\}/);

  return (
    <div className="drawer-wrap">
      <div className="drawer-back" onClick={cart.close} aria-hidden="true" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={c.title}>
        <header className="drawer-head">
          <h2>{c.title}</h2>
          <button type="button" className="pill pill-dashed" onClick={cart.close}>
            {c.close}
          </button>
        </header>

        {s.lines.length === 0 ? (
          <p className="drawer-empty">{c.empty}</p>
        ) : (
          <>
            <ul className="drawer-lines">
              {s.lines.map((l) => {
                const p = productById(l.id);
                const text = p.text[lang];
                return (
                  <li key={`${l.id}-${l.size}`}>
                    <span className="line-img" style={p.images[0] ? undefined : { background: p.color }}>
                      {p.images[0] && <img src={p.images[0]} alt="" />}
                    </span>
                    <span className="line-info">
                      <b>{text.name}</b>
                      {l.size && <small>{t.shop.size}: {l.size}</small>}
                      <span className="qty">
                        <button type="button" aria-label={c.less} onClick={() => cart.setQty(l.id, l.size, l.qty - 1)}>−</button>
                        <span>{l.qty}</span>
                        <button type="button" aria-label={c.more} onClick={() => cart.setQty(l.id, l.size, l.qty + 1)}>+</button>
                      </span>
                    </span>
                    <span className="line-price">{money(p.price[sum.currency] * l.qty, sum.currency, lang)}</span>
                  </li>
                );
              })}
            </ul>

            <div className="drawer-sum">
              <label className="ship-to">
                <span>{c.country}</span>
                {names && (
                  <select value={s.country} onChange={(e) => cart.setCountry(e.target.value)}>
                    {[...new Set(ZONES.flatMap((z) => z.countries))]
                      .sort((a, b) => names.of(a).localeCompare(names.of(b), lang))
                      .map((code) => (
                        <option key={code} value={code}>
                          {names.of(code)}
                        </option>
                      ))}
                  </select>
                )}
              </label>
              <p>
                <span>{c.goods}</span>
                <span>{money(sum.goods, sum.currency, lang)}</span>
              </p>
              <p>
                <span>{c.shipping}</span>
                <span>{money(sum.shipping, sum.currency, lang)}</span>
              </p>
              <p className="sum-total">
                <span>{c.total}</span>
                <span>{money(sum.total, sum.currency, lang)}</span>
              </p>
            </div>

            {error && (
              <p className="drawer-error" role="alert">
                {error}
              </p>
            )}
            <button type="button" className="pill pill-solid pill-wide" onClick={checkout} disabled={busy}>
              {busy ? c.working : `${c.checkout} →`}
            </button>
            <p className="drawer-note">
              {pre}
              {terms}
              {mid}
              {returns}
              {post}
            </p>
          </>
        )}
      </aside>
    </div>
  );
}
