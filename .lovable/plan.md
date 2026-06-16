# Neon Postgres Integration — Consultation Inquiries + Admin Audit Log

Wire the existing Consult form to a Neon Postgres database, store every submission, and record an admin-action audit log for traceability. No Supabase, no auth UI — public submit, admin reads.

## What you'll do (one-time)
1. Create a free Neon project at neon.tech and copy the pooled connection string (looks like `postgres://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`).
2. Run the SQL below in Neon's SQL Editor to create the tables.
3. Approve this plan — I'll then request `NEON_DATABASE_URL` and `ADMIN_API_TOKEN` via the secrets tool so you can paste them securely.

## SQL to run in Neon

```sql
-- Consultation inquiries submitted from the public form
create table if not exists consultations (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null,
  phone         text,
  dob           date,
  birth_time    time,
  birth_place   text,
  question      text not null,
  source        text default 'website',
  status        text not null default 'new'
                check (status in ('new','contacted','scheduled','closed','spam')),
  ip_hash       text,
  user_agent    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists consultations_status_created_idx
  on consultations (status, created_at desc);
create index if not exists consultations_email_idx on consultations (email);

-- Admin action audit trail (who did what, when, to which inquiry)
create table if not exists audit_log (
  id              bigserial primary key,
  consultation_id uuid references consultations(id) on delete cascade,
  actor           text not null,          -- admin email/name
  action          text not null,          -- viewed | status_changed | note_added | exported | deleted
  from_value      text,
  to_value        text,
  note            text,
  ip_hash         text,
  created_at      timestamptz not null default now()
);
create index if not exists audit_log_consult_idx
  on audit_log (consultation_id, created_at desc);
create index if not exists audit_log_actor_idx
  on audit_log (actor, created_at desc);

-- Auto-update updated_at on consultations
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists consultations_set_updated_at on consultations;
create trigger consultations_set_updated_at
  before update on consultations
  for each row execute function set_updated_at();
```

## What I'll build in the app

**Dependencies:** `@neondatabase/serverless` (HTTP driver — works on Cloudflare Workers), `zod`.

**Server functions (`src/lib/consultations.functions.ts`):**
- `submitConsultation` — public, no auth. Validates with Zod, hashes IP, inserts into `consultations`, writes `audit_log` row (`action='created'`, `actor='public'`). Basic rate-limit by IP hash (1 submit / 30s) to deter abuse.
- `listConsultations` — admin only. Requires `x-admin-token` header matching `ADMIN_API_TOKEN`. Returns paginated rows. Logs `viewed` to `audit_log`.
- `updateConsultationStatus` — admin only. Updates status, logs `status_changed` with `from_value`/`to_value`.
- `addAuditNote` — admin only. Logs `note_added`.

**Server route (`src/routes/api/public/consult.ts`):**
Thin POST wrapper around `submitConsultation` so external tools/forms can post too. Validates body, returns 201 + `{ id }`.

**Frontend:**
- Wire the existing `ConsultForm` on the home page to call `submitConsultation` via `useServerFn`. Show success toast on submit, inline errors on validation failure. No layout/visual changes.
- No admin UI in this step. You'll query via the API token or directly in Neon. (Say the word and I'll add a `/admin` page in a follow-up.)

**Neon client helper (`src/lib/neon.server.ts`):**
Reads `process.env.NEON_DATABASE_URL` inside server boundary, exports a `sql` tagged-template. Server-only filename so it can never leak into the client bundle.

## Secrets I'll request after approval
- `NEON_DATABASE_URL` — pooled Neon connection string
- `ADMIN_API_TOKEN` — random 32+ char string you generate; required header for admin reads

## Out of scope
No admin dashboard UI, no astrologer profile table (you said "Consultation inquiries + Admin action log" only — say the word if you want a `profiles` table too), no email notifications, no design changes.