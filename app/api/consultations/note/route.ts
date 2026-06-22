import { z } from "zod";
import { getSql } from "@/lib/neon.server";
import { readAdminToken, requireAdminToken } from "@/lib/next-admin";

const NoteSchema = z.object({
  id: z.string().uuid(),
  actor: z.string().min(1).max(120).default("admin"),
  note: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  try {
    requireAdminToken(readAdminToken(req));
    const data = NoteSchema.parse(await req.json());
    const sql = getSql();
    await sql`
      insert into audit_log (consultation_id, actor, action, note)
      values (${data.id}, ${data.actor}, 'note_added', ${data.note})
    `;
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save note";
    return Response.json({ error: message }, { status: 400 });
  }
}
