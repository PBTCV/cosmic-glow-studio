import { z } from "zod";
import { getSql } from "@/lib/neon.server";
import { readAdminToken, requireAdminToken } from "@/lib/next-admin";

const Schema = z.object({ id: z.string().uuid() });

export async function POST(req: Request) {
  try {
    requireAdminToken(readAdminToken(req));
    const data = Schema.parse(await req.json());
    const sql = getSql();
    const rows = (await sql`select * from astrologers where id = ${data.id} limit 1`) as Record<
      string,
      unknown
    >[];
    if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });
    const services = (await sql`
      select id, name, description, duration_minutes, price_amount, price_currency, modes,
             display_order, is_active
      from astrologer_services
      where astrologer_id = ${data.id}
      order by display_order asc, created_at asc
    `) as Record<string, unknown>[];
    const availability = (await sql`
      select id, timezone, day_of_week, start_time, end_time
      from astrologer_availability
      where astrologer_id = ${data.id}
      order by day_of_week asc, start_time asc
    `) as Record<string, unknown>[];
    return Response.json({ profile: rows[0], services, availability });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load astrologer";
    return Response.json({ error: message }, { status: 400 });
  }
}
