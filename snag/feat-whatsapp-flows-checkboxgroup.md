# Snag List — `feat/whatsapp-flows-checkboxgroup`

| | |
|---|---|
| **Branch** | `feat/whatsapp-flows-checkboxgroup` |
| **Base** | `main` |
| **Updated** | 2026-09-27 |
| **Scope** | WhatsApp Flows `CheckboxGroup` Multi-Select Delivery Schedule, FSM Back Navigation Matrix, Dynamic Meal Plans Manager, Customer Menu Voting System |
| **Verification** | Backend tests (`npm test` / `vitest run`) → **155 test files passed (1,621 passed)**; `npm run build` (`tsc`) → **Clean build (0 errors)**; Dashboard `tsc --noEmit` → **0 errors**; Supabase Live Verified |

---

## Summary of Changes

| # | Severity / Type | Area | Finding / Requirement | Status |
|---|-----------------|------|-----------------------|--------|
| 1 | FEATURE / META CLOUD API | WhatsApp Flow Dispatch (`core/types.ts`, `meta-cloud.ts`) | Added `WaFlowParams` and `IChakraClient.waFlow` to allow dispatching native WhatsApp Flow interactive messages (`type: "flow"`) via Meta Cloud API v21.0 messages endpoint with circuit breaker protection. | ✅ Resolved |
| 2 | FEATURE / CONFIG | App Configuration (`config.ts`) | Added optional `META_FLOW_SCHEDULE_ID` configuration parameter in Zod schema and `AppConfig` interface with full JSDoc. | ✅ Resolved |
| 3 | FEATURE / WEBHOOK INGESTION | Webhook Ingestion & Parser (`parse-message.ts`) | Extended `parseWhatsAppMessage` and `ParsedMessage` to recognize `interactive.type === 'nfm_reply'` (Native Flow Message reply) and parse JSON payload into `flow_data`. | ✅ Resolved |
| 4 | FEATURE / PROMPT RENDERING | FSM Prompt Renderer (`render-prompt.ts`) | Updated `awaiting_days` prompt to dispatch `waFlow` with `SCHEDULE_SCREEN` when `META_FLOW_SCHEDULE_ID` is configured, while preserving automatic fallback to standard buttons if unconfigured. | ✅ Resolved |
| 5 | FEATURE / FSM HANDLER | Schedule Step Handler (`awaiting-days/index.ts`) | Added `flow_data.selected_days` / `flow_data.delivery_days` handling in `handleButtonsSubStep` and `handleToggleSubStep` to validate, sort, format label, persist draft, and transition to `awaiting_packaging_preference` in a single interaction. | ✅ Resolved |
| 6 | BUG / FSM NAVIGATION | Back Button Matrix (`fsm-back-navigation-matrix.integration.test.ts`) | Built an exhaustive 32-test matrix covering 8 full user journeys forward and backward across all 18 bot FSM steps, testing both versioned interactive button replies (`back_button`) and free-text inputs (`"back"`). | ✅ Resolved |
| 7 | BUG / STEP HANDLERS | Step Rollback Remediation (`returning-user-confirm.ts`, `change-delivery-menu.ts`, `awaiting-feedback.ts`, `home-screen.ts`, `lua-scripts.ts`, `interaction-codec.ts`) | Fixed missing `StateHistoryManager.push` before step transitions, added draft initialization before CAS updates, added missing domain action bindings, and resolved initial draft creation in Lua script CAS. | ✅ Resolved |
| 8 | SECURITY / CRYPTO | Cryptographic `flow_token` (`meta-cloud.ts`) | Replaced `Date.now()` timestamp in `flow_token` with `crypto.randomUUID()` to prevent predictable token guessing and CSRF/replay vulnerabilities (C1). | ✅ Resolved |
| 9 | SECURITY / VALIDATION | Flow Data Schema Validation (`parse-message.ts`) | Added Zod schema validation to `nfm_reply` JSON parsing to ensure only valid object shapes and array structures are accepted (C2). | ✅ Resolved |
| 10 | TEST HYGIENE | Restored Error Handling Tests (`awaiting-feedback.test.ts`) | Restored `fetchSessionContext` error recovery test alongside rating range validation tests (H2). | ✅ Resolved |
| 11 | CODE QUALITY | ChakraHQ Adapter Stub & DRY Refactoring (`chakra.ts`, `awaiting-days/index.ts`, `home-screen.ts`) | Passed `history_stack: ['NEW']` on `home_help_refund` (M3) and extracted shared `processFlowDataResponse` helper in `awaiting-days/index.ts` (M4). | ✅ Resolved |
| 12 | BUG / PROVIDER COMPATIBILITY | ChakraHQ waFlow Crash Fix (`chakra.ts`, `render-prompt.ts`) | Removed throwing `waFlow` stub from ChakraHQ client to prevent breaking capability detection. Added `WHATSAPP_PROVIDER !== 'chakra'` check and try-catch fallback in `render-prompt.ts` so ChakraHQ and provider errors cleanly fall back to `waButtons`. | ✅ Resolved |
| 13 | REQUIREMENT / FSM ROUTING | Enforce Checkbox-Only Schedule & Remove Text Typing (`orchestrator.ts`, `render-prompt.ts`, `awaiting-days/index.ts`) | Reinstated `'awaiting_days'` in `BUTTON_ONLY_STEPS` in `orchestrator.ts` (with `!flow_data` bypass for Flow submissions). Removed all day text typing instructions, removed `parseCustomDays` execution from `handleButtonsSubStep` and `handleToggleSubStep`. All schedule selection is strictly 100% interactive via WhatsApp Flow `CheckboxGroup` or toggle list. | ✅ Resolved |
| 14 | ROBUSTNESS / WEBHOOK PARSER | Object `response_json` Parsing (`parse-message.ts`) | Updated `parseWhatsAppMessage` to safely handle `response_json` when provided as either a string or pre-deserialized object without throwing. | ✅ Resolved |
| 15 | FEATURE / META CLOUD API | `mode` & `data` Parameters (`types.ts`, `meta-cloud.ts`) | Added optional `mode` (`'draft'` \| `'published'`) and `data` initial screen payload to `WaFlowParams` and forwarded to Meta Cloud interactive flow message parameters. | ✅ Resolved |
| 16 | FEATURE / FSM HANDLER | Sunday Rejection Notification in Flow (`awaiting-days/index.ts`) | Added specific Sunday closed notification when flow data contains only Sunday. | ✅ Resolved |
| 17 | INTEGRATION TESTS | WhatsApp Flow & Interactive Schedule Matrix (`fsm-back-navigation-matrix.integration.test.ts`) | Updated integration suite to verify WhatsApp Flow `nfm_reply` progression, `waFlow` re-dispatch on rewind, and explicit rejection of typed free-text schedules (`"MWF"`, `"Mon, Wed, Fri"`) at `awaiting_days`. | ✅ Resolved |
| 18 | UNIT TESTS | Extended Flow Test Coverage (`render-prompt-flow.test.ts`, `parse-message-flow.test.ts`, `meta-cloud-flow.test.ts`, `awaiting-days-flow-response.test.ts`) | Added unit tests for Chakra fallback, try/catch error fallback, object `response_json`, `mode: 'draft'`, flow `data`, Sunday notification, and invalid day tokens. | ✅ Resolved |
| 19 | TEST SUITE & VERIFICATION | Whole-Suite Regression Testing | 155 / 155 test files passed; TypeScript build passes with zero errors. | ✅ Resolved |
| 20 | BUG / FSM STEP | Sunday Silent Drop in Multi-Day Selection (`awaiting-days/index.ts`) | Evaluated Sunday rejection upfront before length check, ensuring users selecting Sunday with weekdays receive closure warning rather than silently dropping Sunday. | ✅ Resolved |
| 21 | FEATURE / ROBUSTNESS | Case-Insensitive & Full-Name Day Token Normalization in WhatsApp Flow (`awaiting-days/index.ts`) | Added `DAY_TOKEN_MAP` and `normalizeFlowDays` to support `"Monday"`, `"Mon"`, `"MON"` without failing schedule selection. | ✅ Resolved |
| 22 | BUG / PROMPT RENDERER | Schedule Screen Flow Rendering on Back Navigation (`render-prompt.ts`) | Fixed `sd_day_sub_step === 'buttons'` check in `renderStepPrompt` to re-dispatch `waFlow` instead of falling back to legacy buttons when returning from toggle mode. | ✅ Resolved |
| 23 | UX / PARITY | Returning User Prompt with Address on Rewind (`render-prompt.ts`) | Displayed customer name and saved delivery address on `returning_user_confirm` rewind prompt to maintain context for "Deliver here ✅". | ✅ Resolved |
| 24 | STATE MANAGEMENT | Forward `history_stack` in Quick Order transition (`returning-user-confirm.ts`) | Passed `history_stack: metadata.history_stack` in `handleAwaitingPack` call. | ✅ Resolved |
| 25 | FEATURE / FSM ROLLOVER | One-Time Trial Meal Cutoff & Next-Day Rollover Flow (`awaiting-slot.ts`, `time.ts`, `payment-orchestrator.ts`, `handle-webhook-event.ts`, `save-session.ts`, `draft-session.ts`, `fetch-context.ts`, `awaiting-schedule-confirmation.ts`) | Implemented interactive next-day and Monday rollover for trial meals ordered past cutoff or on Sundays, with explicit confirmation buttons (`Dinner Today 🌙`, `Lunch Tomorrow 🍱`, `Confirm Tomorrow 🍱`, `Confirm Monday 🍱`), target delivery date calculation, and webhook notification date formatting. | ✅ Resolved |
| 26 | BUG / FSM ENTRY GUARDS | Sunday One-Time Upstream Blocking Guards Removed (`home-screen.ts`, `awaiting-pack.ts`, `awaiting-address-confirm.ts`, `awaiting-address.ts`) | Removed legacy hardcoded Sunday `isSunday` session reset blocks from upstream registration, pack selection, and address steps, unblocking real Sunday customers to reach `awaiting_slot` and schedule for Monday rollover. | ✅ Resolved |
| 27 | CODE QUALITY / HYGIENE | Shadowed `IST_OFFSET_MS` Cleanup (`payment-orchestrator.ts`) | Removed redundant module-level and function-level `IST_OFFSET_MS` definitions; imported canonical constant from `shared/utils/time`. | ✅ Resolved |
| 28 | TEST COVERAGE & HYGIENE | Extended Test Suite (`awaiting-slot.test.ts`, `fsm-back-navigation-matrix.integration.test.ts`, `awaiting-days-flow-response.test.ts`, `payment-orchestrator.test.ts`) | Added tests for Saturday midday cutoff offering Monday Lunch, Sunday end-to-end trial meal journey, WhatsApp Flow malformed day tokens rejection, and payment link cutoff expiry on scheduled delivery date. | ✅ Resolved |
| 29 | CODE QUALITY / DOCS | Cut-off Alignment & Diagram Parity (`whatsapp-bot-flow.md`, `whatsapp-bot-flow.mmd`, `interactive-flow.html`, `whatsapp-bot-flow-diagram.html`, `whatsapp-bot-flow-diagram.svg`) | Aligned stale cut-off references (Lunch 7 AM, Dinner 3 PM) to canonical 12:00 PM lunch and 5:30 PM dinner cutoffs and replaced hard-rejection diagrams with interactive rollover branches. | ✅ Resolved |
| 30 | FUNCTIONAL / STATE HYGIENE | Rollover Target Delivery Date & Day Label Draft Persistence (`awaiting-slot.ts`, `awaiting-slot.test.ts`) | Saved displayed `delivery_date` and `day_label` in draft session during rollover prompt generation and reused them when customer taps tomorrow or Monday rollover buttons to eliminate midnight boundary drift. | ✅ Resolved |
| 31 | DB / MIGRATION | Plan Features & Popular Ribbon (`20260927000000_add_plan_features_and_popular.sql`) | Added `features TEXT[]` and `popular BOOLEAN` columns to `public.plans` with backfills for starter, regular, and family plans. | ✅ Resolved (`6465a39`) |
| 32 | BACKEND / SERVER ACTIONS | Dynamic Plans CRUD Actions (`dashboard/app/actions/plans.ts`) | Implemented `createPlanAction`, `updatePlanAction`, and `deletePlanAction` with active subscription foreign key safety check (soft-deactivates instead of deleting). | ✅ Resolved (`bb6c417`) |
| 33 | DASHBOARD UI | Plans Management Interface (`dashboard/components/plans/PlansPageClient.tsx`) | Added "➕ Add Plan" modal, dynamic feature bullet points editor, popular ribbon toggle, and delete flow. | ✅ Resolved (`7c8ce1e`) |
| 34 | DB / MIGRATION | Customer Menu Polls Schema (`20260927000001_create_polls_and_votes.sql`) | Created `public.polls`, `public.poll_votes`, and `public.poll_otps` with atomic `CONSTRAINT unique_customer_poll_vote UNIQUE (poll_id, customer_id)`. | ✅ Resolved (`04a5fcf`) |
| 35 | BACKEND / SERVER ACTIONS | Menu Polls Actions & Queries (`dashboard/app/actions/polls.ts`, `dashboard/lib/queries/polls.ts`) | Implemented `createPollAction`, `closePollAction`, `deletePollAction`, and `fetchAdminPolls` with single-query vote aggregation and winner calculation. | ✅ Resolved (`7b06afe`) |
| 36 | DASHBOARD UI | Customer Menu Polls Manager (`dashboard/app/(admin)/polls/page.tsx`, `dashboard/components/polls/PollsPageClient.tsx`) | Built `/admin/polls` interface with poll creator modal, dynamic dish options list, closing deadlines, and live percentage progress bars. | ✅ Resolved (`7b06afe`) |

