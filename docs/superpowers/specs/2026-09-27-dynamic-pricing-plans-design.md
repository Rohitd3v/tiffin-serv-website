# Design Spec: Dynamic Pricing Plans & Dashboard Management

**Date:** 2026-09-27  
**Status:** Approved  
**Topic:** Dynamic Pricing Plans for Website & CRUD Management in Existing Dashboard  

---

## 1. Overview & Goals

### 1.1 Context
Mom's Kitchen operates a customer-facing website (`tiffin-website`), an administrative dashboard (`tiffin-service/dashboard`), and a WhatsApp order bot (`tiffin-service/backend`) connecting to a shared Supabase database (`public.plans`).

Previously, the "Choose Your Pack" pricing section on the website was hardcoded with 3 plans (Starter, Regular, Family). The owner wants to manage pricing plans (Add, Edit, Remove/Deactivate) from the existing administrative dashboard, and have the website automatically reflect these changes.

### 1.2 Goals
1. **Extend Supabase `public.plans` Schema**: Add support for card feature bullet points (`features TEXT[]`) and a "Most Chosen" ribbon flag (`popular BOOLEAN`).
2. **Dashboard Management (`tiffin-service/dashboard`)**:
   - Provide an "Add New Plan" modal with input validation.
   - Enhance the "Edit Plan" modal to edit bullet points and toggle the popular badge.
   - Provide a safe Delete / Deactivate action with subscription checks.
3. **Dynamic Website Pricing (`tiffin-website`)**:
   - Fetch active plans dynamically from Supabase `public.plans`.
   - Provide a resilient fallback to default plans if the database connection is delayed or unreachable.
   - Retain the proven standard bot trigger message in the WhatsApp button URL (per user instruction) to ensure no regressions in bot handling.

### 1.3 Non-Goals
- **No dynamic WhatsApp URLs**: Do NOT append plan-specific text to the WhatsApp link. Keep the standard bot trigger URL (`https://wa.me/917033558836?text=Hello! I want to order a tiffin.`) to preserve existing bot NLP and state machine flows.
- **No duplicate dashboard**: Do not create a separate `/admin` dashboard in `tiffin-website`; use the existing management interface in `tiffin-service/dashboard`.

---

## 2. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Database                        │
│                  (public.plans table)                       │
│      [code, name, meals, price, features, popular, active]  │
└───────────────────────▲─────────────────────────────┬───────┘
                        │ Read/Write                  │ Read (active=true)
                        │                             ▼
        ┌───────────────┴───────────────┐     ┌───────────────┴───────────────┐
        │   Existing Admin Dashboard    │     │      Customer Landing Page    │
        │   (tiffin-service/dashboard)  │     │       (tiffin-website)        │
        │  • Add / Create New Plan      │     │  • Fetches active plans       │
        │  • Edit Details & Features    │     │  • Dynamic "Choose Your Pack" │
        │  • Toggle Active / Delete     │     │  • Standard WhatsApp CTA Link │
        └───────────────────────────────┘     └───────────────┬───────────────┘
                                                              │
                                                              ▼
                                              ┌───────────────────────────────┐
                                              │      WhatsApp Bot Flow        │
                                              │   • Standard trigger message  │
                                              │   • Bot presents plans from   │
                                              │     the same public.plans DB  │
                                              │   • Orchestrates payment      │
                                              └───────────────────────────────┘
```

---

## 3. Database Schema Extension (`public.plans`)

```sql
-- Migration: Add features and popular columns to public.plans
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false;

-- Backfill existing default plans with initial feature bullets
UPDATE public.plans
SET features = ARRAY[
  '4 Butter Rotis',
  'Seasonal Veggie',
  'Dal Tadka',
  'Steamed Rice',
  'Salad & Pickle'
]
WHERE code = 'starter' AND (features IS NULL OR array_length(features, 1) IS NULL);

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

---

## 4. Dashboard Implementation (`tiffin-service/dashboard`)

### 4.1 Server Actions (`app/actions/plans.ts`)
1. **`createPlanAction(data)`**:
   - Requires admin authentication (`requireAdmin()`).
   - Validates fields:
     - `name`: Non-empty string.
     - `code`: Unique lowercase slug (e.g. `starter`, `regular_plus`).
     - `meals`: Integer $\ge 1$.
     - `price_rupees`: Number $> 0$, stored as paise (`Math.round(price_rupees * 100)`).
     - `features`: Array of non-empty strings.
     - `popular`: Boolean.
     - `active`: Boolean (default `true`).
   - Inserts into `public.plans`.
   - Logs event in `system_logs` (`event_type: "plan_created"`).
