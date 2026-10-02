"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { CartItem } from "@/lib/cart";
import type { Customer } from "@/lib/orders";
import { site } from "@/lib/site";

export default function CheckoutForm({
  items, submitLabel, onSuccess,
}: { items: CartItem[]; submitLabel: string; onSuccess: (id: string, kind: string) => void }) {
  const [c, setC] = useState<Customer>({ name: "", email: "", phone: "", company: "", fulfillment: "pickup", location: site.locations[0].city, address: "", deadline: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setC((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: c, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      onSuccess(data.id, data.kind);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm font-semibold">Full name*<input required className="field mt-1 font-normal" value={c.name} onChange={set("name")} autoComplete="name" /></label>
        <label className="text-sm font-semibold">Company<input className="field mt-1 font-normal" value={c.company} onChange={set("company")} autoComplete="organization" /></label>
        <label className="text-sm font-semibold">Email*<input required type="email" className="field mt-1 font-normal" value={c.email} onChange={set("email")} autoComplete="email" /></label>
        <label className="text-sm font-semibold">Phone*<input required type="tel" className="field mt-1 font-normal" value={c.phone} onChange={set("phone")} autoComplete="tel" /></label>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold mb-2">How do you want it?</legend>
        <div className="grid grid-cols-3 gap-2">
          {([["pickup", "Local pickup"], ["ship", "Ship to me"], ["install", "Delivery + install"]] as const).map(([id, label]) => (
            <button key={id} type="button" className="choice text-center" aria-pressed={c.fulfillment === id} onClick={() => setC((x) => ({ ...x, fulfillment: id }))}>{label}</button>
          ))}
        </div>
      </fieldset>
      {c.fulfillment === "pickup" ? (
        <label className="block text-sm font-semibold">Pickup location
          <select className="field mt-1 font-normal" value={c.location} onChange={set("location")}>
            {site.locations.map((l) => <option key={l.city} value={l.city}>{l.city}, {l.state}</option>)}
          </select>
        </label>
      ) : (
        <label className="block text-sm font-semibold">{c.fulfillment === "install" ? "Install address" : "Shipping address"}*
          <textarea required rows={2} className="field mt-1 font-normal" value={c.address} onChange={set("address")} autoComplete="street-address" />
        </label>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm font-semibold">Need it by<input type="date" className="field mt-1 font-normal" value={c.deadline} onChange={set("deadline")} /></label>
      </div>
      <label className="block text-sm font-semibold">Anything else?<textarea rows={3} className="field mt-1 font-normal" value={c.notes} onChange={set("notes")} /></label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="btn btn-brand w-full">
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : submitLabel}
      </button>
      <p className="text-xs text-muted text-center">
        No payment now. We&apos;ll check your files and send a proof with final pricing. Payment is collected once you approve.
      </p>
    </form>
  );
}
