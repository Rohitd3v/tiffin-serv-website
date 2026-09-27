# Design Spec: Customer Menu Voting System (Active Subscriber Exclusive)

**Date:** 2026-09-27  
**Status:** Approved  
**Topic:** Menu Voting System with WhatsApp OTP Authentication & Duplicate Prevention  

---

## 1. Overview & Business Value

Mom's Kitchen wants to let customers vote on upcoming menu specials (e.g. *"What should we cook for Friday lunch? Paneer Butter Masala vs Dal Makhani vs Rajma Chawal"*).

### Business Impact:
1. **Drives Customer Retention & Engagement**: Customers feel ownership over their meals and look forward to delivery days.
2. **Eliminates Food Waste**: The kitchen prepares dishes with verified high demand.
3. **Incentivizes Meal Plan Purchases**: Non-subscribers who visit the voting section are shown a friendly upsell (*"Voting is an exclusive perk for active subscribers — subscribe today to pick your menu!"*), directly driving plan sales.

---

## 2. Core Requirements & Constraints

1. **Active Plan Enforcement**: ONLY users who currently have an `active` subscription in `public.subscriptions` are eligible to vote.
2. **Strict Duplicate Prevention**: One customer can vote **only once** per poll. Enforced at the PostgreSQL database level using a `UNIQUE(poll_id, customer_id)` constraint.
3. **Passwordless WhatsApp Authentication**: Customers verify their identity by entering their registered WhatsApp phone number and receiving an instant 4-digit verification code via WhatsApp.
4. **Admin Dashboard Control**: Admins can create polls, define dish options, set closing deadlines, view live bar-chart results, and close polls from `tiffin-service/dashboard`.
5. **Brand Aesthetic Alignment**: The voting interface on `tiffin-website` matches the warm cream, terracotta rust, turmeric mustard, and deep teal theme established from the business cards.

---

## 3. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                Customer on Website                              │
│                    1. Selects dish & enters WhatsApp phone number               │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ POST /api/poll/send-otp
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Eligibility & Duplicate Guard                          │
│  1. Check customer exists in `public.customers`                                 │
│  2. Check `subscriptions.status = 'active'`                                     │
│     ➜ IF NOT ACTIVE: Return 403 { code: 'NO_ACTIVE_PLAN' }                      │
│  3. Check `poll_votes` for (poll_id, customer_id)                               │
│     ➜ IF ALREADY VOTED: Return 409 { code: 'ALREADY_VOTED', results: [...] }    │
│  4. IF ELIGIBLE: Store 4-digit code in `poll_otps` (expires in 5 mins)          │
│  5. Send WhatsApp message: "Mom's Kitchen voting code: 4921"                    │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ Customer receives WhatsApp code
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                Cast Vote & Commit                               │
│  1. Customer enters 4-digit OTP & submits                                       │
│  2. POST /api/poll/vote validates OTP                                          │
│  3. Inserts into `public.poll_votes (poll_id, customer_id, option_id)`          │
│     ➜ Protected by `UNIQUE(poll_id, customer_id)` constraint                     │
│  4. Returns live vote counts and percentages for immediate UI feedback          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema (Supabase)

```sql
-- 1. Polls Table (Created and Managed by Admin)
CREATE TABLE public.polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
    closes_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Example options format:
-- [
--   {"id": "opt_1", "label": "Paneer Butter Masala with Naan"},
--   {"id": "opt_2", "label": "Special Dal Makhani with Jeera Rice"},
--   {"id": "opt_3", "label": "Amritsari Chole Kulche Special"}
-- ]

-- 2. Poll Votes Table (Cast by Verified Active Customers)
CREATE TABLE public.poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    option_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- ★ STRICT DUPLICATE GUARD ★
    -- Guarantees that even with concurrent requests, a customer can only vote once per poll
    CONSTRAINT unique_customer_poll_vote UNIQUE (poll_id, customer_id)
);

-- 3. Poll OTPs Table (Temporary Verification Codes)
CREATE TABLE public.poll_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for speedy phone and OTP lookups
CREATE INDEX IF NOT EXISTS idx_poll_otps_phone_expires ON public.poll_otps (phone, expires_at);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes (poll_id);
```

---

## 5. API Endpoints (`tiffin-website`)

### 5.1 `GET /api/poll/active`
- **Purpose**: Returns the currently active poll, total votes, and real-time distribution percentages.
- **Response**:
  ```json
  {
    "poll": {
      "id": "uuid",
      "title": "What should we cook for Friday Lunch?",
      "description": "Vote for your favorite dish! Winning dish will be prepared fresh for all subscribers.",
      "options": [
        { "id": "opt_1", "label": "Paneer Butter Masala", "votes": 42, "percent": 56 },
        { "id": "opt_2", "label": "Dal Makhani & Jeera Rice", "votes": 33, "percent": 44 }
      ],
      "totalVotes": 75,
      "closesAt": "2026-10-02T12:00:00Z"
    }
  }
  ```

