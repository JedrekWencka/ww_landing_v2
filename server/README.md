# WHITEWATER shop (Stripe Checkout)

How it works: the site (static) has a cart in the browser. "Checkout" calls `POST /api/checkout`; the small Node
service in this folder re-prices the cart (it never trusts the browser), applies the shipping rate for the country,
and creates a **Stripe Checkout Session**. The customer pays on Stripe's page. Stripe calls `POST /api/webhook`
when the payment succeeded; the service then stores the order and lowers the stock.

## What you edit
| What | Where |
|---|---|
| Products, prices, sizes, seeded stock, photos, EN/PL texts | `src/data/products.js` |
| Shipping rates, countries, delivery times, free-shipping threshold | `server/shipping.mjs` |
| Your company details in the legal pages (must be filled in) | `src/legal.js` (`SELLER`) |
| Stripe keys, tax on/off | `/opt/ww_shop/.env` on the server |

After editing prices or products: `./deploy/shop-api.sh` (API) and `./deploy/hetzner.sh` (site).

## Stripe Dashboard checklist
1. Settings → Payment methods: turn on Cards, Apple Pay, Google Pay, Link, BLIK, Przelewy24 (what you want).
2. Developers → Webhooks → add endpoint `https://whitewaterband.com/api/webhook`, events
   `checkout.session.completed` and `checkout.session.async_payment_succeeded`; copy the signing secret to `.env`.
3. (Optional) Settings → Tax: set up Stripe Tax, then `STRIPE_TAX=1` in `.env`.
4. Settings → Emails: customer receipts on; "successful payments" notification to you on.
5. Developers → API keys → restricted key with the permissions listed in `.env.example`.

## Testing without money
Use the test keys (`rk_test_…` / `sk_test_…`) and card `4242 4242 4242 4242`, any future date, any CVC.
`GET /api/shop` shows `"mode": "test"` or `"live"`. `npm test` runs the API tests against a fake Stripe.

## Day to day (on the server)
    docker exec ww-shop-api node server/admin.mjs orders              # list orders with addresses
    docker exec ww-shop-api node server/admin.mjs stock               # show stock
    docker exec ww-shop-api node server/admin.mjs stock shirt-black M 12   # set stock (CDs: size "one")
Orders and stock are plain files in `/opt/ww_shop/data/` (back them up).

## Notes
- Stock is lowered when the payment is confirmed. Two people paying for the last item at the same time can both
  succeed; you would then refund one in the Dashboard.
- Sessions expire after 30 minutes. The success page (`/shop/?status=success`) empties the cart.
- The legal pages are drafts. Have a lawyer check them before selling.
