# Customer Menu Voting System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a menu voting system where admins can create food choice polls in the dashboard (`tiffin-service/dashboard`), and only active meal plan subscribers can cast a vote on the website (`tiffin-website`) via passwordless WhatsApp OTP authentication, with strict database-level duplicate prevention (`UNIQUE(poll_id, customer_id)`).

**Architecture:**
- Supabase database stores `polls`, `poll_votes`, and temporary `poll_otps`.
- `tiffin-website` provides secure API routes (`/api/poll/active`, `/api/poll/send-otp`, `/api/poll/vote`) verifying active subscriptions (`subscriptions.status = 'active'`) and sending 4-digit OTPs via Meta Cloud API / WhatsApp adapter.
- `src/components/MenuVotingWidget.tsx` renders on the website matching the card theme (warm cream, terracotta, turmeric, and deep teal) with instant live percentage bars.
- `tiffin-service/dashboard` provides an administrative panel at `/admin/polls` to create polls, add dish options, and monitor live voting results.

**Tech Stack:** Next.js 16 (App Router), React 19, Supabase JS Client, PostgreSQL, Meta Cloud WhatsApp API, Tailwind CSS v4, Framer Motion, TypeScript.

## Global Constraints
- Active Subscribers Only: Non-subscribers cannot vote; they receive an encouraging upsell message with a CTA to subscribe to a meal plan.
- Duplicate Prevention: A customer can vote ONLY once per poll. Enforced at the PostgreSQL level via `CONSTRAINT unique_customer_poll_vote UNIQUE (poll_id, customer_id)`.
- Brand Styling: Uses established theme tokens (`--color-brutal-bg`, `--color-brutal-border`, `--color-brutal-pop`, `--color-brutal-accent`).
- Passwordless Authentication: 4-digit code sent via WhatsApp valid for 5 minutes.

---

### Task 1: Supabase Database Migration for Polls, Votes, and OTPs

**Files:**
- Create: `/home/arch/Downloads/tiffin-service/supabase/migrations/20260927000001_create_polls_and_votes.sql`
- Script: `/home/arch/Downloads/tiffin-website/scripts/apply-voting-migration.mjs`

**Interfaces:**
- Produces: `public.polls`, `public.poll_votes`, `public.poll_otps` tables with constraints and initial active seed poll.

- [ ] **Step 1: Write migration SQL file**

Create `/home/arch/Downloads/tiffin-service/supabase/migrations/20260927000001_create_polls_and_votes.sql`:
```sql
-- Migration: Create Polls, Poll Votes, and Poll OTPs tables
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
    closes_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    option_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_customer_poll_vote UNIQUE (poll_id, customer_id)
);

CREATE TABLE IF NOT EXISTS public.poll_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_poll_otps_phone_expires ON public.poll_otps (phone, expires_at);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes (poll_id);

-- Seed initial sample active poll if no active poll exists
INSERT INTO public.polls (title, description, options, status, closes_at)
SELECT
  'What special dish should we cook for Friday Lunch?',
  'Vote for your favorite weekend comfort meal! The winning dish will be freshly made for all active subscribers.',
  '[
    {"id": "opt_1", "label": "Shahi Paneer with Butter Naan & Jeera Rice"},
    {"id": "opt_2", "label": "Dal Makhani with Laccha Paratha & Pulao"},
    {"id": "opt_3", "label": "Amritsari Chole Kulche with Mint Chutney & Salad"}
  ]'::jsonb,
  'active',
  now() + interval '7 days'
WHERE NOT EXISTS (SELECT 1 FROM public.polls WHERE status = 'active');
```

- [ ] **Step 2: Write and execute migration runner script**

Create `/home/arch/Downloads/tiffin-website/scripts/apply-voting-migration.mjs` using direct psql connection with `SUPABASE_DB_PASSWORD` or Supabase client.
Run: `node /home/arch/Downloads/tiffin-website/scripts/apply-voting-migration.mjs`  
Expected: Tables created and initial active poll seeded.

- [ ] **Step 3: Commit migration files**

```bash
git add docs/superpowers/plans/
git commit -m "chore: add migration for polls, poll_votes, and poll_otps"
```

---

### Task 2: WhatsApp OTP Notification Helper (`tiffin-website`)

**Files:**
- Create: `/home/arch/Downloads/tiffin-website/src/lib/whatsapp.ts`

