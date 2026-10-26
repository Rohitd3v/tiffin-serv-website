import { ShieldCheck } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Subscription & Delivery Policy",
  description:
    "Review service terms, delivery zones, order cutoffs, pause policies, and Razorpay payment conditions for Mom's Kitchen meal delivery in Delhi NCR & Gurugram.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://momskitchen.co.in/terms",
    title: "Terms & Conditions | Mom's Kitchen",
    description:
      "Review subscription guidelines, delivery slots, and policies for Mom's Kitchen.",
    images: [{ url: "/og-image.jpg", width: 1280, height: 737, alt: "Mom's Kitchen Terms" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | Mom's Kitchen",
    description: "Subscription policies, delivery windows, and service guidelines.",
    images: ["/og-image.jpg"],
  },
};

const termsSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://momskitchen.co.in/terms/#webpage",
      url: "https://momskitchen.co.in/terms",
      name: "Terms & Conditions | Mom's Kitchen",
      description:
        "Standard terms and conditions for Mom's Kitchen meal delivery in Delhi NCR.",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://momskitchen.co.in/#website",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://momskitchen.co.in/terms/#breadcrumb",
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
          name: "Terms",
          item: "https://momskitchen.co.in/terms",
        },
      ],
    },
  ],
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsSchema) }}
      />
      {/* Adaptive frosted navigation */}
      <SiteNav
        whatsappUrl="/"
        links={null}
        subtitle={null}
        backLink={{ href: "/", label: "Back Home" }}
        showOrderCta={false}
      />

      <article className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-40">
        <header className="mb-12 border-b border-hairline-soft pb-10">
          <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-amber to-coral text-white shadow-lift">
            <ShieldCheck className="h-6 w-6" strokeWidth={1.5} />
          </span>
          <h1 className="display-hero mb-3 text-4xl text-ink md:text-6xl">
            Terms &amp; Conditions
          </h1>
          <p className="tabular text-[13px] text-faint">Last updated: April 2026</p>
        </header>

        <div className="space-y-12">
          <section>
            <h3 className="text-2xl font-semibold -tracking-[0.02em] text-ink mb-4">
              1. Service Description
            </h3>
            <p className="text-[15px] leading-relaxed text-muted">
              Mom&apos;s Kitchen provides subscription-based meal preparation and delivery
              services within designated zones in Delhi NCR. All orders are initiated
              through our WhatsApp-based automated system.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold -tracking-[0.02em] text-ink mb-4">
              2. Subscription & Payments
            </h3>
            <ul className="list-disc space-y-3 pl-6 text-[15px] leading-relaxed text-muted">
              <li>Payments are processed securely via Razorpay.</li>
              <li>Subscriptions (Starter, Regular, Family) are pre-paid.</li>
              <li>&quot;Meals Remaining&quot; are tracked within our database and updated upon each delivery.</li>
              <li>One-time trial boxes are non-refundable.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold -tracking-[0.02em] text-ink mb-4">
              3. Delivery Windows
            </h3>
            <p className="text-[15px] leading-relaxed text-muted mb-3">
              We strictly adhere to the following slots:
            </p>
            <ul className="tabular space-y-1.5 pl-6 list-disc text-[15px] text-ink">
              <li>Lunch: 12:00 PM – 2:00 PM</li>
              <li>Dinner: 7:00 PM – 9:00 PM</li>
            </ul>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Delays caused by extreme weather or traffic in Delhi NCR will be communicated
              via WhatsApp.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold -tracking-[0.02em] text-ink mb-4">
              4. Pause & Cancellation
            </h3>
            <p className="text-[15px] leading-relaxed text-muted">
              Users can pause their meals by texting &quot;PAUSE&quot; to our WhatsApp bot.
              Pause requests for Lunch must be received before 9:00 AM, and for Dinner
              before 4:00 PM on the same day.
            </p>
          </section>

          <section className="calm-card bg-tealwash p-7 rounded-[1.75rem]">
            <h3 className="text-xl font-semibold -tracking-[0.02em] text-ink mb-2">
              Governing Law
            </h3>
            <p className="text-[13px] leading-relaxed text-muted">
              These terms are governed by the laws of the Republic of India. Any disputes
              shall be subject to the exclusive jurisdiction of the courts in Gurugram.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
