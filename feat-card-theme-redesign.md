# Snag List & Changelog — `tiffin-website`

| Metadata | Details |
|---|---|
| **Branch** | `feat/card-theme-redesign` |
| **Date** | 2026-10-09 |
| **Scope** | reCAPTCHA v3 Anti-Spam, WhatsApp OTP Rate Limiting, Poll Auto-Close with Winner Tagging, Dashboard-Managed Site Content |
| **Verification** | `npm run lint` → 0 errors / 0 warnings · `npx tsc --noEmit` → 0 errors · `npm run build` → Turbopack clean · anon-key RLS read of `site_content` verified → 5 keys |

---

## Executive Summary

Completes the website side of the dashboard↔website sync pairing (dashboard branch: `feat/poll-management-site-content-sync` in `tiffin-service`):

1. **reCAPTCHA v3 (graceful skip)** — invisible captcha on Send-OTP and Confirm-Vote endpoints. Activates automatically when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET_KEY` land in `.env.local`; until then requests pass through so the site keeps working.
2. **OTP spam shield** — max 3 OTP sends per phone per 10 minutes on `/api/poll/send-otp` (HTTP 429 beyond that).
3. **Poll auto-close with winner tagging** — when a poll's `closes_at` deadline passes, the next visit to `/api/poll/active` tallies the votes, persists `winner_option_id` + `closed_at`, flips the poll to `closed`, and stops serving it as active. `/api/poll/vote` independently rejects ballots on ended polls (HTTP 410).
4. **Dashboard-managed homepage content** — hero, contact info, process steps, testimonials, and vote banner now render from the `site_content` table with hardcoded `LOCAL_DEFAULTS` fallback so the site never blanks out.

---

## Summary of Changes & Snags Resolved

| # | Type | Area | Finding / Requirement | Status |
|---|------|------|-----------------------|--------|
| 1 | SECURITY | Poll Endpoints | reCAPTCHA v3 verification server-side on `send-otp` + `vote` | ✅ Complete |
| 2 | SECURITY | OTP Endpoint | Rate limit: 3 OTPs / 10 min / phone | ✅ Complete |
| 3 | FEATURE | Poll Lifecycle | Auto-close + winner tagging in `/api/poll/active`; vote-guard `410` on ended polls in `/api/poll/vote` | ✅ Complete |
| 4 | FEATURE | Dynamic Content | `getSiteContent()` merges DB rows over `LOCAL_DEFAULTS`; home page consumes it | ✅ Complete |
| 5 | INTEGRATION | Client | `MenuVotingWidget` requests captcha tokens (`send_otp`, `poll_vote` actions) and passes them to both endpoints | ✅ Complete |
| 6 | ENV | Config | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` placeholders appended to `.env.local` (not committed — gitignored) | ✅ Complete |

---

## Detailed Snags & Technical Solutions

### 1. Snag: Captcha keys not yet registered (must not block voting deployment)
* **Problem**: reCAPTCHA v3 requires site/secret keys from the Google admin console; blocking inbound votes until keys exist would break subscriber voting in the interim.
* **Resolution**:
  - Client (`src/lib/recaptcha.ts`): when the site key is missing, `getRecaptchaToken()` resolves `null`; widget proceeds without a token. Script injection only occurs when a key exists.
  - Server (`src/lib/server-recaptcha.ts`): when the secret is missing, `verifyRecaptcha()` returns `{ ok: true, skipped: true }` — the check is bypassed, not failed. A Google-fetch network error also fails **open** (availability over strictness) and logs loudly.
  - Once keys are added, both paths enforce a score threshold (`RECAPTCHA_MIN_SCORE`, default 0.5) and reject tampered/missing tokens with 403.

### 2. Snag: OTP endpoint could be spammed independently of captcha keys being set
* **Problem**: Even with subscriber eligibility checks in place, a scripted loop on one phone number could burn WhatsApp message quota.
* **Resolution**: `send-otp` counts `poll_otps` rows for the phone created in the last 10 minutes and returns `429 Too many verification attempts` at 3+. This is DB-backed, so it also works across concurrent requests/processes.

### 3. Snag: Auto-close must not strand winners in a client-only recompute
* **Problem**: If a poll's deadline rolls over while nobody is watching the dashboard, the winning dish should already be recorded — the earlier design recomputed winners in the widget on every render.
* **Resolution**: `/api/poll/active` is a server route: on seeing an expired active poll it tallies `poll_votes`, persists `winner_option_id`/`closed_at` via the service-role path, immediately returns `{ poll: null }`. The dashboard's `closePollAction` (sibling branch) uses the same persistence contract, so website and dashboard winners always agree.

### 4. Snag: Homepage content must not blank out on partial DB data
* **Problem**: Overwriting the homepage with DB values verbatim would flash empty sections if the migration had not run or a key was deleted.
* **Resolution**: `getSiteContent()` shallow-merges each DB section over `LOCAL_DEFAULTS`: missing strings keep fallbacks, missing arrays (`steps`, `items`) keep fallbacks, and parse/DB errors return `LOCAL_DEFAULTS` untouched. Empty DB strings and empty arrays are ignored (truthiness filters) so a half-typed save never destroys the live page.

### 5. Snag: Keeping the plan-card WhatsApp link static (carried-over requirement)
* **Problem**: Dynamically injecting `text=` query parameters into plan-card URLs previously broke the bot's FSM keyword matcher.
* **Resolution**: Preserved the static trigger-message behavior — plan cards still open the shared static `wa.me` link; the message template remains untouched.

---

## Verification Evidence

1. **Lint & Types**:
   - `npm run lint` → 0 errors, 0 warnings
   - `npx tsc --noEmit` → 0 errors
2. **Production Build** (Turbopack): clean, with `/` `/vote` `/api/poll/active|send-otp|vote` routes present.
3. **RLS sanity against production anon key**:
   - `createClient(PUBLIC_URL, ANON_KEY).from('site_content').select('key')` → `contact, hero, process, testimonials, vote_banner` (no error) — confirms the exact zero-rows failure mode from the previous RLS snag cannot recur on the new table.
