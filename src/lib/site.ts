export const SITE_NAME = "Pradeep Bhanot's The Cosmic Voice";
export const SITE_SHORT_NAME = "The Cosmic Voice";
export const SITE_DESCRIPTION =
  "Executive Vedic consulting blending astrology, Vastu, and strategic intelligence for leaders, founders, and enterprises.";
export const SITE_TAGLINE = "Ancient Wisdom, Modern Strategy";
export const SITE_LOCALE = "en_US";
export const DEFAULT_OG_IMAGE = "/pradeepji.svg";
export const SITE_EMAIL = "Pradeepbhanot@gmail.com";
export const SITE_PHONE = "+917888933521";
export const SITE_ADDRESS = {
  locality: "Panchkula",
  region: "Haryana",
  country: "IN",
};

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}
