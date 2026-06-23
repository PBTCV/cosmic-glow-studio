import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { urlFor } from "@/sanity/image";
import type { PostListItem } from "@/sanity/types";

function PostCard({ post }: { post: PostListItem }) {
  const imageUrl = post.coverImage ? urlFor(post.coverImage)?.width(800).height(500).url() : null;

  return (
    <Link
      href={`/insights/${post.slug}`}
      className="group glass-card border border-[var(--gold)]/15 overflow-hidden flex flex-col h-full hover:border-[var(--gold)]/40 transition-colors"
    >
      <div className="relative aspect-[16/10] bg-[var(--charcoal)] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.coverImage?.alt || post.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--gold)]/30">
            <span className="material-symbols-outlined text-5xl">auto_stories</span>
          </div>
        )}
      </div>
      <div className="p-6 md:p-8 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {post.publishedAt ? (
            <time className="label-caps text-[10px] text-[var(--gold)]">
              {format(new Date(post.publishedAt), "MMMM d, yyyy")}
            </time>
          ) : null}
          {post.author ? (
            <span className="text-xs text-muted-foreground font-light">{post.author}</span>
          ) : null}
        </div>
        <h2 className="font-display text-2xl md:text-3xl leading-tight mb-3 group-hover:text-[var(--gold)] transition-colors">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="text-muted-foreground font-light leading-relaxed line-clamp-3 flex-1">
            {post.excerpt}
          </p>
        ) : null}
        {post.categories?.length ? (
          <div className="flex flex-wrap gap-2 mt-5">
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
        <span className="mt-6 inline-flex items-center gap-2 label-caps text-xs text-[var(--gold)] group-hover:gap-3 transition-all">
          Read insight
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </span>
      </div>
    </Link>
  );
}

export function InsightsListPage({ posts }: { posts: PostListItem[] }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="pt-28 md:pt-36 pb-20 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="label-caps text-[var(--gold)] mb-4">Insights</p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6">
              Cosmic clarity for <span className="italic text-[var(--gold)]">modern leaders</span>
            </h1>
            <p className="text-muted-foreground font-light text-lg leading-relaxed max-w-2xl">
              Essays on Vedic strategy, timing, and the patterns that shape decisive moments in
              business and life.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="border border-dashed border-[var(--gold)]/25 rounded-sm p-12 md:p-16 text-center">
              <p className="font-display text-2xl mb-3">Insights arriving soon</p>
              <p className="text-muted-foreground font-light max-w-md mx-auto">
                Publish your first post in{" "}
                <Link href="/studio" className="text-[var(--gold)] hover:underline">
                  Sanity Studio
                </Link>{" "}
                to see it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
