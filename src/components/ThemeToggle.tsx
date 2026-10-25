"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { appleFlickSpring } from "@/lib/motionTokens";

/** Storage key for the manual theme override; the pre-paint boot script in
 * layout.tsx reads the same key. Values: "dark" | "light" | (unset = system). */
const THEME_KEY = "mk-theme";

/** Single source of truth is the `.dark` class on <html>, so the toggle,
 * the boot script and cross-tab storage events all stay in sync. */
function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

function applyDark(dark: boolean): void {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  } catch {
    // Storage write failure — class toggle already applied for this tab
  }
}

function markOverride(dark: boolean): void {
  try {
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  } catch {
    // Storage write failure — class toggle already applied for this tab
  }
}

/**
 * Apple-style theme control: follows the system on first visit, then keeps
 * a manual override in localStorage (booted pre-paint for zero flash). The
 * sun/moon glyph cross-fades and rotates on a flick spring so the change
 * feels like a Control Center toggle, not a re-render.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setDark(isDark());

    sync();
    // Boot script, other tabs' storage writes and clearOverride all write via
    // the class — track it at the source so `dark` never desyncs.
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // With no manual override, follow live system-preference changes.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = (e: MediaQueryListEvent) => {
      let override: string | null = null;
      try {
        override = localStorage.getItem(THEME_KEY);
      } catch {}
      if (!override) {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };
    media.addEventListener("change", onSystemChange);

    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY && e.newValue) {
        document.documentElement.classList.toggle("dark", e.newValue === "dark");
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        applyDark(dark !== true);
        markOverride(dark !== true);
      }}
      aria-label={dark === true ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark === true ? "true" : "false"}
      title="Toggle dark mode"
      className="press flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-muted transition-colors duration-150 hover:bg-tealwash hover:text-ink"
    >
      {/* Placeholder keeps the 32px target stable from first SSR paint */}
      <motion.span
        key={dark === null ? "pending" : dark ? "sun" : "moon"}
        initial={{ rotate: dark ? 70 : -70, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={appleFlickSpring}
        className="flex"
      >
        {dark ? (
          <Sun className="h-4 w-4" strokeWidth={1.75} />
        ) : (
          <Moon className="h-4 w-4" strokeWidth={1.75} />
        )}
      </motion.span>
    </button>
  );
}
