import { getSql } from "@/lib/neon.server";

export async function GET() {
  try {
    const sql = getSql();
    const rows = (await sql`
      select id, slug, full_name, honorific, title, photo_url, tagline,
             languages, specialties, short_bio, years_experience,
             is_featured, display_order
      from astrologers
      where is_active = true
      order by display_order asc, created_at desc
    `) as Record<string, unknown>[];
    return Response.json({ rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch astrologers";
    return Response.json({ error: message }, { status: 500 });
  }
}
