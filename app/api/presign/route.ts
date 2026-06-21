import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import path from "path";
import { validateUpload } from "@/lib/upload-policy";
import { resolveExpiry } from "@/lib/expiry";
import { generateDeleteToken } from "@/lib/delete-token";
import { presignPut } from "@/lib/drivers/r2";
import type { FileRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid = customAlphabet(ALPHABET, 6);

function sanitizeExt(name: string): string {
  const ext = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return ext.length > 1 && ext.length <= 8 ? ext : "";
}

export async function POST(req: NextRequest) {
  let body: { name?: string; type?: string; size?: number; expires?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name = "", type = "", size = 0, expires = "never" } = body;

  const check = validateUpload({ name, type, size });
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const ext = sanitizeExt(name);
  const id = nanoid();
  const storedName = `${id}${ext}`;
  const uploadedAt = Date.now();
  const expiresAt = resolveExpiry(expires);
  const deleteToken = generateDeleteToken(id);

  const record: FileRecord = {
    id,
    name: storedName,
    originalName: name,
    ext,
    type: type || "application/octet-stream",
    size,
    uploadedAt,
    expiresAt,
    deleteToken,
  };

  const presignedUrl = await presignPut(record);

  const uploadHeaders: Record<string, string> = {
    "Content-Type": record.type,
    "x-amz-meta-id": record.id,
    "x-amz-meta-originalname": encodeURIComponent(record.originalName),
    "x-amz-meta-uploadedat": String(record.uploadedAt),
    "x-amz-meta-deletetoken": record.deleteToken,
  };
  if (record.expiresAt) {
    uploadHeaders["x-amz-meta-expiresat"] = String(record.expiresAt);
  }

  return NextResponse.json({ presignedUrl, record, uploadHeaders });
}
