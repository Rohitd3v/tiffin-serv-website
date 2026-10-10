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
