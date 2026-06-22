import { getAdminAccess } from "@/lib/admin.server";

export function readAdminToken(req: Request): string | undefined {
  const header = req.headers.get("x-admin-token");
  if (header?.trim()) return header.trim();
  return undefined;
}

export function requireAdminToken(token?: string): void {
  const expected = getAdminAccess();
  if (!token || token.length !== expected.length) throw new Error("Unauthorized");
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) throw new Error("Unauthorized");
}

export async function jsonBody<T>(req: Request): Promise<T> {
  return (await req.json()) as T;
}
