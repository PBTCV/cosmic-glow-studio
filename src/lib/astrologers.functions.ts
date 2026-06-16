import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

function requireAdmin(inputToken?: string) {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) throw new Error("ADMIN_API_TOKEN not configured");
  const token = inputToken ?? getRequestHeader("x-admin-token");
  if (!token || token.length !== expected.length) throw new Error("Unauthorized");
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) throw new Error("Unauthorized");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const TextArr = z.array(z.string().trim().min(1).max(120)).max(40).default([]);

const ProfileSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(80).optional(),
  full_name: z.string().trim().min(2).max(160),
  honorific: z.string().trim().max(40).optional().nullable(),
  title: z.string().trim().max(160).optional().nullable(),
  photo_url: z.string().trim().max(1000).optional().nullable(),
  languages: TextArr,
  years_experience: z.number().int().min(0).max(120).optional().nullable(),
  specialties: TextArr,
  certifications: TextArr,
  lineage: z.string().trim().max(400).optional().nullable(),
  tagline: z.string().trim().max(240).optional().nullable(),
  short_bio: z.string().trim().max(2000).optional().nullable(),
  long_bio: z.string().trim().max(20000).optional().nullable(),
  quote: z.string().trim().max(800).optional().nullable(),
  philosophy: z.string().trim().max(4000).optional().nullable(),
  email: z.string().trim().max(200).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  whatsapp: z.string().trim().max(40).optional().nullable(),
  website_url: z.string().trim().max(500).optional().nullable(),
  instagram_url: z.string().trim().max(500).optional().nullable(),
  youtube_url: z.string().trim().max(500).optional().nullable(),
  linkedin_url: z.string().trim().max(500).optional().nullable(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().min(0).max(9999).default(0),
});

function nv<T>(v: T | undefined | null | ""): T | null {
  if (v === undefined || v === null || v === "") return null;
  return v as T;
}

// ----- Public reads -----

export const listAstrologersPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("./neon.server");
  const sql = getSql();
  const rows = (await sql`
    select id, slug, full_name, honorific, title, photo_url, tagline,
           languages, specialties, short_bio, years_experience,
           is_featured, display_order
    from astrologers
    where is_active = true
    order by display_order asc, created_at desc
  `) as any[];
  return { rows };
});

export const getAstrologerBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { getSql } = await import("./neon.server");
    const sql = getSql();
    const rows = (await sql`
      select * from astrologers where slug = ${data.slug} and is_active = true limit 1
    `) as any[];
    if (!rows.length) return { profile: null, services: [], availability: [] };
    const profile = rows[0];
    const services = (await sql`
      select id, name, description, duration_minutes, price_amount, price_currency, modes, display_order
      from astrologer_services
      where astrologer_id = ${profile.id as string} and is_active = true
      order by display_order asc, created_at asc
    `) as any[];
    const availability = (await sql`
      select id, timezone, day_of_week, start_time, end_time
      from astrologer_availability
      where astrologer_id = ${profile.id as string}
      order by day_of_week asc, start_time asc
    `) as any[];
    return { profile, services, availability };
  });

// ----- Admin -----

const AdminTokenInput = z.object({ adminToken: z.string().min(1) });

export const listAstrologersAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminTokenInput.parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.adminToken);
    const { getSql } = await import("./neon.server");
    const sql = getSql();
    const rows = (await sql`
      select id, slug, full_name, honorific, title, photo_url, tagline,
             specialties, is_active, is_featured, display_order, updated_at
      from astrologers
      order by display_order asc, created_at desc
    `) as any[];
    return { rows };
  });

