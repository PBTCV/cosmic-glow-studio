import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSql } from "@/lib/neon.server";
import { AstrologerProfilePage } from "@/components/pages/astrologer-profile-page";
import { JsonLd } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, personJsonLd } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sql = getSql();
  const rows = (await sql`
    select full_name, honorific, title, tagline, short_bio, photo_url, specialties
    from astrologers where slug = ${slug} and is_active = true limit 1
  `) as Array<{
    full_name: string;
    honorific: string | null;
    title: string | null;
    tagline: string | null;
    short_bio: string | null;
    photo_url: string | null;
    specialties: string[];
  }>;
  const p = rows[0];
  if (!p) return { title: "Astrologer not found" };

  const pageTitle = `${p.honorific ? p.honorific + " " : ""}${p.full_name}${p.title ? " — " + p.title : ""}`;
  const desc = (p.tagline || p.short_bio || `Vedic astrologer profile of ${p.full_name}.`).slice(
    0,
    160,
  );

  return createMetadata({
    title: pageTitle,
    description: desc,
    path: `/astrologer/${slug}`,
    ogImage: p.photo_url,
    ogType: "profile",
    keywords: p.specialties?.length
      ? p.specialties
      : ["Vedic astrologer", "astrology consultation"],
  });
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

  const p = profile as {
    full_name: string;
    honorific?: string | null;
    title?: string | null;
    tagline?: string | null;
    short_bio?: string | null;
    photo_url?: string | null;
    specialties?: string[];
    instagram_url?: string | null;
    youtube_url?: string | null;
    linkedin_url?: string | null;
    website_url?: string | null;
  };

  const displayName = p.honorific ? `${p.honorific} ${p.full_name}` : p.full_name;
  const description = (
    p.tagline ||
    p.short_bio ||
    `Vedic astrologer profile of ${p.full_name}.`
  ).slice(0, 160);
  const sameAs = [p.instagram_url, p.youtube_url, p.linkedin_url, p.website_url].filter(
    (url): url is string => Boolean(url),
  );

  return (
    <>
      <JsonLd
        data={[
          personJsonLd({
            name: displayName,
            title: p.title,
            description,
            slug,
            imageUrl: p.photo_url,
            specialties: p.specialties,
            sameAs,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Council", path: "/#council" },
            { name: displayName, path: `/astrologer/${slug}` },
          ]),
        ]}
      />
      <AstrologerProfilePage
        profile={profile as Parameters<typeof AstrologerProfilePage>[0]["profile"]}
        services={services as Parameters<typeof AstrologerProfilePage>[0]["services"]}
        availability={availability as Parameters<typeof AstrologerProfilePage>[0]["availability"]}
      />
    </>
  );
}
