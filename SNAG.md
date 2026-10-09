# Snag List & Changelog — `tiffin-website`

| Metadata | Details |
|---|---|
| **Branch** | `feat/card-theme-redesign` |
| **Date** | 2026-09-27 |
| **Scope** | Dynamic Pricing Meal Plans, Menu Voting System, WhatsApp OTP Verification, RLS & Service Role Hardening |
| **Verification** | `npm run lint` → 0 errors / 0 warnings · `npm run build` → Turbopack production build clean · E2E voting lifecycle test verified |

---

## Executive Summary

This document records the architectural improvements, feature implementations, and resolved snags across two major deliverables:
1. **Dynamic Pricing & Meal Plans**: Dynamic Supabase-backed subscription plans with customizable feature bullet points and "Most Chosen" popularity ribbons.
2. **Customer Menu Voting System**: Exclusive weekly meal voting for active plan subscribers, secured by WhatsApp 4-digit OTP verification and PostgreSQL database-level duplicate prevention.

---

## Summary of Changes & Snags Resolved

| # | Type | Area | Finding / Requirement | Status |
|---|------|------|-----------------------|--------|
| 1 | FEATURE | Customer UI | Dynamic Pricing Plans in "Choose Your Pack" section with database fallbacks | ✅ Complete (`21ee8b7`) |
| 2 | FEATURE | Customer UI | Neo-brutalist `MenuVotingWidget` component with 4-step state machine (`SELECT` → `OTP` → `VOTED` / `NOT_SUBSCRIBER`) | ✅ Complete (`dce5a52`) |
| 3 | FEATURE | Routing | Dedicated `/vote` community page and `#vote` anchor section on homepage with navbar link | ✅ Complete (`dce5a52`) |
| 4 | BACKEND | API Routes | Secure backend endpoints for `/api/poll/active`, `/api/poll/send-otp`, and `/api/poll/vote` | ✅ Complete (`bcbd8c3`, `6674388`) |
| 5 | INTEGRATION | WhatsApp | Meta Cloud API OTP dispatch with safe development logging fallback | ✅ Complete (`d8d71e6`) |
| 6 | BUG / RLS | Supabase Client | Server-side API routes returned 0 customer rows due to RLS blocking anon key | ✅ Resolved (`f326e15`) |
| 7 | BUG / RLS | Database Policy | `polls` and `poll_votes` tables had RLS enabled with 0 policies, hiding active polls | ✅ Resolved |
| 8 | LINT / REACT | UI Widget | React 19 / Next 16 lint error for synchronous `setState` in `useEffect` body | ✅ Resolved (`dce5a52`) |
| 9 | TYPESCRIPT | API Routes | Strict type compliance: replaced all `any` catches with `unknown` and `Error` guards | ✅ Resolved (`6674388`) |
| 10 | STABILITY | Bot CTA | Kept static WhatsApp URL on plan cards without dynamic query parameters to avoid bot FSM breakages | ✅ Enforced |

---

## Detailed Snags & Technical Solutions

### 1. Snag: Server-Side API Routes Blocked by Supabase RLS (Customer Lookup Failure)
* **Problem**: 
  `src/lib/supabase.ts` was initially instantiated using only `NEXT_PUBLIC_SUPABASE_ANON_KEY`. When the server-side API route `/api/poll/send-otp` queried `public.customers` and `public.subscriptions` to verify active subscription status, PostgreSQL Row Level Security (RLS) silently filtered all rows out (returned 0 rows). This caused active paying subscribers to be falsely rejected with `NO_ACTIVE_PLAN`.
* **Root Cause**: 
  The client anon key has no SELECT permissions on internal customer/subscription records under RLS.
* **Resolution**:
  Updated `src/lib/supabase.ts` to detect the server environment (`typeof window === "undefined"`). In Node.js server runtimes (API routes), it automatically uses `SUPABASE_SERVICE_ROLE_KEY` to securely bypass RLS for administrative verification, while preserving the anon key in client-side bundles:
  ```typescript
  const effectiveKey =
    typeof window === "undefined" && serviceRoleKey
      ? serviceRoleKey
      : supabaseAnonKey;
  ```
