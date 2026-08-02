# Design.md — MoveSmart
### Visual Design System
**Version:** 1.0 · **Theme:** Light only · **Last updated:** July 27, 2026

This document is the single source of truth for color, theme, and typography. Any component built in `frontend/` should derive its visual values from here — no ad-hoc hex codes or fonts introduced in component code.

---

## 1. Theme

**Light only for MVP.** No dark mode toggle, no `prefers-color-scheme` handling required. Do not build a theming/token-switch system in anticipation of dark mode — that's unnecessary complexity until it's actually requested (consistent with Rules.md §6, no speculative abstraction).

> Note on direction: the original concept doc (`MoveSmart_Explained.txt`) described a deep-navy, purple/cyan "AI city at night" aesthetic. The palette below is a deliberate, lighter, more restrained direction — closer to a clean, modern SaaS product than a dark sci-fi one. This is the palette of record going forward. Flagging the shift so it's a conscious decision, not a drift.

---

## 2. Color Palette

| Token | Hex | Role |
|---|---|---|
| **Primary** | `#00ADB5` | Brand accent — primary buttons, links, active states, key highlights (recommended locality badges, selected filters) |
| **Secondary** | `#393E46` | Secondary UI elements — secondary buttons, nav bar, footers, dark UI chrome |
| **Background** | `#EEEEEE` | App/page background |
| **Surface / Card** | `#FFFFFF` | Cards, modals, panels, inputs — anything that sits "on top of" the background |
| **Text Primary** | `#222831` | Headings, primary body copy |
| **Text Secondary** | `#393E46` | Supporting text, captions, metadata (same value as Secondary — see note below) |
| **Border** | `#D9D9D9` | Dividers, input borders, card outlines |
| **Success** | `#22C55E` | Verified listing, positive cost signal, confirmation states |
| **Warning** | `#F59E0B` | Suspicious-listing flag (Isolation Forest output), stale data notice, estimate disclaimer |
| **Error** | `#EF4444` | Form errors, failed API calls, destructive actions |

**Note on Text Secondary = Secondary (`#393E46`):** these currently share one hex value. That's fine — one token can serve two roles — but keep them as **separate CSS variables** (`--color-secondary` and `--color-text-secondary`) even though the value is identical today. If either needs to diverge later (e.g., a lighter grey for captions), you change one token, not a find-and-replace across the codebase.

### 2.1 Usage Rules

- **Primary (`#00ADB5`)** is for action and emphasis — buttons, active tab indicators, links, the "recommended" badge on a locality card, chart accents. Don't use it as a large background fill for text-heavy areas (see accessibility note below).
- **Secondary (`#393E46`)** is for structural chrome — navbar, footer, secondary/outline buttons — not for large body-text blocks.
- **Warning (`#F59E0B`)** is reserved specifically for the suspicious-listing flag and any "this is an estimate, not a fact" labeling (cost-of-living figures, commute estimates). Keep this association consistent — don't reuse warning-orange for unrelated UI states.
- **Error (`#EF4444`)** is reserved for actual failures (validation errors, failed requests) — never used decoratively.
- One accent per screen at a time. If multiple things could be "highlighted," pick the one that matters most for that screen's job — don't let Primary, Success, and Warning all compete for attention on the same view.

### 2.2 Accessibility / Contrast Notes

- `Text Primary (#222831)` on `Background (#EEEEEE)` and on `Surface (#FFFFFF)` — passes WCAG AA comfortably for body text.
- `Primary (#00ADB5)` on white/light background — sufficient contrast for **large text, icons, and UI controls**, but do **not** use it for small/body-sized text on a light background; use it as a fill (buttons with white text on top) or for icons/large headings instead.
- White text on `Primary (#00ADB5)` button fills — verify at implementation time; if contrast is borderline, darken the hover/pressed state slightly rather than changing the base token.
- `Border (#D9D9D9)` is for dividers/outlines only — never used for text.

### 2.3 Tailwind Mapping (for `tailwind.config.js`)

```js
colors: {
  primary:        '#00ADB5',
  secondary:      '#393E46',
  background:     '#EEEEEE',
  surface:        '#FFFFFF',
  'text-primary':   '#222831',
  'text-secondary': '#393E46',
  border:         '#D9D9D9',
  success:        '#22C55E',
  warning:        '#F59E0B',
  error:          '#EF4444',
}
```

Use these semantic names (`bg-primary`, `text-text-primary`, `border-border`, etc.) in components — not raw hex or Tailwind's default palette (`bg-teal-500`, `text-gray-800`) — so the whole app stays traceable back to this file.

---

## 3. Typography

**Status: fonts not yet finalized** — to be locked in at the start of frontend build, not before. This section exists so that decision has a clear framework to be made within, instead of being made ad hoc per-component later.

### 3.1 What the type system needs to do