**Interfaces:**
- Consumes: `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`, `WHATSAPP_PROVIDER` from `.env.local`.
- Produces: `export async function sendWhatsAppOtp(phone: string, code: string): Promise<{ ok: boolean, error?: string }>`

- [ ] **Step 1: Write `src/lib/whatsapp.ts`**

```typescript
/**
 * WhatsApp Messaging Utility for Sending Verification OTPs.
 * Supports Meta Cloud API with safe development fallback.
 */

export async function sendWhatsAppOtp(phone: string, otpCode: string): Promise<{ ok: boolean; error?: string }> {
  const provider = process.env.WHATSAPP_PROVIDER || "meta";
  const metaToken = process.env.META_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  // Clean phone number (strip spaces, symbols; ensure standard digits e.g. 919876543210)
  let cleanPhone = phone.replace(/[^0-9]/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone;
  }

  const messageText = `Mom's Kitchen 🍲: Your menu voting verification code is *${otpCode}*. It is valid for 5 minutes. Enter this code to cast your vote!`;

  if (provider === "meta" && metaToken && phoneNumberId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${metaToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "text",
          text: {
            preview_url: false,
            body: messageText,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn("Meta WhatsApp API error:", errorData);
        // Do not throw; return status
        return { ok: false, error: "Failed to send WhatsApp message via Meta API" };
      }

      return { ok: true };
    } catch (err: any) {
      console.warn("Error calling Meta Cloud API:", err?.message || err);
      return { ok: false, error: err?.message || "Network error" };
    }
  }

  // Development / Local fallback: Log OTP to console
  console.log(`\n[DEV WHATSAPP OTP] To: ${cleanPhone} | Code: ${otpCode} | Message: ${messageText}\n`);
  return { ok: true };
}
```

- [ ] **Step 2: Commit helper**

```bash
git add src/lib/whatsapp.ts
git commit -m "feat: add WhatsApp OTP notification utility with Meta API integration"
```

---

### Task 3: Voting Backend API Routes (`tiffin-website`)

**Files:**
- Create: `src/app/api/poll/active/route.ts`
- Create: `src/app/api/poll/send-otp/route.ts`
- Create: `src/app/api/poll/vote/route.ts`

**Interfaces:**
- Produces:
  - `GET /api/poll/active`: Returns current poll and vote statistics.
  - `POST /api/poll/send-otp`: Checks active plan in `subscriptions`, verifies not already voted, generates & sends OTP.
  - `POST /api/poll/vote`: Verifies OTP, inserts vote, returns updated results.

- [ ] **Step 1: Implement `src/app/api/poll/active/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    // 1. Fetch current active poll
    const { data: poll, error } = await supabase
      .from("polls")
      .select("id, title, description, options, status, closes_at, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!poll) {
      return NextResponse.json({ poll: null });
    }

    // 2. Fetch all votes for this poll
    const { data: votes, error: votesErr } = await supabase
      .from("poll_votes")
      .select("option_id")
      .eq("poll_id", poll.id);

    const voteCounts: Record<string, number> = {};
    const totalVotes = votes ? votes.length : 0;

    if (votes) {
      for (const v of votes) {
        voteCounts[v.option_id] = (voteCounts[v.option_id] || 0) + 1;
      }
    }

    const options = Array.isArray(poll.options) ? poll.options : [];
    const enrichedOptions = options.map((opt: any) => {
      const count = voteCounts[opt.id] || 0;
      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return {
        id: opt.id,
        label: opt.label || opt.text || "Dish Option",
        votes: count,
        percent,
      };
    });

    return NextResponse.json({
      poll: {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        options: enrichedOptions,
        totalVotes,
        closesAt: poll.closes_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Implement `src/app/api/poll/send-otp/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendWhatsAppOtp } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { phone, pollId } = await req.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 });
    }
    if (!pollId || typeof pollId !== "string") {
      return NextResponse.json({ error: "Poll ID is required" }, { status: 400 });
    }

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

    // 1. Verify customer exists and has an active subscription
    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .select("id, name, phone")
      .or(`phone.eq.${cleanPhone},phone.eq.${cleanPhone.slice(-10)}`)
      .limit(1)
      .maybeSingle();

    if (custErr || !customer) {
      return NextResponse.json({
        code: "NO_ACTIVE_PLAN",
        message: "Voting is an exclusive perk for active subscribers. Subscribe to any meal plan today to vote on upcoming menus!",
      }, { status: 403 });
    }

    const { data: activeSub, error: subErr } = await supabase
      .from("subscriptions")
      .select("id, status")
      .eq("customer_id", customer.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (subErr || !activeSub) {
      return NextResponse.json({
        code: "NO_ACTIVE_PLAN",
        message: "Voting is an exclusive perk for active subscribers. Subscribe to any meal plan today to vote on upcoming menus!",
      }, { status: 403 });
    }

    // 2. Check if customer already voted on this poll
    const { data: existingVote } = await supabase
      .from("poll_votes")
      .select("id, option_id")
      .eq("poll_id", pollId)
      .eq("customer_id", customer.id)
      .maybeSingle();

    if (existingVote) {
      return NextResponse.json({
        code: "ALREADY_VOTED",
        message: "You have already voted on this poll! Here are the community results so far.",
        votedOptionId: existingVote.option_id,
      }, { status: 409 });
    }

    // 3. Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Delete existing OTPs for this phone to avoid stacking
    await supabase.from("poll_otps").delete().eq("phone", cleanPhone);

    const { error: otpInsertErr } = await supabase.from("poll_otps").insert({
      phone: cleanPhone,
      otp_code: otpCode,
      expires_at: expiresAt,
      attempts: 0,
    });

    if (otpInsertErr) {
      return NextResponse.json({ error: "Failed to create verification code" }, { status: 500 });
    }

    // 4. Send WhatsApp notification
    await sendWhatsAppOtp(cleanPhone, otpCode);

    const maskedPhone = cleanPhone.slice(-10).replace(/(\d{2})\d{4}(\d{4})/, "$1••••$2");

    return NextResponse.json({
      ok: true,
      message: `Verification code sent to WhatsApp number +91 ${maskedPhone}`,
      phoneMasked: `+91 ${maskedPhone}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Implement `src/app/api/poll/vote/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { phone, pollId, optionId, otp } = await req.json();

    if (!phone || !pollId || !optionId || !otp) {
      return NextResponse.json({ error: "Missing required voting parameters" }, { status: 400 });
    }

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

    // 1. Verify OTP
    const { data: otpRow, error: otpErr } = await supabase
      .from("poll_otps")
      .select("id, otp_code, expires_at, attempts")
      .eq("phone", cleanPhone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpErr || !otpRow) {
      return NextResponse.json({ error: "No active verification code found. Please request a new code." }, { status: 400 });
    }

    if (new Date(otpRow.expires_at).getTime() < Date.now()) {
      await supabase.from("poll_otps").delete().eq("id", otpRow.id);
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    if (otpRow.otp_code.trim() !== String(otp).trim()) {
      await supabase.from("poll_otps").update({ attempts: otpRow.attempts + 1 }).eq("id", otpRow.id);
      return NextResponse.json({ error: "Incorrect verification code. Please check your WhatsApp." }, { status: 400 });
    }

    // 2. Fetch customer ID
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .or(`phone.eq.${cleanPhone},phone.eq.${cleanPhone.slice(-10)}`)
      .limit(1)
      .maybeSingle();

    if (!customer) {
      return NextResponse.json({ error: "Customer not recognized" }, { status: 403 });
    }

    // 3. Insert vote (Protected by PostgreSQL UNIQUE constraint)
    const { error: voteErr } = await supabase.from("poll_votes").insert({
      poll_id: pollId,
      customer_id: customer.id,
      option_id: optionId,
    });

    if (voteErr) {
      if (voteErr.code === "23505" || voteErr.message.includes("unique")) {
        return NextResponse.json({
          code: "ALREADY_VOTED",
          message: "You have already voted on this poll!",
        }, { status: 409 });
      }
      return NextResponse.json({ error: voteErr.message }, { status: 500 });
    }

    // 4. Invalidate used OTP
    await supabase.from("poll_otps").delete().eq("id", otpRow.id);

    return NextResponse.json({
      ok: true,
      message: "Vote cast successfully! Thank you for choosing this week's special.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Commit API routes**

```bash
git add src/app/api/poll/
git commit -m "feat: add active poll, send-otp, and cast-vote backend API routes"
```

---

### Task 4: Admin Dashboard Polls Management (`tiffin-service/dashboard`)

**Files:**
- Create: `/home/arch/Downloads/tiffin-service/dashboard/app/actions/polls.ts`
- Create: `/home/arch/Downloads/tiffin-service/dashboard/lib/queries/polls.ts`
- Create: `/home/arch/Downloads/tiffin-service/dashboard/app/(admin)/polls/page.tsx`
- Create: `/home/arch/Downloads/tiffin-service/dashboard/components/polls/PollsPageClient.tsx`

**Interfaces:**
- Produces: `/admin/polls` dashboard route with Create Poll modal, live results bar chart, and Close Poll toggle.

- [ ] **Step 1: Write server actions in `app/actions/polls.ts`**

Implement `createPollAction`, `closePollAction`, `deletePollAction` with `requireAdmin()` check and `system_logs` recording.

- [ ] **Step 2: Write queries in `lib/queries/polls.ts`**

Implement `fetchPolls()` querying `public.polls` and total votes per option.

- [ ] **Step 3: Create UI page and `PollsPageClient.tsx`**

Build the dashboard UI with:
- "➕ Create Menu Poll" button.
- Modal with title, description, dynamic dish options (add/remove options), and closing deadline.
- Real-time progress bars showing current votes per option.
- "Close Poll" action.

- [ ] **Step 4: Typecheck and commit in `tiffin-service`**

```bash
git -C /home/arch/Downloads/tiffin-service add dashboard/
git -C /home/arch/Downloads/tiffin-service commit -m "feat(dashboard): add menu polls management page with creation and live results"
```

---

### Task 5: Customer Website Voting Widget & Page (`tiffin-website`)

**Files:**
- Create: `src/components/MenuVotingWidget.tsx`
- Create: `src/app/vote/page.tsx`
- Modify: `src/app/page.tsx` (Add voting section & navigation link)

**Interfaces:**
- Produces: Interactive voting widget with dish selection, phone verification, active subscriber gate, WhatsApp OTP modal, and live community percentage bars.

- [ ] **Step 1: Create `src/components/MenuVotingWidget.tsx`**

Build the widget styled with card tokens (`bg-brutal-bg`, `border-brutal-border`, `bg-brutal-accent`, `bg-brutal-pop`):
- Fetches active poll from `/api/poll/active`.
- If no active poll: Shows a friendly *"Next week's poll is opening soon!"* card.
- If active poll:
  - Radio list of dish options with appetizing food badges.
  - 10-digit WhatsApp number input.
  - "Send Code" button triggering `/api/poll/send-otp`.
  - If `NO_ACTIVE_PLAN`: Shows card explaining voting is an exclusive perk for active plan members, with a "View Plans" button pointing to `#plans`.
  - If `ALREADY_VOTED` or after voting: Displays animated progress bars with vote counts and percentages.
  - If eligible: Displays 4-digit OTP input with "Confirm Vote" button triggering `/api/poll/vote`.

- [ ] **Step 2: Create dedicated `/vote` page at `src/app/vote/page.tsx`**

Provide a clean standalone route with navigation, header, and `<MenuVotingWidget />`.

- [ ] **Step 3: Add Voting Section & Nav link to `src/app/page.tsx`**

Add "Vote Menu" link to top navigation bar.  
Add `<MenuVotingWidget />` section on the homepage.

- [ ] **Step 4: Commit website UI components**

```bash
git add src/components/MenuVotingWidget.tsx src/app/vote/page.tsx src/app/page.tsx
git commit -m "feat: add interactive menu voting widget and dedicated /vote page"
```

---

### Task 6: Verification & Full Build Check

**Files:**
- Touch: all modified files

- [ ] **Step 1: Run production build on `tiffin-website`**

Run: `npm run build`  
Expected: `✓ Compiled successfully` with zero errors.

- [ ] **Step 2: Run linter on `tiffin-website`**

Run: `npm run lint`  
Expected: `0 problems`.

- [ ] **Step 3: Run typecheck on `tiffin-service/dashboard`**

Run: `pnpm --prefix /home/arch/Downloads/tiffin-service/dashboard build --dry-run` or `tsc --noEmit`.  
Expected: clean type check.

- [ ] **Step 4: Commit and finalize**

```bash
git add .
git commit -m "feat: complete customer menu voting system with active subscriber gate and WhatsApp OTP"
```
