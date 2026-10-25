import { Utensils, Sparkles } from "lucide-react";
import { MenuVotingWidget } from "@/components/MenuVotingWidget";
import { SiteNav } from "@/components/SiteNav";
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
    <main className="min-h-screen bg-paper pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(voteSchema) }}
      />
      {/* Adaptive frosted navigation */}
      <SiteNav
        whatsappUrl={whatsappUrl}
        links={null}
        subtitle="Menu Voting"
        backLink={{ href: "/", label: "Back to Home" }}
        helpUrl={whatsappUrl}
        helpLabel="Help"
      />

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 pt-32 md:px-6">
        {/* Breadcrumb & Header */}
        <div className="mb-12 text-center">
          <span className="eyebrow mb-4 inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1 text-amber-deep">
            <Sparkles className="h-3 w-3" strokeWidth={1.5} /> Subscriber exclusive privilege
          </span>
          <h1 className="display-hero mb-4 text-4xl text-ink md:text-6xl">
            Curate this{" "}
            <span className="bg-gradient-to-br from-amber-deep via-coral to-coral-deep bg-clip-text text-transparent">
              week&apos;s special
            </span>
            .
          </h1>
          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-muted">
            Active meal plan subscribers vote on our upcoming Friday comfort special.
            Verified directly through your WhatsApp.
          </p>
        </div>

        {/* Voting Widget Component */}
        <MenuVotingWidget plansHref="/#plans" />

        {/* How Voting Works */}
        <div className="frost mt-14 rounded-[1.75rem] p-6 md:p-8">
          <h3 className="mb-6 flex items-center gap-2.5 text-[17px] font-semibold -tracking-[0.02em] text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-tealwash text-ink">
              <Utensils className="h-4 w-4" strokeWidth={1.5} />
            </span>
            How menu voting works
          </h3>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { num: "01", label: "Choose dish", desc: "Select your favorite comfort meal from the weekly chef choices." },
              { num: "02", label: "WhatsApp OTP", desc: "Enter your WhatsApp phone number to verify your active meal pack subscription." },
              { num: "03", label: "We cook & deliver", desc: "The winning dish is prepared fresh on Friday and delivered hot to your doorstep!" },
            ].map((step) => (
              <div key={step.num} className="border-t border-hairline-soft pt-4">
                <span className="eyebrow block text-coral">{step.num} · {step.label}</span>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
