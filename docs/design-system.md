# Mom's Kitchen — Apple-Grade Design System

The October 2026 redesign replaces the original high-contrast neo-brutalist
language (3px ink borders, hard offset shadows, raw pastel cards) with a
refined, tactile, Apple-inspired web experience — think apple.com product
pages translated for a homestyle tiffin brand.

This document is the source of truth for the design decisions. Implementation
tokens live in **`src/app/globals.css`** (materials, color, shadows, type) and
**`src/lib/motionTokens.ts`** (spring physics).

---

## 1. Principles

Everything follows Apple's *Designing Fluid Interfaces* rules, translated to
the web:

1. **Response** — feedback fires on pointer-down (the `.press` utility scales
   to 0.97 the instant a surface is touched), never only on release.
2. **Direct manipulation** — the Vaul bottom sheet tracks the finger 1:1 with
   rubber-banding at its edges; nothing moves except attached to input.
3. **Interruptibility** — motion uses springs, never fixed-duration tweens, so
   any animation can be grabbed and redirected from its live value.
4. **Behavior over animation** — two house springs only (see §4); bounce is
   reserved for momentum-release moments.
5. **Spatial consistency** — enter and exit along the same path (the sheet
   always returns to the bottom edge; scroll reveals fade in place).
6. **Materials & depth** — translucent frosted surfaces carry hierarchy;
   bigger surfaces get deeper blur and stronger diffusion, never hard borders.
7. **Restraint** — one ambient gradient wash per region, hairline separation,
   and no decorative noise louder than the content.

## 2. Materials

Four surface materials, all defined in `globals.css`:

| Class | Use | Recipe |
|---|---|---|
| `.frost` | Cards resting on the paper backdrop | `rgba(255,255,255,.72)` + `blur(20px) saturate(180%)`, 1px specular top edge, `--shadow-soft` |
| `.frost-strong` | Floating chrome: nav, sheets, dialogs | `rgba(255,255,255,.82)` + `blur(28px) saturate(190%)`, `--shadow-lift` |
| `.glass` | Light glass over the dark `.wash-deep` gradient | `rgba(255,255,255,.14)` + `blur(20px)`, deep ambient shadow |
| `.calm-card` | Opaque white card where backdrop blur reads as noise | white + hairline border + `--shadow-soft` |

Rules of use:

- **Never stack a light translucent surface directly on another** — legibility
  collapses. Nest `.calm-card` inside `.frost` instead.
- Larger floating surfaces read as *thicker material*: stronger blur + deeper
  shadow (that is the difference between `.frost` and `.frost-strong`).
- The "light catching the material" edge is an inset white hairline
  (`inset 0 1px 0 rgba(255,255,255,.7)`), not a visible dark border.
- Legacy `brutalist-*` classes are aliased to the softened equivalents so
  dashboard-managed payloads age out gracefully; do **not** use them in new
  code.

## 3. Typography

Apple's system stack is the default — it already ships optical sizing,
tracking tables and Dynamic Type legibility tuning:

```
--font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
             "Helvetica Neue", Arial, sans-serif
```

- `body` sets `font-optical-sizing: auto` and antialiasing.
- **`.display-hero`** — weight 700, `letter-spacing: -0.025em`,
  `line-height: 1.02`. Large display text only; the negative tracking grows
  with size.
- **`.display-locked`** — weight 650, `letter-spacing: -0.02em`,
  `line-height: 1.05` for section headlines.
- **`.eyebrow`** — 0.7rem, 600, +0.12em uppercase. The only place tracking is
  *positive*: micro-labels above headlines.
- Body copy is 13–15px with relaxed leading and `text-muted`.
- Numbers in the pricing and voting UI use **`.tabular`**
  (`font-variant-numeric: tabular-nums`) so counters don't jitter.
- Global accent headline gradient: `from-amber-deep via-coral to-coral-deep`
  with `bg-clip-text text-transparent` — used once per page, on the hero verb.

## 4. Color

