import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elite Vedic Consulting — Ancient Wisdom, Modern Strategy" },
      {
        name: "description",
        content:
          "Executive-grade Vedic consulting. Astrology, Vastu, and strategic intelligence for founders, leaders, and enterprises.",
      },
      { property: "og:title", content: "Elite Vedic Consulting" },
      {
        property: "og:description",
        content: "Ancient wisdom. Modern strategy. Cosmic clarity for decisive leaders.",
      },
    ],
  }),
  component: Index,
});

const Icon = ({ name, className = "", filled = false }: { name: string; className?: string; filled?: boolean }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 300, 'GRAD' 0, 'opsz' 24` }}
  >
    {name}
  </span>
);

function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-offwhite/75 border-b border-border/60">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-5 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full border border-gold flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-gold" />
          </span>
          <span className="font-display text-2xl tracking-tight text-charcoal">
            Elite<span className="text-gold">·</span>Vedic
          </span>
        </a>
        <div className="hidden md:flex items-center gap-10">
          {["Insights", "Services", "Council", "Method"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="label-caps text-ink-soft hover:text-charcoal transition-colors">
              {l}
            </a>
          ))}
        </div>
        <a
          href="#consult"
          className="hidden md:inline-flex items-center gap-2 bg-charcoal text-offwhite px-6 py-2.5 rounded-full label-caps hover:bg-charcoal/90 transition"
        >
          Book Consult <Icon name="arrow_forward" className="text-base" />
        </a>
      </div>
    </nav>
  );
}

const orbitalNodes = [
  { label: "Astrology", icon: "star", pos: "top-[8%] left-[16%]" },
  { label: "Vastu", icon: "temple_hindu", pos: "top-[2%] left-1/2 -translate-x-1/2" },
  { label: "Career", icon: "work_history", pos: "top-[8%] right-[16%]" },
  { label: "Wealth", icon: "diamond", pos: "top-[48%] right-[2%]" },
  { label: "Relations", icon: "favorite", pos: "bottom-[8%] right-[18%]" },
  { label: "Muhurta", icon: "schedule", pos: "bottom-[2%] left-1/2 -translate-x-1/2" },
  { label: "Remedies", icon: "spa", pos: "bottom-[8%] left-[18%]" },
  { label: "Karma", icon: "all_inclusive", pos: "top-[48%] left-[2%]" },
];

function Hero() {
  return (
    <section id="top" className="relative min-h-screen pt-28 flex flex-col items-center justify-center overflow-hidden">
      {/* ambient gold glows */}
      <div className="pointer-events-none absolute -top-32 -left-40 w-[520px] h-[520px] rounded-full blur-3xl"
           style={{ background: "radial-gradient(closest-side, rgba(244,182,82,0.22), transparent)" }} />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl"
           style={{ background: "radial-gradient(closest-side, rgba(244,182,82,0.18), transparent)" }} />

      <div className="relative w-full max-w-[980px] h-[560px] flex items-center justify-center">
        {/* Orbits */}
        <div className="orbital-path w-[420px] h-[420px] animate-orbit-slow" />
        <div className="orbital-path w-[640px] h-[640px] opacity-70 animate-orbit-reverse" />
        <div className="orbital-path w-[860px] h-[860px] opacity-40" />

        {/* Central sigil */}
        <div className="relative z-10 animate-float">
          <div className="w-28 h-28 rounded-full bg-charcoal flex items-center justify-center shadow-[0_20px_60px_-10px_rgba(244,182,82,0.45)] ring-1 ring-gold/40">
            <Icon name="auto_awesome" filled className="text-gold text-5xl" />
          </div>
          <span className="absolute inset-0 rounded-full animate-gold-pulse" />
        </div>

        {/* Nodes */}
        {orbitalNodes.map((n) => (
          <div key={n.label} className={`absolute ${n.pos} group cursor-pointer text-center`}>
            <div className="w-14 h-14 rounded-full glass-card flex items-center justify-center mb-2 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(244,182,82,0.55)] group-hover:border-gold">
              <Icon name={n.icon} className="text-charcoal group-hover:text-gold transition-colors" />
            </div>
            <span className="label-caps text-ink-soft text-[10px]">{n.label}</span>
          </div>
        ))}
      </div>

      <div className="relative z-20 text-center max-w-3xl px-6 -mt-12">
        <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-gold/40 bg-card">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="label-caps text-charcoal">Elite Vedic Consulting</span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl text-charcoal leading-[1.05] mb-6">
          Unlock Your <span className="italic text-gold">Cosmic</span> Blueprint
        </h1>
        <p className="text-lg md:text-xl text-ink-soft leading-relaxed max-w-2xl mx-auto">
          From ancient celestial alignments to modern executive strategy — we deliver the cosmic
          intelligence you need to navigate complexity and lead with clarity.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#consult" className="inline-flex items-center justify-center gap-2 bg-charcoal text-offwhite px-9 py-4 rounded-full font-semibold hover:bg-charcoal/90 transition shadow-lg shadow-charcoal/10">
            Begin Your Audit <Icon name="arrow_forward" className="text-lg" />
          </a>
          <a href="#services" className="inline-flex items-center justify-center gap-2 border border-charcoal/80 text-charcoal px-9 py-4 rounded-full font-semibold hover:bg-charcoal hover:text-offwhite transition">
            Explore Methodology
          </a>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const marks = ["FINANCIAL TIMES", "FORBES EXECUTIVE", "WIRED", "TECH CRUNCH", "ECONOMIC REVIEW"];
  return (
    <section className="py-16 border-y border-border bg-card/40">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16">
        <p className="label-caps text-center text-ink-soft mb-8">Featured & Trusted By</p>
        <div className="flex flex-wrap justify-around items-center gap-x-12 gap-y-6 opacity-70">
          {marks.map((m) => (
            <span key={m} className="label-caps text-charcoal text-base md:text-lg">{m}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

const services = [
  { icon: "explore", title: "Enterprise Vastu Audit", body: "Re-engineer physical workspaces to align with magnetic fields and natural elements — reducing friction, amplifying creative output." },
  { icon: "insights", title: "Executive Transit Mapping", body: "Plan mergers, product launches, and hiring cycles around the most favorable planetary windows." },
  { icon: "psychology", title: "Natal Leadership Profile", body: "Identify innate strengths and subconscious blockers in key decision-makers." },
  { icon: "diversity_3", title: "Relationship Synastry", body: "Optimize co-founder dynamics and board composition through energetic compatibility." },
  { icon: "hub", title: "Custom Methodology", body: "Bespoke integration of Vedic wisdom for modern technology scaling and capital strategy." },
  { icon: "schedule", title: "Muhurta — Auspicious Timing", body: "Precision timing for signings, launches, and announcements to maximize cosmic momentum." },
];

function Services() {
  return (
    <section id="services" className="py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16">
        <div className="text-center mb-20">
          <span className="label-caps text-gold">Integrated Wisdom Streams</span>
          <h2 className="font-display text-4xl md:text-6xl text-charcoal mt-4 mb-6">
            Four pillars. <span className="italic">One framework.</span>
          </h2>
          <div className="gold-divider mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hero card */}
          <div className="md:col-span-2 glass-card rounded-3xl p-10 md:p-12 flex flex-col justify-between min-h-[420px] relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl"
                 style={{ background: "radial-gradient(closest-side, rgba(244,182,82,0.25), transparent)" }} />
            <div className="relative z-10">
              <Icon name="explore" className="text-charcoal text-4xl mb-6" />
              <h3 className="font-display text-3xl md:text-4xl text-charcoal mb-4">{services[0].title}</h3>
              <p className="text-ink-soft max-w-md leading-relaxed">{services[0].body}</p>
            </div>
            <div className="relative z-10 mt-8 flex items-center justify-between">
              <a href="#consult" className="inline-flex items-center gap-2 font-semibold text-charcoal group/btn">
                Learn more
                <Icon name="arrow_forward" className="group-hover/btn:translate-x-1 transition-transform" />
              </a>
              <div className="hidden sm:flex gap-2">
                {[1,2,3,4].map(i => <span key={i} className="w-2 h-2 rounded-full bg-gold/60" />)}
              </div>
            </div>
          </div>

          {/* Dark feature card */}
          <div className="bg-charcoal text-offwhite rounded-3xl p-10 md:p-12 flex flex-col justify-between min-h-[420px] relative overflow-hidden">
            <div className="absolute -bottom-32 -right-20 w-72 h-72 rounded-full blur-3xl"
                 style={{ background: "radial-gradient(closest-side, rgba(244,182,82,0.35), transparent)" }} />
            <div className="relative z-10">
              <Icon name="insights" filled className="text-gold text-4xl mb-6" />
              <h3 className="font-display text-3xl md:text-4xl mb-4">{services[1].title}</h3>
              <p className="text-silver leading-relaxed">{services[1].body}</p>
            </div>
            <a href="#consult" className="relative z-10 mt-8 inline-flex items-center justify-center gap-2 bg-gold text-charcoal py-3.5 px-6 rounded-full font-semibold hover:brightness-105 transition">
              Request Sample Audit <Icon name="north_east" className="text-base" />
            </a>
          </div>

          {services.slice(2).map((s) => (
            <div key={s.title} className="glass-card rounded-3xl p-8 flex flex-col gap-4 hover:border-gold transition-colors group">
              <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center group-hover:bg-gold transition-colors">
                <Icon name={s.icon} className="text-charcoal" />
              </div>
              <h4 className="font-display text-2xl text-charcoal">{s.title}</h4>
              <p className="text-ink-soft text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Council() {
  const experts = [
    {
      name: "Dr. Alistair Thorne",
      role: "Vedic Strategy Lead",
      bio: "Three decades of corporate logistics fused with the precise geometry of Vastu Shastra — optimizing enterprise environments for natural flow and peak operational efficiency.",
      initials: "AT",
    },
    {
      name: "Elena Sterling",
      role: "Celestial Intelligence Officer",
      bio: "A master of Hellenistic astrology and modern psychometrics, bridging individual natal blueprints with professional leadership growth arcs.",
      initials: "ES",
    },
  ];
  return (
    <section id="council" className="py-32 bg-card/50">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16">
        <div className="mb-16 max-w-2xl">
          <span className="label-caps text-gold">The Strategic Council</span>
          <h2 className="font-display text-4xl md:text-6xl text-charcoal mt-4 mb-6">
            Counsel for those who <span className="italic">decide at scale.</span>
          </h2>
          <div className="gold-divider" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {experts.map((e) => (
            <div key={e.name} className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="w-56 h-72 rounded-3xl flex-shrink-0 relative overflow-hidden border border-border bg-gradient-to-br from-charcoal to-charcoal/80 flex items-center justify-center">
                <div className="absolute inset-0 opacity-30"
                     style={{ background: "radial-gradient(circle at 30% 30%, rgba(244,182,82,0.5), transparent 60%)" }} />
                <span className="relative font-display text-7xl text-gold">{e.initials}</span>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="label-caps text-offwhite/70 text-[10px]">Council</span>
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                </div>
              </div>
              <div className="pt-2">
                <h3 className="font-display text-3xl text-charcoal mb-2">{e.name}</h3>
                <p className="label-caps text-gold mb-4">{e.role}</p>
                <p className="text-ink-soft leading-relaxed">{e.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConsultForm() {
  return (
    <section id="consult" className="py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16">
        <div className="glass-card rounded-[36px] p-10 md:p-16 relative overflow-hidden">
          <div className="absolute -right-28 -top-28 w-96 h-96 rounded-full blur-3xl"
               style={{ background: "radial-gradient(closest-side, rgba(244,182,82,0.28), transparent)" }} />
          <div className="absolute -left-28 -bottom-28 w-96 h-96 rounded-full blur-3xl"
               style={{ background: "radial-gradient(closest-side, rgba(26,26,26,0.08), transparent)" }} />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="label-caps text-gold">Initiate</span>
              <h2 className="font-display text-4xl md:text-5xl text-charcoal mt-4 mb-6">
                Your Celestial Audit
              </h2>
              <p className="text-ink-soft text-lg leading-relaxed mb-8">
                Share your temporal and spatial coordinates to receive a complimentary high-level
                synthesis of your strategic alignment for the upcoming quarter.
              </p>
              <ul className="space-y-4">
                {[
                  "Personalized Transit Mapping",
                  "Core Elemental Balance",
                  "Strategic Decision Windows",
                  "Auspicious Timing Brief",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-3 text-charcoal">
                    <span className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                      <Icon name="check" className="text-gold text-base" />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Full Name" placeholder="Jane Doe" />
                <Field label="Email Address" placeholder="jane@enterprise.com" type="email" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Birth Date" type="date" />
                <Field label="Exact Birth Time" type="time" />
              </div>
              <Field label="Birth Location (City, Country)" placeholder="Mumbai, India" />
              <button
                type="submit"
                className="w-full bg-charcoal text-offwhite py-5 rounded-full font-semibold text-base hover:bg-charcoal/90 transition flex items-center justify-center gap-2 group"
              >
                Generate Strategic Blueprint
                <Icon name="auto_awesome" filled className="text-gold group-hover:rotate-12 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-2">
      <label className="label-caps text-[10px] text-ink-soft">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-border focus:border-gold py-3 outline-none transition-colors text-charcoal placeholder:text-ink-soft/50"
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-charcoal text-offwhite pt-20 pb-10 px-6 md:px-16">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full border border-gold flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-gold" />
              </span>
              <span className="font-display text-2xl">Elite<span className="text-gold">·</span>Vedic</span>
            </div>
            <p className="text-silver max-w-md leading-relaxed">
              Ancient wisdom. Modern strategy. Cosmic clarity for the executives, founders, and
              institutions shaping what comes next.
            </p>
          </div>
          <div>
            <p className="label-caps text-gold mb-4">Practice</p>
            <ul className="space-y-2 text-silver">
              <li><a href="#services" className="hover:text-gold transition">Services</a></li>
              <li><a href="#council" className="hover:text-gold transition">Council</a></li>
              <li><a href="#consult" className="hover:text-gold transition">Book a Consult</a></li>
            </ul>
          </div>
          <div>
            <p className="label-caps text-gold mb-4">Contact</p>
            <ul className="space-y-2 text-silver">
              <li>concierge@elitevedic.co</li>
              <li>+1 (212) 555 — 0888</li>
              <li>New York · Mumbai · London</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-offwhite/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-silver text-sm">© {new Date().getFullYear()} Elite Vedic Consulting. All rights reserved.</p>
          <div className="flex gap-3">
            {["share", "mail", "language"].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border border-offwhite/20 flex items-center justify-center hover:border-gold hover:text-gold transition cursor-pointer">
                <Icon name={i} className="text-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <Council />
        <ConsultForm />
      </main>
      <Footer />
    </div>
  );
}