### 5.2 `POST /api/poll/send-otp`
- **Body**: `{ "phone": "9876543210", "pollId": "uuid" }`
- **Logic**:
  1. Clean & format phone into E.164 (e.g. `919876543210`).
  2. Query `customers` + `subscriptions`:
     ```sql
     SELECT c.id, c.name FROM public.customers c
     JOIN public.subscriptions s ON s.customer_id = c.id
     WHERE c.phone = :phone AND s.status = 'active'
     LIMIT 1;
     ```
  3. If not found: Return `403` with `{ code: "NO_ACTIVE_PLAN", message: "Voting is exclusive for active subscribers." }`.
  4. Query `poll_votes` where `poll_id = :pollId AND customer_id = :customerId`.
     If found: Return `409` with `{ code: "ALREADY_VOTED", message: "You have already voted for this poll." }`.
  5. Generate 4-digit random OTP (e.g. `4921`).
  6. Insert into `poll_otps` with `expires_at = now() + interval '5 minutes'`.
  7. Send WhatsApp message using Meta Cloud API / WhatsApp provider:
     *"Mom's Kitchen: Your menu voting code is 4921 (valid for 5 minutes). Enter this code to cast your vote!"*
  8. Return `{ ok: true, phoneMasked: "+91 ••••• •43210" }`.

### 5.3 `POST /api/poll/vote`
- **Body**: `{ "phone": "9876543210", "pollId": "uuid", "optionId": "opt_1", "otp": "4921" }`
- **Logic**:
  1. Verify OTP in `poll_otps` (not expired, code matches, `attempts < 3`).
  2. If invalid: Increment attempts, return `400 { error: "Invalid or expired OTP code." }`.
  3. Query `customer_id` for phone.
  4. Insert into `public.poll_votes (poll_id, customer_id, option_id)`.
  5. Delete used OTP.
  6. Return `{ ok: true, message: "Vote cast successfully!" }` with updated poll statistics.

---

## 6. Frontend Components (`tiffin-website`)

1. **`src/components/MenuVotingWidget.tsx`**:
   - Integrated into Homepage (`src/app/page.tsx`) and dedicated page (`src/app/vote/page.tsx`).
   - Styled with card colors: Warm Buttermilk background (`#FFF8ED`), Deep Forest Teal text & borders (`#0C4A48`), Terracotta badges (`#E85A34`), and Turmeric highlights (`#F5A623`).
   - **Step 1 (Select Dish & Enter Phone)**: Radio list of dishes with tempting food icons + Phone number input.
   - **Step 2 (Active Plan Check & OTP)**:
     - If non-subscriber: Renders friendly banner with button to view packs.
     - If already voted: Directly shows the live percentage bars.
     - If active subscriber: Displays 4-digit OTP input with resend countdown timer.
   - **Step 3 (Live Results Display)**: Animated smooth progress bars showing current community voting percentages.

---

## 7. Admin Dashboard (`tiffin-service/dashboard`)

1. **Page `/admin/polls`**:
   - Shows existing polls with Status badge, total votes, and winning dish.
   - "➕ Create Poll" modal: Title, description, dynamic options manager, and deadline.
   - Live Results modal: Real-time progress bar for each option.
   - "Close Poll" toggle button.
2. **Server Actions (`app/actions/polls.ts`)**:
   - `createPollAction`: Inserts new poll into `public.polls`.
   - `closePollAction`: Toggles status to `'closed'`.
   - `deletePollAction`: Safely deletes poll and cascading votes.

---

## 8. Verification & Test Plan

1. **Database Schema Verification**:
   - Run SQL migration script creating `polls`, `poll_votes`, and `poll_otps`.
   - Verify `UNIQUE(poll_id, customer_id)` constraint by attempting duplicate insertion.
2. **Eligibility & Fraud Prevention Testing**:
   - Test non-subscriber phone number $\rightarrow$ Verify `NO_ACTIVE_PLAN` is returned.
   - Test active subscriber phone number $\rightarrow$ Verify WhatsApp OTP is generated and received.
   - Test wrong OTP $\rightarrow$ Verify rejection.
   - Test valid OTP $\rightarrow$ Verify vote is recorded.
   - Test duplicate voting with same phone $\rightarrow$ Verify `ALREADY_VOTED` response.
3. **Dashboard Testing**:
   - Create poll, verify options.
   - Cast test votes, verify live percentage calculation.
   - Close poll, verify voting is blocked.
4. **Website UI Testing**:
   - Verify responsive layout on mobile and desktop.
   - Check build and linter pass with 0 errors.
