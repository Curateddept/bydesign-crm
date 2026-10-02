"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Type, X } from "lucide-react";

type TextEl = { id: string; kind: "text"; text: string; x: number; y: number; size: number; color: string; bold: boolean };
type ImageEl = { id: string; kind: "image"; img: HTMLImageElement; x: number; y: number; w: number };
type El = TextEl | ImageEl;

const LONG_SIDE = 2400; // export resolution (px) on the longest side
const FONTS = "'Space Grotesk', Inter, Arial, sans-serif";

/**
 * Lightweight canvas designer: background color, text and logo/images,
 * drag to position. Exports a PNG that is attached to the order as artwork.
 */
export default function DesignOnline({
  aspect, onDone, onClose,
}: { aspect: number; onDone: (file: File) => Promise<void>; onClose: () => void }) {
  const W = aspect >= 1 ? LONG_SIDE : Math.round(LONG_SIDE * aspect);
  const H = aspect >= 1 ? Math.round(LONG_SIDE / aspect) : LONG_SIDE;
  const canvas = useRef<HTMLCanvasElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [bg, setBg] = useState("#ffffff");
  const [els, setEls] = useState<El[]>(() => [
    { id: "t1", kind: "text", text: "Your Headline", x: 0.5, y: 0.42, size: 0.12, color: "#0d0d0f", bold: true },
    { id: "t2", kind: "text", text: "Add details here", x: 0.5, y: 0.62, size: 0.06, color: "#3a3a42", bold: false },
  ]);
  const [sel, setSel] = useState<string | null>("t1");
  const [saving, setSaving] = useState(false);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const bounds = useCallback(
    (ctx: CanvasRenderingContext2D, el: El) => {
      if (el.kind === "text") {
        // size is relative to the short side; shrink long text to fit 92% of the width
        let px = el.size * Math.min(W, H);
        ctx.font = `${el.bold ? 700 : 500} ${px}px ${FONTS}`;
        let w = ctx.measureText(el.text).width;
        if (w > W * 0.92) {
          px *= (W * 0.92) / w;
          ctx.font = `${el.bold ? 700 : 500} ${px}px ${FONTS}`;
          w = ctx.measureText(el.text).width;
        }
        return { x: el.x * W - w / 2, y: el.y * H - px / 2, w, h: px };
      }
      const w = el.w * W;
      const h = w * (el.img.naturalHeight / el.img.naturalWidth);
      return { x: el.x * W - w / 2, y: el.y * H - h / 2, w, h };
    },
    [W, H],
  );

  const draw = useCallback(
    (withSelection: boolean) => {
      const ctx = canvas.current?.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      for (const el of els) {
        const b = bounds(ctx, el);
        if (el.kind === "text") {
          ctx.fillStyle = el.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(el.text, el.x * W, el.y * H);
        } else {
          ctx.drawImage(el.img, b.x, b.y, b.w, b.h);
        }
        if (withSelection && el.id === sel) {
          ctx.strokeStyle = "#ff4b1f";
          ctx.lineWidth = Math.max(3, W / 400);
          ctx.setLineDash([W / 100, W / 160]);
          ctx.strokeRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16);
          ctx.setLineDash([]);
        }
      }
    },
    [bg, els, sel, W, H, bounds],
  );

  useEffect(() => {
    draw(true);
    // redraw once web fonts are ready so text metrics are right
    document.fonts?.ready.then(() => draw(true));
  }, [draw]);

  const toCanvas = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  function onDown(e: React.PointerEvent) {
    const ctx = canvas.current!.getContext("2d")!;
    const p = toCanvas(e);
    const hit = [...els].reverse().find((el) => {
      const b = bounds(ctx, el);
      return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
    });
    setSel(hit?.id ?? null);
    if (hit) {
      drag.current = { id: hit.id, dx: p.x - hit.x * W, dy: p.y - hit.y * H };
      canvas.current!.setPointerCapture(e.pointerId);
    }
  }
  function onMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const p = toCanvas(e);
    const { id, dx, dy } = drag.current;
    setEls((all) => all.map((el) => (el.id === id ? { ...el, x: (p.x - dx) / W, y: (p.y - dy) / H } : el)));
  }
  const onUp = () => { drag.current = null; };

  const update = (patch: Partial<TextEl> & Partial<ImageEl>) =>
    setEls((all) => all.map((el) => (el.id === sel ? ({ ...el, ...patch } as El) : el)));
  const selected = els.find((e) => e.id === sel);

  function addText() {
    const id = crypto.randomUUID();
    setEls((a) => [...a, { id, kind: "text", text: "New text", x: 0.5, y: 0.5, size: 0.08, color: "#0d0d0f", bold: true }]);
    setSel(id);
  }
  function addImage(file: File | undefined) {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const id = crypto.randomUUID();
      setEls((a) => [...a, { id, kind: "image", img, x: 0.5, y: 0.25, w: 0.3 }]);
      setSel(id);
    };
    img.src = URL.createObjectURL(file);
  }

  async function finish() {
    setSaving(true);
    draw(false);
    const blob = await new Promise<Blob | null>((r) => canvas.current!.toBlob(r, "image/png"));
    draw(true);
    if (!blob) { setSaving(false); return; }
    try {
      await onDone(new File([blob], `online-design-${Date.now()}.png`, { type: "image/png" }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-2 sm:p-6" role="dialog" aria-modal="true" aria-label="Design online">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-full overflow-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-display text-lg font-bold">Design online</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-cloud" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid lg:grid-cols-[1fr_300px]">
          <div className="bg-cloud p-4 sm:p-8 grid place-items-center">
            <canvas
              ref={canvas}
              width={W}
              height={H}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              className="max-w-full max-h-[60vh] w-auto h-auto shadow-lg touch-none cursor-move bg-white"
              style={{ aspectRatio: `${W} / ${H}` }}
            />
          </div>
          <div className="p-5 space-y-5 border-t lg:border-t-0 lg:border-l border-line">
            <div className="flex gap-2">
              <button onClick={addText} className="btn btn-outline flex-1 !py-2 text-sm"><Type className="h-4 w-4" /> Text</button>
              <button onClick={() => fileInput.current?.click()} className="btn btn-outline flex-1 !py-2 text-sm"><ImagePlus className="h-4 w-4" /> Logo</button>
              <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={(e) => { addImage(e.target.files?.[0]); e.target.value = ""; }} />
            </div>
            <label className="block text-sm font-semibold">
              Background
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="mt-1 block h-10 w-full rounded border border-line" />
            </label>

            {selected?.kind === "text" && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold">Text
                  <input className="field mt-1" value={selected.text} onChange={(e) => update({ text: e.target.value })} />
                </label>
                <label className="block text-sm font-semibold">Size
                  <input type="range" min={0.03} max={0.35} step={0.005} value={selected.size} onChange={(e) => update({ size: +e.target.value })} className="w-full accent-[#ff4b1f]" />
                </label>
                <div className="flex gap-3 items-end">
                  <label className="block text-sm font-semibold flex-1">Color
                    <input type="color" value={selected.color} onChange={(e) => update({ color: e.target.value })} className="mt-1 block h-10 w-full rounded border border-line" />
                  </label>
                  <button onClick={() => update({ bold: !selected.bold })} aria-pressed={selected.bold} className="choice h-10 font-bold">B</button>
                </div>
              </div>
            )}
            {selected?.kind === "image" && (
              <label className="block text-sm font-semibold">Image size
                <input type="range" min={0.05} max={1} step={0.01} value={selected.w} onChange={(e) => update({ w: +e.target.value })} className="w-full accent-[#ff4b1f]" />
              </label>
            )}
            {selected && (
              <button onClick={() => { setEls((a) => a.filter((x) => x.id !== sel)); setSel(null); }} className="text-sm text-red-600 inline-flex items-center gap-1">
                <Trash2 className="h-4 w-4" /> Delete selected
              </button>
            )}
            <p className="text-xs text-muted">Drag items on the canvas to position them. Our team reviews every design and sends a proof before printing.</p>
            <button onClick={finish} disabled={saving} className="btn btn-brand w-full">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Use this design"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
