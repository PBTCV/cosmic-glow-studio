import { z } from "zod";
import { getSql } from "@/lib/neon.server";
import { readAdminToken, requireAdminToken } from "@/lib/next-admin";

const AvailSchema = z.object({
  id: z.string().uuid().optional(),
  astrologer_id: z.string().uuid(),
  timezone: z.string().trim().min(1).max(80).default("Asia/Kolkata"),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
});

export async function POST(req: Request) {
  try {
    requireAdminToken(readAdminToken(req));
    const d = AvailSchema.parse(await req.json());
    const sql = getSql();
    if (d.id) {
      await sql`
        update astrologer_availability set
          timezone = ${d.timezone},
          day_of_week = ${d.day_of_week},
          start_time = ${d.start_time}::time,
          end_time = ${d.end_time}::time
        where id = ${d.id}
      `;
      return Response.json({ ok: true, id: d.id });
    }
    const rows = (await sql`
      insert into astrologer_availability (astrologer_id, timezone, day_of_week, start_time, end_time)
      values (${d.astrologer_id}, ${d.timezone}, ${d.day_of_week}, ${d.start_time}::time, ${d.end_time}::time)
      returning id
    `) as Array<{ id: string }>;
    return Response.json({ ok: true, id: rows[0]?.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save availability";
    return Response.json({ error: message }, { status: 400 });
  }
}
