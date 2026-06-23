import { client } from "./client";
import { isSanityConfigured } from "./env";
import type { PostDetail, PostListItem } from "./types";

const publishedFilter = `publishedAt <= now()`;

export const POSTS_LIST_QUERY = `*[_type == "post" && ${publishedFilter}] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  coverImage,
  author,
  categories
}`;

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug && ${publishedFilter}][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  coverImage,
  author,
  categories,
  body,
  seo
}`;

export const POST_SLUGS_QUERY = `*[_type == "post" && ${publishedFilter}] { "slug": slug.current }`;

export const LATEST_POSTS_QUERY = `*[_type == "post" && ${publishedFilter}] | order(publishedAt desc)[0...$limit] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  coverImage,
  author,
  categories
}`;

const fetchOptions = { next: { revalidate: 60 } };

export async function getPosts(): Promise<PostListItem[]> {
  if (!isSanityConfigured()) return [];
  return client.fetch<PostListItem[]>(POSTS_LIST_QUERY, {}, fetchOptions);
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  if (!isSanityConfigured()) return null;
  return client.fetch<PostDetail | null>(POST_BY_SLUG_QUERY, { slug }, fetchOptions);
}

export async function getPostSlugs(): Promise<string[]> {
  if (!isSanityConfigured()) return [];
  try {
    const rows = await client.fetch<Array<{ slug: string }>>(POST_SLUGS_QUERY, {}, fetchOptions);
    return rows.map((r) => r.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getLatestPosts(limit = 3): Promise<PostListItem[]> {
  if (!isSanityConfigured()) return [];
  return client.fetch<PostListItem[]>(LATEST_POSTS_QUERY, { limit }, fetchOptions);
}
