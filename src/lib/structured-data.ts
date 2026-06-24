import {
  SITE_ADDRESS,
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_NAME,
  SITE_PHONE,
  absoluteUrl,
} from "@/lib/site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/pradeepji.svg"),
    description: SITE_DESCRIPTION,
    email: SITE_EMAIL,
    telephone: SITE_PHONE,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_ADDRESS.locality,
      addressRegion: SITE_ADDRESS.region,
      addressCountry: SITE_ADDRESS.country,
    },
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: absoluteUrl("/pradeepji.svg"),
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleJsonLd({
  title,
  description,
  slug,
  publishedAt,
  author,
  imageUrl,
}: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  author?: string | null;
  imageUrl?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: absoluteUrl(`/insights/${slug}`),
    datePublished: publishedAt,
    dateModified: publishedAt,
    inLanguage: "en",
    image: imageUrl ? [imageUrl] : [absoluteUrl("/pradeepji.svg")],
    author: {
      "@type": "Person",
      name: author || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/pradeepji.svg"),
      },
    },
    mainEntityOfPage: absoluteUrl(`/insights/${slug}`),
  };
}

export function personJsonLd({
  name,
  title,
  description,
  slug,
  imageUrl,
  specialties,
  sameAs,
}: {
  name: string;
  title?: string | null;
  description: string;
  slug: string;
  imageUrl?: string | null;
  specialties?: string[];
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: title || "Vedic Astrologer",
    description,
    url: absoluteUrl(`/astrologer/${slug}`),
    image: imageUrl || absoluteUrl("/pradeepji.svg"),
    knowsAbout: specialties?.length ? specialties : ["Vedic astrology", "Vastu", "Muhurta"],
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    ...(sameAs?.length ? { sameAs } : {}),
  };
}

export function faqJsonLd(items: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
