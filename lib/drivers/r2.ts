import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import type { FileRecord, StorageDriver } from "@/lib/types";

const BUCKET = process.env.R2_BUCKET!;
const PUBLIC_BASE = process.env.R2_PUBLIC_BASE?.replace(/\/$/, "") || null;

let client: S3Client | null = null;
function s3(): S3Client {
  if (client) return client;
  const endpoint =
    process.env.R2_ENDPOINT ||
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  client = new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return client;
}

function recordFromHead(
  name: string,
  meta: Record<string, string> | undefined,
  contentType: string | undefined,
  size: number | undefined,
  lastModified: Date | undefined
): FileRecord {
  const originalName = meta?.originalname
    ? decodeURIComponent(meta.originalname)
    : name;
  const uploadedAt = meta?.uploadedat
    ? Number(meta.uploadedat)
    : lastModified?.getTime() ?? Date.now();
  const expiresAt = meta?.expiresat ? Number(meta.expiresat) : null;
  return {
    id: meta?.id || name.replace(/\.[^.]+$/, ""),
    name,
    originalName,
    ext: path.extname(name).toLowerCase(),
    type: contentType || "application/octet-stream",
    size: size ?? 0,
    uploadedAt,
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
    deleteToken: meta?.deletetoken || "",
  };
}

export const r2Driver: StorageDriver = {
  async saveFile(record, buffer) {
    await s3().send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: record.name,
        Body: buffer,
        ContentType: record.type,
        ContentDisposition: `inline; filename="${encodeURIComponent(
          record.originalName
        )}"`,
        Metadata: {
          id: record.id,
          originalname: encodeURIComponent(record.originalName),
          uploadedat: String(record.uploadedAt),
          deletetoken: record.deleteToken,
          ...(record.expiresAt ? { expiresat: String(record.expiresAt) } : {}),
        },
      })
    );
  },

  async getRecord(name) {
    try {
      const head = await s3().send(
        new HeadObjectCommand({ Bucket: BUCKET, Key: name })
      );
      return recordFromHead(
        name,
        head.Metadata,
        head.ContentType,
        head.ContentLength,
        head.LastModified
      );
    } catch {
      return undefined;
    }
  },

  async readFileBytes(name) {
    const res = await s3().send(
      new GetObjectCommand({ Bucket: BUCKET, Key: name })
    );
    const bytes = await res.Body!.transformToByteArray();
    return Buffer.from(bytes);
  },

  async listFiles() {
    const res = await s3().send(
      new ListObjectsV2Command({ Bucket: BUCKET, MaxKeys: 100 })
    );
    const keys = (res.Contents ?? []).map((o) => o.Key!).filter(Boolean);
    const records = await Promise.all(
      keys.map(async (key) => {
        try {
          const head = await s3().send(
            new HeadObjectCommand({ Bucket: BUCKET, Key: key })
          );
          return recordFromHead(
            key,
            head.Metadata,
            head.ContentType,
            head.ContentLength,
            head.LastModified
          );
        } catch {
          return null;
        }
      })
    );
    return records
      .filter((r): r is FileRecord => r !== null)
      .sort((a, b) => b.uploadedAt - a.uploadedAt);
  },

  async deleteFile(name) {
    try {
      await s3().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: name }));
    } catch {
      /* already gone */
    }
  },

  publicUrl(name) {
    return PUBLIC_BASE ? `${PUBLIC_BASE}/${name}` : null;
  },
};

export async function presignPut(record: FileRecord): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: record.name,
    ContentType: record.type,
    Metadata: {
      id: record.id,
      originalname: encodeURIComponent(record.originalName),
      uploadedat: String(record.uploadedAt),
      deletetoken: record.deleteToken,
      ...(record.expiresAt ? { expiresat: String(record.expiresAt) } : {}),
    },
  });
  return getSignedUrl(s3(), cmd, { expiresIn: 3600 });
}

export async function presignDelete(name: string): Promise<string> {
  const cmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: name });
  return getSignedUrl(s3(), cmd, { expiresIn: 604800 });
}