---

## 1 — Strict Checkbox-Only Schedule Selection (No Free-Text Day Typing)

### User Story & Context
Previously, customers at `awaiting_days` were allowed to either tap buttons, open a toggle list, or type arbitrary text such as `"MWF"`, `"Mon, Wed, Fri"`, or `"Tue, Thu"`. While flexible, free-text parsing introduced customer confusion, typos (e.g. `"MMF"`, `"mondy"`), and unpredictable edge-case handling.

To ensure a seamless, unambiguous, and error-free checkout experience, the business requirement was established:
> **Customers must only select delivery days via interactive checkbox mechanisms (Meta WhatsApp Flows `CheckboxGroup` or the WhatsApp list toggle). All free-text day typing must be strictly rejected.**

### Technical Implementation
1. **Orchestrator Button-Only Guard (`orchestrator.ts`):**
   - Reinstated `'awaiting_days'` inside `BUTTON_ONLY_STEPS`.
   - Updated the guard condition:
     ```typescript
     if (!parsed.reply_id && !parsed.flow_data && parsed.text && BUTTON_ONLY_STEPS.has(context.step)) {
       await services.chakra.waText(
         parsed.phone,
         'Please select one of the options from the menu below to continue 🍱:',
       );
       await renderStepPrompt(parsed.phone, context.step, context, services);
       return;
     }
     ```
   - Crucially, `!parsed.flow_data` ensures that native WhatsApp Flow interactive submissions (`nfm_reply`) pass cleanly through to step execution, while any typed text is caught and rejected.
