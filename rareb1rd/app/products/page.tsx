import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { categories, productsIn } from "@/lib/products";

export const metadata: Metadata = { title: "All Products" };

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold">All products</h1>
      <p className="mt-2 text-muted">Choose a product, upload your artwork, and see your price instantly.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <a key={c.slug} href={`#${c.slug}`} className="rounded-full border border-line px-3 py-1 text-sm hover:border-ink">{c.name}</a>
        ))}
      </div>
      {categories.map((c) => (
        <section key={c.slug} id={c.slug} className="pt-12 scroll-mt-32">
          <h2 className="font-display text-2xl font-bold">{c.name}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productsIn(c.slug).map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
