"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Palette, PenTool, ShoppingCart, Upload } from "lucide-react";
import ArtworkUpload, { uploadArtwork } from "./ArtworkUpload";
import DesignOnline from "./DesignOnline";
import { money, priceFor, type Option, type Product } from "@/lib/products";
import { useCart, type Artwork } from "@/lib/cart";

type ArtMode = "upload" | "design" | "help";

function aspectFromLabel(label?: string) {
  const nums = label?.match(/\d+(\.\d+)?/g)?.map(Number);
  return nums && nums.length >= 2 && nums[0] > 0 && nums[1] > 0 ? nums[0] / nums[1] : 4 / 3;
}

function Choices({ title, options, value, onChange }: { title: string; options: Option[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold mb-2">{title}</legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button key={o.id} type="button" className="choice" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function ProductConfigurator({ product: p, blobEnabled }: { product: Product; blobEnabled: boolean }) {
  const router = useRouter();
  const { add } = useCart();
  const isQuote = p.pricing === "quote";

  const [size, setSize] = useState(p.sizes?.[0]?.id ?? "");
  const [material, setMaterial] = useState(p.materials?.[0]?.id ?? "");
  const [finish, setFinish] = useState(p.finishes?.[0]?.id ?? "");
  const [quantity, setQuantity] = useState(p.quantities?.[0] ?? 1);
  const [preset, setPreset] = useState(p.presets?.length ? 0 : -1);
  const [widthIn, setWidthIn] = useState(p.presets?.[0]?.w ?? 24);
  const [heightIn, setHeightIn] = useState(p.presets?.[0]?.h ?? 36);
  const [artMode, setArtMode] = useState<ArtMode>("upload");
  const [artwork, setArtwork] = useState<Artwork[]>([]);
  const [notes, setNotes] = useState("");
  const [designerOpen, setDesignerOpen] = useState(false);
  const [error, setError] = useState("");

  const price = useMemo(
    () => priceFor(p, { size, material, finish, quantity, widthIn, heightIn }),
    [p, size, material, finish, quantity, widthIn, heightIn],
  );

  const sizeLabel = p.pricing === "sqft"
    ? `${widthIn}" W × ${heightIn}" H (${((widthIn * heightIn) / 144).toFixed(1)} sq ft)`
    : p.sizes?.find((s) => s.id === size)?.label;
  const aspect = p.pricing === "sqft" ? widthIn / heightIn : aspectFromLabel(p.sizes?.find((s) => s.id === size)?.label);

  function addToCart() {
    setError("");
    if (artMode !== "help" && artwork.length === 0) {
      setError(artMode === "upload" ? "Upload your artwork, or choose “Hire a designer”." : "Create your design first, or choose another option.");
      return;
    }
    if (isQuote && !notes.trim()) {
      setError("Tell us a bit about your project (size, quantity, timeline).");
      return;
    }
    const options = [
      sizeLabel && { label: "Size", value: sizeLabel },
      p.materials && { label: "Material", value: p.materials.find((m) => m.id === material)?.label ?? "" },
      p.finishes && { label: "Options", value: p.finishes.find((f) => f.id === finish)?.label ?? "" },
    ].filter(Boolean) as { label: string; value: string }[];

    add({
      slug: p.slug,
      name: p.name,
      options,
      quantity: isQuote ? 0 : quantity,
      total: price?.total ?? null,
      artwork,
      designHelp: artMode === "help",
      notes,
    });
    router.push("/cart");
  }

  return (
    <div className="space-y-6">
      {!isQuote && (
        <>
          {p.pricing === "sqft" && (
            <fieldset>
              <legend className="text-sm font-semibold mb-2">Size</legend>
              <div className="grid grid-cols-3 gap-2">
                {p.presets?.map((ps, i) => (
                  <button key={ps.label} type="button" className="choice text-center" aria-pressed={preset === i}
                    onClick={() => { setPreset(i); setWidthIn(ps.w); setHeightIn(ps.h); }}>
                    {ps.label}
                  </button>
                ))}
                <button type="button" className="choice text-center" aria-pressed={preset === -1} onClick={() => setPreset(-1)}>Custom</button>
              </div>
              {preset === -1 && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="text-sm">Width (inches)
                    <input type="number" min={1} max={1200} className="field mt-1" value={widthIn} onChange={(e) => setWidthIn(Math.max(1, +e.target.value || 1))} />
                  </label>
                  <label className="text-sm">Height (inches)
                    <input type="number" min={1} max={1200} className="field mt-1" value={heightIn} onChange={(e) => setHeightIn(Math.max(1, +e.target.value || 1))} />
                  </label>
                </div>
              )}
              {p.minSqft && <p className="mt-2 text-xs text-muted">Minimum billable size: {p.minSqft} sq ft each.</p>}
            </fieldset>
          )}
          {p.sizes && p.sizes.length > 1 && <Choices title="Size" options={p.sizes} value={size} onChange={setSize} />}
          {p.materials && p.materials.length > 1 && <Choices title="Material" options={p.materials} value={material} onChange={setMaterial} />}
          {p.finishes && p.finishes.length > 1 && <Choices title="Options" options={p.finishes} value={finish} onChange={setFinish} />}

          <fieldset>
            <legend className="text-sm font-semibold mb-2">Quantity</legend>
            <div className="flex flex-wrap gap-2">
              {p.quantities?.map((q) => (
                <button key={q} type="button" className="choice min-w-16 text-center" aria-pressed={quantity === q} onClick={() => setQuantity(q)}>
                  {q.toLocaleString()}
                </button>
              ))}
              <input type="number" min={1} aria-label="Custom quantity" className="field !w-28" value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.floor(+e.target.value || 1)))} />
            </div>
          </fieldset>
        </>
      )}

      {/* Artwork */}
      <fieldset>
        <legend className="text-sm font-semibold mb-2">Artwork</legend>
        <div className="grid grid-cols-3 gap-2">
          {([
            ["upload", Upload, "Upload file"],
            ["design", PenTool, "Design online"],
            ["help", Palette, "Hire a designer"],
          ] as const).map(([id, I, label]) => (
            <button key={id} type="button" className="choice flex flex-col items-center gap-1 text-center !py-3" aria-pressed={artMode === id} onClick={() => setArtMode(id)}>
              <I className="h-5 w-5" /> <span className="text-xs sm:text-sm">{label}</span>
            </button>
          ))}
        </div>
        <div className="mt-3">
          {artMode === "upload" && <ArtworkUpload files={artwork} onChange={setArtwork} blobEnabled={blobEnabled} />}
          {artMode === "design" && (
            <div className="space-y-3">
              <button type="button" onClick={() => setDesignerOpen(true)} className="btn btn-outline w-full">
                <PenTool className="h-4 w-4" /> {artwork.length ? "Start another design" : "Open the designer"}
              </button>
              {artwork.length > 0 && <ArtworkUpload files={artwork} onChange={setArtwork} blobEnabled={blobEnabled} />}
            </div>
          )}
          {artMode === "help" && (
            <p className="rounded-xl bg-cloud p-4 text-sm text-ink-2">
              Our in-house designers will create your artwork. Add your ideas, brand colors and any links below — you can also attach logos or references after ordering. Design fees are quoted with your proof.
            </p>
          )}
        </div>
      </fieldset>

      <label className="block text-sm font-semibold">
        {isQuote ? "Project details" : "Notes for our team (optional)"}
        <textarea rows={isQuote ? 5 : 3} className="field mt-2 font-normal" value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder={isQuote ? "Dimensions, quantity, materials, install location, deadline…" : "Bleed, colors, deadline, installation…"} />
      </label>

      {/* Price + CTA */}
      <div className="rounded-2xl border border-line p-5 bg-cloud">
        {price ? (
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm text-muted">Total</div>
              <div className="font-display text-3xl font-bold">{money(price.total)}</div>
            </div>
            <div className="text-right text-sm text-muted">
              {money(price.each)} each
              {p.setupFee ? <><br />incl. {money(p.setupFee)} setup</> : null}
            </div>
          </div>
        ) : (
          <div>
            <div className="font-display text-xl font-bold">Custom project</div>
            <div className="text-sm text-muted">We&apos;ll reply with pricing and a proof, usually within 1 business day.</div>
          </div>
        )}
        <div className="mt-3 flex items-center gap-1.5 text-sm text-muted"><Clock className="h-4 w-4" /> Production: {p.turnaround} after proof approval</div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="button" onClick={addToCart} className="btn btn-brand w-full mt-4">
          <ShoppingCart className="h-4 w-4" /> {isQuote ? "Add to quote request" : "Add to cart"}
        </button>
      </div>

      {designerOpen && (
        <DesignOnline
          aspect={aspect}
          onClose={() => setDesignerOpen(false)}
          onDone={async (file) => {
            const art = await uploadArtwork(file, blobEnabled);
            setArtwork((a) => [...a, art]);
            setDesignerOpen(false);
          }}
        />
      )}
    </div>
  );
}
