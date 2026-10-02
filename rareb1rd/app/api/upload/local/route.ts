import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { MAX_LOCAL_BYTES, extAllowed, safeName } from "@/lib/uploads";

// Local-development fallback used when BLOB_READ_WRITE_TOKEN is not set.
export async function POST(req: Request) {
  if (process.env.VERCEL) {
    return NextResponse.json({ error: "File storage is not configured. Set BLOB_READ_WRITE_TOKEN." }, { status: 500 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!extAllowed(file.name)) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  if (file.size > MAX_LOCAL_BYTES) return NextResponse.json({ error: "File too large" }, { status: 413 });

  const filename = `${Date.now()}_${safeName(file.name)}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${filename}` });
}
