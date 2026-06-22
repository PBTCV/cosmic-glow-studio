import { z } from "zod";
import { getSql } from "@/lib/neon.server";
import { readAdminToken, requireAdminToken } from "@/lib/next-admin";

const Schema = z.object({ id: z.string().uuid() });

export async function POST(req: Request) {
  try {
    requireAdminToken(readAdminToken(req));
    const data = Schema.parse(await req.json());
    const sql = getSql();
    await sql`delete from astrologer_services where id = ${data.id}`;
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete service";
    return Response.json({ error: message }, { status: 400 });
  }
}
