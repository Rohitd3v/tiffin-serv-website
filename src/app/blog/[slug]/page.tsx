import { BLOG_POSTS } from "@/lib/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MessageCircle, Share2 } from "lucide-react";
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
    title: `${post.title} | Mom's Kitchen Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const slug = (await params).slug;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b-[3px] border-brutal-border p-6 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link href="/blog" className="flex items-center gap-2 font-bold uppercase text-sm hover:bg-brutal-accent px-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
        <Link href="/" className="text-2xl font-bold tracking-tight uppercase text-brutal-text hidden md:block">
          Mom&apos;s Kitchen
        </Link>
        <div className="flex gap-4">
          <button className="p-2 border-2 border-brutal-border hover:bg-brutal-sea transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto p-6 md:p-20">
        <header className="mb-12">
          <div className="bg-brutal-pop text-white text-xs font-black uppercase px-3 py-1 border-2 border-brutal-border w-fit mb-6 shadow-brutal-sm">
            {post.category}
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-brutal-text leading-none mb-8">
            {post.title}
          </h1>
          <div className="flex flex-wrap gap-6 text-sm font-bold uppercase text-brutal-muted font-mono border-y-2 border-brutal-border py-4">
            <span className="flex items-center gap-2 text-brutal-text">
              <Calendar className="w-4 h-4" /> {post.date}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> {post.readTime}
            </span>
            <span className="md:ml-auto">By Mom&apos;s Kitchen Editorial</span>
          </div>
        </header>

        <div 
          className="prose prose-xl max-w-none font-medium leading-relaxed text-brutal-text 
          [&>p]:mb-8 [&>h2]:text-brutal-text [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-8 [&>ul>li]:mb-2
          [&>strong]:font-black"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="mt-20 pt-10 border-t-4 border-brutal-border">
          <div className="brutalist-card bg-brutal-accent">
            <h3 className="text-3xl font-black uppercase mb-4">Want more content like this?</h3>
            <p className="font-bold font-mono mb-8">Join our Delhi community on WhatsApp for daily menus, nutrition tips, and exclusive subscription offers.</p>
            <a 
              href="https://wa.me/919800111101?text=I read your blog and want to subscribe"
              className="bg-brutal-border text-white text-xl font-bold px-8 py-4 shadow-brutal uppercase flex items-center gap-3 w-fit hover:bg-brutal-pop transition-colors border-[3px] border-brutal-border"
            >
              <MessageCircle className="w-6 h-6" /> Chat with Us
            </a>
          </div>
        </footer>
      </article>

      {/* Recommended Section */}
      <section className="bg-brutal-bg p-6 md:p-20 border-t-[3px] border-brutal-border">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-black uppercase tracking-tighter mb-12">More to Read</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 2).map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="brutalist-card bg-white hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-brutal">
                <h4 className="text-2xl font-black uppercase mb-4">{p.title}</h4>
                <p className="font-mono text-sm opacity-70 mb-4">{p.excerpt}</p>
                <span className="text-xs font-black uppercase underline">Read Now</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}
