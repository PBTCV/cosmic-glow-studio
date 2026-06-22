import { z } from "zod";
import { getSql } from "@/lib/neon.server";
import { readAdminToken, requireAdminToken } from "@/lib/next-admin";

const ListSchema = z.object({
  status: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).default(0),
});

export async function POST(req: Request) {
  try {
    requireAdminToken(readAdminToken(req));
    const input = ListSchema.parse(await req.json());
    const sql = getSql();
    const rows = input.status
      ? await sql`
          select id, full_name, email, phone, dob, birth_time, birth_place, question,
                 status, created_at, updated_at
          from consultations
          where status = ${input.status}
          order by created_at desc
          limit ${input.limit} offset ${input.offset}
        `
      : await sql`
          select id, full_name, email, phone, dob, birth_time, birth_place, question,
                 status, created_at, updated_at
          from consultations
          order by created_at desc
          limit ${input.limit} offset ${input.offset}
        `;
    await sql`
      insert into audit_log (actor, action, note)
      values ('admin', 'viewed', ${"list status=" + (input.status ?? "all")})
    `;
    return Response.json({ rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load consultations";
    return Response.json({ error: message }, { status: 400 });
  }
}
