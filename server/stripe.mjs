// Minimal Stripe client with no dependencies: form-encoded REST calls + webhook signature check.
import { createHmac, timingSafeEqual } from "node:crypto";

const BASE = process.env.STRIPE_API_BASE || "https://api.stripe.com";

/** {a:{b:1}, c:[x,y]} → a[b]=1&c[0]=x&c[1]=y (Stripe's nested form encoding) */
export function encode(value, prefix = "", out = []) {
  if (value === undefined || value === null) return out;
  if (Array.isArray(value)) value.forEach((v, i) => encode(v, `${prefix}[${i}]`, out));
  else if (typeof value === "object") for (const [k, v] of Object.entries(value)) encode(v, prefix ? `${prefix}[${k}]` : k, out);
  else out.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(String(value))}`);
  return out;
}

export async function stripe(method, path, params, { idempotencyKey } = {}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  const body = params ? encode(params).join("&") : undefined;
  const url = BASE + path + (method === "GET" && body ? `?${body}` : "");
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(method !== "GET" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: method === "GET" ? undefined : body,
    signal: AbortSignal.timeout(20000),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json?.error?.message || `Stripe error ${res.status}`);
    err.status = res.status;
    err.stripe = json?.error;
    throw err;
  }
  return json;
}

/** Verifies the Stripe-Signature header of a webhook. Returns the parsed event or throws. */
export function verifyWebhook(rawBody, header, secret, toleranceSec = 300, now = Date.now()) {
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  const parts = Object.fromEntries(
    String(header || "")
      .split(",")
      .map((p) => p.split("="))
      .filter((p) => p.length === 2)
      .map(([k, v]) => [k.trim(), v.trim()]),
  );
  const sigs = String(header || "")
    .split(",")
    .filter((p) => p.trim().startsWith("v1="))
    .map((p) => p.trim().slice(3));
  if (!parts.t || !sigs.length) throw new Error("Malformed Stripe-Signature header");
  if (Math.abs(now / 1000 - Number(parts.t)) > toleranceSec) throw new Error("Webhook timestamp outside tolerance");
  const expected = createHmac("sha256", secret).update(`${parts.t}.`).update(rawBody).digest();
  const ok = sigs.some((s) => {
    const buf = Buffer.from(s, "hex");
    return buf.length === expected.length && timingSafeEqual(buf, expected);
  });
  if (!ok) throw new Error("Webhook signature mismatch");
  return JSON.parse(rawBody.toString("utf8"));
}
