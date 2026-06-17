import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { getAstrologerBySlug } from "@/lib/astrologers.functions";
import { BookConsultationDialog } from "@/components/astrologer/book-consultation-dialog";
import logoAsset from "@/assets/pradeepji.svg";

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
    const p = loaderData?.profile as AstrologerProfile | undefined;
    if (!p) return { meta: [{ title: "Astrologer not found" }] };
    const pageTitle = `${p.honorific ? p.honorific + " " : ""}${p.full_name}${p.title ? " — " + p.title : ""}`;
    const desc = p.tagline || p.short_bio || `Profile of ${p.full_name}`;
    const meta: Array<Record<string, string>> = [
      { title: pageTitle },
      { name: "description", content: desc.slice(0, 160) },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: desc.slice(0, 160) },
    ];
    if (p.photo_url) {
      meta.push({ property: "og:image", content: p.photo_url });
      meta.push({ name: "twitter:image", content: p.photo_url });
    }
    return { meta };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-center px-6 bg-[var(--background)]">
      <div>
        <h1 className="font-display text-4xl text-[var(--gold)]">Profile not found</h1>
        <p className="text-muted-foreground mt-3">This astrologer doesn&apos;t exist or isn&apos;t active.</p>
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

type AstrologerProfile = {
  full_name: string;
  honorific?: string | null;
  title?: string | null;
  tagline?: string | null;
  short_bio?: string | null;
  long_bio?: string | null;
  quote?: string | null;
  philosophy?: string | null;
  photo_url?: string | null;
  languages?: string[];
  specialties?: string[];
  certifications?: string[];
  lineage?: string | null;
  years_experience?: number | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  linkedin_url?: string | null;
};

type Service = {
  id: string;
  name: string;
  description?: string | null;
  duration_minutes?: number | null;
  price_amount?: number | null;
  price_currency?: string;
  modes?: string[];
};

type AvailabilitySlot = {
  id: string;
  timezone: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MODE_LABELS: Record<string, string> = {
  in_person: "In person",
  video: "Video",
  phone: "Phone",
};

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
    >
      {name}
    </span>
  );
}