2. **Removed Day Text Parsing from Step Handler (`awaiting-days/index.ts`):**
   - Stripped `parseCustomDays` execution from both `handleButtonsSubStep` and `handleToggleSubStep`.
   - Any raw text received in toggle sub-step is treated as unrecognized input and prompts:
     `"⚠️ We could not recognize that option. Please tap a day to select, then tap Done ✅."`
3. **Prompt Copy (`render-prompt.ts`):**
   - Removed the typing prompt instruction `"(Or reply by typing days like 'Mon, Wed, Fri')"`.
4. **Preserved Back Navigation Parity:**
   - Global back navigation (`"BACK"` / `"back"` / `back_button`) is handled at Step 6 before the free-text guard (Step 8), allowing customers to rewind to `awaiting_slot` cleanly using either text `"BACK"` or the interactive button.

---

## 2 — WhatsApp Flows Multi-Select Schedule Architecture

### Overview
Meta WhatsApp Flows provides a native multi-select checkbox sheet inside WhatsApp. The customer opens the form sheet, checks any combination of days (Mon–Sat) in a single screen, and taps "Confirm Schedule ✅" to submit their full schedule in **1 single interaction**.

### Key Components
- **Client Dispatch (`meta-cloud.ts`):** Constructs Meta Cloud API v21.0 payload with `type: "flow"`, `flow_action: "navigate"`, and screen payload `SCHEDULE_SCREEN`. Generates cryptographic UUIDs for `flow_token`. Supports optional `mode` (`'draft'` | `'published'`) and initial screen `data`.
- **Webhook Ingestion (`parse-message.ts`):** Parses `interactive.type === 'nfm_reply'`. Safely handles both stringified JSON and pre-deserialized object payloads, validates via Zod schema, and populates `flow_data`.
- **FSM Prompt Rendering (`render-prompt.ts`):** Automatically dispatches `waFlow` if `META_FLOW_SCHEDULE_ID` is configured and `WHATSAPP_PROVIDER !== 'chakra'`. Safely falls back to interactive buttons if the flow call fails or is unconfigured.
- **Single-Interaction Execution (`awaiting-days/index.ts`):** Validates received days, sorts chronologically, generates label, saves to draft session, and advances to `awaiting_packaging_preference`. Rejects Sunday submissions with `"🏖️ Mom's Kitchen is closed on Sundays!"`.

