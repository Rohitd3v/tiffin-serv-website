import Link from "next/link";
import { Utensils } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-hairline-soft bg-paper/60 mt-auto">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-xs">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink-solid text-white shadow-soft">
                <Utensils className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="text-[15px] font-semibold -tracking-[0.01em] text-ink">
                Mom&apos;s Kitchen
              </span>
            </div>
            <p className="mb-4 text-[13px] leading-relaxed text-muted">
              Authentic homestyle tiffin &amp; meal subscription delivered hot daily
              across Delhi NCR &amp; Gurugram.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-hairline-soft bg-white px-3 py-1.5 text-[11px] font-medium text-muted">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-whatsapp opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-whatsapp" />
              </span>
              FSSAI compliant cloud kitchen
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px] lg:grid-cols-3">
            {[
              { href: "/", label: "Home" },
              { href: "/#plans", label: "Meal Plans" },
              { href: "/vote", label: "Menu Voting" },
              { href: "/blog", label: "Food Blog" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ].map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="w-fit rounded text-muted transition-colors duration-150 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="rounded-full border border-hairline-soft bg-tealwash px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Powered by Meta Cloud
            </span>
            <p className="tabular text-[12px] text-faint">© 2026 Mom&apos;s Kitchen Operations</p>
            <p className="text-[11px] text-faint">
              Made by{" "}
              <a
                href="https://github.com/Rohitd3v"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-hairline underline-offset-2 transition-colors duration-150 hover:text-ink"
              >
                Rohit Singh Negi
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
