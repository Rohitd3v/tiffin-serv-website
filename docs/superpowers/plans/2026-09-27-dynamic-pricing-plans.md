# Dynamic Pricing Plans Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable dynamic meal pricing plans on the marketing website (`tiffin-website`) driven by Supabase, managed via CRUD actions (Add, Edit, Deactivate/Delete) in the existing admin dashboard (`tiffin-service/dashboard`), while retaining the standard WhatsApp trigger message without URL query parameters.

**Architecture:** 
- Supabase `public.plans` table extended with `features TEXT[]` (bullet points) and `popular BOOLEAN` (badge).
- `tiffin-service/dashboard` server actions and UI enhanced with `createPlanAction`, `updatePlanAction`, `deletePlanAction`, and an interactive bullet list manager.
- `tiffin-website` fetches active plans from Supabase with a zero-downtime static fallback, dynamically rendering the "Choose Your Pack" section and preserving the proven static `whatsappUrl` trigger.

**Tech Stack:** Next.js 16 (App Router), React 19, Supabase JS Client, PostgreSQL, Tailwind CSS v4, Framer Motion, TypeScript.

## Global Constraints
- Preserve static WhatsApp trigger: Do NOT add dynamic URL parameters to WhatsApp links. Always use standard `whatsappUrl = "https://wa.me/917033558836?text=Hello! I want to order a tiffin."`.
- Do not create a duplicate dashboard in `tiffin-website`: Manage plans inside `tiffin-service/dashboard`.
- Zero-downtime fallback: If Supabase connection fails or is slow, `tiffin-website` MUST immediately fallback to default starter, regular, and family plans without erroring.
- Stored currency: Prices in `public.plans` are stored in paise (e.g. ₹480 = 48000 paise). The website maps paise to rupees (`price / 100`).

---

### Task 1: Supabase Database Migration & Schema Extension

**Files:**
- Create: `/home/arch/Downloads/tiffin-service/supabase/migrations/20260927000000_add_plan_features_and_popular.sql`
- Script: `/home/arch/Downloads/tiffin-website/scripts/apply-migration.mjs`

**Interfaces:**
- Produces: `public.plans` table with `features TEXT[] DEFAULT '{}'::text[]` and `popular BOOLEAN DEFAULT false`.

- [ ] **Step 1: Write migration SQL file**

Create `/home/arch/Downloads/tiffin-service/supabase/migrations/20260927000000_add_plan_features_and_popular.sql`:
```sql
-- Migration: Add features array and popular boolean flag to public.plans
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false;

-- Backfill default starter plan
UPDATE public.plans
SET features = ARRAY[
  '4 Butter Rotis',
  'Seasonal Veggie',
  'Dal Tadka',
  'Steamed Rice',
  'Salad & Pickle'
]
WHERE code = 'starter' AND (features IS NULL OR array_length(features, 1) IS NULL);

-- Backfill default regular plan (popular)
UPDATE public.plans
SET features = ARRAY[
  '4 Butter Rotis',
  'Two Seasonal Veggies',
  'Premium Dal',
  'Basmati Rice',
  'Dessert (Fri)',
  'Salad & Pickle'
], popular = true
WHERE code = 'regular' AND (features IS NULL OR array_length(features, 1) IS NULL);

-- Backfill default family plan
UPDATE public.plans
SET features = ARRAY[
  'Standard Thali x 2',
  'Large Portions',
  'Extra Sides',
  'Full Week Variety',
  'Free Weekend Special'
]
WHERE code = 'family' AND (features IS NULL OR array_length(features, 1) IS NULL);
```

- [ ] **Step 2: Apply migration to Supabase using service role API or pg script**

Create `/home/arch/Downloads/tiffin-website/scripts/apply-migration.mjs`:
```javascript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking connection to Supabase plans table...");
  const { data, error } = await supabase.from('plans').select('*').limit(3);
  if (error) {
    console.error("Supabase plans query error:", error);
    process.exit(1);
  }
  console.log("Connected successfully. Existing plans:", data.map(p => p.code));
}

run();
```

- [ ] **Step 3: Run migration script and verify connection**

Run: `node /home/arch/Downloads/tiffin-website/scripts/apply-migration.mjs`  
Expected: `Connected successfully. Existing plans: [...]`

- [ ] **Step 4: Commit migration files**

```bash
git add docs/superpowers/plans/
git commit -m "chore: add migration and verification scripts for plan features and popular flag"
```

---

### Task 2: Dashboard Server Actions (`tiffin-service/dashboard`)

**Files:**
- Modify: `/home/arch/Downloads/tiffin-service/dashboard/app/actions/plans.ts`