export const getAstrologerAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    AdminTokenInput.extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.adminToken);
    const { getSql } = await import("./neon.server");
    const sql = getSql();
    const rows = (await sql`select * from astrologers where id = ${data.id} limit 1`) as Array<
      any
    >;
    if (!rows.length) throw new Error("Not found");
    const services = (await sql`
      select id, name, description, duration_minutes, price_amount, price_currency, modes,
             display_order, is_active
      from astrologer_services
      where astrologer_id = ${data.id}
      order by display_order asc, created_at asc
    `) as any[];
    const availability = (await sql`
      select id, timezone, day_of_week, start_time, end_time
      from astrologer_availability
      where astrologer_id = ${data.id}
      order by day_of_week asc, start_time asc
    `) as any[];
    return { profile: rows[0], services, availability };
  });

export const upsertAstrologer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    AdminTokenInput.extend({ data: ProfileSchema }).parse(input),
  )
  .handler(async ({ data: payload }) => {
    requireAdmin(payload.adminToken);
    const { getSql } = await import("./neon.server");
    const sql = getSql();
    const d = payload.data;

    let slug = d.slug?.trim() || slugify(d.full_name);
    if (!slug) throw new Error("Slug required");

    // ensure unique slug (skip self)
    const conflict = (await sql`
      select id from astrologers where slug = ${slug} ${d.id ? sql`and id <> ${d.id}` : sql``} limit 1
    `) as Array<{ id: string }>;
    if (conflict.length) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    if (d.id) {
      const rows = (await sql`
        update astrologers set
          slug = ${slug},
          full_name = ${d.full_name},
          honorific = ${nv(d.honorific)},
          title = ${nv(d.title)},
          photo_url = ${nv(d.photo_url)},
          languages = ${d.languages},
          years_experience = ${nv(d.years_experience)},
          specialties = ${d.specialties},
          certifications = ${d.certifications},
          lineage = ${nv(d.lineage)},
          tagline = ${nv(d.tagline)},
          short_bio = ${nv(d.short_bio)},
          long_bio = ${nv(d.long_bio)},
          quote = ${nv(d.quote)},
          philosophy = ${nv(d.philosophy)},
          email = ${nv(d.email)},
          phone = ${nv(d.phone)},
          whatsapp = ${nv(d.whatsapp)},
          website_url = ${nv(d.website_url)},
          instagram_url = ${nv(d.instagram_url)},
          youtube_url = ${nv(d.youtube_url)},
          linkedin_url = ${nv(d.linkedin_url)},
          is_active = ${d.is_active},
          is_featured = ${d.is_featured},
          display_order = ${d.display_order}
        where id = ${d.id}
        returning id
      `) as Array<{ id: string }>;
      await sql`insert into audit_log (actor, action, to_value) values ('admin','astrologer_updated',${d.id})`;
      return { ok: true as const, id: rows[0]?.id };
    }

    const rows = (await sql`
      insert into astrologers
        (slug, full_name, honorific, title, photo_url, languages,
         years_experience, specialties, certifications, lineage,
         tagline, short_bio, long_bio, quote, philosophy,
         email, phone, whatsapp, website_url, instagram_url, youtube_url, linkedin_url,
         is_active, is_featured, display_order)
      values
        (${slug}, ${d.full_name}, ${nv(d.honorific)}, ${nv(d.title)}, ${nv(d.photo_url)}, ${d.languages},
         ${nv(d.years_experience)}, ${d.specialties}, ${d.certifications}, ${nv(d.lineage)},
         ${nv(d.tagline)}, ${nv(d.short_bio)}, ${nv(d.long_bio)}, ${nv(d.quote)}, ${nv(d.philosophy)},
         ${nv(d.email)}, ${nv(d.phone)}, ${nv(d.whatsapp)}, ${nv(d.website_url)},
         ${nv(d.instagram_url)}, ${nv(d.youtube_url)}, ${nv(d.linkedin_url)},
         ${d.is_active}, ${d.is_featured}, ${d.display_order})
      returning id
    `) as Array<{ id: string }>;
    const id = rows[0]?.id;
    await sql`insert into audit_log (actor, action, to_value) values ('admin','astrologer_created',${id})`;
    return { ok: true as const, id };
  });

