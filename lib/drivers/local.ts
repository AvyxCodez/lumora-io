import { promises as fs } from "fs";
import path from "path";
import type { FileRecord, StorageDriver } from "@/lib/types";

const ROOT = process.cwd();
const STORAGE_DIR = path.join(ROOT, "storage");
const FILES_DIR = path.join(STORAGE_DIR, "files");
const DB_PATH = path.join(STORAGE_DIR, "db.json");

async function ensureDirs() {
  await fs.mkdir(FILES_DIR, { recursive: true });
}

async function readDb(): Promise<FileRecord[]> {
  try {
    return JSON.parse(await fs.readFile(DB_PATH, "utf8")) as FileRecord[];
  } catch {
    return [];
  }
}

async function writeDb(records: FileRecord[]) {
  await ensureDirs();
  await fs.writeFile(DB_PATH, JSON.stringify(records, null, 2), "utf8");
}

export const localDriver: StorageDriver = {
  async saveFile(record, buffer) {
    await ensureDirs();
    await fs.writeFile(path.join(FILES_DIR, record.name), buffer);
    const db = await readDb();
    db.unshift(record);
    await writeDb(db);
  },

  async getRecord(name) {
    const db = await readDb();
    return db.find((r) => r.id === name || r.name === name);
  },

  async readFileBytes(name) {
    return fs.readFile(path.join(FILES_DIR, name));
  },

  async listFiles() {
    return readDb();
  },

  async deleteFile(name) {
    try {
      await fs.unlink(path.join(FILES_DIR, name));
    } catch {
      /* already gone */
    }
    const db = await readDb();
    const next = db.filter((r) => r.name !== name);
    if (next.length !== db.length) await writeDb(next);
  },

  publicUrl() {
    return null; // served through /f/<name>
  },
};
