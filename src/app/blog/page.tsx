import { BLOG_POSTS } from "@/lib/blog";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
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

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-brutal-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <nav className="border-b-[3px] border-brutal-border p-6 flex justify-between items-center sticky top-0 bg-brutal-bg/80 backdrop-blur-md z-50">
        <Link href="/" className="text-2xl font-bold tracking-tight uppercase text-brutal-text flex items-center gap-2">
          <div className="bg-brutal-pop p-1.5 border-2 border-brutal-border">
            <span className="text-white text-xs">MK</span>
          </div>
          Mom&apos;s Kitchen
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/vote" className="font-bold uppercase text-sm hover:text-brutal-pop transition-colors hidden sm:block">
            Menu Vote
          </Link>
          <Link href="/" className="font-bold uppercase text-sm hover:bg-brutal-accent px-2 py-1 transition-colors border-2 border-brutal-border">
            Back to Home
          </Link>
        </div>
      </nav>

      <section className="p-6 md:p-20 max-w-7xl mx-auto">
        <header className="mb-20">
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-brutal-text leading-none mb-8">
            The <br />
            <span className="bg-brutal-pop text-white px-4 border-[3px] border-brutal-border inline-block mt-2 shadow-brutal">Food Log</span>
          </h1>
          <p className="text-xl md:text-3xl font-medium max-w-2xl text-brutal-muted font-mono uppercase">
            Dispatches from our Delhi kitchens. Real talk about real food.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="brutalist-card bg-white h-full flex flex-col group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform shadow-brutal">
                <div className="bg-brutal-border text-white text-[10px] font-black uppercase px-2 py-1 w-fit mb-4 shadow-brutal-sm">
                  {post.category}
                </div>
                <h2 className="text-3xl font-black uppercase mb-6 leading-tight group-hover:text-brutal-pop transition-colors">
                  {post.title}
                </h2>
                <p className="font-mono text-sm font-medium text-brutal-muted mb-8 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between border-t-2 border-brutal-border pt-4">
                  <div className="flex gap-4 text-[10px] font-bold uppercase text-brutal-muted">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="bg-brutal-accent p-10 md:p-24 border-y-[3px] border-brutal-border">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 text-brutal-text">
            Never Miss a Menu Update
          </h3>
          <p className="text-xl font-bold font-mono mb-12">
            Get Delhi food guides and subscription deals directly on WhatsApp.
          </p>
          <a 
            href="https://wa.me/917033558836?text=Subscribe me to blog updates"
            className="bg-brutal-border text-white text-2xl font-black px-10 py-6 shadow-brutal uppercase hover:bg-brutal-pop transition-colors border-[3px] border-brutal-border inline-block"
          >
            Join the List
          </a>
        </div>
      </section>
    </main>
  );
}
