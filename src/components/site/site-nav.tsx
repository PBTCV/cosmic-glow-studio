import Link from "next/link";
import { LOGO_SRC } from "@/lib/logo";

const CHOOSE_ASTROLOGER = "/#council";

const Icon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
  >
    {name}
  </span>
);

export function NavLogo({ size = 40 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center border border-[var(--gold)]/40 bg-[var(--charcoal)] overflow-hidden rounded-sm"
      style={{ width: size, height: size }}
    >
      <img src={LOGO_SRC} alt="Pradeep Ji" className="w-full h-full object-contain" />
    </span>
  );
}

type SiteNavProps = {
  variant?: "home" | "default";
};

const navItems = [
  { label: "Insights", href: "/insights", isRoute: true },
  { label: "Services", hash: "services" },
  { label: "Council", hash: "council" },
  { label: "Method", hash: "method" },
] as const;

export function SiteNav({ variant = "default" }: SiteNavProps) {
  const logoHref = variant === "home" ? "#top" : "/";

  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[var(--background)]/85 border-b border-[var(--gold)]/15">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        {variant === "home" ? (
          <a href={logoHref} className="flex items-center gap-3">
            <NavLogo size={40} />
          </a>
        ) : (
          <Link href={logoHref} className="flex items-center gap-3">
            <NavLogo size={40} />
          </Link>
        )}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => {
            if ("isRoute" in item && item.isRoute) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="nav-link label-caps text-muted-foreground hover:text-[var(--gold)] transition-colors"
                >
                  {item.label}
                </Link>
              );
            }
            if ("hash" in item) {
              const href = variant === "home" ? `#${item.hash}` : `/#${item.hash}`;
              return (
                <a
                  key={item.label}
                  href={href}
                  className="nav-link label-caps text-muted-foreground hover:text-[var(--gold)] transition-colors"
                >
                  {item.label}
                </a>
              );
            }
            return null;
          })}
        </div>
        <Link
          href={CHOOSE_ASTROLOGER}
          className="hidden md:inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 rounded-full label-caps text-foreground hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all group"
        >
          Choose Astrologer
          <Icon
            name="arrow_forward"
            className="text-base group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </nav>
  );
}
