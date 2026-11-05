// Cart state: lines + shipping country, kept in localStorage. Components subscribe with useCart().
// Before the browser has loaded the saved cart the state is empty, so the pre-rendered page and
// the first client render are identical (no hydration mismatch).
import { useEffect, useSyncExternalStore } from "react";
import { quoteShipping, zoneFor } from "../../server/shipping.mjs";
import { productById } from "../data/products.js";

const KEY = "ww-cart";
const EMPTY = { lines: [], country: "PL", open: false, ready: false };
let state = EMPTY;
const listeners = new Set();

function set(patch, persist = true) {
  state = { ...state, ...patch };
  if (persist) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ lines: state.lines, country: state.country }));
    } catch {
      /* private mode */
    }
  }
  listeners.forEach((l) => l());
}

function load() {
  if (state.ready) return;
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    /* ignore */
  }
  const lines = Array.isArray(saved.lines) ? saved.lines.filter((l) => productById(l?.id) && l.qty > 0) : [];
  const country = zoneFor(saved.country) ? saved.country : "PL";
  set({ lines, country, ready: true }, false);
}

const sameLine = (a, b) => a.id === b.id && (a.size ?? null) === (b.size ?? null);

export const cart = {
  add(id, size = null, qty = 1) {
    const lines = state.lines.map((l) => ({ ...l }));
    const hit = lines.find((l) => sameLine(l, { id, size }));
    if (hit) hit.qty = Math.min(10, hit.qty + qty);
    else lines.push({ id, size, qty });
    set({ lines });
  },
  setQty(id, size, qty) {
    const lines = state.lines
      .map((l) => (sameLine(l, { id, size }) ? { ...l, qty: Math.min(10, qty) } : l))
      .filter((l) => l.qty > 0);
    set({ lines });
  },
  clear: () => set({ lines: [] }),
  setCountry: (country) => set({ country }),
  open: () => set({ open: true }, false),
  close: () => set({ open: false }, false),
};

/** Prices of the current cart in `currency` (the server recalculates everything at checkout). */
export function totals(s, currency) {
  const goods = s.lines.reduce((n, l) => n + productById(l.id).price[currency] * l.qty, 0);
  const zone = quoteShipping(s.country, goods, currency);
  const shipping = s.lines.length ? zone.amount : 0;
  return { currency, goods, shipping, total: goods + shipping, zone };
}

export const count = (s) => s.lines.reduce((n, l) => n + l.qty, 0);

export function useCart() {
  const s = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => EMPTY,
  );
  useEffect(load, []);
  return s;
}

/** "50,00 zł" / "€12.00": a fixed format, so server and browser render the same text. */
export function money(amount, currency, lang) {
  const n = (amount / 100).toFixed(2);
  if (currency === "PLN") return lang === "pl" ? `${n.replace(".", ",")} zł` : `${n} PLN`;
  return lang === "pl" ? `${n.replace(".", ",")} €` : `€${n}`;
}
