export function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export function isValidPhone(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  const digits = v.replace(/[\s\-().]/g, "");
  return /^\+?[0-9]{7,15}$/.test(digits);
}

export function isValidUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidSlug(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
}

export type ProfileFieldErrors = {
  full_name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  photo_url?: string;
  website_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
  slug?: string;
  years_experience?: string;
};

export function validateProfileFields(profile: {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  photo_url?: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  linkedin_url?: string | null;
  slug?: string | null;
  years_experience?: number | null;
}): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};

  if (!profile.full_name.trim()) {
    errors.full_name = "Full name is required";
  } else if (profile.full_name.trim().length < 2) {
    errors.full_name = "At least 2 characters";
  }

  if (profile.email?.trim() && !isValidEmail(profile.email)) {
    errors.email = "Enter a valid email (e.g. name@example.com)";
  }

  if (profile.phone?.trim() && !isValidPhone(profile.phone)) {
    errors.phone = "Enter a valid phone number (7–15 digits, + optional)";
  }

  if (profile.whatsapp?.trim() && !isValidPhone(profile.whatsapp)) {
    errors.whatsapp = "Enter a valid WhatsApp number (7–15 digits, + optional)";
  }

  if (profile.photo_url?.trim() && !isValidUrl(profile.photo_url)) {
    errors.photo_url = "Enter a valid URL starting with http:// or https://";
  }

  if (profile.website_url?.trim() && !isValidUrl(profile.website_url)) {
    errors.website_url = "Enter a valid website URL";
  }

  for (const [key, label] of [
    ["instagram_url", "Instagram"],
    ["youtube_url", "YouTube"],
    ["linkedin_url", "LinkedIn"],
  ] as const) {
    const val = profile[key]?.trim();
    if (val && !isValidUrl(val)) {
      errors[key] = `Enter a valid ${label} URL`;
    }
  }

  if (profile.slug?.trim() && !isValidSlug(profile.slug)) {
    errors.slug = "Use lowercase letters, numbers, and hyphens only";
  }

  if (
    profile.years_experience != null &&
    (profile.years_experience < 0 || profile.years_experience > 120)
  ) {
    errors.years_experience = "Must be between 0 and 120";
  }

  return errors;
}

export function hasErrors(errors: ProfileFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
