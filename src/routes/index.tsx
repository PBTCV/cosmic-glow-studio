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

function Logo({ size = 40 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center border border-gold/40 bg-charcoal overflow-hidden"
      style={{ width: size, height: size }}
    >
      <img src={logoAsset.url} alt="Pradeep Ji — Elite Vedic" className="w-full h-full object-contain" />
    </span>
  );
}

function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-charcoal/70 border-b border-gold/10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <Logo size={40} />
          <span className="font-display text-2xl tracking-tight text-offwhite">
            Elite <span className="italic text-gold">Vedic</span>
          </span>
        </a>
        <div className="hidden md:flex items-center gap-10">
          {["Insights", "Services", "Council", "Method"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link label-caps text-silver hover:text-gold transition-colors">
              {l}
            </a>
          ))}
        </div>
        <a
          href="#consult"
          className="hidden md:inline-flex items-center gap-3 border border-silver/20 px-6 py-3 rounded-full label-caps text-offwhite hover:border-gold hover:text-gold transition-all group"
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
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="absolute w-[3px] h-[3px] rounded-full bg-gold/70 animate-sparkle"
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

function Hero() {
  return (
    <section id="top" className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* ambient gold glows */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(244,182,82,0.20), transparent)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(244,182,82,0.10), transparent)" }}
      />
      <Sparkles />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
        {/* Left — editorial */}
        <div className="flex flex-col gap-8 z-10">
          <div className="flex items-center gap-4 text-gold">
            <span className="w-10 h-px bg-gold" />
            <span className="label-caps">Legacy Wisdom · Modern Leaders</span>
          </div>
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-offwhite leading-[0.92]">
            Unlock Your <br />
            <span className="italic text-gold">Cosmic</span> Potential
          </h1>
          <p className="text-silver/80 text-lg leading-relaxed max-w-md font-light">
            Navigating the intersection of timeless Vedic principles and contemporary
            strategic excellence — counsel for the elite visionary.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 mt-2">
            <a
              href="#consult"
              className="btn-sweep inline-flex items-center justify-center gap-3 border border-gold text-gold hover:text-charcoal px-8 py-4 label-caps transition-colors"
            >
              Begin Your Audit
              <Icon name="arrow_forward" className="text-base" />
            </a>
            <a
              href="#method"
              className="inline-flex items-center justify-center gap-3 text-offwhite hover:text-gold px-2 py-4 label-caps border-b border-gold/30 hover:border-gold transition-colors"
            >
              Our Method
            </a>
          </div>
        </div>

        {/* Right — orbital medallion */}
        <div className="relative h-[560px] md:h-[640px] flex items-center justify-center">
          <div className="orbital-path w-[320px] h-[320px] animate-orbit-slow" />
          <div className="orbital-path w-[480px] h-[480px] animate-orbit-reverse" />
          <div className="orbital-path w-[640px] h-[640px] opacity-50" />

          {/* central medallion */}
          <div className="relative z-10 animate-float">
            <span className="absolute inset-0 rounded-full animate-gold-pulse" />
            <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-full bg-charcoal border border-gold/40 flex items-center justify-center shadow-[0_30px_80px_-10px_rgba(244,182,82,0.4)] overflow-hidden">
              <img
                src={logoAsset.url}
                alt="Elite Vedic logo"
                className="w-[88%] h-[88%] object-contain"
              />
            </div>
          </div>

          {orbitalNodes.map((n) => (
            <div key={n.label} className={`absolute ${n.pos} group cursor-pointer text-center`}>
              <div className="w-12 h-12 rounded-full border border-silver/20 bg-charcoal/80 backdrop-blur flex items-center justify-center mb-2 transition-all duration-500 group-hover:scale-110 group-hover:border-gold group-hover:shadow-[0_0_24px_rgba(244,182,82,0.45)]">
                <Icon name={n.icon} className="text-silver group-hover:text-gold transition-colors text-[20px]" />
              </div>
              <span className="label-caps text-silver/60 group-hover:text-gold transition-colors text-[9px]">
                {n.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* corner mark */}
      <div className="absolute bottom-8 left-8 hidden md:flex flex-col gap-2">
        <div className="w-12 hairline" />
        <div className="label-caps text-silver/40 text-[9px]">Ref. 01.002 // SV-24</div>
      </div>
    </section>
  );
}

function TrustBar() {
  const marks = ["FINANCIAL TIMES", "FORBES EXECUTIVE", "WIRED", "TECHCRUNCH", "ECONOMIC REVIEW"];
  return (
    <section className="py-12 border-y border-gold/10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-8">
        <span className="label-caps text-gold/70 shrink-0">As Featured In</span>
        <div className="flex-1 flex flex-wrap justify-around items-center gap-x-10 gap-y-4 opacity-70">
          {marks.map((m, i) => (
            <span key={m} className="font-display italic text-silver text-lg md:text-xl flex items-center gap-10">
              {m}
              {i < marks.length - 1 && <span className="hidden md:inline-block w-px h-4 bg-gold/30" />}
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
      <span className="font-display italic text-gold text-2xl">{num}</span>
      <span className="hairline w-12" />
      <span className="label-caps text-gold">{label}</span>
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
            <h2 className="font-display text-5xl md:text-6xl text-offwhite leading-[0.95]">
              Four pillars. <br />
              <span className="italic text-gold">One framework.</span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex items-end">
            <p className="text-silver/80 leading-relaxed text-lg font-light">
              Each engagement weaves astrology, Vastu, timing, and strategy into a single
              operating system — calibrated for leaders who treat clarity as capital.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gold/10 border border-gold/10">
          {services.map((s, i) => (
            <div
              key={s.title}
              className="group relative bg-charcoal p-10 flex flex-col gap-6 min-h-[300px] transition-all duration-500 hover:bg-[#1f1f1f]"
            >
              <div className="flex items-start justify-between">
                <Icon name={s.icon} className="text-gold text-[32px] transition-transform duration-500 group-hover:scale-110" />
                <span className="font-display italic text-gold/40 text-xl">0{i + 1}</span>
              </div>
              <h3 className="font-display text-3xl text-offwhite leading-tight">{s.title}</h3>
              <p className="text-silver/70 text-sm leading-relaxed flex-1 font-light">{s.body}</p>
              <div className="flex items-center gap-2 text-gold opacity-0 group-hover:opacity-100 transition-opacity">
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
      featured: true,
    },
    {
      name: "Elena Sterling",
      role: "Celestial Intelligence Officer",
      bio: "A master of Hellenistic astrology and modern psychometrics, bridging individual natal blueprints with professional leadership growth arcs.",
      initials: "ES",
      featured: false,
    },
  ];
  return (
    <section id="council" className="py-32 border-t border-gold/10">
      <div ref={ref} className="reveal max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="max-w-2xl mb-20">
          <SectionLabel num="02" label="The Strategic Council" />
          <h2 className="font-display text-5xl md:text-6xl text-offwhite leading-[0.95]">
            Counsel for those who <span className="italic text-gold">decide at scale.</span>
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-12">
          {/* Featured */}
          <div className="col-span-12 lg:col-span-7">
            <div className="relative h-[520px] rounded-sm overflow-hidden border border-gold/20 bg-gradient-to-br from-[#222] to-charcoal">
              <div
                className="absolute inset-0 opacity-40"
                style={{ background: "radial-gradient(circle at 30% 30%, rgba(244,182,82,0.4), transparent 60%)" }}
              />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display italic text-gold/90 text-[12rem] leading-none">
                {experts[0].initials}
              </span>
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="label-caps text-gold/80 text-[10px]">Council · Featured</span>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-charcoal to-transparent">
                <h3 className="font-display text-4xl text-offwhite mb-2">{experts[0].name}</h3>
                <p className="label-caps text-gold mb-3">{experts[0].role}</p>
                <p className="text-silver/80 max-w-lg leading-relaxed font-light">{experts[0].bio}</p>
              </div>
            </div>
          </div>

          {/* Side stack */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
            <div className="border border-gold/15 p-8 hover:border-gold/40 transition-colors">
              <span className="font-display italic text-gold text-6xl">{experts[1].initials}</span>
              <h3 className="font-display text-3xl text-offwhite mt-4 mb-2">{experts[1].name}</h3>
              <p className="label-caps text-gold mb-3">{experts[1].role}</p>
              <p className="text-silver/70 leading-relaxed font-light text-sm">{experts[1].bio}</p>
            </div>
            <div className="border border-gold/15 p-8">
              <p className="label-caps text-gold/70 mb-6">Credentials</p>
              <ul className="space-y-4">
                {[
                  { k: "Years of Practice", v: "30+" },
                  { k: "Enterprise Clients", v: "120+" },
                  { k: "Global Council Members", v: "12" },
                ].map((c) => (
                  <li key={c.k} className="flex items-baseline justify-between border-b border-gold/10 pb-3">
                    <span className="text-silver/80 text-sm">{c.k}</span>
                    <span className="font-display italic text-gold text-3xl">{c.v}</span>
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

function ConsultForm() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="consult" className="py-32 border-t border-gold/10">
      <div ref={ref} className="reveal max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-5">
            <SectionLabel num="03" label="Initiate" />
            <h2 className="font-display text-5xl md:text-6xl text-offwhite mb-8 leading-[0.95]">
              Your <span className="italic text-gold">Celestial</span> Audit
            </h2>
            <p className="text-silver/80 text-lg leading-relaxed mb-10 font-light max-w-md">
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
                <li key={b} className="flex items-baseline gap-5 border-b border-gold/10 pb-4">
                  <span className="font-display italic text-gold/60 text-sm">0{i + 1}</span>
                  <span className="text-offwhite font-light">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 lg:col-span-7">
            <form
              className="glass-card p-10 md:p-12 space-y-8 relative overflow-hidden"
              onSubmit={(e) => e.preventDefault()}
            >
              <div
                className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(closest-side, rgba(244,182,82,0.18), transparent)" }}
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
                <label className="label-caps text-silver/60 text-[10px]">Intention</label>
                <textarea
                  rows={3}
                  placeholder="Describe the decision or season you are navigating…"
                  className="mt-2 w-full bg-transparent border-b border-gold/20 focus:border-gold py-3 outline-none transition-colors text-offwhite placeholder:text-silver/30 resize-none"
                />
              </div>
              <button
                type="submit"
                className="btn-sweep relative w-full border border-gold text-gold hover:text-charcoal py-5 label-caps transition-colors flex items-center justify-center gap-3 group"
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

function Field({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-2">
      <label className="label-caps text-silver/60 text-[10px]">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-gold/20 focus:border-gold py-3 outline-none transition-colors text-offwhite placeholder:text-silver/30"
      />
    </div>
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
    <section id="method" className="py-32 border-t border-gold/10">
      <div ref={ref} className="reveal max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="mb-16">
          <SectionLabel num="04" label="The Method" />
          <h2 className="font-display text-5xl md:text-6xl text-offwhite max-w-3xl leading-[0.95]">
            Three movements, <span className="italic text-gold">one cosmic arc.</span>
          </h2>
        </div>
        <div className="space-y-px bg-gold/10">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`bg-charcoal grid grid-cols-12 gap-8 p-10 group hover:bg-[#1f1f1f] transition-colors ${
                i % 2 === 1 ? "lg:pl-32" : ""
              }`}
            >
              <div className="col-span-12 lg:col-span-2">
                <span className="font-display italic text-gold text-7xl">{s.n}</span>
              </div>
              <div className="col-span-12 lg:col-span-4">
                <h3 className="font-display text-4xl text-offwhite">{s.t}</h3>
              </div>
              <div className="col-span-12 lg:col-span-6">
                <p className="text-silver/80 leading-relaxed font-light text-lg">{s.body}</p>
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
    <footer className="pt-24 pb-10 px-6 md:px-12 border-t border-gold/15">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <Logo size={40} />
              <span className="font-display text-2xl text-offwhite">
                Elite <span className="italic text-gold">Vedic</span>
              </span>
            </div>
            <p className="text-silver/70 max-w-md leading-relaxed font-light">
              Ancient wisdom. Modern strategy. Cosmic clarity for the executives, founders,
              and institutions shaping what comes next.
            </p>
          </div>
          <div>
            <p className="label-caps text-gold mb-5">Practice</p>
            <ul className="space-y-3 text-silver/80 font-light">
              <li><a href="#services" className="hover:text-gold transition">Services</a></li>
              <li><a href="#council" className="hover:text-gold transition">Council</a></li>
              <li><a href="#method" className="hover:text-gold transition">Method</a></li>
              <li><a href="#consult" className="hover:text-gold transition">Book a Consult</a></li>
            </ul>
          </div>
          <div>
            <p className="label-caps text-gold mb-5">Contact</p>
            <ul className="space-y-3 text-silver/80 font-light">
              <li>concierge@elitevedic.co</li>
              <li>+1 (212) 555 — 0888</li>
              <li>New York · Mumbai · London</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gold/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-silver/50 text-sm font-light">
            © {new Date().getFullYear()} Elite Vedic Consulting. All rights reserved.
          </p>
          <div className="flex gap-3">
            {["share", "mail", "language"].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border border-silver/15 flex items-center justify-center hover:border-gold hover:text-gold text-silver transition cursor-pointer"
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
    <div className="min-h-screen bg-charcoal text-offwhite">
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
