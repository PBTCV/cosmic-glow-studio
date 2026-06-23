import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { SanityPortableText } from "@/components/sanity/portable-text";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { urlFor } from "@/sanity/image";
import type { PostDetail } from "@/sanity/types";

export function InsightDetailPage({ post }: { post: PostDetail }) {
  const imageUrl = post.coverImage ? urlFor(post.coverImage)?.width(1600).height(900).url() : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="pt-28 md:pt-36">
        <article>
          <header className="px-6 md:px-12 pb-12 md:pb-16">
            <div className="max-w-[900px] mx-auto">
              <Link
                href="/insights"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors mb-10"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                All insights
              </Link>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {post.publishedAt ? (
                  <time className="label-caps text-[10px] text-[var(--gold)]">
                    {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                  </time>
                ) : null}
                {post.author ? (
                  <span className="text-sm text-muted-foreground font-light">by {post.author}</span>
                ) : null}
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.08] mb-6">
                {post.title}
              </h1>
              {post.excerpt ? (
                <p className="text-xl text-muted-foreground font-light leading-relaxed">
                  {post.excerpt}
                </p>
              ) : null}
              {post.categories?.length ? (
                <div className="flex flex-wrap gap-2 mt-8">
                  {post.categories.map((cat) => (
                    <span
                      key={cat}
                      className="label-caps text-[9px] px-2 py-1 border border-[var(--gold)]/25 text-[var(--gold)]/80"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </header>

          {imageUrl ? (
            <div className="px-6 md:px-12 mb-12 md:mb-16">
              <div className="max-w-[1200px] mx-auto relative aspect-[16/9] overflow-hidden rounded-sm border border-[var(--gold)]/20">
                <Image
                  src={imageUrl}
                  alt={post.coverImage?.alt || post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>
            </div>
          ) : null}

          {post.body?.length ? (
            <div className="px-6 md:px-12 pb-20 md:pb-28">
              <div className="max-w-[720px] mx-auto">
                <SanityPortableText value={post.body} />
              </div>
            </div>
          ) : null}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
