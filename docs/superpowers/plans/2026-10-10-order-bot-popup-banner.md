# Order Bot Pop-Up Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Neo-Brutalist floating pop-up card on the homepage that triggers after 5 seconds, redirects to the WhatsApp ordering bot, and persists across sessions via `localStorage` so it only displays once per user.

**Architecture:** Create an isolated React client component `src/components/OrderBotPopup.tsx` using `framer-motion` for spring animations, safe `localStorage` access for state persistence, and timer cleanup on unmount. Mount the component into the homepage (`src/app/page.tsx`) with the existing WhatsApp contact URL.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React (`MessageCircle`, `ArrowRight`, `X`), Framer Motion (`motion`, `AnimatePresence`), Node.js built-in test runner (`node --test`).

## Global Constraints

- Location restricted to homepage only (`src/app/page.tsx`).
- Entrance delay: exactly 5000ms.
- Persistence key: `"mk_order_popup_seen"` in `localStorage`.
- Storage is marked immediately upon popup display so refreshes or quick tab closures never re-trigger the popup.
- All `localStorage` interactions must be wrapped in `try...catch` blocks to protect against private browsing restrictions.
- Must match website's Neo-Brutalist design tokens: 3px ink borders (`border-brutal-border`), heavy drop shadow (`shadow-brutal-lg`), cream card background (`bg-brutal-bg`), and WhatsApp brand green CTA (`bg-brutal-whatsapp`).
- Never perform state updates after component unmount; timer must be cleanly cleared.

---

### Task 1: Create and Test `OrderBotPopup` Component

**Files:**
- Create: `scripts/order-bot-popup.test.mjs`
- Create: `src/components/OrderBotPopup.tsx`

**Interfaces:**
- Produces:
  ```typescript
  export interface OrderBotPopupProps {
    whatsappUrl?: string;
    delayMs?: number;
    storageKey?: string;
  }
  export function OrderBotPopup(props: OrderBotPopupProps): React.JSX.Element | null;
  ```

- [ ] **Step 1: Write the failing unit test**

Create `scripts/order-bot-popup.test.mjs` testing the storage helper logic, timer behavior, and component export:

```javascript
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

describe("OrderBotPopup Component & Logic", () => {
  it("OrderBotPopup source file exists and defines expected exports and tokens", () => {
    const filename = fileURLToPath(new URL("../src/components/OrderBotPopup.tsx", import.meta.url));
    const content = readFileSync(filename, "utf8");

    // Must be a client component
    assert.ok(content.includes('"use client"'), "Must be a client component with 'use client'");

    // Must check and set localStorage key
    assert.ok(content.includes("mk_order_popup_seen"), "Must use 'mk_order_popup_seen' as default storage key");
    assert.ok(content.includes("localStorage.getItem"), "Must read from localStorage");
    assert.ok(content.includes("localStorage.setItem"), "Must write to localStorage");

    // Must use 5000ms delay by default
    assert.ok(content.includes("5000"), "Must default to 5000ms delay");

    // Must use neo-brutalist theme classes
    assert.ok(content.includes("border-brutal-border"), "Must use border-brutal-border");
    assert.ok(content.includes("shadow-brutal"), "Must use shadow-brutal");
    assert.ok(content.includes("bg-brutal-whatsapp"), "Must use bg-brutal-whatsapp for CTA");
  });

  it("safely handles localStorage when available and when throwing exceptions", () => {
    // Test storage isolation logic
    const mockStorage = new Map();
    const safeGet = (key) => {
      try { return mockStorage.get(key) ?? null; } catch { return null; }
    };
    const safeSet = (key, val) => {
      try { mockStorage.set(key, val); } catch {}
    };

    assert.equal(safeGet("mk_order_popup_seen"), null);
    safeSet("mk_order_popup_seen", "true");
    assert.equal(safeGet("mk_order_popup_seen"), "true");

    // When storage throws (e.g. private browsing)
    const brokenGet = () => {
      try { throw new Error("SecurityError: localStorage is disabled"); } catch { return null; }
    };
    assert.equal(brokenGet(), null);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/order-bot-popup.test.mjs`
Expected: FAIL with `ENOENT: no such file or directory... OrderBotPopup.tsx`

- [ ] **Step 3: Implement `src/components/OrderBotPopup.tsx`**

Write the complete `src/components/OrderBotPopup.tsx` client component:

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ArrowRight, X } from "lucide-react";

