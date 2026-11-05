// Small command-line helper, run on the server:
//   node server/admin.mjs orders                 list orders
//   node server/admin.mjs stock                  show stock
//   node server/admin.mjs stock shirt-black M 12 set stock (CDs use the size "one")
import { getStock, listOrders, setStock } from "./store.mjs";

const [cmd, id, size, n] = process.argv.slice(2);
if (cmd === "orders") {
  for (const o of await listOrders())
    console.log(`${o.at}  ${o.session}\n  ${o.name ?? ""} <${o.email ?? ""}> ${o.phone ?? ""}\n  ${JSON.stringify(o.address)}\n  ${o.items.map((i) => `${i.qty}× ${i.id}${i.size ? " " + i.size : ""}`).join(", ")}  =  ${(o.total / 100).toFixed(2)} ${String(o.currency).toUpperCase()}\n`);
} else if (cmd === "stock" && id) {
  await setStock(id, size, Number(n));
  console.log(JSON.stringify((await getStock())[id]));
} else if (cmd === "stock") console.log(JSON.stringify(await getStock(), null, 2));
else console.log("usage: node server/admin.mjs orders | stock [product size count]");
