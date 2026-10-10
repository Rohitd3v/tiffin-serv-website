# Specification: Order Bot Pop-Up Banner for Homepage

## 1. Overview & Goal
Add an eye-catching, theme-matched Neo-Brutalist pop-up banner on the homepage that encourages first-time visitors to order via the WhatsApp bot. The banner appears after a 5-second delay and displays only once per user (persisted in browser storage across revisits).

---

## 2. Requirements & Behavior

### 2.1 Trigger & Timing
- **Location**: Homepage only (`src/app/page.tsx`).
- **Delay**: 5 seconds (5000ms) after the homepage mounts.
- **Cancellation**: If the user navigates away before 5 seconds, the timer is cleared and the banner will not attempt to render.

### 2.2 First-Time Visitor Persistence
- **Storage Mechanism**: `localStorage` key `"mk_order_popup_seen"`.
- **Immediate Flagging**: As soon as the 5-second timer fires and the banner is displayed, `"mk_order_popup_seen"` is set to `"true"`.
- **Revisit Behavior**: On subsequent visits, reloads, or navigation back to the homepage, the component checks the key; if `"true"`, it exits immediately and does not show the pop-up again.
- **Fail-Safe**: Storage access is wrapped in a `try...catch` block to support browsers with restricted storage permissions (e.g. private/incognito modes) without crashing.

### 2.3 Bot Redirection
- **Action**: "Order Now" call-to-action button.
- **Destination**: Mom's Kitchen WhatsApp ordering bot:
  ```
  https://wa.me/917033558836?text=Hello!%20I%20want%20to%20order%20a%20tiffin.
  ```
- **Attributes**: `target="_blank"`, `rel="noopener noreferrer"`.

---

## 3. Visual & Thematic Design

The banner adheres strictly to Mom's Kitchen Neo-Brutalist design language:

### 3.1 Layout & Positioning
- Fixed to the bottom-right corner:
  - Desktop: `fixed bottom-6 right-6 z-50 max-w-sm`
  - Mobile: `fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)]`
- Snappy entrance/exit animation powered by `framer-motion`:
  - `initial={{ opacity: 0, y: 50, scale: 0.95 }}`
  - `animate={{ opacity: 1, y: 0, scale: 1 }}`
  - `exit={{ opacity: 0, y: 30, scale: 0.95 }}`

### 3.2 Palette & Styling Elements
- **Card Shell**: Warm background (`bg-brutal-bg`), 3px solid ink border (`border-[3px] border-brutal-border`), heavy drop shadow (`shadow-brutal-lg`).
- **Badge**: Orange pill (`bg-brutal-pop text-white font-mono font-bold text-xs uppercase px-2.5 py-0.5 border-2 border-brutal-border shadow-brutal-sm`).
- **Close Button (✕)**: Hard-bordered dismiss button (`border-2 border-brutal-border bg-white hover:bg-brutal-card-pink text-brutal-border p-1 shadow-brutal-sm`).
- **Typography**:
  - Title: Space Grotesk bold (`text-lg font-black uppercase text-brutal-text leading-tight`).
  - Copy: Space Grotesk / DM Mono (`text-xs font-medium text-brutal-muted mt-1 leading-relaxed`).
- **CTA Button**:
  - Neo-brutalist WhatsApp green (`bg-brutal-whatsapp hover:bg-brutal-whatsapp-hover text-white font-black uppercase text-sm py-3 px-4 border-[2px] border-brutal-border shadow-brutal`).
  - Includes WhatsApp chat icon and arrow icon.
  - Neo-brutalist hover translate effect (`brutalist-button-hover`).
- **Footer Tagline**: Subtle monospace reassurance: `⚡ Instant response • No app download`.

---

## 4. Architecture & Implementation Plan

### 4.1 Components
1. **`src/components/OrderBotPopup.tsx`**:
   - Reusable client component (`"use client"`).
   - Props: `whatsappUrl?: string`.
   - Manages visibility state, timer, `localStorage` read/write, and dismiss handler.
2. **`src/app/page.tsx`**:
   - Imports `<OrderBotPopup whatsappUrl={whatsappUrl} />` and mounts it within the homepage tree.

---

## 5. Verification & Testing
1. **Fresh Visitor Test**: Clear `localStorage` in DevTools, reload home, verify popup slides in after 5s.
2. **Revisit Test**: Reload the page, verify popup does not appear.
3. **Dismiss Test**: Clear storage, trigger popup, click `✕`, verify smooth exit animation and persistent dismissal.
4. **Link Test**: Click CTA button, verify it opens WhatsApp chat in a new tab with prefilled message.
5. **Build Test**: Run `npm run build` to ensure zero compilation or lint errors.
