import { z } from "zod";
import { getAdminAccess } from "@/lib/admin.server";
import { getSql, hashIp } from "@/lib/neon.server";
import { getClientIp } from "@/lib/next-request";

const VerifySchema = z.object({
  token: z.string().min(1).max(512),
});

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: Request) {
  try {
    const body = VerifySchema.parse(await req.json());
    const expected = getAdminAccess();
    const sql = getSql();
    const ip_hash = await hashIp(getClientIp(req));

    if (ip_hash) {
      const recent = (await sql`
        select count(*)::int as n from audit_log
        where action = 'login_failed' and ip_hash = ${ip_hash}
          and created_at > now() - interval '10 minutes'
      `) as Array<{ n: number }>;
      if ((recent[0]?.n ?? 0) >= 5) {
        return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });
      }
    }

    const ok = timingSafeEqual(body.token, expected);
    await sql`
      insert into audit_log (actor, action, ip_hash)
      values ('unknown', ${ok ? "login_success" : "login_failed"}, ${ip_hash})
    `;
    if (!ok) return Response.json({ error: "Invalid password" }, { status: 401 });

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify token";
    return Response.json({ error: message }, { status: 400 });
  }
}
