import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_SHORT_NAME,
  absoluteUrl,
  getSiteUrl,
} from "./site";

type CreateMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  ogImage?: string | null;
  ogType?: "website" | "article" | "profile";
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
};

function resolveImage(image?: string | null) {
  if (!image) return absoluteUrl(DEFAULT_OG_IMAGE);
  return image.startsWith("http") ? image : absoluteUrl(image);
}

export function createMetadata({
  title,
  description,
  path = "/",
  ogImage,
  ogType = "website",
  noIndex = false,
  publishedTime,
  modifiedTime,
  authors,
  keywords,
}: CreateMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const image = resolveImage(ogImage);

  return {
    title,
    description,
    keywords,
    authors: authors?.map((name) => ({ name })),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: ogType,
      images: [{ url: image, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors?.length ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "The Cosmic Voice — Vedic Consulting",
    template: "%s | The Cosmic Voice",
  },
  description:
    "Executive Vedic consulting blending astrology, Vastu, and strategic intelligence for leaders and enterprises.",
  applicationName: SITE_SHORT_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    "Vedic astrology",
    "Vastu consulting",
    "executive astrology",
    "business astrology",
    "Pradeep Bhanot",
    "The Cosmic Voice",
    "corporate Vedic consulting",
  ],
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    title: SITE_SHORT_NAME,
    description:
      "Executive Vedic consulting blending astrology, Vastu, and strategic intelligence for leaders and enterprises.",
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_SHORT_NAME,
    description:
      "Executive Vedic consulting blending astrology, Vastu, and strategic intelligence for leaders and enterprises.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};
