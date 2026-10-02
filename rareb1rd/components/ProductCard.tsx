import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductArt from "./ProductArt";
import { money, startingPrice, type Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const from = startingPrice(product);
  return (
    <Link href={`/products/${product.slug}`} className="group rounded-2xl border border-line overflow-hidden bg-white hover:shadow-xl hover:-translate-y-0.5 transition">
      <ProductArt category={product.category} icon={product.icon} className="aspect-[4/3]" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{product.name}</h3>
          {product.popular && <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide bg-brand-soft text-brand px-2 py-0.5 rounded">Popular</span>}
        </div>
        <p className="mt-1 text-sm text-muted line-clamp-2">{product.summary}</p>
        <div className="mt-3 flex items-center justify-between text-sm">
          {from !== null ? (
            <span>
              <span className="text-muted">Starting at </span>
              <span className="font-bold">{money(from)}</span>
            </span>
          ) : (
            <span className="font-semibold text-brand">Custom quote</span>
          )}
          <ArrowRight className="h-4 w-4 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition" />
        </div>
      </div>
    </Link>
  );
}
