import { NextRequest, NextResponse } from "next/server";
import { getRecord, readFileBytes, publicUrl } from "@/lib/storage";
import { safeServingType } from "@/lib/upload-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const download = req.nextUrl.searchParams.get("download") !== null;

  // Fast path: if the backend exposes a public CDN URL, redirect immediately
  // without making any outbound request to the storage provider.
  const cdn = publicUrl(name);
  if (cdn) {
    return NextResponse.redirect(cdn, 302);
  }

  const record = await getRecord(name);
  if (!record) {
    return new Response("Not found", { status: 404 });
  }

  let bytes: Buffer;
  try {
    bytes = await readFileBytes(record.name);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  // Neutralise anything a browser might execute (html/svg/js) even though we
  // block those at upload — defense in depth for any pre-existing files.
  const { contentType, forceDownload } = safeServingType(record.type);
  const disposition = download || forceDownload ? "attachment" : "inline";

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(record.size),
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(
        record.originalName
      )}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
