## Admin Panel — `/admin` (token-gated, server-verified)

A password-protected admin page to view and manage consultation inquiries. The password is the existing `ADMIN_API_TOKEN` secret stored server-side — it never appears in source code, the client bundle, or any committed file.

### Security model (why no dev can see the password)

- The password = the `ADMIN_API_TOKEN` secret already in Lovable Cloud secrets.
- Verification happens **server-side only** in a new server function `verifyAdminToken`, which compares the submitted token against `process.env.ADMIN_API_TOKEN` using a timing-safe equality check.
- The client never receives the real token from the server. After a successful verify, the entered token is kept in `sessionStorage` (cleared on tab close) so the admin UI can attach it as the `x-admin-token` header on subsequent server-function calls. If a dev inspects the browser, they see only what *this admin* typed — not anything baked into code.
- Nothing about the password lives in the repo: no `.env`, no constants, no fallback default. If the secret isn't configured, the server throws.
- Rate-limit `verifyAdminToken` (e.g. 5 attempts / 10 min per IP hash) to deter brute force.

### What gets built

**1. `src/lib/admin.functions.ts`** — new
- `verifyAdminToken({ token })` — public server fn. Timing-safe compare against `process.env.ADMIN_API_TOKEN`. Logs failed attempts to `audit_log` (`actor='unknown'`, `action='login_failed'`) and successful ones (`action='login_success'`). Returns `{ ok: true }` or throws.

**2. `src/lib/consultations.functions.ts`** — small tweak
- Accept the admin token via `inputValidator` field too (in addition to the header), so the existing `useServerFn` calls can pass it cleanly from the client. Header still supported for external API users.

**3. `src/routes/admin.tsx`** — new page
- If no token in `sessionStorage` → render a single password input + "Unlock" button. On submit, calls `verifyAdminToken`; on success, stores token in `sessionStorage` and shows the dashboard. On failure, shows generic "Invalid password" (no hints).
- Dashboard:
  - Table of inquiries (name, email, phone, question preview, status, created_at) using existing `listConsultations`.
  - Status filter dropdown (`all / new / contacted / scheduled / closed / spam`).
  - Per-row status dropdown → calls `updateConsultationStatus`.
  - Per-row "Add note" → small dialog → calls `addAuditNote`.
  - "Lock" button clears `sessionStorage` and returns to the password screen.
- Pagination: simple Prev / Next (limit 50).
- `noindex, nofollow` meta + excluded from any sitemap.

**4. No changes to:** Neon SQL, public consult form, design tokens, or existing routes.

### Out of scope

- No "remember me" / persistent login (sessionStorage only, by design).
- No multi-user admin accounts or roles — single shared token. If you later want per-admin logins, that's a Supabase Auth migration, separate plan.
- No CSV export, no email notifications, no astrologer profile table.

### After approval

I'll implement the 3 file changes above. The `ADMIN_API_TOKEN` secret is already configured, so no new secret prompt is needed — you just visit `/admin` and type the token you set earlier.