---

## 3 — Provider Compatibility & Fallback (ChakraHQ vs Meta Cloud)

### Problem
In `chakra.ts`, a dummy `waFlow` method was implemented that unconditionally threw `new Error('waFlow not supported on ChakraHQ adapter')`. When `render-prompt.ts` attempted to call `services.chakra.waFlow`, the thrown error crashed the bot execution, preventing fallback to standard buttons.

### Solution
1. Removed the throwing `waFlow` stub from `chakra.ts` so `typeof services.chakra.waFlow === 'function'` accurately reflects whether the active provider supports flows.
2. In `render-prompt.ts`, added an explicit check `services.config.WHATSAPP_PROVIDER !== 'chakra'`.
3. Wrapped the `waFlow` invocation in a `try / catch` block so any provider network errors or misconfigured flow IDs log a warning and seamlessly fall back to standard `waButtons`.

---

## 4 — Security & Cryptographic Hardening

1. **Cryptographic `flow_token` (`meta-cloud.ts`):**
   - Replaced predictable `Date.now()` timestamp with `crypto.randomUUID()`.
   - Ensures cryptographic unpredictability and prevents token guessing.
2. **Strict Zod Schema Validation (`parse-message.ts`):**
   - Validates incoming `flow_data` with `flowDataSchema` requiring array types for `selected_days` / `delivery_days`.
   - Rejects malformed JSON payloads and prevents prototype pollution.

---

## 5 — FSM Back Navigation Matrix (32 Integration Tests)

Every FSM step and user journey supports 100% reliable reverse navigation:
- **Flow 1 (New User Subscription):** 8 forward steps ➔ 8 reverse unwinds to `NEW`.
- **Flow 2 (Returning User Saved Address):** 6 forward steps ➔ 6 reverse unwinds to `NEW`.
- **Flow 3 (One-Time Meal Order):** 3 forward steps ➔ 3 reverse unwinds to `NEW`.
- **Flow 4 (Repeat Order / Change):** Change flow unwinds to `returning_user_confirm` ➔ `NEW`.
- **Flow 5 (Meal Top-Ups):** `add_meals_quantity` ➔ `awaiting_packaging_preference` ➔ Unwinds to `NEW`.
- **Flow 6 (Delivery Settings):** `change_delivery_menu` (Slot & Address) ➔ Unwinds to `NEW`.
- **Flow 7 (Feedback & Support):** Feedback text & Help/Refund ➔ Unwinds to `NEW`.
- **Flow 8 (Internal Sub-Step Toggle):** `awaiting_days` toggle mode ➔ `action_back` reverts to button mode within `awaiting_days` without popping out of the step.
- **Edge Cases & Replay Defense:** Dual triggers (`"back"` vs `back_button`), empty history stack safety, stale version click rollback protection, and strict free-text schedule typing rejection.
- **WhatsApp Flow Navigation:** Forward submission via `nfm_reply`, backward unwind re-dispatching `waFlow`, and assertion that typed text does not advance the state.

