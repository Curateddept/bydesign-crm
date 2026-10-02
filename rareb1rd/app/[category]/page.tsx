import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Icon from "@/components/Icon";
import { categories, getCategory, productsIn } from "@/lib/products";

// Mirrors the original rareb1rd.com URLs: /labels-packaging, /wide-format, /display-design, /events-promotional
export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}
export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/[category]">): Promise<Metadata> {
  const c = getCategory((await props.params).category);
  return c ? { title: c.name, description: c.blurb } : {};
}

export default async function CategoryPage(props: PageProps<"/[category]">) {
  const c = getCategory((await props.params).category);
  if (!c) notFound();
  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <span className="h-12 w-12 rounded-xl bg-brand grid place-items-center"><Icon name={c.icon} className="h-6 w-6" /></span>
          <h1 className="font-display mt-5 text-4xl sm:text-5xl font-bold">{c.name}</h1>
          <p className="mt-4 max-w-2xl text-white/75 text-lg">{c.blurb}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.filter((x) => x.slug !== c.slug).map((x) => (
              <Link key={x.slug} href={`/${x.slug}`} className="rounded-full border border-white/20 px-3 py-1 text-sm hover:bg-white/10">{x.name}</Link>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productsIn(c.slug).map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>
    </>
  );
}
