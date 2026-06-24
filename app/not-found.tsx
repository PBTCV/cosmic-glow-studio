import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-xl mx-auto text-center">
          <p className="label-caps text-[var(--gold)] mb-4">404</p>
          <h1 className="font-display text-4xl md:text-5xl mb-4">Page not found</h1>
          <p className="text-muted-foreground font-light mb-10 leading-relaxed">
            The page you requested is not available. Explore insights, meet our council, or return
            home.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="label-caps border border-[var(--gold)] text-[var(--gold)] px-6 py-3 hover:bg-[var(--gold)] hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/insights"
              className="label-caps border border-foreground/20 px-6 py-3 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
            >
              Insights
            </Link>
            <Link
              href="/#council"
              className="label-caps border border-foreground/20 px-6 py-3 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
            >
              Council
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
