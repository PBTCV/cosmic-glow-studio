import Link from "next/link";
import { NavLogo } from "./site-nav";

const CHOOSE_ASTROLOGER = "/#council";

export function SiteFooter() {
  return (
    <footer className="pt-24 pb-10 px-6 md:px-12 bg-[var(--charcoal)] text-[var(--offwhite)]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <NavLogo size={40} />
              <span className="font-display text-xl md:text-2xl text-[var(--offwhite)] leading-tight">
                Pradeep Bhanot&apos;s{" "}
                <span className="italic text-[var(--gold-bright)]">The Cosmic Voice</span>
              </span>
            </div>
            <p className="text-[var(--silver)]/80 max-w-md leading-relaxed font-light">
              Ancient wisdom. Modern strategy. Cosmic clarity for the executives, founders, and
              institutions shaping what comes next.
            </p>
          </div>
          <div>
            <p className="label-caps text-[var(--gold-bright)] mb-5">Practice</p>
            <ul className="space-y-3 text-[var(--silver)]/80 font-light">
              <li>
                <Link href="/insights" className="hover:text-[var(--gold-bright)] transition">
                  Insights
                </Link>
              </li>
              <li>
                <a href="/#services" className="hover:text-[var(--gold-bright)] transition">
                  Services
                </a>
              </li>
              <li>
                <a href="/#council" className="hover:text-[var(--gold-bright)] transition">
                  Council
                </a>
              </li>
              <li>
                <a href="/#method" className="hover:text-[var(--gold-bright)] transition">
                  Method
                </a>
              </li>
              <li>
                <Link
                  href={CHOOSE_ASTROLOGER}
                  className="hover:text-[var(--gold-bright)] transition"
                >
                  Choose Astrologer
                </Link>
              </li>
              <li>
                <a href="/#consult" className="hover:text-[var(--gold-bright)] transition">
                  Book a Consult
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="label-caps text-[var(--gold-bright)] mb-5">Contact</p>
            <ul className="space-y-3 text-[var(--silver)]/80 font-light">
              <li>Pradeepbhanot@gmail.com</li>
              <li>+91 78889 33521</li>
              <li>Panchkula, Haryana, India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--gold-bright)]/15 pt-8 flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-[var(--silver)]/50 text-sm font-light">
            © {new Date().getFullYear()} Pradeep Bhanot&apos;s The Cosmic Voice. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