---

## 6 — Sunday Closure Guard & Day Token Normalization in Flow Submissions

### User Story & Problem
1. **Sunday Silent Drop:** When a customer selected Sunday along with any weekday (e.g. `['mon', 'sun']`) in WhatsApp Flow, `sortDays(['mon', 'sun'])` returned `['mon']`. Because `sorted.length > 0` was checked first, `persistDailySchedule` immediately saved Monday without warning the customer about Sunday closure. The Sunday notification guard was unreachable.
2. **Day Token Casing:** If a Flow payload passed capitalized or full-name day strings (e.g. `["Mon", "Wed"]` or `["Monday", "Wednesday"]`), `sortDays` strict equality against lowercase constants failed, returning `[]` and falsely warning the customer that no days were selected.

### Solution
1. Moved the Sunday check `rawFlowDays.some(isSundayToken)` to execute **before** `if (sorted.length > 0)`. Any multi-day selection including Sunday triggers the `"🏖️ Mom's Kitchen is closed on Sundays!"` notification and re-prompts for a valid Monday–Saturday schedule.
2. Added `DAY_TOKEN_MAP` and `normalizeFlowDays` in `awaiting-days/index.ts` to cleanly normalize case and convert full-name day tokens (`"Monday"` ➔ `"mon"`, `"Wed"` ➔ `"wed"`).

---

## 7 — Flow Rendering Resilience on Back Navigation (`sd_day_sub_step: 'buttons'`)

### Problem
When a customer in toggle list mode tapped "⬅️ Back" (`action_back`), `saveDraft` stored `day_sub_step: 'buttons'` in Redis. If the customer subsequently rewound or triggered a re-prompt, `!effectiveContext.sd_day_sub_step` evaluated to `false` because `'buttons'` is truthy. As a result, `renderStepPrompt` skipped `waFlow` and fell back to legacy WhatsApp 3-button message.

### Solution
Updated `render-prompt.ts` condition to:
```typescript
(!effectiveContext.sd_day_sub_step || effectiveContext.sd_day_sub_step === 'buttons')
```
ensuring returning to the schedule choice cleanly re-dispatches `waFlow` when `META_FLOW_SCHEDULE_ID` is configured.

---

## 8 — Returning User Context Preservation & In-Memory History Synchronization

### Problem
1. When unwinding backwards to `returning_user_confirm`, `renderStepPrompt` rendered generic text without displaying the customer's saved address, depriving the user of context for `"Deliver here ✅"`.
2. In `returning-user-confirm.ts`, `handleReturningUserConfirm` forwarded `context` with stale pre-transition `history_stack` (`[]`) to `handleAwaitingPack`, causing in-memory state desynchronization.

### Solution
1. Updated `renderStepPrompt` for `returning_user_confirm` to resolve `name` and `delivery_address` from `effectiveContext` and include the saved address:
   `"Welcome back, Priya! 🍱\n\nWould you like to repeat your previous order? Shall we deliver to your saved address?\n\n📍 Flat 402, Sunshine Apts..."`
2. Passed `history_stack: metadata.history_stack` in `handleAwaitingPack` call inside `returning-user-confirm.ts`.

---

## 9 — One-Time Trial Meal Cutoff & Next-Day Rollover Flow

### Context & Business Requirement
Previously, when a customer ordered a one-time trial meal (`one_time`) past the slot cutoff (12:00 PM for Lunch, 17:30 for Dinner) or on a Sunday, the bot issued a hard rejection resetting the session to `NEW` with buttons `[Subscribe]` and `[Back ⬅️]`.

To maximize trial conversions and eliminate customer drop-off, the rollover flow provides interactive choices:
1. **Lunch Cutoff Passed (12:00 PM – 5:30 PM):**
   If the customer selects Lunch, the bot prompts:
   `"Today's Lunch ordering has closed 🕐 (cutoff was 12:00 PM).\n\nWould you like to get Dinner delivered today, or schedule Lunch for tomorrow?"`
   Buttons: `[Dinner Today 🌙]` (`slot_switch_dinner`), `[Lunch Tomorrow 🍱]` (`slot_rollover_tomorrow_lunch`), `[Back ⬅️]`.
