import Link from "next/link";
import { ArrowRight, BadgeCheck, Factory, MapPin, MousePointerClick, Palette, Truck, Upload, Wrench } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductArt from "@/components/ProductArt";
import Icon from "@/components/Icon";
import { categories, products, productsIn } from "@/lib/products";
import { site } from "@/lib/site";

export default function Home() {
  const popular = products.filter((p) => p.popular);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="stripe-bg absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {site.tagline}
            </p>
            <h1 className="font-display mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
              Custom labels, signs &amp; displays. <span className="text-brand">Printed in-house.</span>
            </h1>
            <p className="mt-5 text-lg text-white/75 max-w-xl">
              Pick a product, upload your artwork, and get an instant price. From 250 roll labels to a full building wrap — we print it, finish it and install it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn btn-brand">Shop all products <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/quote" className="btn bg-white text-ink hover:bg-white/90">Upload &amp; get a quote</Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {site.stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-3xl font-bold">{s.value}</dt>
                  <dd className="text-xs text-white/60 mt-1">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((c, i) => (
              <Link key={c.slug} href={`/${c.slug}`} className={`group rounded-2xl overflow-hidden ring-1 ring-white/10 ${i % 2 ? "translate-y-6" : ""}`}>
                <ProductArt category={c.slug} icon={c.icon} className="aspect-square group-hover:scale-[1.03] transition" />
                <div className="bg-white/5 px-4 py-3 text-sm font-semibold flex items-center justify-between">
                  {c.name} <ArrowRight className="h-4 w-4 opacity-60 group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-b border-line bg-cloud">
        <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          {[
            { icon: Upload, t: "Upload any file", d: "PDF, AI, EPS, PSD, PNG, JPG" },
            { icon: BadgeCheck, t: "Free proof", d: "We check every file before print" },
            { icon: Factory, t: "Printed in-house", d: "HP Indigo + 12 wide-format printers" },
            { icon: Wrench, t: "Install available", d: "Walls, windows, wraps & displays" },
          ].map(({ icon: I, t, d }) => (
            <div key={t} className="flex items-start gap-3">
              <I className="h-5 w-5 text-brand shrink-0 mt-0.5" />
              <div><div className="font-semibold">{t}</div><div className="text-muted">{d}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold">Shop by category</h2>
          <Link href="/products" className="text-sm font-semibold hover:text-brand">View all →</Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {categories.map((c) => (
            <div key={c.slug} className="rounded-2xl border border-line p-6 flex flex-col">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-lg bg-brand-soft grid place-items-center"><Icon name={c.icon} className="h-5 w-5 text-brand" /></span>
                <h3 className="font-display text-xl font-bold">{c.name}</h3>
              </div>
              <p className="mt-3 text-sm text-muted">{c.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {productsIn(c.slug).map((p) => (
                  <Link key={p.slug} href={`/products/${p.slug}`} className="text-sm rounded-full border border-line px-3 py-1 hover:border-ink">
                    {p.name}
                  </Link>
                ))}
              </div>
              <Link href={`/${c.slug}`} className="mt-5 text-sm font-semibold text-brand self-start">Shop {c.short} →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Popular */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <h2 className="font-display text-3xl font-bold">Most popular</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <h2 className="font-display text-3xl font-bold text-center">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: MousePointerClick, t: "1. Choose your product", d: "Pick a size, material, finish and quantity. Your price updates instantly." },
            { icon: Palette, t: "2. Upload or design", d: "Upload your print-ready file, build a quick design online, or let our designers handle it." },
            { icon: Truck, t: "3. We print & deliver", d: "We send a proof, print in-house, then ship, deliver, or install." },
          ].map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-2xl bg-cloud p-6">
              <I className="h-8 w-8 text-brand" />
              <h3 className="mt-4 font-semibold text-lg">{t}</h3>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="rounded-3xl bg-ink text-white p-8 md:p-12 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">If it has a surface, we can wrap it.</h2>
            <p className="mt-4 text-white/70">
              Our in-house production floor means tighter color control, faster turnarounds and one team accountable for your project, from file check to final install.
            </p>
            <Link href="/quote" className="btn btn-brand mt-6">Start a project</Link>
          </div>
          <ul className="grid sm:grid-cols-2 gap-4">
            {site.equipment.map((e) => (
              <li key={e.name} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="font-semibold">{e.name}</div>
                <div className="text-sm text-white/60 mt-1">{e.detail}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Locations */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <h2 className="font-display text-3xl font-bold">Production hubs across the U.S.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {site.locations.map((l) => (
            <div key={l.city} className="rounded-2xl border border-line p-5">
              <div className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-brand" /> {l.city}, {l.state}</div>
              {l.address && <p className="mt-2 text-sm text-muted">{l.address}<br />{l.city}, {l.state} {l.zip}</p>}
              <p className="mt-3 text-sm">{l.specialty}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
