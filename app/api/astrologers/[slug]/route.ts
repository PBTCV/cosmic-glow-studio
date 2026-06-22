import { getSql } from "@/lib/neon.server";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const sql = getSql();
    const rows = (await sql`
      select * from astrologers where slug = ${slug} and is_active = true limit 1
    `) as Record<string, unknown>[];
    if (!rows.length)
      return Response.json({ profile: null, services: [], availability: [] }, { status: 404 });

    const profile = rows[0];
    const services = (await sql`
      select id, name, description, duration_minutes, price_amount, price_currency, modes, display_order
      from astrologer_services
      where astrologer_id = ${profile.id as string} and is_active = true
      order by display_order asc, created_at asc
    `) as Record<string, unknown>[];
    const availability = (await sql`
      select id, timezone, day_of_week, start_time, end_time
      from astrologer_availability
      where astrologer_id = ${profile.id as string}
      order by day_of_week asc, start_time asc
    `) as Record<string, unknown>[];

    return Response.json({ profile, services, availability });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch astrologer";
    return Response.json({ error: message }, { status: 500 });
  }
}