**Interfaces:**
- Consumes: Admin authentication via `requireAdmin()`, Supabase service role client via `createServiceRoleClient()`.
- Produces:
  - `createPlanAction(data: CreatePlanInput): Promise<{ ok: boolean, plan: PlanRow }>`
  - `updatePlanAction(code: string, data: UpdatePlanInput): Promise<{ ok: boolean }>`
  - `deletePlanAction(code: string): Promise<{ ok: boolean }>`

- [ ] **Step 1: Update `app/actions/plans.ts` with create, update, and delete actions**

Implement the full server actions in `/home/arch/Downloads/tiffin-service/dashboard/app/actions/plans.ts`:
```typescript
"use server";

import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export type PlanPatch = {
  name?: string;
  meals?: number;
  price?: number;
  features?: string[];
  popular?: boolean;
  active?: boolean;
};

export interface CreatePlanInput {
  name: string;
  code: string;
  meals: number;
  price_rupees: number;
  features: string[];
  popular?: boolean;
  active?: boolean;
}

export interface UpdatePlanInput {
  name?: string;
  meals?: number;
  price_rupees?: number;
  features?: string[];
  popular?: boolean;
  active?: boolean;
}

/**
 * Creates a new subscription meal plan.
 */
export async function createPlanAction(data: CreatePlanInput) {
  const auth = await requireAdmin();
  if (!auth.ok) throw new Error("Unauthorized");

  const name = (data.name || "").trim();
  if (!name) throw new Error("Plan name is required");

  const rawCode = (data.code || name).toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/^_+|_+$/g, "");
  if (!rawCode) throw new Error("Valid plan code is required");

  const meals = Number(data.meals);
  if (!Number.isInteger(meals) || meals < 1) throw new Error("Meals must be a positive integer");

  const priceRupees = Number(data.price_rupees);
  if (isNaN(priceRupees) || priceRupees <= 0) throw new Error("Price must be a positive number");

  const features = Array.isArray(data.features)
    ? data.features.map(f => f.trim()).filter(Boolean)
    : [];

  const admin = createServiceRoleClient();

  // Check if code already exists
  const { data: existing } = await admin.from("plans").select("code").eq("code", rawCode).maybeSingle();
  if (existing) throw new Error(`Plan with code "${rawCode}" already exists`);

  const newPlan = {
    code: rawCode,
    name,
    meals,
    price: Math.round(priceRupees * 100), // convert to paise
    features,
    popular: Boolean(data.popular),
    active: data.active !== undefined ? Boolean(data.active) : true,
    created_at: new Date().toISOString(),
  };

  const { data: inserted, error } = await admin.from("plans").insert(newPlan).select().single();
  if (error) throw new Error(error.message);

  await admin.from("system_logs").insert({
    phone: "system",
    event_type: "plan_created",
    payload: { code: rawCode, admin_profile_id: auth.user.id },
  });

  return { ok: true, plan: inserted };
}

/**
 * Updates subscription plan details.
 */
export async function updatePlanAction(code: string, data: UpdatePlanInput) {
  const auth = await requireAdmin();
  if (!auth.ok) throw new Error("Unauthorized");
  if (!code) throw new Error("Missing plan code");

  const patch: PlanPatch = {};

  if (typeof data.name === "string") {
    const name = data.name.trim();
    if (!name) throw new Error("Name cannot be empty");
    patch.name = name;
  }
  if (typeof data.meals === "number") {
    if (data.meals < 1 || !Number.isInteger(data.meals))
      throw new Error("Meals must be a positive integer");
    patch.meals = data.meals;
  }
  if (typeof data.price_rupees === "number") {
    if (data.price_rupees <= 0)
      throw new Error("Price must be positive");
    patch.price = Math.round(data.price_rupees * 100);
  }
  if (Array.isArray(data.features)) {
    patch.features = data.features.map(f => f.trim()).filter(Boolean);
  }
  if (typeof data.popular === "boolean") {
    patch.popular = data.popular;
  }
  if (typeof data.active === "boolean") {
    patch.active = data.active;
  }

  if (Object.keys(patch).length === 0)
    throw new Error("No valid fields to update");

  const admin = createServiceRoleClient();
  const { error } = await admin.from("plans").update(patch).eq("code", code);
  if (error) throw new Error(error.message);

  await admin.from("system_logs").insert({
    phone: "system",
    event_type: "plan_updated",
    payload: { code, patch, admin_profile_id: auth.user.id },
  });

  return { ok: true };
}

/**
 * Deactivates or removes a subscription plan safely.
 */
export async function deletePlanAction(code: string) {
  const auth = await requireAdmin();
  if (!auth.ok) throw new Error("Unauthorized");
  if (!code) throw new Error("Missing plan code");

  const admin = createServiceRoleClient();

  // Check if any active subscriptions use this plan
  const { count, error: countErr } = await admin
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("pack_type", code)
    .eq("status", "active");

  if (!countErr && (count ?? 0) > 0) {
    // Soft-deactivate if active subscriptions exist
    await admin.from("plans").update({ active: false }).eq("code", code);
    await admin.from("system_logs").insert({
      phone: "system",
      event_type: "plan_deactivated_has_active_subs",
      payload: { code, active_subscriptions_count: count },
    });
    return { ok: true, deactivated: true, message: `Plan deactivated because ${count} active subscription(s) reference it.` };
  }

  const { error } = await admin.from("plans").delete().eq("code", code);
  if (error) throw new Error(error.message);

  await admin.from("system_logs").insert({
    phone: "system",
    event_type: "plan_deleted",
    payload: { code, admin_profile_id: auth.user.id },
  });

  return { ok: true, deleted: true };
}
```

