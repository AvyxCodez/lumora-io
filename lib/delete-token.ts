import { createHmac, timingSafeEqual } from "crypto";

function secret() {
  return process.env.DELETE_SECRET || process.env.ADMIN_TOKEN || "dev-only-secret";
}

export function generateDeleteToken(id: string): string {
  return createHmac("sha256", secret()).update(id).digest("hex").slice(0, 32);
}

export function verifyDeleteToken(id: string, token: string): boolean {
  const expected = generateDeleteToken(id);
  try {
    return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(token, "utf8"));
  } catch {
    return false;
  }
}
