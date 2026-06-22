import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSql } from "@/lib/neon.server";
import { AstrologerProfilePage } from "@/components/pages/astrologer-profile-page";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sql = getSql();
  const rows = (await sql`
    select full_name, honorific, title, tagline, short_bio, photo_url
    from astrologers where slug = ${slug} and is_active = true limit 1
  `) as Array<{
    full_name: string;
    honorific: string | null;
    title: string | null;
    tagline: string | null;
    short_bio: string | null;
    photo_url: string | null;
  }>;
  const p = rows[0];
  if (!p) return { title: "Astrologer not found" };

  const pageTitle = `${p.honorific ? p.honorific + " " : ""}${p.full_name}${p.title ? " — " + p.title : ""}`;
  const desc = (p.tagline || p.short_bio || `Profile of ${p.full_name}`).slice(0, 160);

  return {
    title: pageTitle,
    description: desc,
    openGraph: {
      title: pageTitle,
      description: desc,
      ...(p.photo_url ? { images: [p.photo_url] } : {}),
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sql = getSql();
  const rows = (await sql`
    select * from astrologers where slug = ${slug} and is_active = true limit 1
  `) as Record<string, unknown>[];
  if (!rows.length) notFound();
  const profile = rows[0];

  const services = (await sql`
    select id, name, description, duration_minutes, price_amount, price_currency, modes, display_order
    from astrologer_services
    where astrologer_id = ${profile.id as string} and is_active = true
    order by display_order asc, created_at asc
  `) as unknown[];

  const availability = (await sql`
    select id, timezone, day_of_week, start_time, end_time
    from astrologer_availability
    where astrologer_id = ${profile.id as string}
    order by day_of_week asc, start_time asc
  `) as unknown[];

  return (
    <AstrologerProfilePage
      profile={profile as Parameters<typeof AstrologerProfilePage>[0]["profile"]}
      services={services as Parameters<typeof AstrologerProfilePage>[0]["services"]}
      availability={availability as Parameters<typeof AstrologerProfilePage>[0]["availability"]}
    />
  );
}