export const deleteAstrologer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    AdminTokenInput.extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.adminToken);
    const { getSql } = await import("./neon.server");
    const sql = getSql();
    await sql`delete from astrologers where id = ${data.id}`;
    await sql`insert into audit_log (actor, action, to_value) values ('admin','astrologer_deleted',${data.id})`;
    return { ok: true as const };
  });

const ServiceSchema = z.object({
  id: z.string().uuid().optional(),
  astrologer_id: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().nullable(),
  duration_minutes: z.number().int().min(0).max(1440).optional().nullable(),
  price_amount: z.number().min(0).max(10_000_000).optional().nullable(),
  price_currency: z.string().trim().min(1).max(8).default("INR"),
  modes: z.array(z.enum(["in_person", "video", "phone"])).max(3).default([]),
  display_order: z.number().int().min(0).max(9999).default(0),
  is_active: z.boolean().default(true),
});

export const upsertService = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    AdminTokenInput.extend({ data: ServiceSchema }).parse(input),
  )
  .handler(async ({ data: payload }) => {
    requireAdmin(payload.adminToken);
    const { getSql } = await import("./neon.server");
    const sql = getSql();
    const d = payload.data;
    if (d.id) {
      await sql`
        update astrologer_services set
          name = ${d.name},
          description = ${nv(d.description)},
          duration_minutes = ${nv(d.duration_minutes)},
          price_amount = ${nv(d.price_amount)},
          price_currency = ${d.price_currency},
          modes = ${d.modes},
          display_order = ${d.display_order},
          is_active = ${d.is_active}
        where id = ${d.id}
      `;
      return { ok: true as const, id: d.id };
    }
    const rows = (await sql`
      insert into astrologer_services
        (astrologer_id, name, description, duration_minutes, price_amount, price_currency,
         modes, display_order, is_active)
      values
        (${d.astrologer_id}, ${d.name}, ${nv(d.description)}, ${nv(d.duration_minutes)},
         ${nv(d.price_amount)}, ${d.price_currency}, ${d.modes}, ${d.display_order}, ${d.is_active})
      returning id
    `) as Array<{ id: string }>;
    return { ok: true as const, id: rows[0]?.id };
  });

export const deleteService = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    AdminTokenInput.extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.adminToken);
    const { getSql } = await import("./neon.server");
    const sql = getSql();
    await sql`delete from astrologer_services where id = ${data.id}`;
    return { ok: true as const };
  });

const AvailSchema = z.object({
  id: z.string().uuid().optional(),
  astrologer_id: z.string().uuid(),
  timezone: z.string().trim().min(1).max(80).default("Asia/Kolkata"),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
});

export const upsertAvailability = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    AdminTokenInput.extend({ data: AvailSchema }).parse(input),
  )
  .handler(async ({ data: payload }) => {
    requireAdmin(payload.adminToken);
    const { getSql } = await import("./neon.server");
    const sql = getSql();
    const d = payload.data;
    if (d.id) {
      await sql`
        update astrologer_availability set
          timezone = ${d.timezone},
          day_of_week = ${d.day_of_week},
          start_time = ${d.start_time}::time,
          end_time = ${d.end_time}::time
        where id = ${d.id}
      `;
      return { ok: true as const, id: d.id };
    }
    const rows = (await sql`
      insert into astrologer_availability (astrologer_id, timezone, day_of_week, start_time, end_time)
      values (${d.astrologer_id}, ${d.timezone}, ${d.day_of_week}, ${d.start_time}::time, ${d.end_time}::time)
      returning id
    `) as Array<{ id: string }>;
    return { ok: true as const, id: rows[0]?.id };
  });

export const deleteAvailability = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    AdminTokenInput.extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.adminToken);
    const { getSql } = await import("./neon.server");
    const sql = getSql();
    await sql`delete from astrologer_availability where id = ${data.id}`;
    return { ok: true as const };
  });
