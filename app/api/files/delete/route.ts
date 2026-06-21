import { NextRequest, NextResponse } from "next/server";
import { usingR2 } from "@/lib/storage";
import { verifyDeleteToken } from "@/lib/delete-token";
import { presignDelete } from "@/lib/drivers/r2";
import { getRecord, deleteFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { id?: string; token?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { id, token, name } = body;
  if (!id || !token) {
    return NextResponse.json({ error: "Missing id or token." }, { status: 400 });
  }

  if (usingR2) {
    if (!verifyDeleteToken(id, token)) {
      return NextResponse.json({ error: "Invalid delete token." }, { status: 403 });
    }
    const storedName = name || id;
    const deleteUrl = await presignDelete(storedName);
    return NextResponse.json({ ok: true, deleteUrl });
  }

  // Local driver: verify token via record lookup and delete directly.
  const record = await getRecord(id);
  if (!record) {
    return NextResponse.json({ ok: true, alreadyGone: true });
  }
  if (!record.deleteToken || record.deleteToken !== token) {
    return NextResponse.json({ error: "Invalid delete token." }, { status: 403 });
  }
  await deleteFile(record.name);
  return NextResponse.json({ ok: true });
}
