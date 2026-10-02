"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Paperclip, Trash2 } from "lucide-react";
import CheckoutForm from "@/components/CheckoutForm";
import ProductArt from "@/components/ProductArt";
import { useCart } from "@/lib/cart";
import { getProduct, money } from "@/lib/products";

export default function CartPage() {
  const { items, ready, remove, clear, subtotal } = useCart();
  const router = useRouter();
  const hasQuotes = items.some((i) => i.total === null);

  if (!ready) return <div className="mx-auto max-w-7xl px-4 py-24" />;
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted">Pick a product, upload your artwork, and it&apos;ll show up here.</p>
        <Link href="/products" className="btn btn-brand mt-6">Shop products</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold">Your cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_440px]">
        <div className="space-y-4">
          {items.map((i) => {
            const p = getProduct(i.slug);
            return (
              <div key={i.id} className="flex gap-4 rounded-2xl border border-line p-4">
                {p && <ProductArt category={p.category} icon={p.icon} className="h-24 w-24 shrink-0 rounded-xl" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/products/${i.slug}`} className="font-semibold hover:text-brand">{i.name}</Link>
                    <div className="font-bold whitespace-nowrap">{i.total === null ? "Quote" : money(i.total)}</div>
                  </div>
                  <dl className="mt-1 text-sm text-muted space-y-0.5">
                    {i.quantity > 0 && <div>Qty: {i.quantity.toLocaleString()}</div>}
                    {i.options.map((o) => <div key={o.label}>{o.label}: {o.value}</div>)}
                    {i.designHelp && <div className="text-brand font-medium">Design help requested</div>}
                    {i.notes && <div className="truncate">Notes: {i.notes}</div>}
                  </dl>
                  {i.artwork.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {i.artwork.map((a) => (
                        <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs rounded-full bg-cloud px-2 py-1 hover:bg-line">
                          <Paperclip className="h-3 w-3" /> {a.name}
                        </a>
                      ))}
                    </div>
                  )}
                  <button onClick={() => remove(i.id)} className="mt-3 inline-flex items-center gap-1 text-sm text-muted hover:text-red-600">
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            );
          })}
          <Link href="/products" className="inline-block text-sm font-semibold hover:text-brand">← Keep shopping</Link>
        </div>

        <aside className="rounded-2xl border border-line p-6 self-start lg:sticky lg:top-28">
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Estimated subtotal</span>
            <span className="font-bold">{money(subtotal)}</span>
          </div>
          {hasQuotes && <p className="mt-1 text-sm text-muted">+ custom-quote items priced with your proof</p>}
          <p className="mt-1 text-sm text-muted">Shipping, install and tax calculated with your proof.</p>
          <hr className="my-5 border-line" />
          <CheckoutForm
            items={items}
            submitLabel={hasQuotes && subtotal === 0 ? "Submit quote request" : "Place order & request proof"}
            onSuccess={(id, kind) => {
              clear();
              router.push(`/order/${id}?kind=${kind}`);
            }}
          />
        </aside>
      </div>
    </div>
  );
}
