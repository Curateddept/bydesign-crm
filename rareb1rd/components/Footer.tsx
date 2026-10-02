import Link from "next/link";
import { categories } from "@/lib/products";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-ink text-white mt-24">
      <div className="mx-auto max-w-7xl px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.svg" alt={site.name} className="h-7 w-auto" />
          <p className="mt-4 text-sm text-white/70">{site.description}</p>
          <div className="mt-4 flex gap-4 text-sm">
            <a href={site.social.facebook} target="_blank" rel="noreferrer" className="hover:text-brand">Facebook</a>
            <a href={site.social.pinterest} target="_blank" rel="noreferrer" className="hover:text-brand">Pinterest</a>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Shop</h3>
          <ul className="space-y-2 text-sm text-white/70">
            {categories.map((c) => (
              <li key={c.slug}><Link href={`/${c.slug}`} className="hover:text-white">{c.name}</Link></li>
            ))}
            <li><Link href="/products" className="hover:text-white">All products</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Locations</h3>
          <ul className="space-y-2 text-sm text-white/70">
            {site.locations.map((l) => (
              <li key={l.city}>
                <span className="text-white">{l.city}, {l.state}</span>
                {l.address && <><br />{l.address}, {l.zip}</>}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href={site.phoneHref} className="hover:text-white">{site.phone}</a></li>
            {site.email && <li><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>}
            {site.hours.map((h) => <li key={h.days}>{h.days}: {h.time}</li>)}
            <li className="pt-2"><Link href="/quote" className="text-brand font-semibold">Request a quote →</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {site.name} LLC. All rights reserved.
      </div>
    </footer>
  );
}