- **Paper & ink**: `--color-paper #faf6ef` (warm kitchen paper), `--color-ink
  #0c4a48` (deep teal ink) — the whole palette hangs on these two.
- **Neutrals**: `muted #567673`, `faint #7d918f`, hairlines at 12%/7% ink
  alpha (`hairline`, `hairline-soft`).
- **Accents**: amber `#f5a623` (+`-deep`, `-soft`), coral `#e85a34`
  (+`-deep`, `-soft`), teal wash `#eaf3f2`, WhatsApp green `#25d366`
  (+`-deep`). Accents are *sharp and sparing* — mostly on eyebrows, gradient
  text and one CTA family each.
- Focus halo: `outline: 2px solid rgba(21,133,127,.8)` on `:focus-visible`
  (teal halo, keyboard-visible only).

## 5. Shadows & radii

Layered diffusion, never a hard offset:

```
--shadow-soft:  0 1px 2px + 0 6px 18px   (cards, small chrome)
--shadow-lift:  0 2px 6px + 0 14px 32px  (hover lift, nav)
--shadow-sheet: 0 6px 16px + 0 28px 64px (bottom sheets, dialogs)
```

Radii follow Apple's continuous-corner language: `lg 1.5rem`, `xl 2rem`, with
full pills (`rounded-full`) for actions and `rounded-[10px]` for icon tiles.

## 6. Motion physics

Everything moving is a spring from `@/lib/motionTokens`:

| Token | Damping | Stiffness | When |
|---|---|---|---|
| `appleSpring` | 30 | 300 | Default UI motion — critically damped, **zero overshoot** |
| `appleFlickSpring` | 20 | 260 | Momentum gestures — flick releases, card throws |

Additional infrastructure:

- **Lenis** (`src/components/LenisProvider.tsx`) — inertia scrolling with an
  iOS-style deceleration curve; wire through `lenisStore` for components that
  need the smoothed position. Disabled entirely under reduced motion, where
  native scrolling is the accessible default.
- **GSAP ScrollTrigger** (`src/components/ProcessScroll.tsx`) — pinned scroll
  storytelling in the "How it works" section, driven by Lenis's ticker.
- **Vaul** (`OrderBotPopup`) — iOS bottom sheet with 1:1 swipe tracking,
  rubber-banding and drag-to-dismiss; sheet chrome uses
  `shadow-sheet` + grabber bar.
- **Radix Accordion** — SwiftUI-style disclosure easing
  (`cubic-bezier(0.32,0.72,0,1)` open / inverse close, height animated to
  `--radix-accordion-content-height`).
- **`.press`** — instant pointer-down feedback (scale 0.97, 100ms ease-out).
  Put it on every tappable surface.
- Scroll reveals use `revealViewport` (`once: true, amount: 0.25`) — content
  reveals slightly before entering view, never re-animates.

## 7. Ambient background

- `.wash-bokeh` — the light page wash: three soft radial kitchen-warm
  gradients (amber / teal / coral) over paper. One per region, maximum.
- `.wash-deep` — the dark inverted wash for footer/CTA bands.
- `.grain` — optional ≤ 5%-alpha fractal-noise overlay for hero warmth
  (`mix-blend-mode: multiply`, no looping animation).
- `.edge-fade-y` — soft scroll-edge fade for marquee rows, *never* a hard
  1px divider under floating chrome.

## 8. Dark mode

The palette hangs on `--sys-*` runtime variables declared on `:root` and
overridden on `.dark` — Tailwind's `@theme inline` points every semantic
token (`--color-paper`, `--color-ink`, `--shadow-*`, …) at them, so
components stay token-driven and never branch on theme.

**Boot**: an inline pre-paint script in `layout.tsx` reads
`localStorage["mk-theme"]` (set by `ThemeToggle`), falling back to the
system preference, and toggles `.dark` on `<html>` before first paint —
no flash. A mutating class is the single source of truth; `ThemeToggle`
tracks it with a `MutationObserver`, and cross-tab `storage` events
re-tint all open tabs.

