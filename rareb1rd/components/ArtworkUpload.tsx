"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { CheckCircle2, FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import type { Artwork } from "@/lib/cart";
import { ACCEPT, extAllowed, safeName } from "@/lib/uploads";

type Pending = { key: string; name: string; progress: number; error?: string };

export async function uploadArtwork(file: File, blobEnabled: boolean, onProgress?: (pct: number) => void): Promise<Artwork> {
  if (blobEnabled) {
    const res = await upload(`artwork/${safeName(file.name)}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      multipart: file.size > 20 * 1024 * 1024,
      onUploadProgress: (e) => onProgress?.(e.percentage),
    });
    return { url: res.url, name: file.name, size: file.size, type: file.type };
  }
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload/local", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  onProgress?.(100);
  return { url: data.url, name: file.name, size: file.size, type: file.type };
}

const fmtSize = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`);

export default function ArtworkUpload({
  files, onChange, blobEnabled,
}: { files: Artwork[]; onChange: (f: Artwork[]) => void; blobEnabled: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [drag, setDrag] = useState(false);

  async function handle(list: FileList | null) {
    if (!list) return;
    const added: Artwork[] = [];
    await Promise.all(
      Array.from(list).map(async (file) => {
        const key = crypto.randomUUID();
        if (!extAllowed(file.name)) {
          setPending((p) => [...p, { key, name: file.name, progress: 0, error: "Unsupported file type" }]);
          return;
        }
        setPending((p) => [...p, { key, name: file.name, progress: 0 }]);
        try {
          const art = await uploadArtwork(file, blobEnabled, (pct) =>
            setPending((p) => p.map((x) => (x.key === key ? { ...x, progress: pct } : x))),
          );
          added.push(art);
          setPending((p) => p.filter((x) => x.key !== key));
        } catch (e) {
          setPending((p) => p.map((x) => (x.key === key ? { ...x, error: (e as Error).message } : x)));
        }
      }),
    );
    if (added.length) onChange([...files, ...added]);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
        className={`w-full rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${drag ? "border-brand bg-brand-soft" : "border-line hover:border-ink-2 bg-cloud"}`}
      >
        <UploadCloud className="mx-auto h-8 w-8 text-brand" />
        <div className="mt-2 font-semibold">Drag &amp; drop your artwork, or click to browse</div>
        <div className="mt-1 text-xs text-muted">PDF, AI, EPS, PSD, SVG, PNG, JPG, TIFF or ZIP · multiple files OK</div>
      </button>
      <input ref={input} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => { handle(e.target.files); e.target.value = ""; }} />

      {(files.length > 0 || pending.length > 0) && (
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <li key={f.url} className="flex items-center gap-3 rounded-lg border border-line p-2">
              {f.type.startsWith("image/") && !f.type.includes("tiff") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt="" className="h-12 w-12 rounded object-cover bg-cloud" />
              ) : (
                <span className="h-12 w-12 rounded bg-cloud grid place-items-center"><FileText className="h-5 w-5 text-muted" /></span>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{f.name}</div>
                <div className="text-xs text-muted flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Uploaded · {fmtSize(f.size)}</div>
              </div>
              <button type="button" onClick={() => onChange(files.filter((x) => x.url !== f.url))} className="p-2 text-muted hover:text-ink" aria-label={`Remove ${f.name}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {pending.map((p) => (
            <li key={p.key} className="flex items-center gap-3 rounded-lg border border-line p-2">
              <span className="h-12 w-12 rounded bg-cloud grid place-items-center">
                {p.error ? <FileText className="h-5 w-5 text-red-500" /> : <Loader2 className="h-5 w-5 animate-spin text-muted" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{p.name}</div>
                {p.error ? (
                  <div className="text-xs text-red-600">{p.error}</div>
                ) : (
                  <div className="mt-1 h-1.5 rounded bg-cloud overflow-hidden"><div className="h-full bg-brand transition-all" style={{ width: `${p.progress}%` }} /></div>
                )}
              </div>
              {p.error && (
                <button type="button" onClick={() => setPending((x) => x.filter((y) => y.key !== p.key))} className="p-2 text-muted hover:text-ink" aria-label="Dismiss">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
