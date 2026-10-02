import { NextResponse } from "next/server";
import { deliverOrder, orderId, type Customer, type Order } from "@/lib/orders";
import type { CartItem } from "@/lib/cart";

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: { customer?: Partial<Customer>; items?: CartItem[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const c = body.customer ?? {};
  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  const customer: Customer = {
    name: str(c.name, 120),
    email: str(c.email, 200),
    phone: str(c.phone, 40),
    company: str(c.company, 120),
    fulfillment: c.fulfillment === "ship" || c.fulfillment === "install" ? c.fulfillment : "pickup",
    location: str(c.location, 80),
    address: str(c.address, 400),
    deadline: str(c.deadline, 40),
    notes: str(c.notes),
  };
  if (!customer.name || !/^\S+@\S+\.\S+$/.test(customer.email) || !customer.phone) {
    return NextResponse.json({ error: "Name, a valid email and phone are required." }, { status: 400 });
  }
  if (items.length === 0) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });

  const clean: CartItem[] = items.map((i) => ({
    id: str(i.id, 64),
    slug: str(i.slug, 80),
    name: str(i.name, 120),
    options: (Array.isArray(i.options) ? i.options : []).slice(0, 10).map((o) => ({ label: str(o?.label, 40), value: str(o?.value, 200) })),
    quantity: Math.max(0, Math.floor(Number(i.quantity) || 0)),
    total: typeof i.total === "number" && isFinite(i.total) ? i.total : null,
    artwork: (Array.isArray(i.artwork) ? i.artwork : []).slice(0, 20).map((a) => ({
      url: str(a?.url, 500), name: str(a?.name, 200), size: Number(a?.size) || 0, type: str(a?.type, 100),
    })),
    designHelp: !!i.designHelp,
    notes: str(i.notes),
  }));

  // Prices are estimates; the shop confirms final pricing with the proof before collecting payment.
  const order: Order = {
    id: orderId(),
    createdAt: new Date().toISOString(),
    kind: clean.every((i) => i.total === null) ? "quote" : "order",
    customer,
    items: clean,
    estimatedSubtotal: Math.round(clean.reduce((s, i) => s + (i.total ?? 0), 0) * 100) / 100,
  };

  try {
    await deliverOrder(order, new URL(req.url).origin);
  } catch (e) {
    console.error("Order delivery failed", order.id, e);
    return NextResponse.json({ error: "We couldn't submit your order. Please call us or try again." }, { status: 502 });
  }
  return NextResponse.json({ id: order.id, kind: order.kind });
}