function displayName(p: AstrologerProfile) {
  return p.honorific ? `${p.honorific} ${p.full_name}` : p.full_name;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function AstrologerPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(profileQuery(slug));
  const p = data.profile as AstrologerProfile;
  const services = (data.services ?? []) as Service[];
  const availability = (data.availability ?? []) as AvailabilitySlot[];

  const [bookOpen, setBookOpen] = useState(false);
  const [bookService, setBookService] = useState<string | undefined>();

  function openBook(serviceName?: string) {
    setBookService(serviceName);
    setBookOpen(true);
  }

  const name = displayName(p);
  const specialties = p.specialties ?? [];
  const languages = p.languages ?? [];
  const certifications = p.certifications ?? [];

  const navSections = [
    p.long_bio || p.short_bio ? { id: "about", label: "About" } : null,
    services.length ? { id: "services", label: "Services" } : null,
    availability.length ? { id: "availability", label: "Availability" } : null,
    { id: "book", label: "Book" },
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  const hasContact = !!(p.email || p.phone || p.whatsapp || p.website_url || p.instagram_url || p.youtube_url || p.linkedin_url);

  return (
    <div className="min-h-screen bg-[var(--background)] text-foreground">
      <ProfileNav onBook={() => openBook()} />

      <BookConsultationDialog
        open={bookOpen}
        onOpenChange={setBookOpen}
        astrologerName={name}
        whatsapp={p.whatsapp}
        phone={p.phone}
        serviceName={bookService}
      />

      {/* Hero */}
      <header className="relative pt-28 md:pt-32 pb-16 md:pb-24 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(200,151,61,0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(200,151,61,0.08), transparent 50%)",
          }}
        />
        <div className="relative max-w-[1400px] mx-auto px-6 md:px-12">
          <Link to="/" hash="council" className="inline-flex items-center gap-2 text-xs label-caps text-muted-foreground hover:text-[var(--gold)] transition-colors mb-8">
            <Icon name="arrow_back" className="text-sm" />
            Council
          </Link>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
              {p.honorific && (
                <span className="label-caps text-[var(--gold)] tracking-[0.2em] text-xs">{p.honorific}</span>
              )}
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground leading-[0.95]">
                {p.full_name}
              </h1>
              {p.title && (
                <p className="text-xl md:text-2xl text-muted-foreground font-light">{p.title}</p>
              )}
              {p.tagline && (
                <p className="text-lg md:text-xl italic text-[var(--gold)] max-w-xl leading-relaxed">
                  &ldquo;{p.tagline}&rdquo;
                </p>
              )}
              {(p.short_bio && !p.tagline) && (
                <p className="text-muted-foreground leading-relaxed max-w-xl font-light">{p.short_bio}</p>
              )}

              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {specialties.map((s) => (
                    <span
                      key={s}
                      className="label-caps text-[10px] px-3 py-1.5 rounded-full border border-[var(--gold)]/35 text-[var(--gold)] bg-[var(--gold)]/5"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4">
                <BookButton onClick={() => openBook()} variant="primary">
                  Book consultation
                </BookButton>
                {services.length > 0 && (
                  <a
                    href="#services"
                    className="inline-flex items-center gap-2 border border-foreground/20 px-7 py-3.5 label-caps hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
                  >
                    View services
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="relative mx-auto max-w-[380px] lg:max-w-none">
                <div className="absolute -inset-3 border border-[var(--gold)]/20 rounded-sm rotate-1" aria-hidden />
                <div className="absolute -inset-1 border border-[var(--gold)]/10 rounded-sm -rotate-1" aria-hidden />
                {p.photo_url ? (
                  <img
                    src={p.photo_url}
                    alt={name}
                    className="relative w-full aspect-[4/5] object-cover rounded-sm border border-[var(--gold)]/40 shadow-[0_40px_80px_-20px_rgba(200,151,61,0.35)]"
                  />
                ) : (
                  <div className="relative w-full aspect-[4/5] rounded-sm bg-[var(--charcoal)] border border-[var(--gold)]/30 flex items-center justify-center">
                    <span className="font-display text-8xl text-[var(--gold)]/30 italic">{initials(p.full_name)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-[var(--gold)]/15">
            {p.years_experience != null && (
              <Stat label="Experience" value={`${p.years_experience}+ yrs`} />
            )}
            {languages.length > 0 && (
              <Stat label="Languages" value={languages.length > 2 ? `${languages.slice(0, 2).join(", ")}…` : languages.join(", ")} title={languages.join(", ")} />
            )}
            {specialties.length > 0 && (
              <Stat label="Specialties" value={String(specialties.length)} sub={specialties.slice(0, 2).join(" · ")} />
            )}
            {services.length > 0 && (
              <Stat label="Consultations" value={String(services.length)} sub="offerings available" />
            )}
          </dl>
        </div>
      </header>

      {/* Sub-nav */}
      {navSections.length > 1 && (
        <nav className="sticky top-0 z-40 border-y border-[var(--gold)]/15 bg-[var(--background)]/90 backdrop-blur-md">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex gap-1 overflow-x-auto py-3 scrollbar-none">
            {navSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 px-4 py-2 text-sm label-caps text-muted-foreground hover:text-[var(--gold)] hover:bg-[var(--gold)]/5 rounded-md transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* Main layout */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <main className="lg:col-span-8 space-y-20 md:space-y-28">
            {(p.long_bio || p.short_bio) && (
              <section id="about">
                <SectionLabel label="About" />
                <div className="prose prose-lg max-w-none">
                  <p className="text-muted-foreground leading-[1.85] whitespace-pre-wrap font-light text-base md:text-lg">
                    {p.long_bio || p.short_bio}
                  </p>
                </div>
                {p.lineage && (
                  <div className="mt-8 p-6 border border-[var(--gold)]/15 bg-[var(--cream)]/50 rounded-sm">
                    <p className="label-caps text-[var(--gold)] text-[10px] mb-2">Lineage</p>
                    <p className="text-foreground font-light">{p.lineage}</p>
                  </div>
                )}
              </section>
            )}

            {p.quote && (
              <blockquote className="relative py-10 px-8 md:px-12 border border-[var(--gold)]/20 bg-gradient-to-br from-[var(--cream)]/80 to-white rounded-sm">
                <Icon name="format_quote" className="absolute top-6 left-6 text-[var(--gold)]/25 text-5xl" />
                <p className="font-display text-2xl md:text-3xl italic text-foreground leading-snug relative z-10 pl-8">
                  &ldquo;{p.quote}&rdquo;
                </p>
                <footer className="mt-6 pl-8 text-sm text-muted-foreground">— {p.full_name}</footer>
              </blockquote>
            )}

            {p.philosophy && (
              <section>
                <SectionLabel label="Philosophy" />
                <p className="text-muted-foreground leading-[1.85] whitespace-pre-wrap font-light text-base md:text-lg max-w-3xl">
                  {p.philosophy}
                </p>
              </section>
            )}

            {certifications.length > 0 && (
              <section>
                <SectionLabel label="Credentials" />
                <ul className="grid sm:grid-cols-2 gap-4">
                  {certifications.map((c) => (
                    <li
                      key={c}
                      className="flex gap-4 items-start p-5 border border-[var(--gold)]/15 bg-card/50 rounded-sm hover:border-[var(--gold)]/35 transition-colors"
                    >
                      <span className="shrink-0 w-8 h-8 rounded-full border border-[var(--gold)]/30 flex items-center justify-center">
                        <Icon name="verified" className="text-[var(--gold)] text-base" />
                      </span>
                      <span className="text-foreground font-light leading-relaxed pt-1">{c}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {services.length > 0 && (
              <section id="services">
                <SectionLabel label="Consultation Services" />
                <p className="text-muted-foreground font-light mb-10 max-w-xl">
                  Select a session type that fits your needs. Each consultation is tailored to your chart and context.
                </p>
                <div className="space-y-5">
                  {services.map((s, i) => (
                    <ServiceRow key={s.id} service={s} index={i} onInquire={() => openBook(s.name)} />
                  ))}
                </div>
              </section>
            )}

            {availability.length > 0 && (
              <section id="availability">
                <SectionLabel label="Weekly Availability" />
                <p className="text-xs label-caps text-muted-foreground mb-6">
                  Timezone: {availability[0].timezone}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {DAYS_SHORT.map((d, idx) => {
                    const slots = availability.filter((a) => a.day_of_week === idx);
                    const active = slots.length > 0;
                    return (
                      <div
                        key={d}
                        className={`rounded-sm p-4 min-h-[100px] border transition-colors ${
                          active
                            ? "border-[var(--gold)]/35 bg-[var(--gold)]/5"
                            : "border-[var(--gold)]/10 bg-muted/20 opacity-60"
                        }`}
                      >
                        <p className="label-caps text-[10px] text-[var(--gold)] mb-3">{d}</p>
                        {active ? (
                          slots.map((slot) => (
                            <p key={slot.id} className="text-sm font-medium text-foreground leading-relaxed">
                              {String(slot.start_time).slice(0, 5)}
                              <span className="text-muted-foreground mx-0.5">–</span>
                              {String(slot.end_time).slice(0, 5)}
                            </p>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">Closed</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-4 font-light">
                  Hours shown for {DAYS_FULL[availability[0]?.day_of_week ?? 0]} timezone. Confirm exact slots when booking.
                </p>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-20 space-y-6">
              <div className="border border-[var(--gold)]/20 bg-card/60 backdrop-blur rounded-sm p-6 shadow-[0_20px_50px_-20px_rgba(26,26,26,0.12)]">
                <p className="label-caps text-[var(--gold)] text-[10px] mb-4">Book a session</p>
                <h2 className="font-display text-2xl text-foreground mb-2">{p.full_name}</h2>
                {p.title && <p className="text-sm text-muted-foreground mb-6">{p.title}</p>}

                <ul className="space-y-3 mb-6 text-sm">
                  {p.years_experience != null && (
                    <SidebarRow icon="history" label="Experience" value={`${p.years_experience} years`} />
                  )}
                  {languages.length > 0 && (
                    <SidebarRow icon="translate" label="Languages" value={languages.join(", ")} />
                  )}
                  {services.length > 0 && services[0].price_amount != null && (
                    <SidebarRow
                      icon="payments"
                      label="From"
                      value={`${services[0].price_currency ?? "INR"} ${Number(services[0].price_amount).toLocaleString()}`}
                    />
                  )}
                </ul>

                <BookButton onClick={() => openBook()} variant="primary" className="w-full" id="book">
                  Request consultation
                </BookButton>
              </div>

              {hasContact && (
                <div className="border border-[var(--gold)]/15 rounded-sm p-6">
                  <p className="label-caps text-[var(--gold)] text-[10px] mb-4">Connect</p>
                  <div className="flex flex-wrap gap-2">
                    {p.email && <ContactChip href={`mailto:${p.email}`} icon="mail" label="Email" />}
                    {p.phone && <ContactChip href={`tel:${p.phone}`} icon="call" label="Call" />}
                    {p.whatsapp && (
                      <ContactChip
                        href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`}
                        icon="chat"
                        label="WhatsApp"
                        external
                      />
                    )}
                    {p.website_url && <ContactChip href={p.website_url} icon="language" label="Web" external />}
                    {p.instagram_url && <ContactChip href={p.instagram_url} icon="photo_camera" label="Instagram" external />}
                    {p.youtube_url && <ContactChip href={p.youtube_url} icon="play_circle" label="YouTube" external />}
                    {p.linkedin_url && <ContactChip href={p.linkedin_url} icon="work" label="LinkedIn" external />}
                  </div>
                </div>
              )}

              <Link
                to="/"
                hash="council"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors py-2"
              >
                <Icon name="groups" className="text-base" />
                View full council
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* CTA band */}
      <section className="bg-[var(--charcoal)] text-[var(--offwhite)] py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-[900px] mx-auto text-center">
          <p className="label-caps text-[var(--gold-bright)] text-xs tracking-widest mb-4">Begin your consultation</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight mb-6">
            Work with {p.full_name.split(" ")[0]} on your <span className="italic text-[var(--gold-bright)]">cosmic roadmap</span>
          </h2>
          <p className="text-[var(--silver)]/80 font-light max-w-lg mx-auto mb-10 leading-relaxed">
            Share what you&apos;d like to explore. We&apos;ll open WhatsApp with your message ready to send to {p.full_name.split(" ")[0]}.
          </p>
          <BookButton onClick={() => openBook()} variant="outline-light">
            Message on WhatsApp
          </BookButton>
        </div>
      </section>

      <footer className="border-t border-[var(--gold)]/15 py-8 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="inline-flex w-9 h-9 items-center justify-center border border-[var(--gold)]/40 bg-[var(--charcoal)] rounded-sm overflow-hidden">
              <img src={logoAsset} alt="" className="w-full h-full object-contain" />
            </span>
            <span className="font-display text-lg text-[var(--gold)]">Pradeep Bhanot&apos;s The Cosmic Voice</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors">
            ← Back to homepage
          </Link>
        </div>
      </footer>
    </div>
  );
}

function ProfileNav({ onBook }: { onBook: () => void }) {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[var(--background)]/85 border-b border-[var(--gold)]/15">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="inline-flex w-10 h-10 items-center justify-center border border-[var(--gold)]/40 bg-[var(--charcoal)] rounded-sm overflow-hidden">
            <img src={logoAsset} alt="Home" className="w-full h-full object-contain" />
          </span>
        </Link>
        <button
          type="button"
          onClick={onBook}
          className="inline-flex items-center gap-2 border border-foreground/20 px-5 py-2.5 rounded-full label-caps text-sm hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all group"
        >
          Book consult
          <Icon name="arrow_forward" className="text-base group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </nav>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="hairline w-12 bg-[var(--gold)]/40" />
      <h2 className="label-caps text-[var(--gold)]">{label}</h2>
    </div>
  );
}

function Stat({ label, value, sub, title }: { label: string; value: string; sub?: string; title?: string }) {
  return (
    <div title={title}>
      <dt className="label-caps text-[10px] text-muted-foreground mb-1">{label}</dt>
      <dd className="font-display text-3xl md:text-4xl text-[var(--gold)] italic">{value}</dd>
      {sub && <p className="text-xs text-muted-foreground mt-1 font-light truncate">{sub}</p>}
    </div>
  );
}

function SidebarRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <li className="flex items-start gap-3">
      <Icon name={icon} className="text-[var(--gold)] text-base shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-foreground">{value}</p>
      </div>
    </li>
  );
}

function ContactChip({ href, icon, label, external }: { href: string; icon: string; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--gold)]/25 text-xs hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-colors"
    >
      <Icon name={icon} className="text-sm text-[var(--gold)]" />
      {label}
    </a>
  );
}

function BookButton({
  onClick,
  children,
  variant = "primary",
  className = "",
  id,
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "outline-light";
  className?: string;
  id?: string;
}) {
  const styles = {
    primary: "bg-[var(--gold)] text-[var(--background)] hover:opacity-90",
    outline: "border border-[var(--gold)]/50 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--background)]",
    "outline-light": "border border-[var(--gold-bright)] text-[var(--gold-bright)] hover:bg-[var(--gold-bright)] hover:text-[var(--charcoal)]",
  }[variant];

  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 label-caps transition-colors ${styles} ${className}`}
    >
      {children}
      <Icon name="arrow_forward" className="text-base" />
    </button>
  );
}

function ServiceRow({
  service: s,
  index,
  onInquire,
}: {
  service: Service;
  index: number;
  onInquire: () => void;
}) {
  return (
    <article className="group grid md:grid-cols-[auto,1fr,auto] gap-6 p-6 md:p-8 border border-[var(--gold)]/15 bg-card/40 rounded-sm hover:border-[var(--gold)]/40 hover:shadow-[0_12px_40px_-16px_rgba(200,151,61,0.25)] transition-all">
      <div className="hidden md:flex flex-col items-center justify-center w-14 shrink-0">
        <span className="font-display italic text-3xl text-[var(--gold)]/50 group-hover:text-[var(--gold)] transition-colors">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
          <h3 className="font-display text-2xl text-foreground">{s.name}</h3>
          {s.price_amount != null && (
            <span className="text-[var(--gold)] font-medium">
              {s.price_currency ?? "INR"} {Number(s.price_amount).toLocaleString()}
            </span>
          )}
        </div>
        {s.description && (
          <p className="text-muted-foreground font-light leading-relaxed mb-4">{s.description}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {s.duration_minutes != null && (
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
              <Icon name="schedule" className="text-sm" />
              {s.duration_minutes} min
            </span>
          )}
          {(s.modes ?? []).map((m) => (
            <span key={m} className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-[var(--gold)]/30 text-[var(--gold)]">
              <Icon name={m === "video" ? "videocam" : m === "phone" ? "call" : "person"} className="text-sm" />
              {MODE_LABELS[m] ?? m}
            </span>
          ))}
        </div>
      </div>
      <div className="flex md:flex-col items-center justify-center md:justify-start gap-2">
        <button
          type="button"
          onClick={onInquire}
          className="inline-flex items-center gap-2 whitespace-nowrap label-caps text-xs border border-[var(--gold)]/50 text-[var(--gold)] px-5 py-2.5 hover:bg-[var(--gold)] hover:text-[var(--background)] transition-colors w-full md:w-auto justify-center"
        >
          Book this
          <Icon name="arrow_forward" className="text-sm" />
        </button>
      </div>
    </article>
  );
}
