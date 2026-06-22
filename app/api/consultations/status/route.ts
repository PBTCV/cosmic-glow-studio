import { z } from "zod";
import { getSql } from "@/lib/neon.server";
import { readAdminToken, requireAdminToken } from "@/lib/next-admin";

const UpdateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "scheduled", "closed", "spam"]),
  actor: z.string().min(1).max(120).default("admin"),
});

export async function POST(req: Request) {
  try {
    requireAdminToken(readAdminToken(req));
    const data = UpdateStatusSchema.parse(await req.json());
    const sql = getSql();
    const prev = (await sql`
      select status from consultations where id = ${data.id}
    `) as Array<{ status: string }>;
    if (!prev.length) return Response.json({ error: "Not found" }, { status: 404 });
    await sql`update consultations set status = ${data.status} where id = ${data.id}`;
    await sql`
      insert into audit_log (consultation_id, actor, action, from_value, to_value)
      values (${data.id}, ${data.actor}, 'status_changed', ${prev[0].status}, ${data.status})
    `;
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update status";
    return Response.json({ error: message }, { status: 400 });
  }
}
