export const ACCEPT = ".pdf,.ai,.eps,.psd,.svg,.png,.jpg,.jpeg,.tif,.tiff,.zip";
export const ALLOWED_TYPES = [
  "application/pdf",
  "application/postscript",
  "application/illustrator",
  "application/eps",
  "application/x-eps",
  "image/*",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
];
export const MAX_BLOB_BYTES = 500 * 1024 * 1024; // 500 MB via Vercel Blob client uploads
export const MAX_LOCAL_BYTES = 50 * 1024 * 1024; // 50 MB for the local dev fallback

export function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g, "") : "";
  const base = (dot > 0 ? name.slice(0, dot) : name).replace(/[^a-z0-9]+/gi, "_").slice(0, 60) || "file";
  return `${base}${ext}`;
}

export function extAllowed(name: string) {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  return ACCEPT.split(",").includes(ext);
}
