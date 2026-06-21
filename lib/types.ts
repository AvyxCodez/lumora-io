export type FileRecord = {
  id: string; // public id, e.g. "a1B2c3"
  name: string; // stored key/filename "a1B2c3.png"
  originalName: string;
  ext: string;
  type: string; // mime
  size: number; // bytes
  uploadedAt: number; // epoch ms
  expiresAt: number | null; // epoch ms, or null = permanent
  deleteToken: string; // secret token required to delete the file
};

export interface StorageDriver {
  /** Persist the bytes + metadata for a record. */
  saveFile(record: FileRecord, buffer: Buffer): Promise<void>;
  /** Look up a record by its stored name (id+ext) or bare id. */
  getRecord(name: string): Promise<FileRecord | undefined>;
  /** Read raw bytes for a stored name. */
  readFileBytes(name: string): Promise<Buffer>;
  /** Most recent uploads first. */
  listFiles(): Promise<FileRecord[]>;
  /** Remove a stored file (used for expiry / cleanup). */
  deleteFile(name: string): Promise<void>;
  /** Public CDN URL if the backend exposes one directly, else null. */
  publicUrl(name: string): string | null;
}
