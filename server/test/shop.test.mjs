// Run: node server/test/shop.test.mjs   (uses a fake Stripe, no network)
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createServer } from "node:http";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const seen = [];
const mock = createServer((req, res) => {
  let b = "";
  req.on("data", (c) => (b += c));
  req.on("end", () => {
    seen.push({ method: req.method, url: req.url, auth: req.headers.authorization, form: new URLSearchParams(b) });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ id: "cs_test_1", url: "https://checkout.stripe.com/c/pay/cs_test_1" }));
  });
});
await new Promise((r) => mock.listen(0, r));
process.env.STRIPE_API_BASE = `http://127.0.0.1:${mock.address().port}`;
process.env.STRIPE_SECRET_KEY = "sk_test_x";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
process.env.STRIPE_TAX = "1";
process.env.DATA_DIR = mkdtempSync(join(tmpdir(), "ww-"));

const { server } = await import("../index.mjs");
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const api = `http://127.0.0.1:${server.address().port}`;
const post = (p, body, headers = {}) =>
  fetch(api + p, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

const cart = [{ id: "afterlife-cd", qty: 2 }, { id: "shirt-black", size: "M", qty: 1 }];

// quotes: 2 CDs (100 PLN / 24 EUR) + shirt (60 PLN / 14 EUR)
const q = async (country, lang) => (await (await post("/api/quote", { items: cart, country, lang })).json());
let r = await q("PL", "pl");
assert.deepEqual([r.currency, r.goods, r.shipping, r.total], ["PLN", 16000, 1500, 17500]);
r = await q("DE", "pl");
assert.deepEqual([r.currency, r.shipping, r.total], ["PLN", 6000, 22000]);
r = await q("US", "pl");
assert.deepEqual([r.currency, r.shipping], ["PLN", 10500]);
r = await q("PL", "en");
assert.deepEqual([r.currency, r.goods, r.shipping, r.total], ["EUR", 3800, 400, 4200]);
r = await q("US", "en");
assert.deepEqual([r.currency, r.goods, r.shipping], ["EUR", 3800, 2500]);
assert.equal((await post("/api/quote", { items: cart, country: "RU", lang: "en" })).status, 400);
assert.equal((await post("/api/quote", { items: [{ id: "shirt-black", qty: 1 }], country: "PL", lang: "pl" })).status, 400); // size missing
assert.equal((await post("/api/quote", { items: [{ id: "nope", qty: 1 }], country: "PL", lang: "pl" })).status, 400);
assert.equal((await post("/api/quote", { items: [{ id: "afterlife-cd", qty: 999 }], country: "PL", lang: "pl" })).status, 400);
assert.equal((await post("/api/quote", "{bad")).status, 400);

// checkout creates a Stripe session with the right shape
r = await (await post("/api/checkout", { items: cart, country: "PL", lang: "pl" })).json();
assert.equal(r.url, "https://checkout.stripe.com/c/pay/cs_test_1");
const f = seen.at(-1).form;
assert.equal(seen.at(-1).auth, "Bearer sk_test_x");
assert.equal(f.get("mode"), "payment");
assert.equal(f.get("locale"), "pl");
assert.equal(f.get("line_items[0][price_data][currency]"), "pln");
assert.equal(f.get("line_items[0][price_data][unit_amount]"), "5000");
assert.equal(f.get("line_items[0][quantity]"), "2");
assert.equal(f.get("line_items[1][price_data][product_data][name]"), "Koszulka WHITEWATER — czarna (M)");
assert.equal(f.get("shipping_options[0][shipping_rate_data][fixed_amount][amount]"), "1500");
assert.equal(f.get("shipping_address_collection[allowed_countries][0]"), "PL");
assert.equal(f.get("automatic_tax[enabled]"), "true");
assert.equal(f.get("metadata[cart]"), "afterlife-cd:-:2,shirt-black:M:1");
assert.match(f.get("success_url"), /^https:\/\/whitewaterband\.com\/pl\/sklep\/\?status=success&session_id=\{CHECKOUT_SESSION_ID\}$/);

// English page → EUR, shipping in EUR
await post("/api/checkout", { items: cart, country: "US", lang: "en" });
const fe = seen.at(-1).form;
assert.equal(fe.get("line_items[0][price_data][currency]"), "eur");
assert.equal(fe.get("line_items[0][price_data][unit_amount]"), "1200");
assert.equal(fe.get("shipping_options[0][shipping_rate_data][fixed_amount][amount]"), "2500");
assert.equal(fe.get("shipping_options[0][shipping_rate_data][fixed_amount][currency]"), "eur");

// webhook
const event = (type, extra = {}) =>
  JSON.stringify({
    type,
    data: { object: { id: "cs_test_1", payment_status: "paid", currency: "pln", amount_total: 17500, total_details: { amount_shipping: 1500 },
      customer_details: { email: "a@b.c", phone: "+48123" },
      collected_information: { shipping_details: { name: "Jan", address: { country: "PL", city: "Poznań" } } },
      metadata: { cart: "afterlife-cd:-:2,shirt-black:M:1" }, ...extra } },
  });
const sign = (body, t = Math.floor(Date.now() / 1000), secret = "whsec_test") =>
  `t=${t},v1=${createHmac("sha256", secret).update(`${t}.${body}`).digest("hex")}`;
const stock = async () => (await (await fetch(api + "/api/shop")).json()).stock;

const body = event("checkout.session.completed");
assert.equal((await post("/api/webhook", body, { "Stripe-Signature": sign(body, undefined, "wrong") })).status, 400);
assert.equal((await post("/api/webhook", body, { "Stripe-Signature": sign(body, 1000) })).status, 400);       // too old
assert.equal((await post("/api/webhook", body, { "Stripe-Signature": sign(body) })).status, 200);
let s = await stock();
assert.equal(s["afterlife-cd"].one, 48);
assert.equal(s["shirt-black"].M, 9);
assert.equal((await post("/api/webhook", body, { "Stripe-Signature": sign(body) })).status, 200);             // repeat delivery
assert.equal((await stock())["afterlife-cd"].one, 48);

const unpaid = event("checkout.session.completed", { id: "cs_test_2", payment_status: "unpaid" });
await post("/api/webhook", unpaid, { "Stripe-Signature": sign(unpaid) });
assert.equal((await stock())["afterlife-cd"].one, 48);                                                         // not paid yet → no change
const later = event("checkout.session.async_payment_succeeded", { id: "cs_test_2" });
await post("/api/webhook", later, { "Stripe-Signature": sign(later) });
assert.equal((await stock())["afterlife-cd"].one, 46);

// out of stock → 409 with details
for (let i = 0; i < 5; i++) { const b = event("checkout.session.completed", { id: `cs_bulk_${i}`, metadata: { cart: "afterlife-cd:-:10" } }); await post("/api/webhook", b, { "Stripe-Signature": sign(b) }); }
assert.equal((await stock())["afterlife-cd"].one, 0);
r = await post("/api/quote", { items: [{ id: "afterlife-cd", qty: 1 }], country: "PL", lang: "pl" });
assert.equal(r.status, 409);
assert.equal((await r.json()).left, 0);

console.log("all shop API tests passed");
server.close(); mock.close();
