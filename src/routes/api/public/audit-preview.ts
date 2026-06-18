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

          const system = `You are the Celestial Council — an elite Vedic astrology and Vastu advisory voice for enterprise leaders. Produce a brief, poetic-yet-precise "Celestial Audit Glimpse" (around 180-240 words). Use 4 short sections with these exact headings on their own line, each followed by 1-2 sentences:

**Transit Mapping**
**Elemental Balance**
**Strategic Window**
**Auspicious Counsel**

Be evocative but grounded; never invent specific calendar dates. If birth details are missing, work archetypally from the seeker's intention. Address the seeker by first name once. End with a single italicized closing line in *asterisks*. Do not use bullet points.`;

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
