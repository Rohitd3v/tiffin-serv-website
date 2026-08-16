import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Mom's Kitchen",
  description: "How we handle your data, WhatsApp numbers, and location for meal delivery.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b-[3px] border-brutal-border p-6 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-2 font-bold uppercase text-sm hover:bg-brutal-accent px-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back Home
        </Link>
        <h1 className="text-xl font-black uppercase text-brutal-text">Privacy Policy</h1>
      </nav>

      <article className="max-w-4xl mx-auto p-6 md:p-20">
        <header className="mb-12 border-b-4 border-brutal-border pb-8">
          <div className="bg-brutal-pop p-4 border-2 border-brutal-border w-fit mb-6">
            <Lock className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-6xl font-black uppercase tracking-tighter mb-4">Data <br /> Privacy</h2>
          <p className="font-mono font-bold text-brutal-muted uppercase">Last Updated: April 2026</p>
        </header>

        <div className="space-y-12 font-medium leading-relaxed text-brutal-text">
          <section>
            <h3 className="text-3xl font-black uppercase mb-4">1. Information We Collect</h3>
            <p>To provide automated meal delivery via WhatsApp, we collect:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Phone Number:</strong> Used as your unique account identifier.</li>
              <li><strong>Geolocation:</strong> Captured once via WhatsApp to verify if your address falls within our Delhi NCR delivery zones.</li>
              <li><strong>Delivery Address:</strong> Text-based address for our delivery partners.</li>
              <li><strong>Transaction Data:</strong> Payment confirmation via Razorpay.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-3xl font-black uppercase mb-4">2. How We Use Data</h3>
            <p>Your data is exclusively used for order fulfillment and customer support. We do not sell or trade your personal information to third parties.</p>
          </section>

          <section>
            <h3 className="text-3xl font-black uppercase mb-4">3. Third-Party Services</h3>
            <p>We utilize industry-standard partners to power our ecosystem:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Meta (WhatsApp Cloud API):</strong> For processing your messages and menu selections.</li>
              <li><strong>Razorpay:</strong> For secure, PCI-compliant payment processing.</li>
              <li><strong>Supabase:</strong> For encrypted database storage of your subscription status.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-3xl font-black uppercase mb-4">4. Retention</h3>
            <p>We retain your delivery history for 12 months to provide subscription insights. You may request account deletion at any time by texting &quot;DELETE&quot; to our WhatsApp bot.</p>
          </section>

          <section className="bg-brutal-card-mint p-8 border-[3px] border-brutal-border">
            <h3 className="text-2xl font-black uppercase mb-2">Contact DPO</h3>
            <p className="text-sm font-mono font-bold">privacy@momskitchen.ops — Udyog Vihar, Sector 18, Gurugram, India, 122022.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
