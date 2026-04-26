import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Tiffin Serv",
  description: "Standard terms and conditions for Tiffin Serv meal delivery in Delhi NCR.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b-[3px] border-brutal-border p-6 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-2 font-bold uppercase text-sm hover:bg-brutal-accent px-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back Home
        </Link>
        <h1 className="text-xl font-black uppercase text-brutal-text">Terms & Conditions</h1>
      </nav>

      <article className="max-w-4xl mx-auto p-6 md:p-20">
        <header className="mb-12 border-b-4 border-brutal-border pb-8">
          <div className="bg-brutal-accent p-4 border-2 border-brutal-border w-fit mb-6">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <h2 className="text-6xl font-black uppercase tracking-tighter mb-4">Legal <br /> Framework</h2>
          <p className="font-mono font-bold text-brutal-muted uppercase">Last Updated: April 2026</p>
        </header>

        <div className="space-y-12 font-medium leading-relaxed text-brutal-text">
          <section>
            <h3 className="text-3xl font-black uppercase mb-4">1. Service Description</h3>
            <p>Tiffin Serv provides subscription-based meal preparation and delivery services within designated zones in Delhi NCR. All orders are initiated through our WhatsApp-based automated system.</p>
          </section>

          <section>
            <h3 className="text-3xl font-black uppercase mb-4">2. Subscription & Payments</h3>
            <ul className="list-disc pl-6 space-y-4">
              <li>Payments are processed securely via Razorpay.</li>
              <li>Subscriptions (Starter, Regular, Family) are pre-paid.</li>
              <li>"Meals Remaining" are tracked within our database and updated upon each delivery.</li>
              <li>One-time trial boxes are non-refundable.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-3xl font-black uppercase mb-4">3. Delivery Windows</h3>
            <p>We strictly adhere to the following slots:</p>
            <ul className="font-mono font-bold mt-4 space-y-2">
              <li>Lunch: 12:00 PM - 2:00 PM</li>
              <li>Dinner: 7:00 PM - 9:00 PM</li>
            </ul>
            <p className="mt-4">Delays caused by extreme weather or traffic in Delhi will be communicated via WhatsApp.</p>
          </section>

          <section>
            <h3 className="text-3xl font-black uppercase mb-4">4. Pause & Cancellation</h3>
            <p>Users can pause their meals by texting "PAUSE" to our WhatsApp bot. Pause requests for Lunch must be received before 9:00 AM, and for Dinner before 4:00 PM on the same day.</p>
          </section>

          <section className="bg-brutal-bg p-8 border-[3px] border-brutal-border">
            <h3 className="text-2xl font-black uppercase mb-2">Governing Law</h3>
            <p className="text-sm">These terms are governed by the laws of the Republic of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Delhi.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
