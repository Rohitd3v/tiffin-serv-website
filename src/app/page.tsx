"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AnimatedBranch } from "@/components/AnimatedBranch";
import {
  ArrowRight,
  Utensils,
  Truck,
  Star,
  MessageCircle,
  CheckCircle2,
  MapPin,
  Map,
  CreditCard,
} from "lucide-react";

export default function Home() {
  const whatsappUrl =
    "https://wa.me/917033558836?text=Hello! I want to order a tiffin.";

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b-[3px] border-brutal-border p-6 flex justify-between items-center sticky top-0 bg-brutal-bg/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="bg-brutal-pop p-1.5 border-2 border-brutal-border">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight uppercase text-brutal-text">
            Mom&apos;s Kitchen
          </h1>
        </div>
        <div className="hidden md:flex gap-6 font-medium uppercase text-sm">
          <a
            href="#how"
            className="hover:bg-brutal-accent px-2 transition-colors"
          >
            Process
          </a>
          <a
            href="#plans"
            className="hover:bg-brutal-pop hover:text-white px-2 transition-colors"
          >
            Plans
          </a>
          <motion.a
            whileHover={{ scale: 1.05, x: 2, y: -2 }}
            whileTap={{ scale: 0.95 }}
            href={whatsappUrl}
            className="bg-brutal-accent border-2 border-brutal-border px-3 py-1 shadow-brutal-sm hover:shadow-brutal transition-shadow"
          >
            Order on WhatsApp
          </motion.a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b-[3px] border-brutal-border py-16 md:py-32">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(rgb(45_27_78_/_0.1)_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

        <AnimatedBranch />

        <div className="relative z-10 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-brutal-pop text-white text-xs font-bold uppercase px-3 py-1 border-2 border-brutal-border mb-6 shadow-brutal-sm inline-block"
          >
            Freshly Cooked • Delivered Hot
          </motion.div>

          <motion.h2
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
            className="text-6xl md:text-8xl lg:text-[9rem] font-black leading-[0.9] uppercase tracking-tighter mb-8 text-brutal-text"
          >
            Eat Like <br />
            <span className="text-brutal-pop stroke-black">Home,</span> <br />
            <motion.span
              initial={{ rotate: -5, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 12,
                delay: 0.4,
              }}
              className="bg-brutal-accent px-4 border-[3px] border-brutal-border inline-block mt-4"
            >
              Anywhere.
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl font-medium max-w-2xl mx-auto mb-10 text-brutal-muted leading-tight"
          >
            Subscription-based home-style meals delivered daily. Zero junk. Full
            flavor. Automated via WhatsApp for your convenience.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <motion.a
              href={whatsappUrl}
              whileHover={{ scale: 1.05, x: 4, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="bg-brutal-border text-brutal-accent text-xl font-bold px-8 py-5 shadow-brutal uppercase flex items-center gap-3 group hover:bg-brutal-pop hover:text-white transition-colors border-[3px] border-brutal-border"
            >
              <MessageCircle className="w-6 h-6" /> Start on WhatsApp
            </motion.a>

            <motion.a
              href="#plans"
              whileHover={{ scale: 1.05, x: -4, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-brutal-text text-xl font-bold px-8 py-5 border-[3px] border-brutal-border shadow-brutal hover:bg-brutal-bg transition-colors uppercase"
            >
              View Plans
            </motion.a>
          </motion.div>
        </div>

        {/* Marquee */}
        <div className="bg-brutal-border text-brutal-accent py-5 mt-16 md:mt-32 border-y-[3px] border-brutal-border overflow-hidden flex whitespace-nowrap">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="flex gap-12 text-xl font-bold uppercase tracking-widest"
          >
            {[...Array(12)].map((_, i) => (
              <span key={i} className="flex items-center gap-6">
                Freshly Prepared <Star className="w-5 h-5 fill-current" />
                WhatsApp Integrated <Star className="w-5 h-5 fill-current" />
                Free Delivery <Star className="w-5 h-5 fill-current" />
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section
        id="how"
        className="p-8 md:p-24 border-b-[3px] border-brutal-border bg-brutal-card-mint/30 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 100 }}
            className="mb-20"
          >
            <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-brutal-text leading-none mb-4">
              The WhatsApp Way
            </h3>
            <p className="text-xl font-mono font-bold text-brutal-muted">
              No apps to download. No websites to login. Just chat.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: MapPin,
                title: "Zone Check",
                desc: "Share location on WhatsApp. We instantly check if we serve your area.",
              },
              {
                icon: Utensils,
                title: "Select Pack",
                desc: "Pick a plan (Starter, Regular, or Family) directly from the WhatsApp menu.",
              },
              {
                icon: CreditCard,
                title: "Quick Pay",
                desc: "Pay securely via Razorpay link sent to your chat. Immediate activation.",
              },
              {
                icon: Truck,
                title: "Eat Daily",
                desc: "Receive hot meals daily. Pause or resume anytime with a simple text.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="brutalist-card bg-white flex flex-col gap-6"
              >
                <div className="bg-brutal-border text-brutal-accent p-4 w-fit shadow-brutal-sm">
                  <item.icon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold uppercase mb-2 text-brutal-text">
                    {item.title}
                  </h4>
                  <p className="text-sm font-medium font-mono text-brutal-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section
        id="plans"
        className="p-8 md:p-24 border-b-[3px] border-brutal-border bg-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 100 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8"
          >
            <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-brutal-text leading-none">
              Choose Your Pack
            </h3>
            <div className="bg-brutal-accent p-4 border-[3px] border-brutal-border shadow-brutal-sm">
              <p className="text-sm font-mono font-bold uppercase italic">
                Includes Delivery • Weekly Menus • Eco-Friendly Packaging
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                name: "Starter",
                meals: 6,
                price: "480",
                color: "bg-brutal-card-peach",
                features: [
                  "4 Butter Rotis",
                  "Seasonal Veggie",
                  "Dal Tadka",
                  "Steamed Rice",
                  "Salad & Pickle",
                ],
              },
              {
                name: "Regular",
                meals: 12,
                price: "900",
                color: "bg-brutal-accent",
                popular: true,
                features: [
                  "4 Butter Rotis",
                  "Two Seasonal Veggies",
                  "Premium Dal",
                  "Basmati Rice",
                  "Dessert (Fri)",
                  "Salad & Pickle",
                ],
              },
              {
                name: "Family",
                meals: 24,
                price: "1680",
                color: "bg-brutal-card-lilac",
                features: [
                  "Standard Thali x 2",
                  "Large Portions",
                  "Extra Sides",
                  "Full Week Variety",
                  "Free Weekend Special",
                ],
              },
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.15,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`brutalist-card ${plan.color} flex flex-col h-full relative overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute top-8 -right-12 bg-brutal-pop text-white font-black text-[10px] uppercase py-1 px-12 rotate-45 border-y-2 border-brutal-border">
                    Most Chosen
                  </div>
                )}

                <h4 className="text-4xl font-black uppercase mb-2 text-brutal-text">
                  {plan.name}
                </h4>
                <div className="font-mono font-bold text-sm mb-6 opacity-70 uppercase tracking-wider">
                  {plan.meals} Full Meals
                </div>

                <div className="text-5xl font-black mb-8 border-b-2 border-brutal-border pb-4">
                  ₹{plan.price}
                </div>

                <ul className="flex-1 space-y-3 mb-10">
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 font-medium text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-brutal-text" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={whatsappUrl}
                  className="bg-brutal-border text-white text-center py-4 font-bold uppercase shadow-brutal hover:bg-brutal-pop transition-colors flex items-center justify-center gap-2 group border-[3px] border-brutal-border"
                >
                  Order This{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.a>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="mt-16 brutalist-card bg-brutal-card-lemon flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="flex items-center gap-6">
              <div className="bg-brutal-border text-white p-4 hidden sm:block">
                <Star className="w-8 h-8 fill-brutal-accent text-brutal-accent" />
              </div>
              <div>
                <h5 className="text-2xl font-bold uppercase text-brutal-text">
                  One-Time Trial Pack
                </h5>
                <p className="font-mono text-sm font-medium text-brutal-muted">
                  Try our quality for just ₹100. No commitment.
                </p>
              </div>
            </div>
            <motion.a
              whileHover={{ scale: 1.05, x: 4, y: -4 }}
              whileTap={{ scale: 0.95 }}
              href={whatsappUrl}
              className="w-full md:w-auto bg-white border-[3px] border-brutal-border px-8 py-3 font-bold uppercase shadow-brutal text-center"
            >
              Get Trial Box
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-brutal-bg p-6 md:p-24 border-b-[3px] border-brutal-border overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 border-l-[10px] border-brutal-pop pl-6">
            <motion.h3
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brutal-text leading-none mb-4"
            >
              Word on the <br className="hidden md:block" /> Street
            </motion.h3>
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl font-bold font-mono text-brutal-muted uppercase"
            >
              What our regulars are saying.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Rahul Verma",
                role: "Tech Lead",
                quote:
                  "Finally found a tiffin that doesn't make me miss home. The Rajma Chawal is legendary.",
                color: "bg-brutal-card-pink",
              },
              {
                name: "Priya Singh",
                role: "Student",
                quote:
                  "Saves me 2 hours of cooking every day. The portions are huge and packaging is spill-proof.",
                color: "bg-brutal-accent",
              },
              {
                name: "Amit Patel",
                role: "Banker",
                quote:
                  "No acid reflux. No excessive oil. Just clean, delicious home food. Worth every penny.",
                color: "bg-brutal-card-lemon",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
                whileHover={{
                  scale: 1.02,
                  rotate: i % 2 === 0 ? 1 : -1,
                  y: -4,
                }}
                className={`brutalist-card ${testimonial.color} flex flex-col justify-between`}
              >
                <div className="mb-8">
                  <div className="flex gap-1 mb-4 bg-white border-[3px] border-brutal-border w-fit p-2 shadow-brutal-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-5 h-5 fill-brutal-pop text-brutal-pop"
                      />
                    ))}
                  </div>
                  <p className="font-bold text-lg md:text-xl leading-snug">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="border-t-[3px] border-brutal-border pt-4 mt-4 bg-white/50 p-4 -mx-6 -mb-6">
                  <p className="font-black uppercase text-xl">
                    {testimonial.name}
                  </p>
                  <p className="font-mono text-sm font-bold opacity-80 uppercase">
                    {testimonial.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 flex justify-center"
          >
            <motion.a
              whileHover={{ scale: 1.05, x: 4, y: -4 }}
              whileTap={{ scale: 0.95 }}
              href="https://maps.google.com/?q=Mom's+Kitchen+Udyog+Vihar+Sector+18+Gurugram"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border-[3px] border-brutal-border px-8 py-4 font-bold uppercase shadow-brutal flex items-center gap-3 hover:bg-brutal-accent transition-colors"
            >
              <Map className="w-6 h-6" /> Rate us on Google Maps
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brutal-pop p-10 md:p-24 border-b-[3px] border-brutal-border overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100 }}
          className="max-w-4xl mx-auto text-center flex flex-col items-center"
        >
          <h3 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-8">
            Hungry <br /> Already?
          </h3>
          <p className="text-xl md:text-3xl font-bold text-brutal-border mb-12 max-w-2xl leading-tight">
            Our kitchens are buzzing. The delivery bikes are ready. Your next
            great home meal is one text away.
          </p>
          <motion.a
            href={whatsappUrl}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-brutal-text text-2xl md:text-4xl font-black px-12 py-8 border-[3px] border-brutal-border shadow-brutal-lg uppercase flex items-center gap-6 group hover:bg-brutal-accent transition-colors"
          >
            Chat to Start{" "}
            <MessageCircle className="w-10 h-10 fill-brutal-pop text-brutal-pop" />
          </motion.a>
        </motion.div>
      </section>

      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Mom's Kitchen",
            image: "https://tiffinserv.delivery/logo.png",
            "@id": "https://tiffinserv.delivery",
            url: "https://tiffinserv.delivery",
            telephone: "+917033558836",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Udyog Vihar, Sector 18",
              addressLocality: "Gurugram",
              postalCode: "122022",
              addressCountry: "IN",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 28.6139,
              longitude: 77.209,
            },
            servesCuisine: "Indian",
            priceRange: "₹",
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
                closes: "21:00",
              },
            ],
          }),
        }}
      />


    </main>
  );
}
