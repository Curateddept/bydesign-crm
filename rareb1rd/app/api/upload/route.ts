import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { ALLOWED_TYPES, MAX_BLOB_BYTES, extAllowed } from "@/lib/uploads";

// Issues short-lived tokens so the browser uploads artwork straight to Vercel Blob
// (bypasses the serverless request-size limit, so large print files work).
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("artwork/") || !extAllowed(pathname)) {
          throw new Error("Unsupported file type");
        }
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_BLOB_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
