import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { z } from "zod";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const Input = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  dob: z.string().trim().max(20).optional().or(z.literal("")),
  birth_time: z.string().trim().max(20).optional().or(z.literal("")),
  birth_place: z.string().trim().max(200).optional().or(z.literal("")),
  question: z.string().trim().min(3).max(2000),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive the Vedic sun sign (Rashi) from a date string like "YYYY-MM-DD" or "DD/MM/YYYY". */
function deriveRashi(dob: string): string {
  const parts = dob.includes("-") ? dob.split("-") : dob.split("/").reverse();
  const [year, month, day] = parts.map(Number);
  if (!month || !day) return "";

  // Approximate Vedic solar ingress dates (sidereal, ~23° offset from tropical)
  const rashis = [
    { sign: "Mesha (Aries)", start: [4, 14] },
    { sign: "Vrishabha (Taurus)", start: [5, 15] },
    { sign: "Mithuna (Gemini)", start: [6, 15] },
    { sign: "Karka (Cancer)", start: [7, 17] },
    { sign: "Simha (Leo)", start: [8, 17] },
    { sign: "Kanya (Virgo)", start: [9, 17] },
    { sign: "Tula (Libra)", start: [10, 17] },
    { sign: "Vrishchika (Scorpio)", start: [11, 16] },
    { sign: "Dhanu (Sagittarius)", start: [12, 16] },
    { sign: "Makara (Capricorn)", start: [1, 14] },
    { sign: "Kumbha (Aquarius)", start: [2, 13] },
    { sign: "Meena (Pisces)", start: [3, 15] },
  ];

  for (let i = rashis.length - 1; i >= 0; i--) {
    const [sm, sd] = rashis[i].start;
    if (month > sm || (month === sm && day >= sd)) return rashis[i].sign;
  }
  return rashis[rashis.length - 1].sign; // wrap to Meena
}

/** Map birth month to ruling planet for elemental context. */
function getRulingPlanet(dob: string): string {
  const parts = dob.includes("-") ? dob.split("-") : dob.split("/").reverse();
  const month = Number(parts[1]);
  const planetMap: Record<number, string> = {
    1: "Saturn",
    2: "Saturn",
    3: "Jupiter",
    4: "Mars",
    5: "Venus",
    6: "Mercury",
    7: "Moon",
    8: "Sun",
    9: "Mercury",
    10: "Venus",
    11: "Mars",
    12: "Jupiter",
  };
  return planetMap[month] || "";
}

/** Extract first name only for personalised address. */
function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0];
}

/** Classify intent from the question for targeted advice framing. */
function classifyIntent(question: string): string {
  const q = question.toLowerCase();
  if (/\b(business|startup|venture|company|enterprise|revenue|profit)\b/.test(q)) return "business & enterprise growth";
  if (/\b(career|job|promotion|leadership|role|position)\b/.test(q)) return "career & professional advancement";
  if (/\b(wealth|invest|financial|money|asset|portfolio)\b/.test(q)) return "wealth & financial strategy";
  if (/\b(health|heal|wellbeing|energy|vitality|stress)\b/.test(q)) return "health & vitality";
  if (/\b(relation|partner|marriage|love|family|team)\b/.test(q)) return "relationships & alliances";
  if (/\b(vastu|space|office|home|property|direction)\b/.test(q)) return "Vastu & sacred space";
  return "holistic life strategy";
}

/** Identify current Vedic season (Ritu) for temporal grounding. */
function getVedicSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month <= 2 || month === 12) return "Shishira (Winter — ruled by Saturn's discipline)";
  if (month <= 4) return "Vasanta (Spring — ruled by Venus's renewal)";
  if (month <= 6) return "Grishma (Summer — ruled by the Sun's ambition)";
  if (month <= 8) return "Varsha (Monsoon — ruled by the Moon's intuition)";
  if (month <= 10) return "Sharad (Autumn — ruled by Jupiter's clarity)";
  return "Hemanta (Early Winter — ruled by Mercury's precision)";
}

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/api/public/audit-preview")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),

      POST: async ({ request }) => {
        try {
          const key = process.env.LOVABLE_API_KEY;
          if (!key) {
            return new Response("AI not configured", { status: 500, headers: CORS });
          }

          const body = await request.json();
          const data = Input.parse(body);

          // ── Enrich context before prompting ──────────────────────────────
          const name = firstName(data.full_name);
          const intent = classifyIntent(data.question);
          const season = getVedicSeason();
          const rashi = data.dob ? deriveRashi(data.dob) : null;
          const planet = data.dob ? getRulingPlanet(data.dob) : null;
          const hasFullChart = data.dob && data.birth_time && data.birth_place;
          const chartQuality = hasFullChart
            ? "full Janma Kundali data available — use specific planetary house references"
            : data.dob
              ? "partial data — use Rashi and ruling planet; avoid Ascendant references"
              : "no birth data — work purely from intention and archetypal wisdom";

          // ── System prompt (role + constraints + format contract) ──────────
          const system = `You are the Celestial Council — an elite body of Vedic Jyotish scholars and Vastu Shastra masters who advise Fortune-500 CEOs, heads of state, and generational entrepreneurs. Your language is precise, evocative, and never generic. You draw from Brihat Parashara Hora Shastra, Saravali, and classical Vastu texts.

CONSTRAINTS
• Never invent specific calendar dates or transit times.
• Never fabricate planets in houses unless birth data supports it.
• Never use bullet points or numbered lists.
• Address the seeker by first name exactly once (in the opening sentence).
• Keep the total response between 200–260 words.
• If birth data is partial or absent: work from intention, Rashi (if available), and universal archetypes — state this gracefully, never apologetically.

OUTPUT FORMAT — produce exactly these four headings, each on its own line in bold, each followed by exactly 2 sentences:

**Transit Mapping**
**Elemental Balance**
**Strategic Window**
**Auspicious Counsel**

Close with a single line in *italics* (wrapped in asterisks) that crystallises the core insight poetically. No additional text before or after.`;

          // ── User prompt (rich, structured context) ────────────────────────
          const prompt = `SEEKER PROFILE
Name: ${data.full_name} (address as "${name}")
Date of Birth: ${data.dob || "not provided"}
Time of Birth: ${data.birth_time || "not provided"}
Place of Birth: ${data.birth_place || "not provided"}
${rashi ? `Vedic Sun Sign (Rashi): ${rashi}` : ""}
${planet ? `Approximate Ruling Planet: ${planet}` : ""}

TEMPORAL CONTEXT
Current Vedic Season: ${season}

CHART DATA QUALITY
${chartQuality}

SEEKER'S INTENTION (domain: ${intent})
${data.question}

Produce the Celestial Audit Glimpse now, following the system instructions exactly.`;

          const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
          const gateway = createLovableAiGatewayProvider(key);

          const result = streamText({
            model: gateway("google/gemini-3-flash-preview"),
            system,
            prompt,
            temperature: 0.72, // balanced: creative but not hallucination-prone
            maxTokens: 420, // tight ceiling keeps response focused
            topP: 0.9, // nucleus sampling for richer vocabulary
          });

          return result.toTextStreamResponse({
            headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Bad request";
          return new Response(message, { status: 400, headers: CORS });
        }
      },
    },
  },
});
