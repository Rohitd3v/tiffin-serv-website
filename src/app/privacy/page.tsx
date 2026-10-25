import { Lock } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Customer Data & Security Policy",
  description:
    "Understand how Mom's Kitchen collects, protects, and handles customer phone numbers, delivery addresses, geolocation, and WhatsApp ordering data.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://momskitchen.co.in/privacy",
    title: "Privacy Policy | Mom's Kitchen",
    description:
      "Customer privacy, security, and WhatsApp data handling principles at Mom's Kitchen.",
    images: [{ url: "/og-image.jpg", width: 1280, height: 737, alt: "Mom's Kitchen Privacy Policy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Mom's Kitchen",
    description: "How Mom's Kitchen protects your privacy and meal delivery data.",
    images: ["/og-image.jpg"],
  },
};

const privacySchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://momskitchen.co.in/privacy/#webpage",
      url: "https://momskitchen.co.in/privacy",
      name: "Privacy Policy | Mom's Kitchen",
      description:
        "How we handle your data, WhatsApp numbers, and location for meal delivery.",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://momskitchen.co.in/#website",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://momskitchen.co.in/privacy/#breadcrumb",
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
          name: "Privacy",
          item: "https://momskitchen.co.in/privacy",
        },
      ],
    },
  ],
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacySchema) }}
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
          <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-ink-solid to-[#0d5651] text-white shadow-lift">
            <Lock className="h-6 w-6" strokeWidth={1.5} />
          </span>
          <h1 className="display-hero mb-3 text-4xl text-ink md:text-6xl">Privacy Policy</h1>
          <p className="tabular text-[13px] text-faint">Last updated: April 2026</p>
        </header>

        <div className="space-y-12">
          <section>
            <h3 className="text-2xl font-semibold -tracking-[0.02em] text-ink mb-4">
              1. Information We Collect
            </h3>
            <p className="text-[15px] leading-relaxed text-muted mb-3">
              To provide automated meal delivery via WhatsApp, we collect:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-[15px] leading-relaxed text-muted">
              <li><strong className="font-semibold text-ink">Phone Number:</strong> Used as your unique account identifier.</li>
              <li><strong className="font-semibold text-ink">Geolocation:</strong> Captured once via WhatsApp to verify if your address falls within our Delhi NCR delivery zones.</li>
              <li><strong className="font-semibold text-ink">Delivery Address:</strong> Text-based address for our delivery partners.</li>
              <li><strong className="font-semibold text-ink">Transaction Data:</strong> Payment confirmation via Razorpay.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold -tracking-[0.02em] text-ink mb-4">
              2. How We Use Data
            </h3>
            <p className="text-[15px] leading-relaxed text-muted">
              Your data is exclusively used for order fulfillment and customer support. We do
              not sell or trade your personal information to third parties.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold -tracking-[0.02em] text-ink mb-4">
              3. Third-Party Services
            </h3>
            <p className="text-[15px] leading-relaxed text-muted mb-3">
              We utilize industry-standard partners to power our ecosystem:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-[15px] leading-relaxed text-muted">
              <li><strong className="font-semibold text-ink">Meta (WhatsApp Cloud API):</strong> For processing your messages and menu selections.</li>
              <li><strong className="font-semibold text-ink">Razorpay:</strong> For secure, PCI-compliant payment processing.</li>
              <li><strong className="font-semibold text-ink">Supabase:</strong> For encrypted database storage of your subscription status.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold -tracking-[0.02em] text-ink mb-4">
              4. Retention
            </h3>
            <p className="text-[15px] leading-relaxed text-muted">
              We retain your delivery history for 12 months to provide subscription insights.
              You may request account deletion at any time by texting &quot;DELETE&quot; to our
              WhatsApp bot.
            </p>
          </section>

          <section className="calm-card bg-tealwash p-7 rounded-[1.75rem]">
            <h3 className="text-xl font-semibold -tracking-[0.02em] text-ink mb-2">Contact DPO</h3>
            <p className="text-[13px] leading-relaxed text-muted">
              privacy@momskitchen.ops — Udyog Vihar, Sector 18, Gurugram, India, 122022.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
