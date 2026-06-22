import { z } from "zod";
import { getSql } from "@/lib/neon.server";
import { readAdminToken, requireAdminToken } from "@/lib/next-admin";

const ServiceSchema = z.object({
  id: z.string().uuid().optional(),
  astrologer_id: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().nullable(),
  duration_minutes: z.number().int().min(0).max(1440).optional().nullable(),
  price_amount: z.number().min(0).max(10_000_000).optional().nullable(),
  price_currency: z.string().trim().min(1).max(8).default("INR"),
  modes: z
    .array(z.enum(["in_person", "video", "phone"]))
    .max(3)
    .default([]),
  display_order: z.number().int().min(0).max(9999).default(0),
  is_active: z.boolean().default(true),
});

function nv<T>(v: T | undefined | null | ""): T | null {
  if (v === undefined || v === null || v === "") return null;
  return v as T;
}

export async function POST(req: Request) {
  try {
    requireAdminToken(readAdminToken(req));
    const d = ServiceSchema.parse(await req.json());
    const sql = getSql();
    if (d.id) {
      await sql`
        update astrologer_services set
          name = ${d.name},
          description = ${nv(d.description)},
          duration_minutes = ${nv(d.duration_minutes)},
          price_amount = ${nv(d.price_amount)},
          price_currency = ${d.price_currency},
          modes = ${d.modes},
          display_order = ${d.display_order},
          is_active = ${d.is_active}
        where id = ${d.id}
      `;
      return Response.json({ ok: true, id: d.id });
    }
    const rows = (await sql`
      insert into astrologer_services
        (astrologer_id, name, description, duration_minutes, price_amount, price_currency, modes, display_order, is_active)
      values
        (${d.astrologer_id}, ${d.name}, ${nv(d.description)}, ${nv(d.duration_minutes)}, ${nv(d.price_amount)},
         ${d.price_currency}, ${d.modes}, ${d.display_order}, ${d.is_active})
      returning id
    `) as Array<{ id: string }>;
    return Response.json({ ok: true, id: rows[0]?.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save service";
    return Response.json({ error: message }, { status: 400 });
  }
}
