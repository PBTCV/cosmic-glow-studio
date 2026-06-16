# Light Theme Refinement + Hero Medallion Swap

Keep the Editorial Orbit layout, Cormorant + Karla typography, and asymmetric structure. Two focused changes:

## 1. Flip to a premium light theme

Update `src/styles.css` tokens (no layout changes):

- `--background`: `#f8f8f8` (off‑white)
- `--foreground`: `#1a1a1a` (charcoal)
- `--card`: `#ffffff` with a near‑imperceptible warm tint
- `--muted`: `#efece6` (warm paper)
- `--muted-foreground`: `#6b6b6b`
- `--border`: `rgba(26,26,26,0.08)` (hairlines now dark)
- `--input`: `rgba(26,26,26,0.14)`
- `--primary`: keep gold `#f4b652`, `--primary-foreground`: charcoal
- `html`/`body` background → off‑white; selection stays gold on charcoal

Premium light treatments (not generic "white bg"):
- Add a subtle radial vignette: warm cream → off‑white behind the hero.
- Hairline rules in `gold` and `charcoal/10` (replacing the white/10 used in dark mode).
- `glass-card` becomes frosted cream: `rgba(255,255,255,0.6)` + 14px blur + `1px solid rgba(26,26,26,0.06)` + soft shadow `0 30px 60px -30px rgba(26,26,26,0.18)`.
- Buttons: primary stays gold; ghost becomes charcoal outline; CTA sweep fills gold over charcoal text.
- Service cards: white surface, hairline border, gold border + soft gold glow on hover.
- Nav: off‑white with bottom hairline; gold underline draw stays.
- Footer: charcoal block kept as intentional contrast anchor at page bottom (premium magazine feel).

## 2. Replace the logo at the center of the orbit medallion

The logo stays in the nav only. In the hero medallion, swap it for a custom celestial mark built in SVG (inline in `src/routes/index.tsx`):

- Centerpiece: a gold 8‑point compass star inside a thin double‑ring, sitting on a soft cream disc with a faint gold radial glow.
- Inner detail: small gold dot grid forming a zodiac‑inspired circular constellation (12 points around the star).
- Keeps the existing motion: floating disc (`animate-float`), pulsing gold halo (`animate-gold-pulse`), outer ring rotating slowly (`animate-orbit-slow`), inner ring reverse (`animate-orbit-reverse`), drifting sparkles.
- Service nodes (Astrology, Career, Relations, Muhurta, Vastu, Wealth) on the rings are unchanged in position; node chips restyled for light mode (white card, hairline border, gold icon, charcoal label).

## Files touched

- `src/styles.css` — token flip + light‑mode utilities (`glass-card`, hairline color, shadows, vignette).
- `src/routes/index.tsx` — replace the `<img pradeepji>` inside the medallion with the new inline SVG compass‑star + constellation; restyle node chips, cards, form, and CTAs for light surfaces.

## Out of scope

- No layout, section order, copy, or typography changes.
- Nav logo unchanged.
- No new routes or backend work.
