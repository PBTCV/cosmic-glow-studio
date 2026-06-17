import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { getAdminAccess } from "./admin.server";

const VerifySchema = z.object({
  token: z.string().min(1).max(512),
});

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const verifyAdminToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => VerifySchema.parse(input))
  .handler(async ({ data }) => {
    const expected = getAdminAccess();

    const { getSql, hashIp } = await import("./neon.server");
    const sql = getSql();
    const ip = getRequestIP({ xForwardedFor: true });
    const ip_hash = await hashIp(ip);

    // Rate limit: 5 failed attempts per 10 min per ip_hash
    if (ip_hash) {
      const recent = (await sql`
        select count(*)::int as n from audit_log
        where action = 'login_failed' and ip_hash = ${ip_hash}
          and created_at > now() - interval '10 minutes'
      `) as Array<{ n: number }>;
      if ((recent[0]?.n ?? 0) >= 5) {
        throw new Error("Too many attempts. Try again later.");
      }
    }

    const ok = timingSafeEqual(data.token, expected);
    await sql`
      insert into audit_log (actor, action, ip_hash)
      values ('unknown', ${ok ? "login_success" : "login_failed"}, ${ip_hash})
    `;
    if (!ok) throw new Error("Invalid password");
    return { ok: true as const };
  });
