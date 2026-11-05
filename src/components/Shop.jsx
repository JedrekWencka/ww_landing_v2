import { useEffect, useState } from "react";
import { PRODUCTS, stockKey } from "../data/products.js";
import { ZONES, currencyForLang } from "../../server/shipping.mjs";
import { cart, money, useCart } from "../shop/cart.js";
import { track } from "../analytics.js";
import { pagePath } from "../pages.js";
import Marquee from "./Marquee.jsx";
import CartDrawer from "./CartDrawer.jsx";

const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (_, k) => vars[k]);

function Photo({ product, t, lang }) {
  const alt = product.images[0] ? t.alt[product.imageAlt[0]] : "";
  if (!product.images.length) {
    const dark = product.color === "#161616";
    return (
      <span className="product-tile" style={{ background: product.color, color: dark ? "#ececec" : "#161616" }}>
        <b>WHITEWATER</b>
        <small>{t.shop.photosSoon}</small>
      </span>
    );
  }
  return (
    <>
      <img src={product.images[0]} alt={alt} loading="lazy" decoding="async" />
      {product.images[1] && <img className="alt-img" src={product.images[1]} alt="" loading="lazy" decoding="async" aria-hidden="true" />}
    </>
  );
}

function Product({ product, t, lang, stock, currency }) {
  const [size, setSize] = useState(null);
  const [flash, setFlash] = useState(false);
  const text = product.text[lang];
  const left = (s) => (stock ? stock[product.id]?.[stockKey(product, s)] ?? 0 : null);
  const soldOut = !product.sizes && left(null) === 0;

  const add = () => {
    cart.add(product.id, size);
    track("add_to_cart", { item_id: product.id, size: size ?? undefined });
    setFlash(true);
    setTimeout(() => setFlash(false), 1400);
    cart.open();
  };

  return (
    <article className="product">
      <div className="product-photo">
        <Photo product={product} t={t} lang={lang} />
      </div>
      <div className="product-body">
        <div className="product-head">
          <h2>{text.name}</h2>
          <span className="product-price">{money(product.price[currency], currency, lang)}</span>
        </div>
        <p className="product-meta">{text.meta}</p>
        <p className="product-desc">{text.desc}</p>

        {product.sizes && (
          <fieldset className="sizes">
            <legend>{t.shop.size}</legend>
            {product.sizes.map((s) => {
              const n = left(s);
              return (
                <label key={s} className={`size${size === s ? " is-on" : ""}${n === 0 ? " is-off" : ""}`}>
                  <input type="radio" name={`size-${product.id}`} value={s} disabled={n === 0} checked={size === s} onChange={() => setSize(s)} />
                  {s}
                </label>
              );
            })}
          </fieldset>
        )}

        <div className="product-buy">
          <button type="button" className="pill pill-solid" onClick={add} disabled={soldOut || (product.sizes && !size)}>
            {soldOut ? t.shop.soldOut : flash ? `${t.shop.added} ✓` : product.sizes && !size ? t.shop.pickSize : t.shop.add}
          </button>
          {!product.sizes && stock && left(null) > 0 && left(null) <= 5 && <span className="product-low">{fill(t.shop.left, { n: left(null) })}</span>}
        </div>
      </div>
    </article>
  );
}

export default function Shop({ t, lang }) {
  const s = useCart();
  const [stock, setStock] = useState(null);
  const [status, setStatus] = useState(null);
  const [names, setNames] = useState(null);
  const country = s.country;
  const currency = currencyForLang(lang);

  useEffect(() => {
    fetch("/api/shop")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStock(d.stock))
      .catch(() => {});
    setNames(new Intl.DisplayNames([lang], { type: "region" }));
    const q = new URLSearchParams(location.search);
    const st = q.get("status");
    if (st === "success" || st === "cancelled") {
      setStatus(st);
      if (st === "success") {
        cart.clear();
        track("purchase_return");
      }
      history.replaceState(null, "", location.pathname);
    }
  }, [lang]);

  return (
    <>
      <section className="shop" id="shop">
        <div className="split-head split">
          <h1 className="label">{t.shop.title}</h1>
          <Marquee className="marquee-big" items={t.shop.ticker} />
        </div>

        {status && (
          <p className={`shop-status is-${status}`} role="status">
            {status === "success" ? t.shop.success : t.shop.cancelled}
          </p>
        )}

        <div className="shop-bar">
          <p>{t.shop.intro}</p>
          <label className="ship-to">
            <span>{t.shop.shipTo}</span>
            {names ? (
              <select value={country} onChange={(e) => cart.setCountry(e.target.value)}>
                {[...new Set(ZONES.flatMap((z) => z.countries))]
                  .sort((a, b) => names.of(a).localeCompare(names.of(b), lang))
                  .map((c) => (
                    <option key={c} value={c}>
                      {names.of(c)}
                    </option>
                  ))}
              </select>
            ) : (
              <select value="PL" disabled>
                <option value="PL">{lang === "pl" ? "Polska" : "Poland"}</option>
              </select>
            )}
          </label>
        </div>

        <div className="shop-grid">
          {PRODUCTS.map((p) => (
            <Product key={p.id} product={p} t={t} lang={lang} stock={stock} currency={currency} />
          ))}
        </div>

        <div className="rows-block shop-info">
          <div>
            <h2 className="shop-h">{t.shop.shippingTitle}</h2>
            <p className="rows-intro">{t.shop.shippingText}</p>
            <ul className="rate-list">
              {ZONES.map((z) => (
                <li key={z.id}>
                  <span>{z.name[lang]}</span>
                  <span>{fill(t.shop.deliveryDays, { a: z.days[0], b: z.days[1] })}</span>
                  <b>{money(z.amount[currency], currency, lang)}</b>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="shop-h">{t.shop.paymentsTitle}</h2>
            <p className="rows-intro">{t.shop.paymentsText}</p>
            <ul className="legal-links">
              {["terms", "privacy", "returns"].map((id) => (
                <li key={id}>
                  <a href={pagePath(id, lang)}>{t.shop.legalNav[id]}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <CartDrawer t={t} lang={lang} />
    </>
  );
}
