import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { site } from "@/lib/site";

export const metadata = { title: "Thank you" };

export default async function OrderConfirmation(props: PageProps<"/order/[id]">) {
  const { id } = await props.params;
  const { kind } = await props.searchParams;
  const isQuote = kind === "quote";
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
      <h1 className="font-display mt-4 text-3xl font-bold">{isQuote ? "Quote request received!" : "Order received!"}</h1>
      <p className="mt-2 text-muted">Reference <span className="font-mono font-semibold text-ink">{id}</span></p>
      <ol className="mt-8 text-left space-y-3 rounded-2xl bg-cloud p-6 text-sm">
        <li><b>1. File check</b> — our prepress team reviews your artwork.</li>
        <li><b>2. Proof</b> — you&apos;ll get a digital proof{isQuote ? " and pricing" : " and final total"} by email, usually within 1 business day.</li>
        <li><b>3. Production</b> — once approved, we print, finish and get it to you.</li>
      </ol>
      <p className="mt-6 text-sm text-muted">Questions? Call <a href={site.phoneHref} className="font-semibold text-ink">{site.phone}</a></p>
      <Link href="/products" className="btn btn-ink mt-6">Continue shopping</Link>
    </div>
  );
}
