import { NextRequest, NextResponse } from "next/server";
import { listFiles } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only listing of every file on the instance.
 *
 * This is intentionally NOT public — the user-facing "Your uploads" gallery is
 * tracked per-browser (see lib/history.ts), so files are only discoverable via
 * their unguessable link. Set ADMIN_TOKEN to enable this endpoint and call it
 * with `Authorization: Bearer <token>` (or `?token=<token>`).
 */
export async function GET(req: NextRequest) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "Admin listing is disabled." },
      { status: 403 }
    );
  }

  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    req.nextUrl.searchParams.get("token");

  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const files = await listFiles();
  return NextResponse.json({ files });
}
