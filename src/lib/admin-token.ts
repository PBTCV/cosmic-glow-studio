// Client-only helper for the admin session token.
export const ADMIN_TOKEN_KEY = "ev_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}