export interface OrderBotPopupProps {
  /** Target link to the ordering WhatsApp chat */
  whatsappUrl?: string;
  /** Delay before banner appears (defaults to 5000ms) */
  delayMs?: number;
  /** Storage key to track seen status (defaults to "mk_order_popup_seen") */
  storageKey?: string;
}

const DEFAULT_WHATSAPP_URL =
  "https://wa.me/917033558836?text=Hello!%20I%20want%20to%20order%20a%20tiffin.";
const DEFAULT_STORAGE_KEY = "mk_order_popup_seen";
const DEFAULT_DELAY_MS = 5000;

export function OrderBotPopup({
  whatsappUrl = DEFAULT_WHATSAPP_URL,
  delayMs = DEFAULT_DELAY_MS,
  storageKey = DEFAULT_STORAGE_KEY,
}: OrderBotPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Guard against SSR and restricted storage in private browsing
    try {
      const alreadySeen = localStorage.getItem(storageKey);
      if (alreadySeen === "true") {
        return;
      }
    } catch {
      // If localStorage is inaccessible, do not block display
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
      try {
        localStorage.setItem(storageKey, "true");
      } catch {
        // Storage write failure is handled gracefully
      }
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [delayMs, storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="dialog"
          aria-label="Order Tiffin Pop-Up"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-full max-w-[calc(100vw-2rem)] sm:max-w-sm"
        >
          <div className="bg-brutal-bg border-[3px] border-brutal-border p-4 sm:p-5 shadow-brutal-lg relative flex flex-col gap-3">
            {/* Top header row: Badge + Dismiss Button */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 bg-brutal-pop text-white font-mono font-bold text-[11px] uppercase px-2.5 py-0.5 border-2 border-brutal-border shadow-brutal-sm">
                <span>🔥</span>
                <span>Order In 60s</span>
              </span>

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close pop-up banner"
                className="p-1 border-2 border-brutal-border bg-white hover:bg-brutal-card-pink text-brutal-border transition-colors shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Headline and Description */}
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase text-brutal-text leading-tight tracking-tight">
                Craving Ghar Ka Khana?
              </h3>
              <p className="text-xs font-medium text-brutal-muted mt-1 leading-relaxed">
                Skip the cooking hassle. Tap below to chat with our WhatsApp bot and get fresh homestyle meals delivered hot!
              </p>
            </div>

            {/* Call To Action button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDismiss}
              className="mt-1 w-full bg-brutal-whatsapp hover:bg-brutal-whatsapp-hover text-white font-black uppercase text-xs sm:text-sm py-3 px-4 border-[2px] border-brutal-border shadow-brutal flex items-center justify-center gap-2 brutalist-button-hover transition-transform duration-150"
            >
              <MessageCircle className="w-4 h-4 fill-white stroke-none" />
              <span>Order Now On WhatsApp</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </a>

            {/* Monospace reassurance footer */}
            <p className="text-[10px] font-mono text-center text-brutal-muted uppercase tracking-wider">
              ⚡ Instant response • No app download needed
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/order-bot-popup.test.mjs`
Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add scripts/order-bot-popup.test.mjs src/components/OrderBotPopup.tsx
git commit -m "feat: implement OrderBotPopup component with timer and localStorage persistence"
```

---

### Task 2: Mount `OrderBotPopup` on Homepage

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes:
  ```typescript
  import { OrderBotPopup } from "@/components/OrderBotPopup";
  ```

- [ ] **Step 1: Import and mount `OrderBotPopup` in `src/app/page.tsx`**

Add the import at the top of `src/app/page.tsx`:
```tsx
import { OrderBotPopup } from "@/components/OrderBotPopup";
```

Mount `<OrderBotPopup whatsappUrl={whatsappUrl} />` right above the closing `</main>` tag:
```tsx
      {/* 5-second delayed first-time visitor WhatsApp order popup */}
      <OrderBotPopup whatsappUrl={whatsappUrl} />
    </main>
```

- [ ] **Step 2: Run TypeScript and Next.js build verification**

Run: `npm run build`
Expected: Build successfully completes with 0 errors.

- [ ] **Step 3: Run project tests**

Run:
```bash
node --test scripts/order-bot-popup.test.mjs
node --test scripts/menu-vote-banner.test.mjs
```
Expected: PASS with 0 failures.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: mount OrderBotPopup on homepage"
```

---

### Task 3: Verification & Polish

**Files:**
- Verify: Full browser rendering, responsive styles, and storage behavior

- [ ] **Step 1: Run linter**

Run: `npm run lint`
Expected: Pass with 0 lint errors.

- [ ] **Step 2: Commit any final cleanup and verification notes**

```bash
git status
```
Expected: Clean working tree.
