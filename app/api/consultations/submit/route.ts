import { z } from "zod";
import { getSql, hashIp } from "@/lib/neon.server";
import { getClientIp } from "@/lib/next-request";

const SubmitSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  dob: z.string().trim().max(20).optional().or(z.literal("")),
  birth_time: z.string().trim().max(20).optional().or(z.literal("")),
  birth_place: z.string().trim().max(200).optional().or(z.literal("")),
  question: z.string().trim().min(5).max(2000),
});

function nullify(v?: string): string | null {
  if (!v) return null;
  const t = v.trim();
  return t.length ? t : null;
}

export async function POST(req: Request) {
  try {
    const data = SubmitSchema.parse(await req.json());
    const sql = getSql();
    const ua = req.headers.get("user-agent");
    const ip_hash = await hashIp(getClientIp(req));

    if (ip_hash) {
      const recent = (await sql`
        select 1 from consultations
        where ip_hash = ${ip_hash} and created_at > now() - interval '30 seconds'
        limit 1
      `) as Array<unknown>;
      if (recent.length > 0) {
        return Response.json(
          { error: "Please wait a moment before submitting again." },
          { status: 429 },
        );
      }
    }

    const rows = (await sql`
      insert into consultations
        (full_name, email, phone, dob, birth_time, birth_place, question, ip_hash, user_agent)
      values
        (${data.full_name}, ${data.email}, ${nullify(data.phone)},
         ${nullify(data.dob)}::date, ${nullify(data.birth_time)}::time,
         ${nullify(data.birth_place)}, ${data.question}, ${ip_hash}, ${ua})
      returning id
    `) as Array<{ id: string }>;

    const id = rows[0]?.id;
    if (id) {
      await sql`
        insert into audit_log (consultation_id, actor, action, to_value, ip_hash)
        values (${id}, 'public', 'created', 'new', ${ip_hash})
      `;
    }
    return Response.json({ ok: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit consultation";
    return Response.json({ error: message }, { status: 400 });
  }
}
