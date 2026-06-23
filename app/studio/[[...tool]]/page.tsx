"use client";

import Link from "next/link";
import { NextStudio } from "next-sanity/studio";
import config from "@/sanity/studio-config";
import { isSanityConfigured } from "@/sanity/env";

function StudioSetup() {
  return (
    <div className="min-h-screen bg-[var(--charcoal)] text-[var(--offwhite)] flex items-center justify-center p-8">
      <div className="max-w-lg text-center space-y-4">
        <h1 className="font-display text-3xl">Sanity Studio setup</h1>
        <p className="text-[var(--silver)]/80 font-light leading-relaxed">
          Add your Sanity project credentials to <code className="text-[var(--gold)]">.env</code>{" "}
          and restart the dev server:
        </p>
        <pre className="text-left text-sm bg-black/30 border border-[var(--gold)]/20 p-4 rounded-sm overflow-x-auto">
          {`NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production`}
        </pre>
        <p className="text-sm text-[var(--silver)]/60">
          Create a project at{" "}
          <a
            href="https://www.sanity.io/manage"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--gold)] hover:underline"
          >
            sanity.io/manage
          </a>
          , then run <code className="text-[var(--gold)]">npm run studio</code> or reload{" "}
          <code className="text-[var(--gold)]">/studio</code>.
        </p>
        <Link href="/" className="inline-block text-sm text-[var(--gold)] hover:underline">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}

export default function StudioPage() {
  if (!isSanityConfigured()) {
    return <StudioSetup />;
  }

  return <NextStudio config={config} />;
}
