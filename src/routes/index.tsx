import { createFileRoute } from "@tanstack/react-router";
import logoAsset from "@/assets/pradeepji.svg.asset.json";
import { useReveal } from "@/hooks/use-reveal";

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

function NavLogo({ size = 40 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center border border-[var(--gold)]/40 bg-[var(--charcoal)] overflow-hidden rounded-sm"
      style={{ width: size, height: size }}
    >
      <img src={logoAsset.url} alt="Pradeep Ji — Elite Vedic" className="w-full h-full object-contain" />
    </span>
  );
}

function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[var(--background)]/85 border-b border-[var(--gold)]/15">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <NavLogo size={40} />
          <span className="font-display text-2xl tracking-tight text-foreground">
            Elite <span className="italic text-[var(--gold)]">Vedic</span>
          </span>
        </a>
        <div className="hidden md:flex items-center gap-10">
          {["Insights", "Services", "Council", "Method"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link label-caps text-muted-foreground hover:text-[var(--gold)] transition-colors">
              {l}
            </a>
          ))}
        </div>
        <a
          href="#consult"
          className="hidden md:inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 rounded-full label-caps text-foreground hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all group"
        >
          Book Consult
          <Icon name="arrow_forward" className="text-base group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </nav>
  );
}

const orbitalNodes = [
  { label: "Astrology", icon: "star", pos: "top-[6%] left-[18%]" },
  { label: "Vastu", icon: "temple_hindu", pos: "top-[-2%] left-1/2 -translate-x-1/2" },
  { label: "Career", icon: "work_history", pos: "top-[6%] right-[12%]" },
  { label: "Wealth", icon: "diamond", pos: "top-[46%] right-[-2%]" },
  { label: "Relations", icon: "favorite", pos: "bottom-[12%] right-[14%]" },
  { label: "Muhurta", icon: "schedule", pos: "bottom-[0%] left-1/2 -translate-x-1/2" },
  { label: "Remedies", icon: "spa", pos: "bottom-[12%] left-[14%]" },
  { label: "Karma", icon: "all_inclusive", pos: "top-[46%] left-[-2%]" },
];

function Sparkles() {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className="absolute w-[3px] h-[3px] rounded-full bg-[var(--gold)]/70 animate-sparkle"
          style={{
            left: `${(i * 73) % 100}%`,
            bottom: `${(i * 37) % 60}%`,
            animationDelay: `${(i * 0.5) % 6}s`,
            animationDuration: `${5 + (i % 4)}s`,
          }}
        />
      ))}
    </div>
  );
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;

/* Celestial compass mark — replaces the logo in the medallion */
function CelestialMark() {
  const points = Array.from({ length: 12 });
  return (
    <svg viewBox="0 0 240 240" className="w-[88%] h-[88%]" aria-hidden>
      <defs>
        <radialGradient id="discGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f8efd8" />
          <stop offset="70%" stopColor="#faf6ee" />
          <stop offset="100%" stopColor="#f0e6d0" />
        </radialGradient>
        <linearGradient id="starGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8b85a" />
          <stop offset="50%" stopColor="#c8973d" />
          <stop offset="100%" stopColor="#8a6520" />
        </linearGradient>
      </defs>

      <circle cx="120" cy="120" r="118" fill="url(#discGlow)" />
      <circle cx="120" cy="120" r="116" fill="none" stroke="#c8973d" strokeOpacity="0.35" strokeWidth="0.6" />
      <circle cx="120" cy="120" r="100" fill="none" stroke="#c8973d" strokeOpacity="0.25" strokeWidth="0.5" />

      {points.map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = r3(120 + Math.cos(a) * 92);
        const y = r3(120 + Math.sin(a) * 92);
        return <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.4 : 1.4} fill="#c8973d" />;
      })}

      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const x1 = r3(120 + Math.cos(a) * 80);
        const y1 = r3(120 + Math.sin(a) * 80);
        const x2 = r3(120 + Math.cos(a) * (i % 2 === 0 ? 74 : 77));
        const y2 = r3(120 + Math.sin(a) * (i % 2 === 0 ? 74 : 77));
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c8973d" strokeOpacity={i % 2 === 0 ? 0.6 : 0.25} strokeWidth="0.6" />;
      })}

      <g transform="translate(120 120)">
        <polygon points="0,-66 10,-10 66,0 10,10 0,66 -10,10 -66,0 -10,-10" fill="url(#starGold)" stroke="#8a6520" strokeWidth="0.6" />
        <polygon points="0,-44 7,-7 44,0 7,7 0,44 -7,7 -44,0 -7,-7" transform="rotate(45)" fill="#e8b85a" opacity="0.85" />
        <circle r="6" fill="#faf6ee" stroke="#8a6520" strokeWidth="0.8" />
        <circle r="2" fill="#c8973d" />
      </g>
    </svg>
  );
}

