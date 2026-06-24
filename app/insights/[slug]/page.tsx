import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightDetailPage } from "@/components/pages/insight-detail-page";
import { JsonLd } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/seo";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";
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

  return createMetadata({
    title,
    description,
    path: `/insights/${slug}`,
    ogImage: imageUrl,
    ogType: "article",
    publishedTime: post.publishedAt,
    authors: post.author ? [post.author] : undefined,
    keywords: post.categories ?? undefined,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const description = (post.seo?.metaDescription || post.excerpt || post.title).slice(0, 160);
  const imageUrl = post.coverImage ? urlFor(post.coverImage)?.width(1200).height(630).url() : null;

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd({
            title: post.title,
            description,
            slug,
            publishedAt: post.publishedAt,
            author: post.author,
            imageUrl: imageUrl ?? undefined,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Insights", path: "/insights" },
            { name: post.title, path: `/insights/${slug}` },
          ]),
        ]}
      />
      <InsightDetailPage post={post} />
    </>
  );
}
