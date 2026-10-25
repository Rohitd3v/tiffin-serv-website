# Mom's Kitchen — Homestyle Tiffin Subscription

A Next.js website for a Delhi NCR & Gurugram homestyle tiffin subscription
service: plan browsing, WhatsApp-first ordering, and a subscriber-exclusive
weekly menu vote (WhatsApp OTP verified, reCAPTCHA protected).

> **Design**: Apple-grade interfaces — frosted materials, SF typography,
> spring physics, and momentum scrolling. See
> [`docs/design-system.md`](docs/design-system.md) for the full design
> system documentation (materials, type, color, motion, accessibility).

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
```

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | TypeScript check |
| `node --test scripts/*.test.mjs` | Unit tests (routes, components, content) |

## Stack

- **Next.js (App Router) 16** + React 19 + TypeScript
- **Tailwind CSS v4** — design tokens in `src/app/globals.css` (`@theme`)
- **Supabase** — `plans`, `site_content`, `polls`, `poll_otps`, `poll_votes`,
  `customers`, `subscriptions` (RLS-protected; see `supabase/migrations/`)
- **framer-motion** — spring micro-interactions (`src/lib/motionTokens.ts`)
- **Lenis** — Apple-style inertia scrolling; **GSAP ScrollTrigger** — pinned
  "How it works" story
- **Vaul** — iOS-style bottom sheets (order popup)
- **Radix UI Accordion** — accessible FAQ disclosures
- **lucide-react** — icons at a consistent optical weight (`strokeWidth 1.75`)

## Architecture Notes

- **Content & pricing never blank the site**: `getPublicPlans()` and
  `getSiteContent()` merge Supabase rows over commented `LOCAL_DEFAULTS`,
  falling back wholesale on any error or empty result.
- **Voting pipeline** (`src/app/api/poll/*`): eligibility and OTP issuance on
  `send-otp` (subscriber-active check, 3-per-10-minute phone rate limit,
  4-digit code with exact-boundary seeding), OTP-bound ballot casting on
  `vote` (attempts counting, unique-constraint dedupe, code consumption only
  after a successful insert). `active` auto-closes expired polls and persists
  the winner.
- **reCAPTCHA v3 degrades gracefully**: with no keys configured both client
  and server pass through, so the site keeps working until `.env.local` gets
  `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET_KEY`.
- **Voting UI flow**: `SELECT → OTP → VOTED / NOT_SUBSCRIBER` state machine in
  `MenuVotingWidget`, with home, vote-page and WhatsApp fallback paths.
- **Ordering** is WhatsApp-first and uses one encoded `wa.me` destination
  across all CTAs for bot keyword matching.

## Verification Checklist

Before shipping UI changes, run the checks and confirm the documented
behaviors against `docs/design-system.md` §8 (reduced motion / transparency /
contrast):

```bash
npx tsc --noEmit && npm run lint && npm run build
node --test scripts/pr-unit.test.mjs scripts/menu-vote-banner.test.mjs scripts/order-bot-popup.test.mjs
```

## Deploy on Vercel

Push to a Vercel-linked branch, or run `npm run build` and deploy with
`vercel --prod`. Set the Supabase and reCAPTCHA environment variables in the
hosting dashboard (see `.env.example`).
