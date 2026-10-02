import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { CartItem } from "./cart";
import { money } from "./products";
import { site } from "./site";

export type Customer = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  fulfillment: "pickup" | "ship" | "install";
  location?: string;
  address?: string;
  deadline?: string;
  notes?: string;
};

export type Order = {
  id: string;
  createdAt: string;
  kind: "order" | "quote";
  customer: Customer;
  items: CartItem[];
  estimatedSubtotal: number;
};

export function orderId() {
  const n = Date.now().toString(36).toUpperCase().slice(-6);
  const r = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `RB-${n}${r}`;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function orderEmailHtml(o: Order, origin: string) {
  const abs = (u: string) => (u.startsWith("http") ? u : `${origin}${u}`);
  const rows = o.items
    .map(
      (i) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">
        <b>${esc(i.name)}</b>${i.quantity ? ` × ${i.quantity.toLocaleString()}` : ""}<br/>
        ${i.options.map((x) => `${esc(x.label)}: ${esc(x.value)}`).join("<br/>")}
        ${i.designHelp ? "<br/><b>Needs design help</b>" : ""}
        ${i.notes ? `<br/>Notes: ${esc(i.notes)}` : ""}
        ${i.artwork.map((a) => `<br/>📎 <a href="${esc(abs(a.url))}">${esc(a.name)}</a>`).join("")}
      </td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${i.total === null ? "Quote" : money(i.total)}</td></tr>`,
    )
    .join("");
  const c = o.customer;
  return `<div style="font-family:Arial,sans-serif;max-width:640px">
    <h2>New ${o.kind} ${o.id}</h2>
    <p><b>${esc(c.name)}</b>${c.company ? ` — ${esc(c.company)}` : ""}<br/>${esc(c.email)} · ${esc(c.phone)}<br/>
    Fulfillment: ${esc(c.fulfillment)}${c.location ? ` (${esc(c.location)})` : ""}${c.address ? `<br/>${esc(c.address)}` : ""}
    ${c.deadline ? `<br/>Needed by: ${esc(c.deadline)}` : ""}${c.notes ? `<br/>Notes: ${esc(c.notes)}` : ""}</p>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <p style="text-align:right"><b>Estimated subtotal: ${money(o.estimatedSubtotal)}</b></p>
  </div>`;
}

/**
 * Delivers an order to the shop. Configure at least one of:
 *  - RESEND_API_KEY + ORDER_EMAIL_TO (+ optional ORDER_EMAIL_FROM): emails the order
 *  - ORDER_WEBHOOK_URL: POSTs the order JSON (Zapier, Make, Slack workflow, CRM…)
 * In local dev (no config, not on Vercel) orders are written to .data/orders/.
 */
export async function deliverOrder(o: Order, origin: string) {
  const tasks: Promise<unknown>[] = [];
  const { RESEND_API_KEY, ORDER_EMAIL_TO, ORDER_EMAIL_FROM, ORDER_WEBHOOK_URL } = process.env;

  if (RESEND_API_KEY && ORDER_EMAIL_TO) {
    tasks.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: ORDER_EMAIL_FROM ?? `${site.name} Orders <orders@resend.dev>`,
          to: ORDER_EMAIL_TO.split(",").map((s) => s.trim()),
          reply_to: o.customer.email,
          subject: `New ${o.kind} ${o.id} — ${o.customer.name}`,
          html: orderEmailHtml(o, origin),
        }),
      }).then((r) => { if (!r.ok) throw new Error(`Email failed (${r.status})`); }),
    );
  }
  if (ORDER_WEBHOOK_URL) {
    tasks.push(
      fetch(ORDER_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(o) })
        .then((r) => { if (!r.ok) throw new Error(`Webhook failed (${r.status})`); }),
    );
  }
  if (tasks.length === 0) {
    if (process.env.VERCEL) throw new Error("Order delivery is not configured");
    const dir = path.join(process.cwd(), ".data", "orders");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${o.id}.json`), JSON.stringify(o, null, 2));
    return;
  }
  await Promise.all(tasks);
}
