"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArtworkUpload from "@/components/ArtworkUpload";
import CheckoutForm from "@/components/CheckoutForm";
import type { Artwork } from "@/lib/cart";
import { categories } from "@/lib/products";

export default function QuoteForm({ blobEnabled }: { blobEnabled: boolean }) {
  const router = useRouter();
  const [category, setCategory] = useState<string>(categories[0].name);
  const [details, setDetails] = useState("");
  const [artwork, setArtwork] = useState<Artwork[]>([]);

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-semibold mb-2">What do you need?</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[...categories.map((c) => c.name), "Something else"].map((n) => (
            <button key={n} type="button" className="choice text-center" aria-pressed={category === n} onClick={() => setCategory(n)}>{n}</button>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm font-semibold">Project details
        <textarea rows={5} className="field mt-2 font-normal" value={details} onChange={(e) => setDetails(e.target.value)}
          placeholder="What is it, dimensions, quantity, materials, where it's going, deadline…" />
      </label>
      <div>
        <div className="text-sm font-semibold mb-2">Files &amp; references (optional)</div>
        <ArtworkUpload files={artwork} onChange={setArtwork} blobEnabled={blobEnabled} />
      </div>
      <hr className="border-line" />
      <CheckoutForm
        submitLabel="Send quote request"
        items={[{ id: "quote", slug: "", name: `Quote: ${category}`, options: [], quantity: 0, total: null, artwork, designHelp: false, notes: details }]}
        onSuccess={(id) => router.push(`/order/${id}?kind=quote`)}
      />
    </div>
  );
}
