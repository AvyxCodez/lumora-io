import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dns from "dns/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const endpoint =
    process.env.R2_ENDPOINT ||
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  const config = {
    endpoint,
    bucket: process.env.R2_BUCKET,
    hasKey: !!process.env.R2_ACCESS_KEY_ID,
    hasSecret: !!process.env.R2_SECRET_ACCESS_KEY,
    keyLength: process.env.R2_ACCESS_KEY_ID?.length,
    secretLength: process.env.R2_SECRET_ACCESS_KEY?.length,
  };

  // Test 0: DNS resolution
  const hostname = new URL(endpoint).hostname;
  let dnsTest: { ok: boolean; addresses?: string[]; error?: string } = { ok: false };
  try {
    const addresses = await dns.resolve4(hostname);
    dnsTest = { ok: true, addresses };
  } catch (e: any) {
    dnsTest = { ok: false, error: e.message };
  }

  // Test 1: raw HTTPS connectivity (no auth, just TLS)
  let fetchTest: { ok: boolean; status?: number; error?: string } = { ok: false };
  try {
    const r = await fetch(endpoint, { method: "GET" });
    fetchTest = { ok: true, status: r.status };
  } catch (e: any) {
    fetchTest = { ok: false, error: e.message };
  }

  // Test 2: S3 SDK list
  let sdkTest: { ok: boolean; keyCount?: number; error?: string; code?: string; httpStatus?: number } = { ok: false };
  try {
    const client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const result = await client.send(
      new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET!, MaxKeys: 1 })
    );
    sdkTest = { ok: true, keyCount: result.KeyCount };
  } catch (err: any) {
    sdkTest = {
      ok: false,
      error: err.message,
      code: err.code,
      httpStatus: err.$metadata?.httpStatusCode,
    };
  }

  return NextResponse.json({ config, dnsTest, fetchTest, sdkTest });
}
