import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import ProductArt from "@/components/ProductArt";
import ProductCard from "@/components/ProductCard";
import ProductConfigurator from "@/components/ProductConfigurator";
import { getCategory, getProduct, products, productsIn } from "@/lib/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getProduct(slug);
  return p ? { title: p.name, description: p.summary } : {};
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const p = getProduct(slug);
  if (!p) notFound();
  const cat = getCategory(p.category)!;
  const related = productsIn(p.category).filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">Home</Link> / <Link href={`/${cat.slug}`} className="hover:text-ink">{cat.name}</Link> / <span className="text-ink">{p.name}</span>
      </nav>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_480px]">
        <div>
          <ProductArt category={p.category} icon={p.icon} size="lg" className="aspect-[4/3] rounded-3xl" />
          <h1 className="font-display mt-8 text-3xl sm:text-4xl font-bold">{p.name}</h1>
          <p className="mt-3 text-lg text-ink-2">{p.summary}</p>
          <ul className="mt-6 grid sm:grid-cols-3 gap-3">
            {p.details.map((d) => (
              <li key={d} className="flex items-start gap-2 text-sm rounded-xl bg-cloud p-3"><Check className="h-4 w-4 text-brand shrink-0 mt-0.5" /> {d}</li>
            ))}
          </ul>
          <div className="mt-8 rounded-2xl border border-line p-6 text-sm text-ink-2 space-y-2">
            <h2 className="font-semibold text-ink">Artwork guidelines</h2>
            <p>Send vector files (PDF, AI, EPS) or high-resolution images — 300 DPI at final size for small format, 150 DPI for large format. Add 0.125&quot; bleed and keep text 0.125&quot; inside the trim.</p>
            <p>Not print-ready? No problem — every order gets a free file check and a digital proof before we print.</p>
          </div>
        </div>
        <aside className="lg:sticky lg:top-28 self-start">
          <ProductConfigurator product={p} blobEnabled={!!process.env.BLOB_READ_WRITE_TOKEN} />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold">More in {cat.name}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <ProductCard key={r.slug} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
