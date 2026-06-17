export function normalizeWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function buildWhatsAppUrl(phone: string, message: string): string | null {
  const num = normalizeWhatsAppNumber(phone);
  if (!num) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function buildConsultationMessage(opts: {
  astrologerName: string;
  topic: string;
  serviceName?: string;
}): string {
  const lines = [
    `Hello ${opts.astrologerName},`,
    "",
    "I would like to book a consultation with you.",
  ];

  if (opts.serviceName?.trim()) {
    lines.push("", `Service: ${opts.serviceName.trim()}`);
  }

  lines.push("", "I would like to consult about:", opts.topic.trim());

  return lines.join("\n");
}

export function getAstrologerWhatsAppNumber(profile: {
  whatsapp?: string | null;
  phone?: string | null;
}): string | null {
  const raw = profile.whatsapp?.trim() || profile.phone?.trim();
  if (!raw) return null;
  const num = normalizeWhatsAppNumber(raw);
  return num || null;
}
