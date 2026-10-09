import Link from "next/link";
import { Utensils } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brutal-bg p-12 border-b-[15px] border-brutal-border mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-6 h-6 text-brutal-pop" />
            <span className="text-xl font-black uppercase tracking-tight text-brutal-text">
              Mom&apos;s Kitchen
            </span>
          </div>
          <p className="font-mono text-xs font-bold text-brutal-muted uppercase max-w-xs">
            Authentic homestyle tiffin &amp; meal subscription delivered hot daily across Delhi NCR &amp; Gurugram.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4 font-bold uppercase text-sm">
          <Link
            href="/"
            className="hover:text-brutal-pop transition-colors"
          >
            Home
          </Link>
          <Link
            href="/#plans"
            className="hover:text-brutal-pop transition-colors"
          >
            Meal Plans
          </Link>
          <Link
            href="/vote"
            className="hover:text-brutal-pop transition-colors"
          >
            Menu Voting
          </Link>
          <Link
            href="/blog"
            className="hover:text-brutal-pop transition-colors"
          >
            Food Blog
          </Link>
          <Link
            href="/privacy"
            className="hover:text-brutal-pop transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-brutal-pop transition-colors"
          >
            Terms
          </Link>
        </div>

        <div className="text-right flex flex-col items-end">
          <div className="bg-brutal-border text-white text-[10px] font-black uppercase px-2 py-1 mb-2">
            Powered by Meta Cloud
          </div>
          <p className="font-mono text-xs font-bold text-brutal-muted mb-2">
            © 2026 MOM&apos;S KITCHEN OPERATIONS
          </p>
          <p className="font-mono text-[10px] font-bold text-brutal-muted uppercase">
            Website & Bot Made with ❤️ by{" "}
            <a
              href="https://github.com/Rohitd3v"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brutal-pop transition-colors underline"
            >
              Rohit Singh Negi
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
