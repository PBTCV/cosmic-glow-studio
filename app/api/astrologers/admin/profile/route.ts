import { z } from "zod";
import { getSql } from "@/lib/neon.server";
import { readAdminToken, requireAdminToken } from "@/lib/next-admin";

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

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(req: Request) {
  try {
    requireAdminToken(readAdminToken(req));
    const d = ProfileSchema.parse(await req.json());
    const sql = getSql();
    let slug = d.slug?.trim() || slugify(d.full_name);
    if (!slug) return Response.json({ error: "Slug required" }, { status: 400 });

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
      return Response.json({ ok: true, id: rows[0]?.id });
    }

    const rows = (await sql`
      insert into astrologers
        (slug, full_name, honorific, title, photo_url, languages, years_experience, specialties, certifications, lineage,
         tagline, short_bio, long_bio, quote, philosophy, email, phone, whatsapp, website_url, instagram_url, youtube_url,
         linkedin_url, is_active, is_featured, display_order)
      values
        (${slug}, ${d.full_name}, ${nv(d.honorific)}, ${nv(d.title)}, ${nv(d.photo_url)}, ${d.languages},
         ${nv(d.years_experience)}, ${d.specialties}, ${d.certifications}, ${nv(d.lineage)}, ${nv(d.tagline)},
         ${nv(d.short_bio)}, ${nv(d.long_bio)}, ${nv(d.quote)}, ${nv(d.philosophy)}, ${nv(d.email)}, ${nv(d.phone)},
         ${nv(d.whatsapp)}, ${nv(d.website_url)}, ${nv(d.instagram_url)}, ${nv(d.youtube_url)}, ${nv(d.linkedin_url)},
         ${d.is_active}, ${d.is_featured}, ${d.display_order})
      returning id
    `) as Array<{ id: string }>;
    const id = rows[0]?.id;
    await sql`insert into audit_log (actor, action, to_value) values ('admin','astrologer_created',${id})`;
    return Response.json({ ok: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save profile";
    return Response.json({ error: message }, { status: 400 });
  }
}
