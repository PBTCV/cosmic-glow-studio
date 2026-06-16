import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getAstrologerBySlug } from "@/lib/astrologers.functions";

const profileQuery = (slug: string) =>
  queryOptions({
    queryKey: ["astrologer", slug],
    queryFn: () => getAstrologerBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/astrologer/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(profileQuery(params.slug));
    if (!data.profile) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const p = loaderData?.profile as any;
    if (!p) return { meta: [{ title: "Astrologer not found" }] };
    const title = `${p.honorific ? p.honorific + " " : ""}${p.full_name}${p.title ? " — " + p.title : ""}`;
    const desc = p.tagline || p.short_bio || `Profile of ${p.full_name}`;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc.slice(0, 160) },
      { property: "og:title", content: title },
      { property: "og:description", content: desc.slice(0, 160) },
    ];
    if (p.photo_url) {
      meta.push({ property: "og:image", content: p.photo_url });
      meta.push({ name: "twitter:image", content: p.photo_url });
    }
    return { meta };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <h1 className="font-display text-4xl text-[var(--gold)]">Profile not found</h1>
        <p className="text-muted-foreground mt-3">This astrologer doesn't exist or isn't active.</p>
        <Link to="/" className="inline-block mt-6 text-[var(--gold)] hover:underline">← Back home</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <p className="text-destructive">{error.message}</p>
    </div>
  ),
  component: AstrologerPage,
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function AstrologerPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(profileQuery(slug));
  const p = data.profile as any;
  const services = (data.services ?? []) as any[];
  const availability = (data.availability ?? []) as any[];

  return (
    <div className="min-h-screen bg-[var(--background)] text-foreground">
      {/* Top bar */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[var(--background)]/85 border-b border-[var(--gold)]/15">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-tight">
            Elite <span className="italic text-[var(--gold)]">Vedic</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-[var(--gold)]">← Home</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-36 pb-16 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-[280px,1fr] gap-10 items-start">
          <div className="relative">
            {p.photo_url ? (
              <img src={p.photo_url} alt={p.full_name} className="w-full aspect-square object-cover rounded-lg border border-[var(--gold)]/30 shadow-[0_20px_60px_-15px_rgba(200,151,61,0.35)]" />
            ) : (
              <div className="w-full aspect-square rounded-lg bg-[var(--charcoal)] border border-[var(--gold)]/20" />
            )}
          </div>
          <div className="space-y-5">
            {p.honorific && <span className="label-caps text-[var(--gold)] tracking-widest text-xs">{p.honorific}</span>}
            <h1 className="font-display text-5xl md:text-6xl text-foreground leading-tight">
              {p.full_name}
            </h1>
            {p.title && <p className="text-xl text-muted-foreground">{p.title}</p>}
            {p.tagline && <p className="text-lg italic text-[var(--gold)]">"{p.tagline}"</p>}

            <div className="flex flex-wrap gap-2 pt-2">
              {(p.specialties ?? []).map((s: string) => (
                <span key={s} className="text-xs px-3 py-1 rounded-full border border-[var(--gold)]/40 text-[var(--gold)]">{s}</span>
              ))}
            </div>

            <dl className="grid grid-cols-2 gap-4 pt-4 text-sm">
              {p.years_experience != null && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Experience</dt>
                  <dd className="text-lg text-foreground">{p.years_experience} years</dd>
                </div>
              )}
              {(p.languages ?? []).length > 0 && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Languages</dt>
                  <dd className="text-foreground">{p.languages.join(", ")}</dd>
                </div>
              )}
              {p.lineage && (
                <div className="col-span-2">
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Lineage</dt>
                  <dd className="text-foreground">{p.lineage}</dd>
                </div>
              )}
            </dl>

            <div className="pt-4">
              <Link
                to="/"
                hash="consult"
                className="inline-flex items-center gap-3 border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--background)] px-7 py-3 label-caps transition-colors"
              >
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1000px] mx-auto px-6 md:px-10 space-y-16 pb-24">
        {p.long_bio && (
          <Section title="About">
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {p.long_bio}
            </div>
          </Section>
        )}

        {p.quote && (
          <blockquote className="border-l-2 border-[var(--gold)] pl-6 italic text-xl text-foreground">
            "{p.quote}"
          </blockquote>
        )}

        {p.philosophy && (
          <Section title="Philosophy">
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{p.philosophy}</p>
          </Section>
        )}

        {(p.certifications ?? []).length > 0 && (
          <Section title="Credentials">
            <ul className="space-y-2 text-muted-foreground">
              {p.certifications.map((c: string) => (
                <li key={c} className="flex gap-3"><span className="text-[var(--gold)]">✦</span>{c}</li>
              ))}
            </ul>
          </Section>
        )}

        {services.length > 0 && (
          <Section title="Services">
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((s) => (
                <div key={s.id} className="border border-[var(--gold)]/15 rounded-lg p-5 hover:border-[var(--gold)]/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg text-foreground">{s.name}</h3>
                    {s.price_amount != null && (
                      <span className="text-[var(--gold)] font-medium whitespace-nowrap">
                        {s.price_currency} {Number(s.price_amount).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {s.description && <p className="text-sm text-muted-foreground mt-2">{s.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                    {s.duration_minutes != null && <span>{s.duration_minutes} min</span>}
                    {(s.modes ?? []).map((m: string) => (
                      <span key={m} className="px-2 py-0.5 rounded border border-[var(--gold)]/30">{m.replace("_", " ")}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {availability.length > 0 && (
          <Section title="Availability">
            <p className="text-xs text-muted-foreground mb-3">Timezone: {availability[0].timezone}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {DAYS.map((d, idx) => {
                const slots = availability.filter((a) => a.day_of_week === idx);
                return (
                  <div key={d} className="border border-[var(--gold)]/15 rounded p-3 min-h-[80px]">
                    <div className="text-xs uppercase tracking-wider text-[var(--gold)] mb-2">{d}</div>
                    {slots.length === 0 ? (
                      <div className="text-xs text-muted-foreground">—</div>
                    ) : slots.map((s) => (
                      <div key={s.id} className="text-xs text-foreground">
                        {String(s.start_time).slice(0, 5)}–{String(s.end_time).slice(0, 5)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {(p.email || p.phone || p.whatsapp || p.website_url || p.instagram_url || p.youtube_url || p.linkedin_url) && (
          <Section title="Connect">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {p.email && <li><a className="hover:text-[var(--gold)]" href={`mailto:${p.email}`}>Email</a></li>}
              {p.phone && <li><a className="hover:text-[var(--gold)]" href={`tel:${p.phone}`}>Phone</a></li>}
              {p.whatsapp && <li><a className="hover:text-[var(--gold)]" href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener">WhatsApp</a></li>}
              {p.website_url && <li><a className="hover:text-[var(--gold)]" href={p.website_url} target="_blank" rel="noopener">Website</a></li>}
              {p.instagram_url && <li><a className="hover:text-[var(--gold)]" href={p.instagram_url} target="_blank" rel="noopener">Instagram</a></li>}
              {p.youtube_url && <li><a className="hover:text-[var(--gold)]" href={p.youtube_url} target="_blank" rel="noopener">YouTube</a></li>}
              {p.linkedin_url && <li><a className="hover:text-[var(--gold)]" href={p.linkedin_url} target="_blank" rel="noopener">LinkedIn</a></li>}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-[var(--gold)] mb-4">{title}</h2>
      {children}
    </section>
  );
}
