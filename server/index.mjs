// WHITEWATER shop backend. No dependencies; Node 20+.
//   POST /api/quote     cart + country → prices incl. shipping (for the cart drawer)
//   POST /api/checkout  cart + country → Stripe Checkout Session URL
//   POST /api/webhook   Stripe → stock, orders
//   GET  /api/shop      stock + shippable countries
// Settings come from environment variables, see server/README.md.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { PRODUCTS, productById, stockKey } from "../src/data/products.js";
import { SITE } from "../src/links.js";
import { COUNTRIES, currencyForLang, quoteShipping } from "./shipping.mjs";
import { stripe, verifyWebhook } from "./stripe.mjs";
import { getStock, saveOrder, takeStock } from "./store.mjs";

const env = (k, d = "") => process.env[k] ?? d;
const SITE_URL = () => env("SITE_URL", SITE).replace(/\/$/, "");
const MAX_LINES = 12;
const MAX_QTY = 10;

class HttpError extends Error {
  constructor(status, code, extra = {}) {
    super(code);
    this.status = status;
    this.body = { error: code, ...extra };
  }
}

// ───────────── pricing ─────────────

/** Validates the cart and prices it. Throws HttpError with a machine-readable code. */
export async function priceCart(items, country, currency) {
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "empty_cart");
  if (items.length > MAX_LINES) throw new HttpError(400, "too_many_lines");
  if (currency !== "PLN" && currency !== "EUR") throw new HttpError(400, "bad_currency");
  if (!quoteShipping(country, 0, currency)) throw new HttpError(400, "unknown_country");

  const stock = await getStock();
  const merged = new Map();
  for (const raw of items) {
    const p = productById(raw?.id);
    if (!p) throw new HttpError(400, "unknown_product", { id: String(raw?.id) });
    const qty = Number(raw.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) throw new HttpError(400, "bad_quantity", { id: p.id });
    let size = null;
    if (p.sizes) {
      if (!p.sizes.includes(raw.size)) throw new HttpError(400, "size_required", { id: p.id });
      size = raw.size;
    }
    const key = `${p.id}:${size ?? "-"}`;
    merged.set(key, { product: p, size, qty: Math.min(MAX_QTY, (merged.get(key)?.qty ?? 0) + qty) });
  }

  const lines = [...merged.values()];
  for (const l of lines) {
    const left = stock[l.product.id]?.[stockKey(l.product, l.size)] ?? 0;
    if (l.qty > left) throw new HttpError(409, "out_of_stock", { id: l.product.id, size: l.size, left });
  }

  const goods = lines.reduce((sum, l) => sum + l.product.price[currency] * l.qty, 0);
  const ship = quoteShipping(country, goods, currency);
  return { lines, currency, goods, shipping: ship, total: goods + ship.amount };
}

// ───────────── checkout ─────────────

async function createCheckout({ items, country, lang }) {
  lang = lang === "pl" ? "pl" : "en";
  const cart = await priceCart(items, country, currencyForLang(lang));
  const { currency, shipping } = cart;
  const base = SITE_URL();
  const shopPath = lang === "pl" ? "/pl/sklep/" : "/shop/";
  const termsPath = lang === "pl" ? "/pl/sklep/regulamin/" : "/shop/terms/";
  const tax = env("STRIPE_TAX") === "1";

  const params = {
    mode: "payment",
    locale: lang,
    submit_type: "pay",
    client_reference_id: undefined,
    success_url: `${base}${shopPath}?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${shopPath}?status=cancelled`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    line_items: cart.lines.map((l) => {
      const t = l.product.text[lang];
      return {
        quantity: l.qty,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: l.product.price[currency],
          tax_behavior: "inclusive",
          product_data: {
            name: l.size ? `${t.name} (${l.size})` : t.name,
            description: t.meta,
            tax_code: "txcd_99999999",
            images: l.product.images[0] ? [`${base}${l.product.images[0]}`] : undefined,
            metadata: { product: l.product.id, size: l.size ?? "" },
          },
        },
      };
    }),
    shipping_address_collection: { allowed_countries: [country] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: shipping.name[lang],
          tax_behavior: "inclusive",
          tax_code: "txcd_92010001",
          fixed_amount: { amount: shipping.amount, currency: currency.toLowerCase() },
          delivery_estimate: {
            minimum: { unit: "business_day", value: shipping.days[0] },
            maximum: { unit: "business_day", value: shipping.days[1] },
          },
        },
      },
    ],
    phone_number_collection: { enabled: true },
    billing_address_collection: "auto",
    customer_creation: "always",
    invoice_creation: { enabled: true, invoice_data: { description: "WHITEWATER" } },
    allow_promotion_codes: true,
    automatic_tax: tax ? { enabled: true } : undefined,
    custom_text: {
      submit: {
        message:
          lang === "pl"
            ? `Płacąc, akceptujesz [regulamin sklepu](${base}${termsPath}). Masz 14 dni na odstąpienie od umowy.`
            : `By paying you accept the [terms of sale](${base}${termsPath}). You have 14 days to withdraw from the purchase.`,
        },
    },
    consent_collection: env("STRIPE_REQUIRE_TOS") === "1" ? { terms_of_service: "required" } : undefined,
    metadata: {
      cart: cart.lines.map((l) => `${l.product.id}:${l.size ?? "-"}:${l.qty}`).join(","),
      lang,
      country,
    },
    payment_intent_data: { description: "WHITEWATER shop", metadata: { lang } },
  };

  const session = await stripe("POST", "/v1/checkout/sessions", params);
  return { url: session.url, id: session.id };
}

