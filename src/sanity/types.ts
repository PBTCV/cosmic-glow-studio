import type { PortableTextBlock } from "@portabletext/types";

export type SanityImage = {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  alt?: string;
};

export type PostListItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt: string;
  coverImage?: SanityImage | null;
  author?: string | null;
  categories?: string[] | null;
};

export type PostDetail = PostListItem & {
  body?: PortableTextBlock[] | null;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
  } | null;
};
