import { z } from "zod";
import { getSql } from "@/lib/neon.server";
import { readAdminToken, requireAdminToken } from "@/lib/next-admin";

const Schema = z.object({ id: z.string().uuid() });

export async function POST(req: Request) {
  try {
    requireAdminToken(readAdminToken(req));
    const data = Schema.parse(await req.json());
    const sql = getSql();
    await sql`delete from astrologers where id = ${data.id}`;
    await sql`insert into audit_log (actor, action, to_value) values ('admin','astrologer_deleted',${data.id})`;
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete astrologer";
    return Response.json({ error: message }, { status: 400 });
  }
}
