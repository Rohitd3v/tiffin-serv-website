"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Drawer } from "vaul";
import { MessageCircle, ArrowUpRight, Lock, Plus } from "lucide-react";
import { appleSpring } from "@/lib/motionTokens";

export interface OrderBotPopupProps {
  /** Target link to the ordering WhatsApp chat */
  whatsappUrl?: string;
  /** Delay before sheet auto-opens (defaults to 5000ms) */
  delayMs?: number;
  /** Storage key to track seen status (defaults to "mk_order_popup_seen") */
  storageKey?: string;
}

const DEFAULT_WHATSAPP_URL =
  "https://wa.me/917033558836?text=Hello!%20I%20want%20to%20order%20a%20tiffin.";
const DEFAULT_STORAGE_KEY = "mk_order_popup_seen";
const DEFAULT_DELAY_MS = 5000;

/** localStorage is an external store: read it through useSyncExternalStore so
 * the client snapshot lands after hydration (no server/client mismatch) and
 * cross-tab "storage" events hide the pill everywhere at once. */
function useSeenOnce(storageKey: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      return () => window.removeEventListener("storage", onStoreChange);
    },
    () => {
      try {
        return window.localStorage.getItem(storageKey) === "true";
      } catch {
        return false; // Private browsing etc. — still eligible to show
      }
    },
    () => false,
  );
}

function markSeen(storageKey: string): void {
  try {
    localStorage.setItem(storageKey, "true");
  } catch {
    // Storage write failure is handled gracefully
  }
}

/**
 * iOS-style bottom sheet for first-time visitors. 1:1 swipe tracking,
 * rubber-banding and drag-to-dismiss come from Vaul; auto-opens once after
 * `delayMs`, and stays reachable via the floating pill afterwards.
 */
export function OrderBotPopup({
  whatsappUrl = DEFAULT_WHATSAPP_URL,
  delayMs = DEFAULT_DELAY_MS,
  storageKey = DEFAULT_STORAGE_KEY,
}: OrderBotPopupProps) {
  const [open, setOpen] = useState(false);
  const seen = useSeenOnce(storageKey);
  const allowAutoOpen = !seen;

  useEffect(() => {
    if (seen) return;
    const timer = setTimeout(() => {
      setOpen(true);
      markSeen(storageKey);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs, storageKey, seen]);

  return (
    <>
      {/* Floating order pill — always reachable, frosted material */}
      <motion.button
        type="button"
        onClick={() => {
          markSeen(storageKey);
          setOpen(true);
        }}
        initial={{ y: 80, opacity: 0 }}
        animate={open ? { y: 90, opacity: 0 } : undefined}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={allowAutoOpen ? appleSpring : { duration: 0 }}
        style={allowAutoOpen ? undefined : { y: 90, opacity: 0, pointerEvents: "none" }}
        aria-label="Open ordering sheet"
        className="frost-strong press fixed bottom-5 right-4 sm:right-6 z-40 flex items-center gap-2 rounded-full py-3 pr-4 pl-3 text-[13px] font-semibold text-ink"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-whatsapp text-white">
          <MessageCircle className="h-3.5 w-3.5 fill-white stroke-none" strokeWidth={1.75} />
        </span>
        Order now
        <ArrowUpRight className="h-4 w-4 text-muted" strokeWidth={1.75} />
      </motion.button>

      <Drawer.Root open={open} onOpenChange={setOpen} repositionInputs={false}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/50" />
          <Drawer.Content
            className="fixed inset-x-0 bottom-0 z-[71] flex justify-center px-4 pb-5 outline-none"
            style={{ touchAction: "none" }}
          >
            <div className="frost-strong w-full max-w-md overflow-hidden rounded-t-[1.75rem] sm:rounded-[1.75rem] shadow-sheet">
              {/* Grabber */}
              <div className="mx-auto mt-3 mb-1 h-1.5 w-9 rounded-full bg-ink/25" />
              <Drawer.Title className="sr-only">Order a tiffin</Drawer.Title>
              <Drawer.Description className="sr-only">
                Open the WhatsApp chat to order your tiffin
              </Drawer.Description>

              <div className="flex flex-col items-center gap-4 px-6 pb-8 pt-2 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-whatsapp to-whatsapp-deep text-white shadow-lift">
                  <MessageCircle className="h-7 w-7 fill-white stroke-none" strokeWidth={1.75} />
                </span>

                <div>
                  <h3 className="text-xl font-semibold -tracking-[0.02em] text-ink">
                    Craving ghar ka khana?
                  </h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">
                    Hot homestyle meals, delivered daily across Delhi NCR &amp; Gurugram —
                    ordered in one WhatsApp message.
                  </p>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="press w-full rounded-2xl bg-whatsapp py-4 text-center text-[15px] font-semibold text-white shadow-lift transition-colors duration-150 hover:bg-whatsapp-deep"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    Chat to order on WhatsApp
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </a>

                <div className="flex w-full items-center justify-center gap-5 border-t border-hairline-soft pt-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-faint">
                    <Lock className="h-3 w-3" strokeWidth={1.5} /> Secure &amp; instant
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-faint">
                    <Plus className="h-3 w-3" strokeWidth={1.5} /> No app download
                  </span>
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
