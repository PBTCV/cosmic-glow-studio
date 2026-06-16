## Astrologer Profiles — schema, admin CRUD, public pages

Multiple astrologers, each with a dedicated public page, listed together on a Council section, and managed from the existing `/admin` panel.

### Neon SQL (run in Neon SQL Editor)

```sql
create table if not exists astrologers (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,           -- e.g. 'pradeep-ji'
  -- Identity
  full_name       text not null,
  honorific       text,                           -- "Acharya", "Pandit", "Sri"
  title           text,                           -- "Founder & Chief Astrologer"
  photo_url       text,
  languages       text[] default '{}',            -- ['English','Hindi','Sanskrit']
  -- Credentials
  years_experience int,
  specialties     text[] default '{}',            -- ['Vedic','Vastu','Numerology']
  certifications  text[] default '{}',
  lineage         text,                           -- guru / parampara
  -- Bio & philosophy
  tagline         text,                           -- short one-liner
  short_bio       text,                           -- 1-2 paragraphs (listing/about)
  long_bio        text,                           -- full page content
  quote           text,
  philosophy      text,
  -- Contact & social
  email           text,
  phone           text,
  whatsapp        text,
  website_url     text,
  instagram_url   text,
  youtube_url     text,
  linkedin_url    text,
  -- Display
  is_active       boolean not null default true,
  is_featured     boolean not null default false,
  display_order   int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists astrologers_active_order_idx
  on astrologers (is_active, display_order, created_at desc);

drop trigger if exists astrologers_set_updated_at on astrologers;
create trigger astrologers_set_updated_at
  before update on astrologers
  for each row execute function set_updated_at();

-- Services offered by each astrologer
create table if not exists astrologer_services (
  id                uuid primary key default gen_random_uuid(),
  astrologer_id    uuid not null references astrologers(id) on delete cascade,
  name              text not null,                -- "Career Reading"
  description       text,
  duration_minutes  int,
  price_amount      numeric(10,2),
  price_currency    text default 'INR',
  modes             text[] default '{}',          -- ['in_person','video','phone']
  display_order     int not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);
create index if not exists astrologer_services_astrologer_idx
  on astrologer_services (astrologer_id, display_order);

-- Weekly availability windows (simple, timezone-aware)
create table if not exists astrologer_availability (
  id              uuid primary key default gen_random_uuid(),
  astrologer_id  uuid not null references astrologers(id) on delete cascade,
  timezone        text not null default 'Asia/Kolkata',
  day_of_week     int not null check (day_of_week between 0 and 6), -- 0=Sun
  start_time      time not null,
  end_time        time not null,
  created_at      timestamptz not null default now()
);
create index if not exists astrologer_availability_astrologer_idx
  on astrologer_availability (astrologer_id, day_of_week);
```

### Server functions — `src/lib/astrologers.functions.ts`

Public (no auth):
- `listAstrologersPublic()` — active only, ordered by `display_order`, returns identity/bio/specialties for listing.
- `getAstrologerBySlug({ slug })` — full profile + services + availability for the dedicated page.

Admin (token-gated, same `adminToken` pattern as consultations):
- `listAstrologersAdmin({ adminToken })` — all rows incl. inactive.
- `getAstrologerAdmin({ adminToken, id })` — full row + services + availability.
- `upsertAstrologer({ adminToken, data })` — create or update. Auto-generates `slug` from `full_name` when missing; ensures uniqueness.
- `deleteAstrologer({ adminToken, id })` — hard delete (cascades services/availability).
- `upsertService({ adminToken, ... })` / `deleteService(...)`.
- `upsertAvailability({ adminToken, ... })` / `deleteAvailability(...)`.

All admin writes append an `audit_log` row (`actor='admin'`, `action='astrologer_*'`, `to_value`=id).

### Admin UI additions

**`/admin/astrologers`** — list page
- Table: photo, name, title, specialties, featured, active, order, edit/delete.
- "+ New astrologer" button → `/admin/astrologers/new`.

**`/admin/astrologers/$id`** — editor (also handles `new`)
- Tabs: **Profile** (identity/credentials/bio/social), **Services**, **Availability**.
- Photo: paste URL for v1 (no file upload — keeps scope tight; image upload is a separate plan if you want it).
- Save buttons per tab; each calls the corresponding upsert fn.

Add a sidebar link in the existing admin dashboard: "Consultations" / "Astrologers".

### Public pages

- **Council section on `/`** — query `listAstrologersPublic`, render cards (photo, name, title, tagline, specialties chips) with a "View profile" link to `/astrologer/$slug`. Replaces the current static Council content.
- **`/astrologer/$slug`** — dedicated profile page. Loader uses TanStack Query + `getAstrologerBySlug`. Sections: hero (photo, name, honorific, title, tagline, languages), credentials (years, specialties, certifications, lineage), long bio + philosophy + quote, services (cards with price/duration/modes), availability (weekly grid), contact & social links, CTA back to Consult form. Per-route `head()` with title/description/og:title/og:description derived from the profile and `og:image` = `photo_url`. Returns `notFound()` when slug is missing.

### Files

- New: `src/lib/astrologers.functions.ts`, `src/routes/admin.astrologers.tsx`, `src/routes/admin.astrologers.$id.tsx`, `src/routes/astrologer.$slug.tsx`.
- Edited: `src/routes/admin.tsx` (add nav tabs to Consultations / Astrologers), `src/routes/index.tsx` (Council section now data-driven).
- Neon: run the SQL above before testing.

### Out of scope (call out if you want it next)

- Image upload (currently URL only).
- Booking/scheduling against availability slots.
- Rich-text editor for `long_bio` (plain textarea + line breaks for now).
- Reviews/testimonials per astrologer.
- Per-astrologer assignment on consultation rows.
