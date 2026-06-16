import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export const Route = createFileRoute("/api/public/consult")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { submitConsultation } = await import("@/lib/consultations.functions");
          const result = await submitConsultation({ data: body });
          return new Response(JSON.stringify(result), {
            status: 201,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Bad request";
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }
      },
    },
  },
});