- [ ] **Step 2: Typecheck dashboard server actions**

Run: `pnpm --prefix /home/arch/Downloads/tiffin-service/dashboard build --dry-run` or verify typecheck.

---

### Task 3: Dashboard Plans UI Component (`tiffin-service/dashboard`)

**Files:**
- Modify: `/home/arch/Downloads/tiffin-service/dashboard/components/plans/PlansPageClient.tsx`
- Modify: `/home/arch/Downloads/tiffin-service/dashboard/lib/queries/plans.ts`

**Interfaces:**
- Produces: Enhanced UI with "➕ Add New Plan" modal, dynamic bullet-point list input, "Most Chosen" Popular toggle, and Delete action.

- [ ] **Step 1: Update `PlanRow` interface in `lib/queries/plans.ts`**

Update `/home/arch/Downloads/tiffin-service/dashboard/lib/queries/plans.ts`:
```typescript
export interface PlanRow {
  id: string;
  code: string;
  name: string;
  meals: number;
  price: number; // paise
  active: boolean;
  description?: string | null;
  features?: string[] | null;
  popular?: boolean | null;
  created_at: string;
}
```

- [ ] **Step 2: Update `PlansPageClient.tsx` with Add Modal, Features list, and Popular toggle**

Implement in `/home/arch/Downloads/tiffin-service/dashboard/components/plans/PlansPageClient.tsx`:
- Add button: `<Button onClick={() => setCreating(true)}>➕ Add Plan</Button>`
- Modal for Creation: Name, Code, Meals, Price in ₹, Popular Toggle, Bullet Point inputs (add bullet, remove bullet), Active switch.
- Modal for Editing: Name, Meals, Price in ₹, Popular Toggle, Bullet Point inputs, Active switch.
- Action Buttons in Table: Edit, Toggle Active, Delete.

---

### Task 4: Website Data Layer (`tiffin-website`)

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/plans.ts`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local`.
- Produces:
  - `export interface PublicPlan { id: string; code: string; name: string; meals: number; price: number; features: string[]; popular: boolean; color: string; }`
  - `export async function getPublicPlans(): Promise<PublicPlan[]>`

- [ ] **Step 1: Install `@supabase/supabase-js`**

Run: `npm install @supabase/supabase-js` in `/home/arch/Downloads/tiffin-website`.

- [ ] **Step 2: Create `src/lib/supabase.ts`**

Create `/home/arch/Downloads/tiffin-website/src/lib/supabase.ts`:
```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
```

- [ ] **Step 3: Create `src/lib/plans.ts` with Fallback & Data Fetcher**

