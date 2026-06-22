import { getSql } from "@/lib/neon.server";
import { readAdminToken, requireAdminToken } from "@/lib/next-admin";

export async function POST(req: Request) {
  try {
    requireAdminToken(readAdminToken(req));
    const sql = getSql();
    const rows = (await sql`
      select id, slug, full_name, honorific, title, photo_url, tagline,
             specialties, is_active, is_featured, display_order, updated_at
      from astrologers
      order by display_order asc, created_at desc
    `) as Record<string, unknown>[];
    return Response.json({ rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load astrologers";
    return Response.json({ error: message }, { status: 400 });
  }
}
