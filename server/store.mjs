// Stock and orders, kept in plain files under DATA_DIR (default ./data). One writer, so a simple queue is enough.
import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { PRODUCTS, productById, stockKey } from "../src/data/products.js";

const DIR = () => process.env.DATA_DIR || join(process.cwd(), "data");
let queue = Promise.resolve();
const serial = (fn) => (queue = queue.then(fn, fn));

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return fallback;
    throw e;
  }
}
async function writeJson(file, data) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file + ".tmp", JSON.stringify(data, null, 2));
  await rename(file + ".tmp", file);
}

/** Current stock: file contents, topped up with the seed numbers from the catalogue for anything missing. */
export async function getStock() {
  const saved = await readJson(join(DIR(), "stock.json"), {});
  const out = {};
  for (const p of PRODUCTS) out[p.id] = { ...p.stock, ...(saved[p.id] || {}) };
  return out;
}

export const setStock = (id, key, n) =>
  serial(async () => {
    const all = await getStock();
    if (!all[id]) throw new Error(`Unknown product ${id}`);
    all[id][key] = Math.max(0, Math.floor(n));
    await writeJson(join(DIR(), "stock.json"), all);
  });

/** Takes items out of stock; never goes below zero. */
export const takeStock = (lines) =>
  serial(async () => {
    const all = await getStock();
    for (const { id, size, qty } of lines) {
      const p = productById(id);
      if (!p) continue;
      const k = stockKey(p, size);
      all[id][k] = Math.max(0, (all[id][k] ?? 0) - qty);
    }
    await writeJson(join(DIR(), "stock.json"), all);
  });

const ordersFile = () => join(DIR(), "orders.jsonl");

export async function listOrders() {
  try {
    return (await readFile(ordersFile(), "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}

/** Stores an order once per Checkout Session (Stripe may deliver a webhook more than once). Returns false for a repeat. */
export const saveOrder = (order) =>
  serial(async () => {
    const existing = await listOrders();
    if (existing.some((o) => o.session === order.session)) return false;
    await mkdir(DIR(), { recursive: true });
    await appendFile(ordersFile(), JSON.stringify(order) + "\n");
    return true;
  });
