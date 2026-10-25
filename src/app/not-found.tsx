import Link from "next/link";
import { Home, MessageCircle } from "lucide-react";

const WHATSAPP_HELP_URL =
  "https://wa.me/917033558836?text=Hello!%20I%20have%20a%20question%20about%20the%20tiffin%20subscription.";

/**
 * Frosted 404 — same nav-style materials as the vote page: floating pill
 * chrome, display type with tight tracking, and soft specular buttons.
 */
export default function NotFound() {
  return (
    <main className="wash-bokeh flex min-h-screen flex-col items-center justify-center px-4">
      <div className="frost-strong w-full max-w-lg rounded-[2rem] p-10 text-center md:p-12">
        <span className="eyebrow text-coral">404 · Off the menu</span>
        <h1 className="display-hero mt-4 text-4xl text-ink md:text-5xl">
          This page isn&apos;t
          <span className="bg-gradient-to-br from-amber-deep via-coral to-coral-deep bg-clip-text text-transparent">
            {" "}
            on today&apos;s menu.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
          The link may have expired or the dish has been retired. The tiffin
          itself, however, is very much still cooking.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="press inline-flex items-center justify-center gap-2 rounded-full bg-ink-solid px-6 py-3 text-[14px] font-semibold text-white shadow-soft transition-colors duration-150 hover:bg-tealwash hover:text-ink"
          >
            <Home className="h-4 w-4" strokeWidth={1.75} />
            Back to Home
          </Link>
          <a
            href={WHATSAPP_HELP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-[14px] font-semibold text-white shadow-soft transition-colors duration-150 hover:bg-whatsapp-deep"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
            Ask on WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
