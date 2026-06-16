# Elite Vedic — Editorial Orbit Redesign

Build the landing page in the chosen Noir & Gold / Cormorant + Karla / asymmetric editorial direction, anchored by the uploaded `pradeepji.svg` logo.

## Brand & assets
- Upload `pradeepji.svg` via `lovable-assets` → `src/assets/pradeepji.svg.asset.json`. Use it as the nav mark and as the centerpiece of the hero orbit medallion (replace generic gold dot/star).
- Swap fonts: load **Cormorant Garamond** (headings, with italic) + **Karla** (body) in `__root.tsx` via `<link>` tags (drop EB Garamond/Hanken). Update `--font-display` / `--font-sans` tokens in `src/styles.css`.
- Keep existing palette tokens (gold #f4b652, charcoal #1a1a1a, silver #d3d3d3, offwhite #f8f8f8) — they already match.
- Default page background flips to **charcoal** (current is light); update `--background`/`--foreground` for a noir base across the whole page.

## Layout (asymmetric editorial, locked across page)
Restructure `src/routes/index.tsx`:

1. **Nav** — gold-bordered logo square + "Elite Vedic" wordmark · INSIGHTS · SERVICES · COUNCIL · METHOD · pill "Book Consult" CTA with arrow.
2. **Hero (asymmetric 50/50)**
   - Left: gold hairline + eyebrow "Legacy Wisdom for Modern Leaders", oversized Cormorant headline "Unlock Your *Cosmic* Potential" (italic gold accent), Karla intro paragraph, primary + ghost CTA.
   - Right: orbit medallion — logo at center, two concentric rings, floating service nodes (Astrology, Career, Relations, Muhurta, Vastu, Wealth) with icon + label.
   - Bottom-left corner: gold hairline + "Ref. 01.002 // SV-24" tag.
3. **Trust bar** — "AS FEATURED IN" row with 5 muted serif wordmarks separated by gold hairlines.
4. **01 — Services** — numbered label, asymmetric 5/7 split: left sticky intro headline, right 6 service cards (gold hairline borders, hover lifts to gold).
5. **02 — Strategic Council** — asymmetric: large featured expert card on left (portrait silhouette frame + bio), stacked secondary expert + credentials on right.
6. **03 — Celestial Audit** form — asymmetric: left editorial copy + numbered steps, right glass-card form (name, email, birth date, time, location, intention textarea, submit).
7. **04 — Method** — three-row zigzag of numbered principles with gold hairline dividers.
8. **Footer** — charcoal, 4-column grid; logo + tagline, sitemap, contact, fine print.

## Motion (CSS-only, holds attention without noise)
- Slow rotating outer ring (`animate-orbit-slow`, 60s) and reverse inner ring (40s).
- Floating logo medallion (`animate-float`, 6s).
- Gold pulse halo behind medallion.
- Drifting gold sparkles (3–5 absolute spans with stagger).
- Scroll-reveal: fade+rise on each section header (IntersectionObserver hook, one small file).
- Nav links: animated gold underline draw on hover.
- CTA: gold fill sweep on hover; arrow translate-x.
- Service cards: gold hairline → gold glow on hover, icon scale.
- Section number labels (01, 02, …) get a thin gold rule that draws in on view.

## Files
- `src/assets/pradeepji.svg.asset.json` (new, via lovable-assets CLI)
- `src/routes/__root.tsx` — swap Google Fonts links to Cormorant Garamond + Karla
- `src/styles.css` — update `--font-display`, `--font-sans`, flip page bg to charcoal, ensure orbit/float/pulse/sparkle keyframes & utilities exist
- `src/routes/index.tsx` — full restructure into the 8 sections above, using the logo asset
- `src/hooks/use-reveal.ts` (new) — tiny IntersectionObserver hook for scroll reveals

## Out of scope
- No backend / form submission wiring (form is presentational; can be wired later if requested).
- No new routes — single landing page.
- No imagery beyond the logo (silhouette frames use CSS, not photos) — can be added later.
