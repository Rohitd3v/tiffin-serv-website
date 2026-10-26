"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  MessageCircle,
  Star,
} from "lucide-react";
import {
  appleSpring,
  appleFlickSpring,
  revealViewport,
} from "@/lib/motionTokens";
import { getPublicPlans, PublicPlan, DEFAULT_PLANS } from "@/lib/plans";
import { getSiteContent, LOCAL_DEFAULTS, SiteContent } from "@/lib/siteContent";
import { MenuVotingWidget } from "@/components/MenuVotingWidget";
import { OrderBotPopup } from "@/components/OrderBotPopup";
import { SiteNav } from "@/components/SiteNav";
import { ProcessScroll } from "@/components/ProcessScroll";
import { FaqSection } from "@/components/FaqSection";
import { AnimatedBranch } from "@/components/AnimatedBranch";

/** "Word on the Street" → last word drops to its own line on md+ screens. */
function TestimonialTitle({ title }: { title: string }) {
  const words = title.split(" ");
  return (
    <>
      {words.map((word, i) =>
        i === words.length - 1 ? (
          <span key={i}>
            <br className="hidden md:block" /> {word}
          </span>
        ) : (
          <span key={i}>{word} </span>
        )
      )}
    </>
  );
}

/** Renders the homepage as an Apple keynote: materials, motion, restraint. */
export default function Home() {
  const [plans, setPlans] = useState<PublicPlan[]>(DEFAULT_PLANS);
  const [content, setContent] = useState<SiteContent>(LOCAL_DEFAULTS);

  useEffect(() => {
    let mounted = true;
    Promise.all([getPublicPlans(), getSiteContent()]).then(([fetchedPlans, fetchedContent]) => {
      if (!mounted) return;
      setPlans(fetchedPlans);
      setContent(fetchedContent);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const { whatsappNumber, whatsappMessage } = content.contact;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="min-h-screen">
      <SiteNav whatsappUrl={whatsappUrl} />

      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="grain wash-bokeh relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28">
        <AnimatedBranch />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={appleSpring}
            className="frost rounded-full px-4 py-1.5 text-[12px] font-medium -tracking-[0.01em] text-ink"
          >
            <span className="mr-1.5 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-whatsapp align-middle" />
            {content.hero.badgeLine1} · {content.hero.badgeLine2}
          </motion.div>

          <motion.h1
            initial={{ y: 12 }}
            animate={{ y: 0 }}
            transition={appleFlickSpring}
            className="display-hero mt-7 text-5xl text-ink sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            {content.hero.titleLine1}{" "}
            <span className="bg-gradient-to-br from-amber-deep via-coral to-coral-deep bg-clip-text text-transparent">
              {content.hero.titleAccent}
            </span>{" "}
            {content.hero.titleLine2}
            <span className="sr-only">
              {" "}— Homestyle Tiffin &amp; Meal Subscription in Delhi NCR &amp; Gurugram
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...appleSpring, delay: 0.08 }}
            className="mt-6 max-w-xl text-lg leading-normal text-muted md:text-xl md:-tracking-[0.012em]"
          >
            {content.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...appleSpring, delay: 0.16 }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <motion.a
              href={whatsappUrl}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={appleSpring}
              className="press inline-flex items-center gap-2.5 rounded-full bg-ink-solid px-7 py-3.5 text-[15px] font-semibold text-white shadow-lift transition-colors duration-150 hover:bg-[#0d5651]"
            >
              <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
              Order on WhatsApp
            </motion.a>
            <motion.a
              href="#plans"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={appleSpring}
              className="press frost inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-150 hover:bg-surface"
            >
              View plans
              <ArrowUpRight className="h-4 w-4 text-muted" strokeWidth={1.75} />
            </motion.a>
          </motion.div>

          {/* Specular message bubble — shows the ordering moment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...appleSpring, delay: 0.24 }}
            className="frost-strong mt-12 flex flex-col items-center gap-2 rounded-[1.25rem] px-6 py-4 sm:flex-row sm:gap-4"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-whatsapp px-3.5 py-1.5 text-[12px] font-medium text-white shadow-soft">
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
              Hi Mom&apos;s Kitchen, order 1 tiffin!
            </span>
            <span className="text-[11px] text-faint">
              Order now: <span className="tabular">{content.contact.whatsappDisplay}</span>
            </span>
          </motion.div>
        </div>

        {/* Quiet marquee — honor-roll strip with soft edge fades */}
        <div className="edge-fade-y mt-20 flex overflow-hidden md:mt-28">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
            className="flex gap-10 pr-10"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="eyebrow flex items-center gap-3 whitespace-nowrap text-faint"
              >
                <span>Freshly Prepared</span>
                <Star className="h-3 w-3 fill-amber text-amber" strokeWidth={1.5} />
                <span>WhatsApp Integrated</span>
                <Star className="h-3 w-3 fill-amber text-amber" strokeWidth={1.5} />
                <span>Free Delivery</span>
                <Star className="h-3 w-3 fill-amber text-amber" strokeWidth={1.5} />
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── How it works (scroll story) ───────────────── */}
      <ProcessScroll
        title={content.process.title}
        subtitle={content.process.subtitle}
        steps={content.process.steps}
      />

      {/* ───────────────────────── Plans (bento) ───────────────────────── */}
      <section
        id="plans"
        className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:py-32"
      >
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-3 text-coral">Pricing</p>
            <h2 className="display-locked text-4xl text-ink md:text-5xl">
              Choose your pack.
            </h2>
          </div>
          <p className="text-[14px] leading-relaxed text-muted md:max-w-xs md:text-right">
            Delivery included · weekly chef menus · eco-friendly packaging.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan, idx) => {
            const isPopular = plan.popular;
            return (
              <motion.div
                key={plan.id || plan.code || idx}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={revealViewport}
                transition={{ ...appleSpring, delay: idx * 0.06 }}
                whileHover={{ y: -6 }}
                className={`relative flex h-full flex-col rounded-[1.75rem] p-7 ${
                  isPopular
                    ? "bg-gradient-to-b from-amber-soft to-surface border border-amber/40 shadow-lift"
                    : "calm-card"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-6 inline-flex items-center gap-1 rounded-full bg-ink-solid px-3 py-1 text-[11px] font-semibold text-white shadow-soft">
                    <Star className="h-3 w-3 fill-amber text-amber" strokeWidth={1.5} />
                    Most Chosen
                  </span>
                )}

                <h3 className="mt-1 text-xl font-semibold -tracking-[0.02em] text-ink">
                  {plan.name}
                </h3>
                <p className="eyebrow mt-1 text-faint">{plan.meals} full meals</p>

                <p className="mt-5 mb-7 flex items-baseline gap-1 border-b border-hairline-soft pb-6">
                  <span className="tabular text-[2.5rem] font-semibold -tracking-[0.03em] text-ink">
                    ₹{plan.price}
                  </span>
                </p>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[14px] text-muted">
                      <span
                        className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full ${
                          isPopular ? "bg-amber-deep text-white" : "bg-tealwash text-ink"
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <motion.a
                  href={whatsappUrl}
                  whileTap={{ scale: 0.98 }}
                  transition={appleSpring}
                  className={`press flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-colors duration-150 ${
                    isPopular
                      ? "bg-ink-solid text-white shadow-lift hover:bg-[#0d5651]"
                      : "bg-tealwash text-ink hover:bg-surface"
                  }`}
                >
                  Order this pack
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                </motion.a>
              </motion.div>
            );
          })}
        </div>

        {/* Trial banner — one-time taste test */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={revealViewport}
          transition={appleSpring}
          className="frost-strong mt-6 flex flex-col items-center justify-between gap-6 rounded-[1.75rem] p-7 md:flex-row"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber to-coral text-white shadow-soft">
              <Star className="h-5 w-5 fill-white" strokeWidth={1.5} />
            </span>
            <div>
              <h3 className="text-[17px] font-semibold -tracking-[0.02em] text-ink">
                One-time trial pack
              </h3>
              <p className="text-[13px] text-muted">
                Try our quality for just ₹100. No commitment.
              </p>
            </div>
          </div>
          <motion.a
            href={whatsappUrl}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={appleSpring}
            className="press w-full rounded-full bg-ink-solid px-7 py-3 text-center text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-[#0d5651] md:w-auto"
          >
            Get trial box
          </motion.a>
        </motion.div>
      </section>

      {/* ───────────────────── Menu voting (subscriber) ─────────────────── */}
      <section
        id="vote"
        className="relative mx-auto max-w-4xl scroll-mt-24 px-5 py-24 md:py-32"
      >
        <div className="mb-10 text-center">
          <p className="eyebrow mb-3 text-coral">Subscriber Exclusive</p>
          <h2 className="display-locked text-4xl text-ink md:text-5xl">
            {content.voteBanner.title || "Vote On Next Week's Menu"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {content.voteBanner.subtitle ||
              "Exclusive to active subscribers. Decide Friday's chef special."}
          </p>
        </div>
        <MenuVotingWidget plansHref="#plans" />
      </section>

      {/* ───────────────────────── Testimonials ───────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 py-24 md:py-32">
        <div className="mb-14 max-w-2xl">
          <p className="eyebrow mb-3 text-coral">Regulars</p>
          <h2 className="display-locked text-4xl text-ink md:text-5xl">
            <TestimonialTitle title={content.testimonials.title} />
          </h2>
          <p className="mt-4 text-[15px] text-muted">{content.testimonials.subtitle}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {content.testimonials.items.map((testimonial, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={revealViewport}
              transition={{ ...appleSpring, delay: i * 0.08 }}
              className={`calm-card ${testimonial.color} flex h-full flex-col justify-between rounded-[1.75rem] p-7`}
            >
              <div>
                <div className="mb-4 flex gap-0.5" aria-label="Rated 5 out of 5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-amber text-amber" strokeWidth={1.5} />
                  ))}
                </div>
                <blockquote className="text-[16px] leading-relaxed -tracking-[0.01em] text-ink">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </div>
              <figcaption className="mt-6 border-t border-hairline-soft pt-4">
                <p className="text-[14px] font-semibold text-ink">{testimonial.name}</p>
                <p className="text-[12px] text-faint">{testimonial.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <motion.a
            href="https://maps.google.com/?q=Mom's+Kitchen+Udyog+Vihar+Sector+18+Gurugram"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={appleSpring}
            className="press frost inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-[14px] font-semibold text-ink transition-colors duration-150 hover:bg-surface"
          >
            <Star className="h-4 w-4 fill-amber text-amber" strokeWidth={1.5} />
            Rate us on Google Maps
          </motion.a>
        </div>
      </section>

      {/* ─────────────────────────── FAQ ─────────────────────────── */}
      <FaqSection />

      {/* ─────────────────────────── CTA panel ─────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-24 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={revealViewport}
          transition={appleSpring}
          className="wash-deep grain relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center md:py-20"
        >
          {/* Soft contour lines, depth only */}
          <svg
            className="absolute inset-0 h-full w-full opacity-20"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,150 C300,50 600,250 1000,100 L1000,600 L0,600 Z" fill="none" stroke="#2DD4BF" strokeWidth="2" />
            <path d="M0,280 C350,180 700,380 1000,220 L1000,600 L0,600 Z" fill="none" stroke="#2DD4BF" strokeWidth="1.5" />
            <path d="M0,420 C400,320 650,480 1000,380 L1000,600 L0,600 Z" fill="none" stroke="#2DD4BF" strokeWidth="1" />
          </svg>

          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
            <h2 className="display-hero text-4xl text-white md:text-6xl">
              Scan to order
              <br />
              <span className="bg-gradient-to-r from-[#6ee7a0] to-[#25d366] bg-clip-text text-transparent">
                on WhatsApp
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/75 md:text-[17px]">
              Fresh, healthy, homestyle meals delivered daily. Zero apps, zero logins —
              just one WhatsApp message.
            </p>

            <div className="glass mt-10 flex w-full max-w-sm flex-col items-center gap-4 rounded-[1.5rem] p-6">
              <a
                href={whatsappUrl}
                className="press flex w-full items-center justify-center gap-2.5 rounded-2xl bg-whatsapp py-4 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-whatsapp-deep"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
                Chat to order now
              </a>
              <div className="tabular flex flex-col gap-1 text-[11px] text-white/70">
                <span>WhatsApp: {content.contact.whatsappDisplay}</span>
                <span>Email: {content.contact.email}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Rich SEO Structured Data (LocalBusiness, DeliveryService, Plans & FAQ) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": ["LocalBusiness", "FoodEstablishment", "DeliveryService"],
                "@id": "https://momskitchen.co.in/#localbusiness",
                name: "Mom's Kitchen",
                alternateName: "Mom's Kitchen Homestyle Tiffin Service",
                image: "https://momskitchen.co.in/og-image.jpg",
                url: "https://momskitchen.co.in",
                telephone: "+917033558836",
                email: "orders@momskitchen.com",
                priceRange: "₹480 - ₹1680",
                servesCuisine: [
                  "North Indian",
                  "Homestyle",
                  "Ghar Ka Khana",
                  "Vegetarian",
                  "Thali",
                ],
                knowsAbout: [
                  "FSSAI Food Safety Standards",
                  "Daily Homestyle Meal Subscriptions",
                  "Hygienic Cloud Kitchen Operations",
                ],
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Udyog Vihar Phase 4, Sector 18",
                  addressLocality: "Gurugram",
                  addressRegion: "Haryana",
                  postalCode: "122022",
                  addressCountry: "IN",
                },
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: 28.5034,
                  longitude: 77.0844,
                },
                areaServed: [
                  { "@type": "AdministrativeArea", name: "Delhi NCR" },
                  { "@type": "City", name: "Delhi" },
                  { "@type": "City", name: "South Delhi" },
                  { "@type": "City", name: "Central Delhi" },
                  { "@type": "City", name: "Gurugram" },
                  { "@type": "City", name: "Noida" },
                ],
                hasMenu: "https://momskitchen.co.in/#plans",
                openingHoursSpecification: [
                  {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ],
                    opens: "08:00",
                    closes: "21:30",
                  },
                ],
                potentialAction: {
                  "@type": "OrderAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate:
                      "https://wa.me/917033558836?text=Hello!%20I%20want%20to%20order%20a%20tiffin.",
                    inLanguage: "en-IN",
                    actionPlatform: [
                      "http://schema.org/DesktopWebPlatform",
                      "http://schema.org/MobileWebPlatform",
                      "http://schema.org/IOSPlatform",
                      "http://schema.org/AndroidPlatform",
                    ],
                  },
                  deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet",
                },
              },
              {
                "@type": "ItemList",
                "@id": "https://momskitchen.co.in/#plans-list",
                name: "Mom's Kitchen Tiffin Meal Plans",
                itemListElement: plans.map((plan, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  item: {
                    "@type": "Product",
                    name: `Mom's Kitchen ${plan.name} Pack`,
                    description: `${plan.meals} freshly cooked homestyle meals. Includes ${plan.features.join(", ")}.`,
                    offers: {
                      "@type": "Offer",
                      price: plan.price,
                      priceCurrency: "INR",
                      availability: "https://schema.org/InStock",
                      url: "https://momskitchen.co.in/#plans",
                      seller: {
                        "@id": "https://momskitchen.co.in/#localbusiness",
                      },
                    },
                  },
                })),
              },
              {
                "@type": "FAQPage",
                "@id": "https://momskitchen.co.in/#faq",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "How does Mom's Kitchen tiffin service work?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Ordering is handled 100% via WhatsApp. Send your delivery pin, choose a meal pack (Starter, Regular, or Family), make payment via Razorpay, and receive hot homestyle meals daily. Pause or resume anytime by texting the bot.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Which areas in Delhi NCR and Gurugram do you deliver to?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "We deliver across South Delhi, Central Delhi, North Delhi, and Gurugram (including Udyog Vihar, DLF phases, and Cyber City). Delivery eligibility is verified in seconds through WhatsApp location sharing.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What time are meals delivered?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Lunch is delivered between 12:00 PM and 2:00 PM. Dinner is delivered between 7:00 PM and 9:00 PM. Cutoff for lunch pause is 9:00 AM; cutoff for dinner pause is 4:00 PM.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Can I try a single meal before subscribing?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes! We offer a One-Time Trial Pack for just ₹100 so you can experience our quality, freshness, and authentic homestyle taste before committing to a plan.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What is included in each homestyle tiffin box?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Each meal includes freshly cooked butter rotis, seasonal sabzi, homestyle dal tadka, steamed basmati rice, fresh salad, and pickle, made with fresh daily ingredients and minimal oil.",
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />

      {/* 5-second delayed first-time visitor WhatsApp order sheet */}
      <OrderBotPopup whatsappUrl={whatsappUrl} />
    </main>
  );
}