2. **Evening Cutoff Passed (After 5:30 PM Mon–Fri):**
   `"Today's {{slot}} ordering has closed 🕐\n\nWould you like to schedule delivery for tomorrow ({{Tomorrow Date}}) instead?"`
   Buttons: `[Confirm Tomorrow 🍱]` (`slot_rollover_tomorrow_{slot}`), `[Back ⬅️]`.
3. **Weekend / Sunday Kitchen Off-Day (Saturday after 5:30 PM & Sunday All Day):**
   `"🏖️ Sunday is our kitchen's day off! We don't deliver on Sundays.\n\nWould you like to schedule your one-time {{slot}} meal for Monday ({{Monday Date}})?"`
   Buttons: `[Confirm Monday 🍱]` (`slot_rollover_monday_{slot}`), `[Back ⬅️]`.
4. **Order Summary:**
   Displays clear delivery day and slot:
   `"Delivery: {{dayLabel}} - {{slot}}"` (e.g. `Delivery: Tomorrow (Friday, Sep 25) - Lunch`).
5. **Payment Link Cutoff Expiry & Verification:**
   Payment link `expires_at` is set to the cutoff time of the **target delivery date** (e.g. 12:00 PM on target delivery day for Lunch, 17:30 for Dinner).
6. **Payment Confirmation Webhook:**
   WhatsApp message confirms scheduled delivery date:
   `"Payment confirmed! 🎉\n\nPack: One-Time Trial Meal\nSlot: {{slot}}\n\nDelivery: {{deliveryDateLabel}} 🍱"`

### Technical Implementation
1. **Date Utilities (`time.ts`):**
   - Added `getDeliveryDateInfo(daysAhead, prefix, now)` returning `{ dateStr, dayLabel, dateFormatted, shortDateFormatted }`.
   - Added `formatDeliveryDateForNotification(deliveryDateStr, now)` for WhatsApp webhook confirmations.
2. **FSM Slot Step (`awaiting-slot.ts`):**
   - Expanded `validSlots` to accept `slot_switch_dinner`, `slot_rollover_tomorrow_lunch`, `slot_rollover_tomorrow_dinner`, `slot_rollover_tomorrow`, `slot_rollover_monday_lunch`, `slot_rollover_monday_dinner`, `slot_rollover_monday`.
   - Extracted shared `confirmOneTimeOrder(phone, chosenSlot, dateInfo, input, services)` saving `delivery_date`, `day_label`, `meal_slot`, `quoted_price`, and transitioning to `awaiting_schedule_confirm`.
3. **Session & Draft Persistence (`save-session.ts`, `draft-session.ts`, `fetch-context.ts`):**
   - Added `delivery_date?: string | null` to `SessionData`, `SessionContext`, draft serialization (`sd_delivery_date`), and fallback mapping.
4. **Payment Orchestrator (`payment-orchestrator.ts`):**
   - Updated `computeOneTimeCutoffExpiry(mealSlot, targetDeliveryDate?)` to calculate cutoff timestamp and `targetDateStr` for the scheduled delivery date.
   - Updated `calculateExpiryAndDeliveryDate` and `verifyOneTimeConstraintsBeforePayment` to evaluate Sunday on the target delivery date rather than current calendar date, allowing Sunday checkout for Monday deliveries.
   - Propagated `delivery_date` into `payments` table and `conversation_sessions.session_data`.
5. **Webhook Notification (`handle-webhook-event.ts`):**
   - Formatted delivery confirmation using `formatDeliveryDateForNotification(pay.delivery_date)`.

---

## 10 — Sunday Entry Guard Unblocking & Defensive Hardening

### Problem
While one-time trial meal rollover was introduced in `awaiting-slot.ts` and `payment-orchestrator.ts` to allow Monday delivery scheduling when cutoffs pass or on Sundays, four upstream steps still retained legacy pre-rollover hard-rejection blocks:
1. `home-screen.ts` (`home_one_time_meal`)
2. `awaiting-pack.ts` (`pack_one_time`)
3. `awaiting-address-confirm.ts` (`confirm_address_yes` when `sd_pack_type === 'one_time'`)
4. `awaiting-address.ts` (`preSelectedPack === 'one_time'`)

On Sunday, each of these steps intercepted the flow, sent `"🏖️ Sunday is our kitchen's day off! We don't deliver on Sundays..."`, and reset the session to `NEW`. As a result, Sunday customers could never reach `awaiting_slot`, making Sunday-to-Monday rollover completely unreachable in production.

