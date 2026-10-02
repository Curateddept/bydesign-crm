"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Phone, ShoppingCart, Truck, Upload, X } from "lucide-react";
import { categories, productsIn } from "@/lib/products";
import { site } from "@/lib/site";
import { useCart } from "@/lib/cart";

export default function Header() {
  const { items, ready } = useCart();
  const [open, setOpen] = useState(false);
  const count = ready ? items.length : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line">
      <div className="bg-ink text-white text-xs sm:text-sm">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-center gap-6">
          <span className="inline-flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Upload your own artwork on every product</span>
          <span className="hidden md:inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Local pickup in LA · Tempe · Miami · Brooklyn</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-2 sm:gap-4">
        <button className="lg:hidden -ml-1 p-2" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/" className="shrink-0" aria-label={`${site.name} home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt={site.name} className="h-7 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {categories.map((c) => (
            <div key={c.slug} className="group relative">
              <Link href={`/${c.slug}`} className="px-3 py-2 rounded-md text-sm font-semibold hover:bg-cloud whitespace-nowrap">
                {c.name}
              </Link>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition absolute left-0 top-full pt-2">
                <div className="w-64 rounded-xl border border-line bg-white shadow-xl p-2">
                  {productsIn(c.slug).map((p) => (
                    <Link key={p.slug} href={`/products/${p.slug}`} className="block rounded-md px-3 py-2 text-sm hover:bg-cloud">
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a href={site.phoneHref} className="hidden xl:inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 whitespace-nowrap">
            <Phone className="h-4 w-4" /> {site.phone}
          </a>
          <Link href="/quote" className="hidden md:inline-flex btn btn-outline !py-2 !px-4 text-sm">Get a Quote</Link>
          <Link href="/cart" className="relative p-2 rounded-md hover:bg-cloud" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-brand text-white text-[11px] font-bold grid place-items-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-line bg-white px-4 py-3 space-y-3">
          {categories.map((c) => (
            <div key={c.slug}>
              <Link href={`/${c.slug}`} onClick={() => setOpen(false)} className="font-semibold">{c.name}</Link>
              <div className="mt-1 grid grid-cols-2 gap-x-3">
                {productsIn(c.slug).map((p) => (
                  <Link key={p.slug} href={`/products/${p.slug}`} onClick={() => setOpen(false)} className="text-sm text-muted py-1">
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Link href="/quote" onClick={() => setOpen(false)} className="btn btn-brand flex-1">Get a Quote</Link>
            <a href={site.phoneHref} className="btn btn-outline flex-1">Call</a>
          </div>
        </nav>
      )}
    </header>
  );
}