Per the product's positioning (PRD §1: "selling certainty," premium/architectural/Apple-inspired feel from the original concept doc), typography needs to carry:
- **Clarity under data density** — this app shows numbers, rankings, and comparisons constantly (rent ranges, commute minutes, cost breakdowns). Legibility at small sizes and good numeral rendering (tabular figures) matter more than decorative personality.
- **A calm, confident tone** — not playful, not corporate-cold. The palette is restrained; the type should match that register.

### 3.2 Two-role minimum

- **Display / Heading face** — used for page titles, section headers, the top-line number on cost/commute cards. Used with restraint (headings only, not body copy).
- **Body / UI face** — used for everything else: paragraphs, labels, form fields, table data, buttons.

A third **Data/Mono face** is worth considering (see §3.4) given how numeric this product is — prices, BHK counts, commute times, percentages appear constantly and benefit from tabular/monospaced figures for scannability, e.g., in the cost-of-living breakdown table.

### 3.3 Recommended directions (pick one at build time)

These are starting points, not a final decision — chosen because they suit a "calm, confident, data-forward SaaS" register rather than a generic default:

| Option | Heading | Body/UI | Feel |
|---|---|---|---|
| **A — Modern Grotesk** | Inter or General Sans (semi/bold) | Inter (regular) | Clean, neutral, highly legible — safest, most "trustworthy fintech/proptech" register |
| **B — Editorial Sans** | Söhne or Neue Haas Grotesk | Inter or IBM Plex Sans | More character in headlines, still restrained — closer to the "premium, Apple-inspired" original brief |
| **C — Distinct Personality** | Fraunces (a serif, used sparingly for a few key headlines only) paired with Inter for everything else | Inter | Adds warmth/distinctiveness against an otherwise very neutral, teal-accented UI — higher risk, needs disciplined restraint (serif only for 1–2 hero moments, never in dense data views) |

**Default recommendation if no strong preference emerges: Option A (Inter for both roles, differentiated by weight).** It's free, has excellent number/tabular-figure support, and won't fight the data-dense nature of the product. Option C is worth a real look if the team wants the marketing/landing page to feel more distinctive than the in-app dashboard — it's fine, even good, for those two contexts to diverge slightly (see §3.6).

### 3.4 Numeric/Data Treatment

Regardless of which pairing is chosen:
- Enable **tabular figures** (`font-variant-numeric: tabular-nums`) anywhere numbers are compared vertically — cost breakdown tables, price lists, comparison views. This keeps digits aligned and is a small detail that reads as "premium" per the brief.
- Large standalone numbers (e.g., "₹29,500/month" on a cost card, "28 min" on a commute card) can carry more visual weight — larger size, heavier weight — than the rest of the type scale, since they're often the single most important piece of information on that card.

### 3.5 Type Scale (structure, values TBD with chosen font)

Define a scale with intentional steps — not arbitrary sizes per component:

```
Display   — page-level hero numbers, landing headline
H1        — page titles
H2        — section headers
H3        — card titles
Body      — default paragraph/UI text
Small     — captions, metadata, timestamps
Micro     — badges, tags, fine print (disclaimers on estimates)
```

Each step should have a defined size, line-height, and weight once fonts are chosen — document the final values here (or in `tailwind.config.js` under `fontSize`) so components reference `text-h2`, `text-body`, etc., not raw pixel values.

### 3.6 Where the two contexts can diverge

It's acceptable — and often correct — for the **marketing/landing "city story" scroll experience** (Architecture.md `city-story/`) to use a slightly more expressive heading treatment than the **in-app dashboard** (which prioritizes density and scanability above personality). If that split is used, document both explicitly here once decided, rather than letting it drift component-by-component.

---

## 4. Supporting Tokens (for consistency, not yet specified — fill in during build)

To avoid these being invented ad hoc per-component, capture them here once decided:

| Token | Purpose |
|---|---|
| Border radius scale | Cards, buttons, inputs — pick 1–2 values (e.g., `8px` / `16px`) and reuse everywhere, don't let each component invent its own |
| Shadow / elevation scale | Card elevation, modal elevation — 2–3 steps max |
| Spacing scale | Should follow Tailwind's default spacing scale unless there's a reason to override |
| Icon set | Pick one icon library (e.g., Lucide, given it's already available in this environment's component ecosystem) and use it exclusively — no mixing icon sets |

---

## 5. Do / Don't

**Do:**
- Reference tokens by semantic name (`bg-primary`, `text-warning`) everywhere.
- Keep Warning-orange semantically tied to "flagged/estimate" states only.
- Use tabular figures for any numeric comparison.
- Let one accent lead per screen.

**Don't:**
- Introduce new hex values outside this palette without updating this file first.
- Use Primary teal as body-text color on light backgrounds.
- Mix multiple display/heading fonts across the app once one is chosen.
- Build dark-mode tokens or a theme-switcher for MVP.
