import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import path from "path";
import { saveFile, type FileRecord } from "@/lib/storage";
import { validateUpload } from "@/lib/upload-policy";
import { resolveExpiry } from "@/lib/expiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid = customAlphabet(ALPHABET, 6);
const deleteId = customAlphabet(ALPHABET, 24);

function sanitizeExt(name: string): string {
  const ext = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return ext.length > 1 && ext.length <= 8 ? ext : "";
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const entries = form.getAll("file").filter((f): f is File => f instanceof File);

    if (entries.length === 0) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const expiresAt = resolveExpiry(String(form.get("expires") ?? "never"));

    const results = [];
    for (const file of entries) {
      const check = validateUpload({
        name: file.name,
        size: file.size,
        type: file.type,
      });
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: check.status });
      }

      const ext = sanitizeExt(file.name);
      const id = nanoid();
      const storedName = `${id}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const record: FileRecord = {
        id,
        name: storedName,
        originalName: file.name,
        ext,
        type: file.type || "application/octet-stream",
        size: file.size,
        uploadedAt: Date.now(),
        expiresAt,
        deleteToken: deleteId(),
      };

      await saveFile(record, buffer);
      results.push(record);
    }

    if (results.length === 0) {
      return NextResponse.json({ error: "Empty file(s)." }, { status: 400 });
    }

    return NextResponse.json({ files: results });
  } catch (err) {
    console.error("upload error", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
