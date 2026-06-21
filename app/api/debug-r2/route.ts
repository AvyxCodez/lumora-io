import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

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

    return NextResponse.json({ ok: true, config, keyCount: result.KeyCount });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      config,
      error: err.message,
      code: err.code,
      httpStatus: err.$metadata?.httpStatusCode,
    });
  }
}