### Solution
1. **Unblocked Upstream Steps:** Removed the hardcoded Sunday `isSunday` session reset checks from `home-screen.ts`, `awaiting-pack.ts`, `awaiting-address-confirm.ts`, and `awaiting-address.ts`. Customers requesting one-time meals on Sunday cleanly advance through address confirmation to `awaiting_slot`.
2. **Interactive Monday Rollover:** At `awaiting_slot`, customers are offered `[Confirm Monday 🍱]` (`slot_rollover_monday_{slot}`). Tapping confirmation calculates Monday target date, persists `delivery_date`, sets payment link cutoff expiry to Monday 12:00 PM, and transitions to order confirmation.
3. **Constant Cleanup:** Removed shadowed inner `IST_OFFSET_MS` declaration in `payment-orchestrator.ts` and imported the canonical constant from `shared/utils/time.ts`.
4. **Test Suite Expansion:**
   - Added Saturday midday lunch cutoff test (14:00 IST) in `awaiting-slot.test.ts` asserting `[Dinner Today 🌙]` and `[Lunch Monday 🍱]`.
   - Added full Sunday end-to-end integration test in `fsm-back-navigation-matrix.integration.test.ts` (NEW ➔ address confirm ➔ awaiting_slot ➔ Confirm Monday ➔ awaiting_schedule_confirm).
   - Added malformed/unrecognized flow token test in `awaiting-days-flow-response.test.ts`.
   - Added future target delivery date Razorpay `expire_by` assertion in `payment-orchestrator.test.ts`.

---

## 11 — Cutoff Documentation Alignment & Rollover Draft State Reuse

### Problem
1. **Documentation Cutoff Discrepancy:** The overview table, Step 1 "How It Works" message, and Mermaid flowcharts in `docs/whatsapp-bot-flow.md` (and related diagram files) still cited legacy 6-hour prior ordering windows (Lunch by 7:00 AM, Dinner by 3:00 PM) and depicted hard rejection upon cutoff expiry (`CutoffClosed`), conflicting with the production 12:00 PM lunch / 5:30 PM dinner cutoffs and interactive rollover UX established in Step 6A and `computeOneTimeCutoffExpiry`.
2. **Rollover Date Midnight Boundary Drift:** When rendering rollover options (`Confirm Tomorrow 🍱` or `Confirm Monday 🍱`), the displayed date was computed at prompt time, but only `meal_slot` was saved in the draft. If the customer tapped the rollover button across midnight or after a long delay, `getDeliveryDateInfo` recomputed the date relative to the new current time, leading to potential delivery date divergence between the rendered prompt and confirmed order.

### Solution
1. **Canonical Cutoff Documentation:**
   - Updated `docs/whatsapp-bot-flow.md`: Cut-off Window table row updated to `Same-day: Lunch by 12:00 PM, Dinner by 5:30 PM (Late orders rollover to next delivery day)`; Step 1 How It Works message updated to `Lunch cutoff is 12:00 PM, Dinner cutoff is 5:30 PM. Orders placed after cutoff automatically roll over to the next delivery day (or Monday)`.
   - Replaced Mermaid diagram hard-rejection node with interactive rollover branches (`Open Today`, `Lunch Closed (12 PM - 5:30 PM)`, `Evening Closed (> 5:30 PM)`, `Sunday / Sat Evening`).
   - Aligned `docs/whatsapp-bot-flow.mmd`, `docs/interactive-flow.html`, `docs/whatsapp-bot-flow-diagram.html`, and `docs/whatsapp-bot-flow-diagram.svg`.
2. **Rollover Delivery Date & Day Label Draft Persistence:**
   - In `backend/src/modules/bot/fsm/steps/awaiting-slot.ts`, updated Sunday, Saturday midday, Saturday evening, and weekday evening prompt flows to save `delivery_date` and `day_label` in the draft alongside `meal_slot`.
   - In rollover button tap handlers (`slot_rollover_tomorrow_*`, `slot_rollover_monday_*`), reused `input.sd_delivery_date` and `input.sd_day_label` when present, falling back to `getDeliveryDateInfo` only when either value is absent.
   - Added unit test suite `backend/src/modules/bot/fsm/steps/__tests__/awaiting-slot.test.ts` (9 tests) verifying draft persistence, button generation, and state reuse across all cutoff and rollover combinations.

---

## 12 — Dynamic Subscription Plans Management & Active Reference Guard

### Context & Requirements
To allow kitchen managers to dynamically adjust meal pricing, features, and marketing badges without requiring code releases, the `plans` table was updated to support dynamic feature bullet-point arrays and popularity flags, managed directly from the Admin Dashboard.

### Technical Implementation
1. **Database Migration (`20260927000000_add_plan_features_and_popular.sql`):**
   - Added `features TEXT[] DEFAULT '{}'::text[]` and `popular BOOLEAN DEFAULT false` to `public.plans`.
   - Backfilled starter, regular (popular), and family default thali packages.
2. **Server Actions (`dashboard/app/actions/plans.ts`):**
   - Implemented `createPlanAction`, `updatePlanAction`, and `deletePlanAction`.
   - **Active Subscription Reference Safety**: Hard-deleting a plan actively referenced by subscriptions would break foreign keys. The server action checks `subscriptions` where `pack_type = code AND status = 'active'`. If references exist, it soft-deactivates the plan (`active = false`) and logs to `public.system_logs`.
3. **Dashboard Plans Page (`dashboard/components/plans/PlansPageClient.tsx`):**
   - Added "➕ Add Plan" modal with real-time slug generation, price in rupees (stored as paise), popular badge toggle, and a dynamic feature bullet-point manager.

---

## 13 — Customer Menu Voting System, OTP Verification & Admin Polls Manager

