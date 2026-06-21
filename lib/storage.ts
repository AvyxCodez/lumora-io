import type { FileRecord, StorageDriver } from "@/lib/types";
import { localDriver } from "@/lib/drivers/local";
import { r2Driver } from "@/lib/drivers/r2";

export type { FileRecord } from "@/lib/types";

/**
 * Use Cloudflare R2 when credentials are configured, otherwise fall back to
 * local-disk storage so development works with zero config.
 */
export const usingR2 = Boolean(
  process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    (process.env.R2_ENDPOINT || process.env.R2_ACCOUNT_ID)
);

const driver: StorageDriver = usingR2 ? r2Driver : localDriver;

const isExpired = (r: FileRecord) => r.expiresAt !== null && Date.now() > r.expiresAt;

export const saveFile = (record: FileRecord, buffer: Buffer) =>
  driver.saveFile(record, buffer);

export const getRecord = async (name: string) => {
  const record = await driver.getRecord(name);
  if (record && isExpired(record)) {
    // lazy cleanup: purge on first access after expiry
    driver.deleteFile(record.name).catch(() => {});
    return undefined;
  }
  return record;
};

export const readFileBytes = (name: string) => driver.readFileBytes(name);

export const listFiles = async () => {
  const all = await driver.listFiles();
  return all.filter((r) => !isExpired(r));
};

export const deleteFile = (name: string) => driver.deleteFile(name);
export const publicUrl = (name: string) => driver.publicUrl(name);
