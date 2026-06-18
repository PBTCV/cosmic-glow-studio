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

          const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
          const gateway = createLovableAiGatewayProvider(key);

          const system = `You are the Celestial Council — a senior Vedic astrology and Vastu advisor for decision-makers. Produce a direct, specific "Celestial Audit Glimpse" of 200-260 words that answers the seeker's exact question. Avoid vague mysticism, hedging, and filler phrases like "the cosmos suggests" or "energies align". Be concrete and prescriptive.

Use these 4 sections, each heading on its own line, each followed by 2-3 plain-language sentences. No bullet points. Do not use bold (**) for headings or any other text.

Reading of Your Chart
Name the dominant planetary influence relevant to the question (e.g., Saturn, Jupiter, Rahu, Mars, Venus, Mercury, Moon, Sun) and what it means for the seeker's situation right now. Reference the relevant house or dasha period in general terms (e.g., "10th-house Saturn period favors disciplined execution"). If birth details are missing, say so in one short clause and proceed from the question.

Direct Answer to Your Question
Give a clear yes / no / wait verdict on what the seeker asked. State the reasoning in one or two sentences. No metaphors.

Timing Window
Specify a near-term window using relative time (e.g., "next 10-21 days", "after the upcoming new moon", "from late in the current month into the following 6 weeks"). Name one weekday and one time-of-day that are most favorable for the key action. Never invent calendar dates or years.

Action Plan
Give 3 concrete actions the seeker should take, written as short imperative sentences in a single paragraph, separated by periods. Include at least one Vastu or ritual remedy (direction to face, color, mantra, donation, or placement) and one strategic business move.

Address the seeker by first name once in the opening. End with a single plain text closing line that restates the verdict in under 12 words. Do not use italics or any markdown formatting.`;

          const prompt = `Seeker: ${data.full_name}
Birth date: ${data.dob || "not provided"}
Birth time: ${data.birth_time || "not provided"}
Birth place: ${data.birth_place || "not provided"}

Intention / question:
${data.question}`;

          const result = streamText({
            model: gateway("google/gemini-3-flash-preview"),
            system,
            prompt,
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
