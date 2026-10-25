"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Utensils } from "lucide-react";
import { appleSpring } from "@/lib/motionTokens";
import { ThemeToggle } from "@/components/ThemeToggle";

export interface SiteNavProps {
  /** Fully-encoded WhatsApp ordering link for the primary CTA. */
  whatsappUrl: string;
  /** Center links; falls back to the homepage menu. Pass `null` to hide. */
  links?: Array<{ href: string; label: string }> | null;
  /** Eyebrow under the brand wordmark. Pass `null` to hide. */
  subtitle?: string | null;
  /** Optional contextual back link on the left (inner pages); brand moves to center. */
  backLink?: { href: string; label: string };
  /** Serve a contextual right-hand action instead of the primary order CTA. */
  helpUrl?: string | null;
  /** Label for the contextual right-hand action. */
  helpLabel?: string;
  /** Suppress the right-hand WhatsApp CTA entirely (legal pages). */
  showOrderCta?: boolean;
}

const DEFAULT_LINKS = [
  { href: "#how", label: "Process" },
  { href: "#plans", label: "Plans" },
  { href: "#vote", label: "Menu Vote" },
  { href: "#faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
];

/**
 * Adaptive frosted toolbar: transparent over the hero, materializing into a
 * translucent blur layer once content scrolls underneath (iOS-style scroll
 * edge effect instead of a hard divider). Inner pages reuse the same shell
 * via `backLink` / `helpUrl` instead of hand-copied static nav blocks.
 */
export function SiteNav({
  whatsappUrl,
  links = DEFAULT_LINKS,
  subtitle = "Tiffin Subscription",
  backLink,
  helpUrl,
  helpLabel = "Help",
  showOrderCta = true,
}: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const brand = (
    <Link href="/" className="flex items-center gap-2.5 press" aria-label="Mom's Kitchen home">
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink-solid text-white shadow-soft">
        <Utensils className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-semibold tracking-tight text-ink">
          Mom&apos;s Kitchen
        </span>
        {subtitle !== null && (
          <span className="eyebrow block text-[9px] text-muted">{subtitle}</span>
        )}
      </span>
    </Link>
  );

  const rightAction = helpUrl ? (
    <a
      href={helpUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="press flex items-center gap-2 rounded-full bg-whatsapp px-4 py-2 text-[13px] font-semibold text-white shadow-soft transition-colors duration-150 hover:bg-whatsapp-deep"
    >
      <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
      {helpLabel}
    </a>
  ) : showOrderCta ? (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="press flex items-center gap-2 rounded-full bg-whatsapp px-4 py-2 text-[13px] font-semibold text-white shadow-soft transition-colors duration-150 hover:bg-whatsapp-deep"
    >
      <MessageCircle className="h-4 w-4 fill-white stroke-none" strokeWidth={1.75} />
      Order on WhatsApp
    </a>
  ) : null;

  return (
    <header className="fixed top-0 inset-x-0 z-50 pt-3 px-3 sm:px-4">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={appleSpring}
        aria-label="Primary"
        className={`mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 rounded-2xl px-4 transition-all duration-300 ${
          scrolled
            ? "frost-strong"
            : "border border-transparent bg-transparent shadow-none backdrop-blur-none"
        }`}
      >
        {backLink ? (
          <Link
            href={backLink.href}
            className="press flex items-center gap-2 whitespace-nowrap text-[12px] font-medium text-muted transition-colors duration-150 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> {backLink.label}
          </Link>
        ) : (
          brand
        )}

        {backLink ? (
          brand
        ) : (
          links && (
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-tealwash hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {rightAction}
        </div>
      </motion.nav>
    </header>
  );
}