2. **`updatePlanAction(code, data)`**:
   - Updates `name`, `meals`, `price` (paise), `features`, `popular`, and `active`.
   - Logs event in `system_logs` (`event_type: "plan_updated"`).
3. **`deletePlanAction(code)`**:
   - Checks if any active subscription references `pack_type = code`.
   - If referenced: Rejects deletion with error and suggests setting `active = false` instead.
   - If not referenced: Deletes row from `public.plans`.
   - Logs event in `system_logs` (`event_type: "plan_deleted"`).

### 4.2 UI Component (`components/plans/PlansPageClient.tsx`)
- **Add Plan Button**: Top-right button opening "Create Plan" modal.
- **Form Fields in Modal**:
  - Name, Code, Meals, Price in ₹.
  - "Most Chosen" Popular toggle.
  - Dynamic Bullet Points editor: Add item, remove item, reorder.
  - Active toggle.
- **Plans Table**:
  - Columns: Active Badge, Code, Name, Meals, Price (₹), Popular Badge, Features Count, Actions.
  - Actions: Edit modal button, Quick Activate/Deactivate toggle, Delete button (with confirmation).

---

## 5. Website Implementation (`tiffin-website`)

### 5.1 Supabase Client & Data Fetching (`src/lib/plans.ts`)
- Interface `Plan`:
  ```typescript
  export interface Plan {
    id: string;
    code: string;
    name: string;
    meals: number;
    price: number; // in Rupees
    features: string[];
    popular: boolean;
    active: boolean;
    color?: string;
  }
  ```
- Default Fallback Plans: Hardcoded array of default Starter, Regular, Family packs used when Supabase is not reachable.
- Function `getPublicPlans()`:
  - Queries `public.plans` via Supabase client:
    `.from('plans').select('*').eq('active', true).neq('code', 'one_time').order('price', { ascending: true })`
  - Maps `price` (paise) to Rupees: `Math.round(p.price / 100)`.
  - Assigns theme colors cyclically:
    - 0: `bg-brutal-card-peach`
    - 1 / Popular: `bg-brutal-accent`
    - 2: `bg-brutal-card-lilac`
  - Fallback logic: If any error occurs or array is empty, logs warning and returns default plans.

### 5.2 Dynamic Section Rendering (`src/app/page.tsx`)
- Fetches plans via `getPublicPlans()`.
- Maps plans dynamically in the "Choose Your Pack" grid.
- Renders:
  - `plan.name`
  - `plan.meals` Full Meals
  - `₹${plan.price}`
  - `plan.features` list with check icons.
  - `Most Chosen` ribbon if `plan.popular === true`.
  - Static WhatsApp CTA:
    ```tsx
    <motion.a
      href={whatsappUrl}
      className="..."
    >
      Order This <ArrowRight className="..." />
    </motion.a>
    ```
    *(Preserves the standard bot trigger text without dynamic URL parameters).*

---

## 6. Error Handling & Edge Cases

| Scenario | Handled By | Outcome |
| :--- | :--- | :--- |
| **Supabase DB offline / network timeout** | `getPublicPlans()` try-catch | Automatically renders default plans; site stays fast & live. |
| **Plan deleted in dashboard while in active subscription** | `deletePlanAction()` guard | Prevents deletion; guides admin to set `active = false`. |
| **Plan has no features entered** | Dashboard validator & fallback | Defaults to `['Freshly Cooked Homestyle Meal']`. |
| **Price format mismatch (Paise vs Rupees)** | Server actions & display mapper | Stored as paise in DB, converted cleanly to ₹ on frontend. |
| **WhatsApp trigger stability** | Static `whatsappUrl` constraint | Bot receives standard trigger; no NLP/URL parsing bugs. |

---

## 7. Verification Plan

1. **Database Schema Verification**:
   - Check columns `features` and `popular` in Supabase.
   - Verify backfilled default data.
2. **Dashboard Verification (`tiffin-service/dashboard`)**:
   - Test adding a new plan (e.g. "Executive Pack", 15 meals, ₹1200).
   - Test editing features list and popular toggle.
   - Test deactivating and deleting.
   - Run type checks and build on dashboard.
3. **Website Verification (`tiffin-website`)**:
   - Verify dynamic plans load and display correctly on homepage.
   - Verify card colors, badges, and bullet points match design.
   - Test button click to ensure WhatsApp opens with standard bot trigger.
   - Test fallback behavior by simulating offline database.
   - Run `npm run build` and `npm run lint`.
