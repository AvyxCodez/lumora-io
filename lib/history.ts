"use client";

import type { FileRecord } from "@/lib/types";

const KEY = "lumora:uploads";
const EVENT = "lumora:uploads-changed";

export type HistoryItem = FileRecord;

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function save(items: HistoryItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function addToHistory(records: HistoryItem[]) {
  const existing = getHistory();
  const seen = new Set(existing.map((r) => r.id));
  const merged = [...records.filter((r) => !seen.has(r.id)), ...existing];
  save(merged);
}

export function removeFromHistory(id: string) {
  save(getHistory().filter((r) => r.id !== id));
}

export function clearHistory() {
  save([]);
}

/**
 * Permanently delete an upload from the server (using its delete token) and
 * drop it from local history. Returns true if the file is gone afterwards.
 */
export async function deleteUpload(item: HistoryItem): Promise<boolean> {
  if (item.deleteToken) {
    try {
      const res = await fetch("/api/files/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, token: item.deleteToken, name: item.name }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      // R2 mode: server returns a presigned DELETE URL for the browser to execute.
      if (data.deleteUrl) {
        await fetch(data.deleteUrl, { method: "DELETE" });
      }
    } catch {
      return false;
    }
  }
  removeFromHistory(item.id);
  return true;
}

/** Subscribe to history changes (within the same tab and across tabs). */
export function onHistoryChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