Theme-proof values, by design:

- **Accent solids** (`amber`, `amber-deep`, `amber`→`whatsapp` fills with
  white labels, `ink-solid`) do **not** flip. `ink-solid` lifts slightly in
  dark (`#12635f`) so white icons/labels stay legible and CTAs still
  separate from dark material.
- **Washes flip to low-alpha accent tints** over dark surfaces
  (`amber-soft`, `coral-soft` → 16% alpha; `tealwash` → 10%). Markup pairs
  like `bg-tealwash text-ink` stay coherent automatically since `ink` is
  the light value in dark mode.
- **Materials**: `.frost`/`.frost-strong`/`.glass` get their own `.dark`
  recipes (deep-teal fills at lower alpha, subtle specular inset edges,
  neutral-black diffusion shadows). Dark paper is warm dark-teal
  (`#0a2321`), never pure black.
- **Theme switches ease**: `body` transitions background/color over 300ms
  (§14 "no abrupt brightness jumps"); the toggle glyph cross-fades and
  rotates on the flick spring.

Rules for new UI:

1. Never hardcode `bg-white`/`bg-ink` on a surface — use `bg-surface`,
   `bg-surface/90` or `bg-ink-solid` (fill that carries white text).
2. A scrim/dim overlay is always `bg-black/*`, never `bg-ink/*`.
3. Add any new dark value as a `--sys-*` pair in `globals.css`, not a
   component-local `dark:` variant.

## 9. Accessibility

Each media preference gets its own response in `globals.css`:

- **`prefers-reduced-motion: reduce`** — all durations settle to 200ms,
  loops stop, Lenis and Sakura stay off. Cross-fades replace slides.
- **`prefers-reduced-transparency: reduce`** — `.frost` surfaces go solid
  white and drop the blur.
- **`prefers-contrast: more`** — translucent surfaces become near-solid with
  a defined 40% ink border.
- Keyboard focus, `:focus-visible` ring, and reduced-flow height animations
  on accordions are system-wide.

## 10. Component inventory

| Component | Role | Materials |
|---|---|---| | `SiteNav` | Adaptive floating pill nav on every page: transparent over a hero, materializing to `.frost-strong` when content scrolls beneath | `backLink`, `helpUrl`, `links=null`, `subtitle=null` props for inner pages — inner pages reuse this shell instead of hand-copied static nav blocks
| `Footer` | Dark keynote-style footer band | `.wash-deep` + `.glass` |
| `MenuVotingWidget` | 4-step SMS-OTP voting flow | `.frost` cards, `appleSpring` state transitions |
| `OrderBotPopup` | First-visit iOS bottom sheet + floating pill | Vaul + `.frost-strong`, `markSeen` via `useSyncExternalStore` |
| `ProcessScroll` | Pinned scroll story for "How it works" | GSAP ScrollTrigger + Lenis |
| `FaqSection` | Accessible disclosure FAQ | Radix Accordion + SwiftUI easing |
| `AnimatedBranch`, `Sakura` | Ambient botanical overlays | translucent fills, ≤ 0.55 alpha, soft ambient shadows only |
| `ThemeToggle` | Apple-style sun/moon theme control in `SiteNav` | flips `.dark` on `<html>`, flick-spring glyph cross-fade, system default + `mk-theme` override |
| `not-found.tsx` | Frosted 404 | `.frost-strong` card over `.wash-bokeh` |

## 11. Working rules for new UI

1. Build on materials first (`.frost` family), color second, gradients last.
2. Grab springs from `motionTokens`; never hand-roll a duration tween for a
   user-triggered transition.
3. Every interactive element gets `.press` and a ≥ 44px touch target.
4. Only `transform` and `opacity` animate; heavy surfaces hint with
   `will-change` only while motion is imminent.
5. Add any new color/shadow/spring **as a token** in `globals.css` /
   `motionTokens.ts` — the components stay token-driven.
6. Verify against §9's three media queries before shipping a new surface.
