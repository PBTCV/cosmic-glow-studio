import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

const SubmitSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  dob: z.string().trim().max(20).optional().or(z.literal("")),
  birth_time: z.string().trim().max(20).optional().or(z.literal("")),
  birth_place: z.string().trim().max(200).optional().or(z.literal("")),
  question: z.string().trim().min(5).max(2000),
});

export type SubmitInput = z.infer<typeof SubmitSchema>;

function nullify<T extends string | undefined>(v: T): string | null {
  if (!v) return null;
  const t = v.trim();
  return t.length ? t : null;
}

function requireAdmin() {
  const token = getRequestHeader("x-admin-token");
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) throw new Error("ADMIN_API_TOKEN not configured");
  if (token !== expected) throw new Error("Unauthorized");
}

export const submitConsultation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmitSchema.parse(input))
  .handler(async ({ data }) => {
    const { getSql, hashIp } = await import("./neon.server");
    const sql = getSql();
    const ua = getRequestHeader("user-agent") ?? null;
    const ip = getRequestIP({ xForwardedFor: true });
    const ip_hash = await hashIp(ip);

    // simple rate-limit: 1 submit per ip_hash per 30s
    if (ip_hash) {
      const recent = (await sql`
        select 1 from consultations
        where ip_hash = ${ip_hash} and created_at > now() - interval '30 seconds'
        limit 1
      `) as Array<unknown>;
      if (recent.length > 0) throw new Error("Please wait a moment before submitting again.");
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
    return { ok: true as const, id };
  });

const ListSchema = z.object({
  status: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).default(0),
});

export const listConsultations = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ListSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    requireAdmin();
    const { getSql } = await import("./neon.server");
    const sql = getSql();
    const rows = data.status
      ? await sql`
          select id, full_name, email, phone, dob, birth_time, birth_place, question,
                 status, created_at, updated_at
          from consultations
          where status = ${data.status}
          order by created_at desc
          limit ${data.limit} offset ${data.offset}
        `
      : await sql`
          select id, full_name, email, phone, dob, birth_time, birth_place, question,
                 status, created_at, updated_at
          from consultations
          order by created_at desc
          limit ${data.limit} offset ${data.offset}
        `;
    await sql`
      insert into audit_log (actor, action, note)
      values ('admin', 'viewed', ${'list status=' + (data.status ?? 'all')})
    `;
    return { rows };
  });

const UpdateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "scheduled", "closed", "spam"]),
  actor: z.string().min(1).max(120).default("admin"),
});

export const updateConsultationStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => UpdateStatusSchema.parse(input))
  .handler(async ({ data }) => {
    requireAdmin();
    const { getSql } = await import("./neon.server");
    const sql = getSql();
    const prev = (await sql`
      select status from consultations where id = ${data.id}
    `) as Array<{ status: string }>;
    if (!prev.length) throw new Error("Not found");
    await sql`update consultations set status = ${data.status} where id = ${data.id}`;
    await sql`
      insert into audit_log (consultation_id, actor, action, from_value, to_value)
      values (${data.id}, ${data.actor}, 'status_changed', ${prev[0].status}, ${data.status})
    `;
    return { ok: true as const };
  });

const NoteSchema = z.object({
  id: z.string().uuid(),
  actor: z.string().min(1).max(120).default("admin"),
  note: z.string().min(1).max(2000),
});

export const addAuditNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => NoteSchema.parse(input))
  .handler(async ({ data }) => {
    requireAdmin();
    const { getSql } = await import("./neon.server");
    const sql = getSql();
    await sql`
      insert into audit_log (consultation_id, actor, action, note)
      values (${data.id}, ${data.actor}, 'note_added', ${data.note})
    `;
    return { ok: true as const };
  });
