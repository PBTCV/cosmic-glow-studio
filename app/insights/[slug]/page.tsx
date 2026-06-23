import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightDetailPage } from "@/components/pages/insight-detail-page";
import { getPostBySlug, getPostSlugs } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";

export async function generateStaticParams() {
  try {
    const slugs = await getPostSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Insight not found" };

  const title = post.seo?.metaTitle || post.title;
  const description = (post.seo?.metaDescription || post.excerpt || post.title).slice(0, 160);
  const imageUrl = post.coverImage ? urlFor(post.coverImage)?.width(1200).height(630).url() : null;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  return <InsightDetailPage post={post} />;
}
