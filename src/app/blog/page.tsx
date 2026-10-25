import { BLOG_POSTS } from "@/lib/blog";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delhi Food & Healthy Living Blog | Homestyle Meal Insights",
  description:
    "Explore Delhi tiffin delivery guides, cost breakdowns of home food vs eating out, and healthy office lunch subscriptions from Mom's Kitchen.",
  keywords: [
    "delhi food blog",
    "tiffin service delhi guide",
    "healthy office lunch delhi",
    "meal subscription savings delhi",
    "ghar ka khana delivery tips",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://momskitchen.co.in/blog",
    title: "Delhi Food & Healthy Living Blog | Mom's Kitchen",
    description:
      "Explore Delhi tiffin delivery guides, cost breakdowns of home food vs eating out, and healthy office lunch subscriptions from Mom's Kitchen.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1280,
        height: 737,
        alt: "Mom's Kitchen Food Log - Delhi Food & Meal Subscription Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mom's Kitchen Blog | Delhi Food & Healthy Living Insights",
    description:
      "Discover smart meal subscriptions, nutrition guides, and Delhi food insights from Mom's Kitchen.",
    images: ["/og-image.jpg"],
  },
};

const blogSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://momskitchen.co.in/blog/#webpage",
      url: "https://momskitchen.co.in/blog",
      name: "Mom's Kitchen Food Log & Blog",
      description:
        "Dispatches from our Delhi kitchens. Real talk about real food, healthy lunch delivery, and meal planning.",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://momskitchen.co.in/#website",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://momskitchen.co.in/blog/#breadcrumb",
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
          name: "Blog",
          item: "https://momskitchen.co.in/blog",
        },
      ],
    },
  ],
};

const ORDER_URL =
  "https://wa.me/917033558836?text=Hello!%20I%27d%20like%20to%20order%20a%20tiffin%20subscription.";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      {/* Adaptive frosted navigation */}
      <SiteNav
        whatsappUrl={ORDER_URL}
        links={[{ href: "/vote", label: "Menu Vote" }]}
        subtitle="Food Log"
      />

      <section className="mx-auto max-w-6xl px-5 pb-24 pt-32 md:pt-40">
        <header className="mb-16 max-w-2xl">
          <p className="eyebrow mb-3 text-coral">Dispatches</p>
          <h1 className="display-hero text-5xl text-ink md:text-7xl">
            The Food Log
          </h1>
          <p className="mt-5 text-lg -tracking-[0.012em] text-muted">
            Dispatches from our Delhi kitchens. Real talk about real food.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="calm-card press flex h-full flex-col rounded-[1.75rem] p-7 transition-all duration-200 group-hover:shadow-lift group-hover:border-hairline">
                <span className="eyebrow mb-4 w-fit rounded-full bg-tealwash px-3 py-1 text-muted">
                  {post.category}
                </span>
                <h2 className="text-2xl font-semibold -tracking-[0.02em] leading-snug text-ink mb-4 transition-colors duration-150 group-hover:text-coral">
                  {post.title}
                </h2>
                <p className="mb-8 flex-1 text-[14px] leading-relaxed text-muted">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between border-t border-hairline-soft pt-4">
                  <div className="flex gap-4 text-[12px] font-medium text-faint">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} /> {post.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.5} /> {post.readTime}
                    </span>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 text-muted transition-transform duration-200 group-hover:translate-x-1"
                    strokeWidth={1.75}
                  />
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="wash-deep grain relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center">
          <div className="relative z-10">
            <h3 className="display-locked text-3xl text-white md:text-5xl">
              Never miss a menu update
            </h3>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
              Get Delhi food guides and subscription deals directly on WhatsApp.
            </p>
            <a
              href="https://wa.me/917033558836?text=Subscribe me to blog updates"
              className="press mt-8 inline-flex items-center gap-2.5 rounded-full bg-whatsapp px-8 py-3.5 text-[15px] font-semibold text-white shadow-lift transition-colors duration-150 hover:bg-whatsapp-deep"
            >
              Join the list
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