// ───────────── webhook ─────────────

async function fulfil(session) {
  const meta = session.metadata || {};
  const lines = String(meta.cart || "")
    .split(",")
    .filter(Boolean)
    .map((s) => {
      const [id, size, qty] = s.split(":");
      return { id, size: size === "-" ? null : size, qty: Number(qty) };
    });
  const details = session.collected_information?.shipping_details ?? session.shipping_details ?? {};
  const fresh = await saveOrder({
    session: session.id,
    at: new Date().toISOString(),
    email: session.customer_details?.email ?? null,
    name: details.name ?? session.customer_details?.name ?? null,
    phone: session.customer_details?.phone ?? null,
    address: details.address ?? null,
    items: lines,
    currency: session.currency,
    total: session.amount_total,
    shipping: session.total_details?.amount_shipping ?? session.shipping_cost?.amount_total ?? null,
    paid: session.payment_status,
  });
  if (fresh) {
    await takeStock(lines);
    console.log(`order ${session.id}: ${lines.map((l) => `${l.qty}× ${l.id}${l.size ? " " + l.size : ""}`).join(", ")}`);
  }
}

async function handleWebhook(raw, signature) {
  let event;
  try {
    event = verifyWebhook(raw, signature, env("STRIPE_WEBHOOK_SECRET"));
  } catch (e) {
    throw new HttpError(400, "bad_signature", { detail: e.message });
  }
  const s = event.data?.object;
  if (event.type === "checkout.session.completed" && s.payment_status === "paid") await fulfil(s);
  if (event.type === "checkout.session.async_payment_succeeded") await fulfil(s);
  return { received: true };
}

// ───────────── http ─────────────

const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 30;
}

function readBody(req, max = 32_768) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > max) {
        reject(new HttpError(413, "too_large"));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const send = (res, status, body, headers = {}) => {
  const json = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers });
  res.end(json);
};

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".svg": "image/svg+xml", ".txt": "text/plain", ".xml": "application/xml" };

// Only for local testing (STATIC_DIR=dist): in production nginx serves the files.
async function serveStatic(dir, pathname, res) {
  let p = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  if (p.endsWith("/")) p += "index.html";
  try {
    const data = await readFile(join(dir, p));
    res.writeHead(200, { "Content-Type": MIME[extname(p)] || "application/octet-stream" });
    res.end(data);
  } catch {
    send(res, 404, { error: "not_found" });
  }
}

export const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (url.pathname === "/api/health") return send(res, 200, { ok: true });

    if (url.pathname === "/api/shop" && req.method === "GET") {
      const key = env("STRIPE_SECRET_KEY");
      return send(res, 200, {
        stock: await getStock(),
        countries: COUNTRIES,
        mode: key.startsWith("sk_live") || key.startsWith("rk_live") ? "live" : "test",
      });
    }

    if (url.pathname === "/api/webhook" && req.method === "POST") {
      return send(res, 200, await handleWebhook(await readBody(req, 1_000_000), req.headers["stripe-signature"]));
    }

    if ((url.pathname === "/api/quote" || url.pathname === "/api/checkout") && req.method === "POST") {
      const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress).split(",")[0].trim();
      if (limited(ip)) throw new HttpError(429, "slow_down");
      let input;
      try {
        input = JSON.parse((await readBody(req)).toString("utf8"));
      } catch {
        throw new HttpError(400, "bad_json");
      }
      if (url.pathname === "/api/checkout") return send(res, 200, await createCheckout(input));
      const c = await priceCart(input.items, input.country, currencyForLang(input.lang === "pl" ? "pl" : "en"));
      return send(res, 200, {
        currency: c.currency,
        goods: c.goods,
        shipping: c.shipping.amount,
        total: c.total,
        zone: c.shipping.zone,
        days: c.shipping.days,
      });
    }

    if (url.pathname.startsWith("/api/")) throw new HttpError(404, "not_found");
    if (env("STATIC_DIR")) return serveStatic(env("STATIC_DIR"), url.pathname, res);
    throw new HttpError(404, "not_found");
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.status, e.body);
    if (e.stripe) {
      console.error("stripe:", e.status, e.message);
      return send(res, 502, { error: "payment_provider", message: e.message });
    }
    console.error(e);
    send(res, 500, { error: "server_error" });
  }
});

if (import.meta.url === `file://${process.argv[1]}` || process.env.RUN_SERVER === "1") {
  const port = Number(env("PORT", "8787"));
  server.listen(port, env("HOST", "127.0.0.1"), () => console.log(`shop api on :${port}`));
}
