import { NextRequest, NextResponse } from "next/server";
import { getRecord, deleteFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { id?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { id, token } = body;
  if (!id || !token) {
    return NextResponse.json({ error: "Missing id or token." }, { status: 400 });
  }

  const record = await getRecord(id);
  // Already gone (or expired) — nothing to do, treat as success (idempotent).
  if (!record) {
    return NextResponse.json({ ok: true, alreadyGone: true });
  }

  if (!record.deleteToken || record.deleteToken !== token) {
    return NextResponse.json({ error: "Invalid delete token." }, { status: 403 });
  }

  await deleteFile(record.name);
  return NextResponse.json({ ok: true });
}
