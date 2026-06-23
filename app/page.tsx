import { getSql } from "@/lib/neon.server";
import { HomePage } from "@/components/pages/home-page";
import { getLatestPosts } from "@/sanity/queries";

export const dynamic = "force-dynamic";

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

  return <HomePage astrologers={astrologers} latestPosts={latestPosts} />;
}
