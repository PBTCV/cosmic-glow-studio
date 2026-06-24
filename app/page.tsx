import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { getSql } from "@/lib/neon.server";
import { createMetadata } from "@/lib/seo";
import { faqJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";
import { SITE_DESCRIPTION } from "@/lib/site";
import { HomePage } from "@/components/pages/home-page";
import { homeFaqs } from "@/lib/faqs";
import { getLatestPosts } from "@/sanity/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Vedic Consulting — Ancient Wisdom, Modern Strategy",
  description: SITE_DESCRIPTION,
  path: "/",
  keywords: [
    "Vedic astrology consulting",
    "executive astrology India",
    "Vastu consultant Panchkula",
    "Pradeep Bhanot astrologer",
    "business muhurta timing",
  ],
});

type CouncilAstrologer = {
  id: string;
  slug: string;
  full_name: string;
  honorific: string | null;
  title: string | null;
  photo_url: string | null;
  tagline: string | null;
  languages: string[];
  specialties: string[];
  short_bio: string | null;
  years_experience: number | null;
  is_featured: boolean;
  display_order: number;
};

export default async function Page() {
  const sql = getSql();
  const astrologers = (await sql`
    select id, slug, full_name, honorific, title, photo_url, tagline,
           languages, specialties, short_bio, years_experience,
           is_featured, display_order
    from astrologers
    where is_active = true
    order by display_order asc, created_at desc
  `) as CouncilAstrologer[];

  const latestPosts = await getLatestPosts(3);

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd(homeFaqs)]} />
      <HomePage astrologers={astrologers} latestPosts={latestPosts} />
    </>
  );
}