* **Commit**: `f326e15`

---

### 2. Snag: Active Polls Inaccessible via Anon Key (Zero Policies on RLS)
* **Problem**: 
  After running the migration `20260927000001_create_polls_and_votes.sql`, the `polls` and `poll_votes` tables were created with `rowsecurity = true`. Because no explicit policies were attached, any direct query from client anonymous sessions returned `[]` (empty array).
* **Resolution**:
  Executed SQL policies allowing public read access to active polls and vote totals:
  ```sql
  CREATE POLICY "Public read active polls" ON public.polls FOR SELECT USING (status = 'active');
  CREATE POLICY "Public read poll votes" ON public.poll_votes FOR SELECT USING (true);
  NOTIFY pgrst, 'reload schema';
  ```

---

### 3. Snag: React 19 / ESLint 9 Cascading Render in `useEffect`
* **Problem**: 
  Calling `fetchPoll()` directly inside `useEffect(() => { fetchPoll(); }, [])` triggered ESLint error:
  `Error: Calling setState synchronously within an effect can trigger cascading renders (react-hooks/set-state-in-effect)`.
* **Resolution**:
  Refactored the fetch pattern to use standard asynchronous Promise resolution with an `isMounted` cancellation flag:
  ```typescript
  useEffect(() => {
    let isMounted = true;
    fetch("/api/poll/active", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setPoll(data.poll || null);
          setInitialLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) setInitialLoading(false);
      });
    return () => { isMounted = false; };
  }, []);
  ```
* **Commit**: `dce5a52`

---

### 4. Snag: Duplicate Vote Prevention & Voter Eligibility
* **Problem**: 
  Prevent customers from voting multiple times and prevent non-subscribers from voting on the chef's weekly menu.
* **Resolution**:
  1. **Eligibility Check**: `/api/poll/send-otp` inspects `customers.phone` and `subscriptions.status = 'active'`. Non-subscribers receive 403 `NO_ACTIVE_PLAN` and are routed to an upsell screen to explore meal packs.
  2. **Duplicate Protection**: Database-level constraint:
     ```sql
     CONSTRAINT unique_customer_poll_vote UNIQUE (poll_id, customer_id)
     ```
     Even if duplicate HTTP requests occur concurrently, PostgreSQL rejects the second insertion with error code `23505`. The frontend handles 409 `ALREADY_VOTED` gracefully by displaying community standings.

---

### 5. Snag: Dynamic WhatsApp Parameters Breaking Bot NLP
* **Problem**: 
  Adding dynamic URL query parameters (e.g., `?text=Order%20Starter%20Plan%20at%20480`) to the WhatsApp CTA links could break the WhatsApp bot's command parser / keyword recognizer.
* **Resolution**:
  Preserved the static WhatsApp bot trigger message across all dynamic plan cards:
  ```typescript
  const whatsappUrl = "https://wa.me/917033558836?text=Hello! I want to order a tiffin.";
  ```

---

## Verification Evidence

1. **Automated Verification Script** (`scripts/test-voting-flow.mjs`):
   - Active Poll query: `What special dish should we cook for Friday Lunch?` (Passed)
   - Non-subscriber check (`+91 9999999999`): Blocked with `NO_ACTIVE_PLAN` (Passed)
   - Active subscriber check (`Monika Rawat - 918534068717`): Verified active subscription (Passed)
   - OTP generation and storage in `poll_otps`: Verified (Passed)
   - Vote insertion: Successfully recorded (Passed)
   - Duplicate vote attempt: Rejected by PostgreSQL constraint `23505 (unique_customer_poll_vote)` (Passed)
   - Cleanup: Database returned to clean state (Passed)

2. **Lint & Build Verification**:
   - `npm run lint`: **0 errors, 0 warnings**
   - `npm run build`: **Turbopack compiled successfully in 24.9s** generating static and dynamic routes (`/`, `/vote`, `/api/poll/active`, `/api/poll/send-otp`, `/api/poll/vote`).
