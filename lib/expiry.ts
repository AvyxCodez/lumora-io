export type ExpiryKey = "never" | "1h" | "12h" | "24h" | "72h";

export const EXPIRY_PRESETS: Record<
  ExpiryKey,
  { label: string; short: string; ms: number | null }
> = {
  never: { label: "Keep forever", short: "∞", ms: null },
  "1h": { label: "1 hour", short: "1h", ms: 60 * 60 * 1000 },
  "12h": { label: "12 hours", short: "12h", ms: 12 * 60 * 60 * 1000 },
  "24h": { label: "1 day", short: "24h", ms: 24 * 60 * 60 * 1000 },
  "72h": { label: "3 days", short: "72h", ms: 72 * 60 * 60 * 1000 },
};

export function isExpiryKey(v: string): v is ExpiryKey {
  return v in EXPIRY_PRESETS;
}

/** Resolve a preset key to an absolute expiry timestamp (ms) or null. */
export function resolveExpiry(key: string): number | null {
  if (!isExpiryKey(key)) return null;
  const ms = EXPIRY_PRESETS[key].ms;
  return ms === null ? null : Date.now() + ms;
}

/** Human countdown like "expires in 3h" / "expires in 2d". */
export function expiresInLabel(expiresAt: number | null): string | null {
  if (!expiresAt) return null;
  const s = Math.floor((expiresAt - Date.now()) / 1000);
  if (s <= 0) return "expired";
  if (s < 3600) return `expires in ${Math.max(1, Math.floor(s / 60))}m`;
  if (s < 86400) return `expires in ${Math.floor(s / 3600)}h`;
  return `expires in ${Math.floor(s / 86400)}d`;
}
