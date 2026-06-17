import process from "node:process";

export function getAdminAccess(): string {
  const value = process.env.ADMIN_ACCESS?.trim();
  if (!value) throw new Error("ADMIN_ACCESS is not configured");
  return value;
}

export function getAdminAccessSalt(): string {
  return process.env.ADMIN_ACCESS?.trim() || "salt";
}
