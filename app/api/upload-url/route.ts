import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import path from "path";
import { validateUpload, MAX_FILE_SIZE } from "@/lib/upload-policy";
import { resolveExpiry } from "@/lib/expiry";
import { generateDeleteToken } from "@/lib/delete-token";
import type { FileRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WORKER_URL = process.env.R2_WORKER_URL?.replace(/\/$/, "");
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid = customAlphabet(ALPHABET, 6);

function sanitizeExt(name: string): string {
  const ext = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return ext.length > 1 && ext.length <= 8 ? ext : "";
}

function filenameFromUrl(rawUrl: string): string {
  try {
    const base = path.basename(new URL(rawUrl).pathname);
    return base && base !== "/" ? base : "file";
  } catch {
    return "file";
  }
}

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg", "image/png": ".png", "image/gif": ".gif",
    "image/webp": ".webp", "image/avif": ".avif",
    "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov",
    "audio/mpeg": ".mp3", "audio/ogg": ".ogg", "audio/wav": ".wav",
    "application/pdf": ".pdf",
  };
  return map[mime] || "";
}

export async function POST(req: NextRequest) {
  let body: { url?: string; expires?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { url = "", expires = "never" } = body;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Only http/https URLs are allowed." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Lumora/1.0" },
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return NextResponse.json({ error: "Could not reach that URL." }, { status: 400 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: `URL returned ${res.status}.` }, { status: 400 });
  }

  const rawType = res.headers.get("content-type") || "application/octet-stream";
  const contentType = rawType.split(";")[0].trim();
  const contentLength = Number(res.headers.get("content-length") || 0);

  if (contentLength > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds the size limit." }, { status: 413 });
  }

  const buffer = await res.arrayBuffer();
  if (buffer.byteLength > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds the size limit." }, { status: 413 });
  }

  const originalName = filenameFromUrl(url);
  const ext = sanitizeExt(originalName) || extFromMime(contentType);

  const check = validateUpload({ name: originalName, type: contentType, size: buffer.byteLength });
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  if (!WORKER_URL) {
    return NextResponse.json({ error: "R2_WORKER_URL not configured." }, { status: 500 });
  }

  const id = nanoid();
  const storedName = `${id}${ext}`;
  const uploadedAt = Date.now();
  const expiresAt = resolveExpiry(expires);
  const deleteToken = generateDeleteToken(id);

  const workerRes = await fetch(`${WORKER_URL}/${storedName}`, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-amz-meta-id": id,
      "x-amz-meta-originalname": encodeURIComponent(originalName),
      "x-amz-meta-uploadedat": String(uploadedAt),
      "x-amz-meta-deletetoken": deleteToken,
      ...(expiresAt ? { "x-amz-meta-expiresat": String(expiresAt) } : {}),
    },
    body: buffer,
  });

  if (!workerRes.ok) {
    return NextResponse.json({ error: "Upload to storage failed." }, { status: 502 });
  }

  const record: FileRecord = {
    id,
    name: storedName,
    originalName,
    ext,
    type: contentType,
    size: buffer.byteLength,
    uploadedAt,
    expiresAt,
    deleteToken,
  };

  return NextResponse.json({ file: record });
}