### Context & Requirements
Allow kitchen staff and admins to engage subscribers by posting weekly meal polls (e.g. Friday chef special). 
- **Requirement 1**: Prevent duplicate votes (strictly 1 vote per customer per poll).
- **Requirement 2**: Only active paying subscribers (`subscriptions.status = 'active'`) are eligible to vote.
- **Requirement 3**: Passwordless customer verification via registered WhatsApp number and 4-digit OTP.

### Technical Implementation
1. **Database Schema & Constraints (`20260927000001_create_polls_and_votes.sql`):**
   - `public.polls`: Stores poll title, description, dynamic dish options (JSONB), status (`'active'`, `'closed'`, `'draft'`), and closing deadline (`closes_at`).
   - `public.poll_votes`: Atomic unique constraint prevents double-voting:
     ```sql
     CONSTRAINT unique_customer_poll_vote UNIQUE (poll_id, customer_id)
     ```
   - `public.poll_otps`: Tracks 4-digit verification codes with 5-minute expiry and attempt tracking.
2. **Admin Polls Management (`dashboard/app/(admin)/polls/page.tsx` & `PollsPageClient.tsx`):**
   - Admin can create weekly polls with dynamic dish option rows and set closing deadlines.
   - Built a single-query aggregation query in `dashboard/lib/queries/polls.ts` (`fetchAdminPolls`) that maps vote counts to calculate option percentages and identifies the winning dish in O(N) time without N+1 queries.
   - Live visual bar charts show real-time percentage distributions and current leader badges.
3. **Customer Voting Flow Integration (`tiffin-website`):**
   - Endpoints `/api/poll/active`, `/api/poll/send-otp`, and `/api/poll/vote`.
   - Active subscription validation blocks non-subscribers with `NO_ACTIVE_PLAN` (403), prompting them to subscribe.
   - PostgreSQL unique constraint catches concurrent duplicates and returns `ALREADY_VOTED` (409) with community standings.

---

## 14 — Verification Evidence

### Automated Test Suite & Property Checks
```bash
npm test
```
```
Test Files  155 passed (155)
     Tests  1621 passed (1621)
```

### TypeScript Compilation & Dashboard Checks
```bash
# Backend build
npm run build
> tiffin-backend@1.0.0 build
> tsc (0 errors)

# Dashboard typecheck
pnpm --prefix dashboard tsc --noEmit
(Exited with 0 errors)
```

### Live Supabase Database Checks
- `public.plans` columns `features` and `popular` verified.
- `public.polls`, `public.poll_votes`, and `public.poll_otps` tables and indexes verified.
- Initial active poll query: `What special dish should we cook for Friday Lunch?` verified.




---

## 15 — Code Simplification & Optimization Review (/simplify-code)

Following automated multi-angle code review on PR #132 across Code Reuse, Code Quality, Efficiency, and Clarity:

1. **Shared Token Normalization (`awaiting-days`):**
   - Exported `DAY_MAP` and `isSundayToken` from `backend/src/modules/bot/fsm/steps/awaiting-days/day-parser.ts`.
   - Replaced duplicate 40-line `DAY_TOKEN_MAP` dictionary and regex in `backend/src/modules/bot/fsm/steps/awaiting-days/index.ts`.
2. **Rollover Prompt Extraction (`awaiting-slot`):**
   - Unified Sunday off-day and Saturday post-cutoff Monday rollover logic in `backend/src/modules/bot/fsm/steps/awaiting-slot.ts` into a clean `promptMondayRollover` helper.
   - Replaced dummy synthesized `DeliveryDateInfo` instances with `Pick<DeliveryDateInfo, 'dateStr' | 'dayLabel'>`.
3. **Cutoff Constants Alignment (`payment-orchestrator`):**
   - Replaced magic numbers `12`, `17`, `30` in `computeOneTimeCutoffExpiry` with module constants `LUNCH_CUTOFF_HOUR`, `DINNER_CUTOFF_HOUR`, and `DINNER_CUTOFF_MINUTES`.
4. **Scoped Poll Votes Query (`dashboard/lib/queries/polls.ts`):**
   - Scoped vote query with `.in("poll_id", pollIds)` in `fetchAdminPolls` to prevent unbounded scans across historical votes.
5. **Centralized Query Keys & Error Handling (`dashboard`):**
   - Registered `qk.polls()` in `dashboard/lib/queries/keys.ts`.
   - Replaced hardcoded query keys and error string casts in `dashboard/components/polls/PollsPageClient.tsx` with `qk.polls()` and `getErrorMessage()`.
6. **Plan Creation Round-Trip Elimination (`dashboard/app/actions/plans.ts`):**
   - Removed redundant `SELECT code` pre-check prior to `INSERT INTO plans`, relying directly on PostgreSQL unique constraint enforcement (`code === '23505'`).

### Verification Results
- **Backend Tests:** 155 / 155 test files passed, 1,621 / 1,621 tests passed.
- **Dashboard Lint:** ESLint exited 0 (clean).
- **Dashboard Types:** `tsc --noEmit` exited 0 (clean).
