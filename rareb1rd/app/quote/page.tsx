import type { Metadata } from "next";
import { Clock, MapPin, Phone } from "lucide-react";
import QuoteForm from "./QuoteForm";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Get a Quote", description: "Upload your files and tell us about your project." };

export default function QuotePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 grid gap-12 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="font-display text-4xl font-bold">Get a quote</h1>
        <p className="mt-2 text-muted max-w-2xl">
          Custom displays, building wraps, packaging, or anything not in the catalog — upload your files and tell us what you need. We reply within 1 business day.
        </p>
        <div className="mt-8"><QuoteForm blobEnabled={!!process.env.BLOB_READ_WRITE_TOKEN} /></div>
      </div>
      <aside className="space-y-4">
        <div className="rounded-2xl bg-ink text-white p-6">
          <div className="flex items-center gap-2 font-semibold"><Phone className="h-4 w-4 text-brand" /> Talk to us</div>
          <a href={site.phoneHref} className="mt-2 block font-display text-2xl font-bold">{site.phone}</a>
          {site.email && <a href={`mailto:${site.email}`} className="mt-1 block text-white/70">{site.email}</a>}
          <div className="mt-4 flex items-center gap-2 font-semibold"><Clock className="h-4 w-4 text-brand" /> Hours</div>
          <ul className="mt-2 text-sm text-white/70 space-y-1">{site.hours.map((h) => <li key={h.days}>{h.days}: {h.time}</li>)}</ul>
        </div>
        {site.locations.map((l) => (
          <div key={l.city} className="rounded-2xl border border-line p-5 text-sm">
            <div className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-brand" /> {l.city}, {l.state}</div>
            {l.address && <p className="mt-1 text-muted">{l.address}, {l.city}, {l.state} {l.zip}</p>}
            <p className="mt-1">{l.specialty}</p>
          </div>
        ))}
      </aside>
    </div>
  );
}