Create `/home/arch/Downloads/tiffin-website/src/lib/plans.ts`:
```typescript
import { supabase } from "./supabase";

export interface PublicPlan {
  id: string;
  code: string;
  name: string;
  meals: number;
  price: number; // in Rupees
  features: string[];
  popular: boolean;
  color: string;
}

export const DEFAULT_PLANS: PublicPlan[] = [
  {
    id: "default-starter",
    code: "starter",
    name: "Starter",
    meals: 6,
    price: 480,
    color: "bg-brutal-card-peach",
    popular: false,
    features: [
      "4 Butter Rotis",
      "Seasonal Veggie",
      "Dal Tadka",
      "Steamed Rice",
      "Salad & Pickle",
    ],
  },
  {
    id: "default-regular",
    code: "regular",
    name: "Regular",
    meals: 12,
    price: 900,
    color: "bg-brutal-accent",
    popular: true,
    features: [
      "4 Butter Rotis",
      "Two Seasonal Veggies",
      "Premium Dal",
      "Basmati Rice",
      "Dessert (Fri)",
      "Salad & Pickle",
    ],
  },
  {
    id: "default-family",
    code: "family",
    name: "Family",
    meals: 24,
    price: 1680,
    color: "bg-brutal-card-lilac",
    popular: false,
    features: [
      "Standard Thali x 2",
      "Large Portions",
      "Extra Sides",
      "Full Week Variety",
      "Free Weekend Special",
    ],
  },
];

const CARD_COLORS = [
  "bg-brutal-card-peach",
  "bg-brutal-accent",
  "bg-brutal-card-lilac",
  "bg-brutal-card-lemon",
  "bg-brutal-card-mint",
];

export async function getPublicPlans(): Promise<PublicPlan[]> {
  if (!supabase) {
    return DEFAULT_PLANS;
  }

  try {
    const { data, error } = await supabase
      .from("plans")
      .select("id, code, name, meals, price, features, popular, active")
      .eq("active", true)
      .neq("code", "one_time")
      .order("price", { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.warn("Supabase fetch plans error, using defaults:", error.message);
      return DEFAULT_PLANS;
    }

    return data.map((item, idx) => {
      // Map price from paise to rupees
      const priceRupees = typeof item.price === "number" ? Math.round(item.price / 100) : 0;
      const isPopular = Boolean(item.popular);
      const color = isPopular ? "bg-brutal-accent" : CARD_COLORS[idx % CARD_COLORS.length];

      const features = Array.isArray(item.features) && item.features.length > 0
        ? item.features
        : [
            "Fresh Butter Rotis",
            "Homestyle Seasonal Sabzi",
            "Healthy Dal Tadka",
            "Steamed Rice & Pickle",
          ];

      return {
        id: item.id || item.code,
        code: item.code,
        name: item.name,
        meals: item.meals,
        price: priceRupees,
        features,
        popular: isPopular,
        color,
      };
    });
  } catch (err) {
    console.warn("Error in getPublicPlans, using fallback defaults:", err);
    return DEFAULT_PLANS;
  }
}
```

- [ ] **Step 4: Test `getPublicPlans` locally with a quick scratch runner**

Run: `node -e "import('./src/lib/plans.ts')"` or verify via build.

---

### Task 5: Dynamic "Choose Your Pack" Section (`src/app/page.tsx`)

**Files:**
- Modify: `src/app/page.tsx:250-360`

**Interfaces:**
- Consumes: `getPublicPlans()` from `@/lib/plans`.
- Produces: Dynamic card grid rendering plans with check icons, prices, features, and static `whatsappUrl` trigger.

- [ ] **Step 1: Load dynamic plans in Home component**

Update `src/app/page.tsx` to fetch plans via `useEffect` / state (or server component wrapper):
```tsx
import { useEffect, useState } from "react";
import { getPublicPlans, PublicPlan, DEFAULT_PLANS } from "@/lib/plans";

// inside Home component:
const [plans, setPlans] = useState<PublicPlan[]>(DEFAULT_PLANS);

useEffect(() => {
  let mounted = true;
  getPublicPlans().then((fetched) => {
    if (mounted && fetched.length > 0) {
      setPlans(fetched);
    }
  });
  return () => { mounted = false; };
}, []);
```

- [ ] **Step 2: Dynamically map `plans` in the "Choose Your Pack" grid**

Render each plan:
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-10">
  {plans.map((plan, idx) => (
    <motion.div
      key={plan.id || plan.code || idx}
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.4,
        delay: idx * 0.15,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`brutalist-card ${plan.color} flex flex-col h-full relative overflow-hidden`}
    >
      {plan.popular && (
        <div className="absolute top-8 -right-12 bg-brutal-pop text-white font-black text-[10px] uppercase py-1 px-12 rotate-45 border-y-2 border-brutal-border">
          Most Chosen
        </div>
      )}

      <h4 className="text-4xl font-black uppercase mb-2 text-brutal-text">
        {plan.name}
      </h4>
      <div className="font-mono font-bold text-sm mb-6 opacity-70 uppercase tracking-wider">
        {plan.meals} Full Meals
      </div>

      <div className="text-5xl font-black mb-8 border-b-2 border-brutal-border pb-4">
        ₹{plan.price}
      </div>

      <ul className="flex-1 space-y-3 mb-10">
        {plan.features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2 font-medium text-sm"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-brutal-text" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* Static WhatsApp trigger without dynamic URL parameters */}
      <motion.a
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        href={whatsappUrl}
        className="bg-brutal-border text-white text-center py-4 font-bold uppercase shadow-brutal hover:bg-brutal-pop transition-colors flex items-center justify-center gap-2 group border-[3px] border-brutal-border"
      >
        Order This{" "}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </motion.a>
    </motion.div>
  ))}
</div>
```

---

### Task 6: Verification & Build Check

**Files:**
- Touch: all modified files

- [ ] **Step 1: Run production build on `tiffin-website`**

Run: `npm run build`  
Expected: `✓ Compiled successfully` with zero errors.

- [ ] **Step 2: Run linter on `tiffin-website`**

Run: `npm run lint`  
Expected: `0 problems`.

- [ ] **Step 3: Commit all changes**

```bash
git add .
git commit -m "feat: make Choose Your Pack dynamic with Supabase and dashboard CRUD support"
```
