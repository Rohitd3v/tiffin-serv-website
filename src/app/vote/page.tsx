import Link from "next/link";
import { ArrowLeft, Utensils, Sparkles, MessageCircle } from "lucide-react";
import { MenuVotingWidget } from "@/components/MenuVotingWidget";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Menu Voting | Curate Friday Chef Special",
  description:
    "Active meal plan subscribers decide our Friday chef special! Vote for your favorite homestyle dishes securely via WhatsApp OTP.",
  keywords: [
    "tiffin menu voting",
    "weekly meal special delhi",
    "subscriber menu choice",
    "moms kitchen vote",
    "homestyle special thali",
  ],
  alternates: {
    canonical: "/vote",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://momskitchen.co.in/vote",
    siteName: "Mom's Kitchen",
    title: "Weekly Menu Voting | Mom's Kitchen",
    description:
      "Active subscribers curate our Friday special menu. Cast your vote securely via WhatsApp OTP.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1280,
        height: 737,
        alt: "Mom's Kitchen - Weekly Menu Voting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Weekly Menu Voting | Mom's Kitchen",
    description:
      "Subscribers decide our Friday chef special! Cast your vote securely via WhatsApp OTP.",
    images: ["/og-image.jpg"],
  },
};

const voteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://momskitchen.co.in/vote/#webpage",
      url: "https://momskitchen.co.in/vote",
      name: "Weekly Menu Voting | Mom's Kitchen",
      description:
        "Active meal plan subscribers decide our Friday chef special via secure WhatsApp OTP.",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://momskitchen.co.in/#website",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://momskitchen.co.in/vote/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://momskitchen.co.in",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Menu Voting",
          item: "https://momskitchen.co.in/vote",
        },
      ],
    },
  ],
};

/** Renders the dedicated menu voting page with instructions and WhatsApp help. */
export default function VotePage() {
  const whatsappUrl =
    "https://wa.me/917033558836?text=Hello!%20I%20have%20a%20question%20about%20the%20weekly%20menu%20vote.";

  return (
    <main className="min-h-screen bg-brutal-bg pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(voteSchema) }}
      />
      {/* Top Navigation */}
      <nav className="border-b-[3px] border-brutal-border p-4 md:p-6 flex justify-between items-center sticky top-0 bg-brutal-bg/90 backdrop-blur-md z-50">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold uppercase text-xs md:text-sm hover:text-brutal-pop transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <Link href="/" className="flex items-center gap-3">
          <div className="bg-brutal-pop p-1.5 md:p-2 border-2 border-brutal-border shadow-brutal-sm">
            <Utensils className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <span className="text-lg md:text-xl font-black tracking-tight uppercase text-brutal-text leading-none block">
              Mom&apos;s Kitchen
            </span>
            <span className="text-[9px] md:text-[11px] font-mono font-bold tracking-wider text-brutal-muted uppercase block">
              Menu Voting
            </span>
          </div>
        </Link>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 bg-[#25D366] text-white font-black text-xs uppercase px-3 py-1.5 border-2 border-brutal-border shadow-brutal-sm hover:bg-[#20BA5A] transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white" /> Help
        </a>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-10 md:pt-16">
        {/* Breadcrumb & Header */}
        <div className="mb-10 border-l-[10px] border-brutal-pop pl-4 md:pl-6">
          <div className="inline-flex items-center gap-2 bg-brutal-accent text-brutal-text text-xs font-mono font-bold uppercase px-3 py-1 border-2 border-brutal-border mb-3 shadow-brutal-sm">
            <Sparkles className="w-3.5 h-3.5" /> Subscriber Exclusive Privilege
          </div>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-brutal-text leading-[0.9] mb-4">
            Curate This <br />
            <span className="text-brutal-pop">Week&apos;s Special.</span>
          </h1>
          <p className="font-mono text-sm md:text-base font-bold text-brutal-muted uppercase max-w-xl">
            Active meal plan subscribers vote on our upcoming Friday comfort special. Verified directly through your WhatsApp.
          </p>
        </div>

        {/* Voting Widget Component */}
        <MenuVotingWidget plansHref="/#plans" />

        {/* How Voting Works Helper Box */}
        <div className="mt-12 p-6 md:p-8 border-[3px] border-brutal-border bg-white shadow-brutal">
          <h3 className="text-xl font-black uppercase text-brutal-text tracking-tight mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-brutal-pop" /> How Menu Voting Works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="space-y-1">
              <span className="font-black text-brutal-pop text-sm block">01 / Choose Dish</span>
              <p className="text-brutal-muted font-bold">
                Select your favorite comfort meal from the weekly chef choices.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-black text-brutal-pop text-sm block">02 / WhatsApp OTP</span>
              <p className="text-brutal-muted font-bold">
                Enter your WhatsApp phone number to verify your active meal pack subscription.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-black text-brutal-pop text-sm block">03 / We Cook &amp; Deliver</span>
              <p className="text-brutal-muted font-bold">
                The winning dish is prepared fresh on Friday and delivered hot to your doorstep!
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
