import { BLOG_POSTS } from "@/lib/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, MessageCircle } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const slug = (await params).slug;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Mom's Kitchen`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      url: `https://momskitchen.co.in/blog/${slug}`,
      siteName: "Mom's Kitchen",
      locale: "en_IN",
      images: [
        {
          url: "/og-image.jpg",
          width: 1280,
          height: 737,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const slug = (await params).slug;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) notFound();

  const ORDER_URL =
    "https://wa.me/917033558836?text=Hello!%20I%27d%20like%20to%20order%20a%20tiffin%20subscription.";

  const articleSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://momskitchen.co.in/blog/${post.slug}#article`,
        isPartOf: {
          "@type": "WebPage",
          "@id": `https://momskitchen.co.in/blog/${post.slug}`,
          url: `https://momskitchen.co.in/blog/${post.slug}`,
          name: post.title,
        },
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        dateModified: post.date,
        articleSection: post.category,
        inLanguage: "en-IN",
        image: "https://momskitchen.co.in/og-image.jpg",
        author: {
          "@type": "Person",
          name: post.author.name,
          jobTitle: post.author.role,
          url: "https://momskitchen.co.in",
        },
        publisher: {
          "@type": "Organization",
          name: "Mom's Kitchen",
          url: "https://momskitchen.co.in",
          logo: {
            "@type": "ImageObject",
            url: "https://momskitchen.co.in/og-image.jpg",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://momskitchen.co.in/blog/${post.slug}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://momskitchen.co.in/blog/${post.slug}#breadcrumb`,
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
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: `https://momskitchen.co.in/blog/${post.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Adaptive frosted navigation */}
      <SiteNav
        whatsappUrl={ORDER_URL}
        links={null}
        subtitle={null}
        backLink={{ href: "/blog", label: "Back to Blog" }}
      />

      <article className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-40">
        <header className="mb-12">
          <span className="eyebrow mb-5 w-fit rounded-full bg-tealwash px-3 py-1 text-muted">
            {post.category}
          </span>
          <h1 className="display-hero mb-8 text-4xl text-ink md:text-6xl">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-hairline-soft py-4 text-[12px] font-medium text-faint">
            <span className="tabular flex items-center gap-1.5 text-muted">
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} /> {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} /> {post.readTime}
            </span>
            <span className="md:ml-auto">
              By {post.author.name} · <span className="text-coral">{post.author.role}</span>
            </span>
          </div>
        </header>

        <div
          className="text-[16px] leading-[1.75] text-ink/90
          [&>p]:mb-7 [&>p]:text-muted [&>h2]:mt-12 [&>h2]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:-tracking-[0.02em] [&>h2]:text-ink
          [&>ul]:mb-7 [&>ul]:mt-0 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:text-muted [&>ul>li]:mb-2 [&>ul>li]:leading-relaxed
          [&>strong]:font-semibold [&>strong]:text-ink [&>a]:text-coral [&>a]:underline [&>a]:decoration-hairline [&>a]:underline-offset-2"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="mt-16">
          <div className="calm-card bg-gradient-to-b from-amber-soft to-surface p-8 md:p-10 rounded-[1.75rem]">
            <h3 className="text-2xl font-semibold -tracking-[0.02em] text-ink mb-3">
              Want more content like this?
            </h3>
            <p className="mb-7 text-[14px] leading-relaxed text-muted">
              Join our Delhi community on WhatsApp for daily menus, nutrition tips, and
              exclusive subscription offers.
            </p>
            <a
              href="https://wa.me/917033558836?text=I read your blog and want to subscribe"
              className="press inline-flex items-center gap-2.5 rounded-full bg-ink-solid px-7 py-3.5 text-[14px] font-semibold text-white shadow-lift transition-colors duration-150 hover:bg-[#0d5651]"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} /> Chat with Us
            </a>
          </div>
        </footer>
      </article>

      {/* Recommended Section */}
      <section className="border-t border-hairline-soft bg-paper/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="eyebrow mb-3 text-coral">Keep reading</p>
          <h3 className="display-locked mb-10 text-3xl text-ink">More to read</h3>
          <div className="grid gap-5 md:grid-cols-2">
            {BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2).map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="calm-card press group flex flex-col rounded-[1.75rem] p-7 transition-all duration-200 hover:shadow-lift"
              >
                <h4 className="mb-3 text-xl font-semibold -tracking-[0.02em] leading-snug text-ink transition-colors duration-150 group-hover:text-coral">
                  {p.title}
                </h4>
                <p className="mb-5 flex-1 text-[14px] leading-relaxed text-muted">{p.excerpt}</p>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink">
                  Read now
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