function Hero() {
  return (
    <section id="top" className="relative min-h-screen pt-32 pb-24 overflow-hidden paper-vignette">
      {/* ambient gold glows */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(244,182,82,0.28), transparent)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(200,151,61,0.18), transparent)" }}
      />
      <Sparkles />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
        {/* Left — editorial */}
        <div className="flex flex-col gap-8 z-10">
          <div className="flex items-center gap-4 text-[var(--gold)]">
            <span className="w-10 h-px bg-[var(--gold)]" />
            <span className="label-caps">Legacy Wisdom · Modern Leaders</span>
          </div>
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-foreground leading-[0.92]">
            Unlock Your <br />
            <span className="italic text-[var(--gold)]">Cosmic</span> Potential
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md font-light">
            Navigating the intersection of timeless Vedic principles and contemporary
            strategic excellence — counsel for the elite visionary.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 mt-2">
            <a
              href="#consult"
              className="btn-sweep inline-flex items-center justify-center gap-3 border border-[var(--gold)] text-[var(--gold)] hover:text-white px-8 py-4 label-caps transition-colors"
            >
              Begin Your Audit
              <Icon name="arrow_forward" className="text-base" />
            </a>
            <a
              href="#method"
              className="inline-flex items-center justify-center gap-3 text-foreground hover:text-[var(--gold)] px-2 py-4 label-caps border-b border-[var(--gold)]/40 hover:border-[var(--gold)] transition-colors"
            >
              Our Method
            </a>
          </div>
        </div>

        {/* Right — orbital medallion */}
        <div className="relative h-[560px] md:h-[640px] flex items-center justify-center">
          <div className="orbital-path w-[320px] h-[320px] animate-orbit-slow" />
          <div className="orbital-path w-[480px] h-[480px] animate-orbit-reverse" />
          <div className="orbital-path w-[640px] h-[640px] opacity-60" />

          {/* central medallion — celestial compass mark */}
          <div className="relative z-10 animate-float">
            <span className="absolute inset-0 rounded-full animate-gold-pulse" />
            <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-full bg-[var(--cream)] border border-[var(--gold)]/50 flex items-center justify-center shadow-[0_30px_80px_-10px_rgba(200,151,61,0.45)] overflow-hidden">
              {/* slow rotating compass face */}
              <span className="absolute inset-0 animate-spin-slower">
                <CelestialMark />
              </span>
              {/* static center sigil overlay (counter-rotated star feel via second layer) */}
            </div>
          </div>

          {orbitalNodes.map((n) => (
            <div key={n.label} className={`absolute ${n.pos} group cursor-pointer text-center`}>
              <div className="w-12 h-12 rounded-full border border-[var(--gold)]/30 bg-white/80 backdrop-blur flex items-center justify-center mb-2 transition-all duration-500 group-hover:scale-110 group-hover:border-[var(--gold)] group-hover:shadow-[0_0_24px_rgba(200,151,61,0.45)]">
                <Icon name={n.icon} className="text-[var(--gold)] group-hover:scale-110 transition-transform text-[20px]" />
              </div>
              <span className="label-caps text-muted-foreground group-hover:text-[var(--gold)] transition-colors text-[9px]">
                {n.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* corner mark */}
      <div className="absolute bottom-8 left-8 hidden md:flex flex-col gap-2">
        <div className="w-12 hairline" />
        <div className="label-caps text-muted-foreground/70 text-[9px]">Ref. 01.002 // SV-24</div>
      </div>
    </section>
  );
}

function TrustBar() {
  const marks = ["FINANCIAL TIMES", "FORBES EXECUTIVE", "WIRED", "TECHCRUNCH", "ECONOMIC REVIEW"];
  return (
    <section className="py-12 border-y border-[var(--gold)]/15 bg-[var(--cream)]/50">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-8">
        <span className="label-caps text-[var(--gold)] shrink-0">As Featured In</span>
        <div className="flex-1 flex flex-wrap justify-around items-center gap-x-10 gap-y-4 opacity-80">
          {marks.map((m, i) => (
            <span key={m} className="font-display italic text-muted-foreground text-lg md:text-xl flex items-center gap-10">
              {m}
              {i < marks.length - 1 && <span className="hidden md:inline-block w-px h-4 bg-[var(--gold)]/30" />}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="font-display italic text-[var(--gold)] text-2xl">{num}</span>
      <span className="hairline w-12" />
      <span className="label-caps text-[var(--gold)]">{label}</span>
    </div>
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
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="services" className="py-32">
      <div ref={ref} className="reveal max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-12 gap-10 mb-16">
          <div className="col-span-12 lg:col-span-5">
            <SectionLabel num="01" label="Integrated Wisdom Streams" />
            <h2 className="font-display text-5xl md:text-6xl text-foreground leading-[0.95]">
              Four pillars. <br />
              <span className="italic text-[var(--gold)]">One framework.</span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex items-end">
            <p className="text-muted-foreground leading-relaxed text-lg font-light">
              Each engagement weaves astrology, Vastu, timing, and strategy into a single
              operating system — calibrated for leaders who treat clarity as capital.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--gold)]/15 border border-[var(--gold)]/15">
          {services.map((s, i) => (
            <div
              key={s.title}
              className="group relative bg-card p-10 flex flex-col gap-6 min-h-[300px] transition-all duration-500 hover:bg-[var(--cream)]"
            >
              <div className="flex items-start justify-between">
                <Icon name={s.icon} className="text-[var(--gold)] text-[32px] transition-transform duration-500 group-hover:scale-110" />
                <span className="font-display italic text-[var(--gold)]/50 text-xl">0{i + 1}</span>
              </div>
              <h3 className="font-display text-3xl text-foreground leading-tight">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 font-light">{s.body}</p>
              <div className="flex items-center gap-2 text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="label-caps text-[10px]">Inquire</span>
                <Icon name="arrow_forward" className="text-base" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Council() {
  const ref = useReveal<HTMLDivElement>();
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
    <section id="council" className="py-32 border-t border-[var(--gold)]/15 bg-[var(--cream)]/40">
      <div ref={ref} className="reveal max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="max-w-2xl mb-20">
          <SectionLabel num="02" label="The Strategic Council" />
          <h2 className="font-display text-5xl md:text-6xl text-foreground leading-[0.95]">
            Counsel for those who <span className="italic text-[var(--gold)]">decide at scale.</span>
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-12">
          {/* Featured */}
          <div className="col-span-12 lg:col-span-7">
            <div className="relative h-[520px] rounded-sm overflow-hidden border border-[var(--gold)]/30 bg-gradient-to-br from-white to-[var(--cream)] shadow-[0_30px_70px_-30px_rgba(26,26,26,0.20)]">
              <div
                className="absolute inset-0 opacity-60"
                style={{ background: "radial-gradient(circle at 30% 30%, rgba(200,151,61,0.30), transparent 60%)" }}
              />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display italic text-[var(--gold)]/70 text-[12rem] leading-none">
                {experts[0].initials}
              </span>
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse" />
                <span className="label-caps text-[var(--gold)] text-[10px]">Council · Featured</span>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-white via-white/90 to-transparent">
                <h3 className="font-display text-4xl text-foreground mb-2">{experts[0].name}</h3>
                <p className="label-caps text-[var(--gold)] mb-3">{experts[0].role}</p>
                <p className="text-muted-foreground max-w-lg leading-relaxed font-light">{experts[0].bio}</p>
              </div>
            </div>
          </div>

          {/* Side stack */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
            <div className="bg-card border border-[var(--gold)]/20 p-8 hover:border-[var(--gold)]/60 transition-colors">
              <span className="font-display italic text-[var(--gold)] text-6xl">{experts[1].initials}</span>
              <h3 className="font-display text-3xl text-foreground mt-4 mb-2">{experts[1].name}</h3>
              <p className="label-caps text-[var(--gold)] mb-3">{experts[1].role}</p>
              <p className="text-muted-foreground leading-relaxed font-light text-sm">{experts[1].bio}</p>
            </div>
            <div className="bg-card border border-[var(--gold)]/20 p-8">
              <p className="label-caps text-[var(--gold)] mb-6">Credentials</p>
              <ul className="space-y-4">
                {[
                  { k: "Years of Practice", v: "30+" },
                  { k: "Enterprise Clients", v: "120+" },
                  { k: "Global Council Members", v: "12" },
                ].map((c) => (
                  <li key={c.k} className="flex items-baseline justify-between border-b border-[var(--gold)]/15 pb-3">
                    <span className="text-muted-foreground text-sm">{c.k}</span>
                    <span className="font-display italic text-[var(--gold)] text-3xl">{c.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-2">
      <label className="label-caps text-muted-foreground text-[10px]">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-[var(--gold)]/30 focus:border-[var(--gold)] py-3 outline-none transition-colors text-foreground placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

function ConsultForm() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="consult" className="py-32 border-t border-[var(--gold)]/15">
      <div ref={ref} className="reveal max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-5">
            <SectionLabel num="03" label="Initiate" />
            <h2 className="font-display text-5xl md:text-6xl text-foreground mb-8 leading-[0.95]">
              Your <span className="italic text-[var(--gold)]">Celestial</span> Audit
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10 font-light max-w-md">
              Share your temporal and spatial coordinates to receive a complimentary
              high-level synthesis of your strategic alignment for the upcoming quarter.
            </p>
            <ul className="space-y-5">
              {[
                "Personalized Transit Mapping",
                "Core Elemental Balance",
                "Strategic Decision Windows",
                "Auspicious Timing Brief",
              ].map((b, i) => (
                <li key={b} className="flex items-baseline gap-5 border-b border-[var(--gold)]/15 pb-4">
                  <span className="font-display italic text-[var(--gold)] text-sm">0{i + 1}</span>
                  <span className="text-foreground font-light">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 lg:col-span-7">
            <form
              className="glass-card p-10 md:p-12 space-y-8 relative overflow-hidden rounded-sm"
              onSubmit={(e) => e.preventDefault()}
            >
              <div
                className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(closest-side, rgba(244,182,82,0.25), transparent)" }}
              />
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8">
                <Field label="Full Name" placeholder="Jane Doe" />
                <Field label="Email Address" placeholder="jane@enterprise.com" type="email" />
              </div>
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8">
                <Field label="Birth Date" type="date" />
                <Field label="Exact Birth Time" type="time" />
              </div>
              <div className="relative">
                <Field label="Birth Location (City, Country)" placeholder="Mumbai, India" />
              </div>
              <div className="relative">
                <label className="label-caps text-muted-foreground text-[10px]">Intention</label>
                <textarea
                  rows={3}
                  placeholder="Describe the decision or season you are navigating…"
                  className="mt-2 w-full bg-transparent border-b border-[var(--gold)]/30 focus:border-[var(--gold)] py-3 outline-none transition-colors text-foreground placeholder:text-muted-foreground/50 resize-none"
                />
              </div>
              <button
                type="submit"
                className="btn-sweep relative w-full border border-[var(--gold)] text-[var(--gold)] hover:text-white py-5 label-caps transition-colors flex items-center justify-center gap-3 group"
              >
                Generate Strategic Blueprint
                <Icon name="auto_awesome" filled className="text-base group-hover:rotate-12 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Method() {
  const ref = useReveal<HTMLDivElement>();
  const steps = [
    { n: "I", t: "Observe", body: "We map your natal chart, enterprise charter, and physical environment against current planetary positions." },
    { n: "II", t: "Interpret", body: "Council members synthesize ancient texts with contemporary leadership data to surface latent leverage." },
    { n: "III", t: "Implement", body: "You receive a sequenced playbook — decisions, timings, and remedies — ready for executive action." },
  ];
  return (
    <section id="method" className="py-32 border-t border-[var(--gold)]/15 bg-[var(--cream)]/40">
      <div ref={ref} className="reveal max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="mb-16">
          <SectionLabel num="04" label="The Method" />
          <h2 className="font-display text-5xl md:text-6xl text-foreground max-w-3xl leading-[0.95]">
            Three movements, <span className="italic text-[var(--gold)]">one cosmic arc.</span>
          </h2>
        </div>
        <div className="space-y-px bg-[var(--gold)]/15">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`bg-card grid grid-cols-12 gap-8 p-10 group hover:bg-[var(--cream)] transition-colors ${
                i % 2 === 1 ? "lg:pl-32" : ""
              }`}
            >
              <div className="col-span-12 lg:col-span-2">
                <span className="font-display italic text-[var(--gold)] text-7xl">{s.n}</span>
              </div>
              <div className="col-span-12 lg:col-span-4">
                <h3 className="font-display text-4xl text-foreground">{s.t}</h3>
              </div>
              <div className="col-span-12 lg:col-span-6">
                <p className="text-muted-foreground leading-relaxed font-light text-lg">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="pt-24 pb-10 px-6 md:px-12 bg-[var(--charcoal)] text-[var(--offwhite)]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <NavLogo size={40} />
              <span className="font-display text-2xl text-[var(--offwhite)]">
                Elite <span className="italic text-[var(--gold-bright)]">Vedic</span>
              </span>
            </div>
            <p className="text-[var(--silver)]/80 max-w-md leading-relaxed font-light">
              Ancient wisdom. Modern strategy. Cosmic clarity for the executives, founders,
              and institutions shaping what comes next.
            </p>
          </div>
          <div>
            <p className="label-caps text-[var(--gold-bright)] mb-5">Practice</p>
            <ul className="space-y-3 text-[var(--silver)]/80 font-light">
              <li><a href="#services" className="hover:text-[var(--gold-bright)] transition">Services</a></li>
              <li><a href="#council" className="hover:text-[var(--gold-bright)] transition">Council</a></li>
              <li><a href="#method" className="hover:text-[var(--gold-bright)] transition">Method</a></li>
              <li><a href="#consult" className="hover:text-[var(--gold-bright)] transition">Book a Consult</a></li>
            </ul>
          </div>
          <div>
            <p className="label-caps text-[var(--gold-bright)] mb-5">Contact</p>
            <ul className="space-y-3 text-[var(--silver)]/80 font-light">
              <li>concierge@elitevedic.co</li>
              <li>+1 (212) 555 — 0888</li>
              <li>New York · Mumbai · London</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--gold-bright)]/15 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[var(--silver)]/50 text-sm font-light">
            © {new Date().getFullYear()} Elite Vedic Consulting. All rights reserved.
          </p>
          <div className="flex gap-3">
            {["share", "mail", "language"].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border border-[var(--silver)]/20 flex items-center justify-center hover:border-[var(--gold-bright)] hover:text-[var(--gold-bright)] text-[var(--silver)] transition cursor-pointer"
              >
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
        <Method />
      </main>
      <Footer />
    </div>
  );
}
