"use client";

import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Utensils, 
  Truck, 
  Clock, 
  Star, 
  MessageCircle, 
  CheckCircle2, 
  MapPin, 
  CreditCard 
} from "lucide-react";

export default function Home() {
  const whatsappUrl = "https://wa.me/919800111101?text=Hello! I want to order a tiffin.";

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b-[3px] border-brutal-border p-6 flex justify-between items-center sticky top-0 bg-brutal-bg/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="bg-brutal-pop p-1.5 border-2 border-brutal-border">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight uppercase text-brutal-text">Tiffin Serv</h1>
        </div>
        <div className="hidden md:flex gap-6 font-medium uppercase text-sm">
          <a href="#how" className="hover:bg-brutal-accent px-2 transition-colors">Process</a>
          <a href="#plans" className="hover:bg-brutal-pop hover:text-white px-2 transition-colors">Plans</a>
          <a href={whatsappUrl} className="bg-brutal-accent border-2 border-brutal-border px-3 py-1 shadow-brutal-sm hover:translate-x-1 hover:-translate-y-1 hover:shadow-brutal transition-all">Order on WhatsApp</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b-[3px] border-brutal-border py-12 md:py-24">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(rgb(45_27_78_/_0.1)_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
        
        <div className="relative z-10 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-start">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-brutal-pop text-white text-xs font-bold uppercase px-3 py-1 border-2 border-brutal-border mb-6 shadow-brutal-sm"
            >
              Freshly Cooked • Delivered Hot
            </motion.div>
            
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl md:text-8xl font-black leading-[0.9] uppercase tracking-tighter mb-8 text-brutal-text"
            >
              Eat Like <br />
              <span className="text-brutal-pop stroke-black">Home,</span> <br />
              <span className="bg-brutal-accent px-4 border-[3px] border-brutal-border inline-block mt-2">Anywhere.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl font-medium max-w-lg mb-10 text-brutal-muted leading-tight"
            >
              Subscription-based home-style meals delivered daily. Zero junk. Full flavor. Automated via WhatsApp for your convenience.
            </motion.p>

            <div className="flex flex-wrap gap-4">
              <motion.a 
                href={whatsappUrl}
                whileHover={{ scale: 1.05, x: 4, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="bg-brutal-border text-brutal-accent text-xl font-bold px-8 py-5 shadow-brutal uppercase flex items-center gap-3 group hover:bg-brutal-pop hover:text-white transition-colors border-[3px] border-brutal-border"
              >
                <MessageCircle className="w-6 h-6" /> Start on WhatsApp
              </motion.a>
              
              <a 
                href="#plans"
                className="bg-white text-brutal-text text-xl font-bold px-8 py-5 border-[3px] border-brutal-border shadow-brutal hover:bg-brutal-bg transition-colors uppercase"
              >
                View Plans
              </a>
            </div>
          </div>

          <div className="relative">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="brutalist-card bg-brutal-card-lilac relative z-10 p-2"
            >
              <div className="aspect-square bg-brutal-border flex items-center justify-center p-8 overflow-hidden">
                <Utensils className="w-full h-full text-brutal-accent opacity-20 absolute" />
                <div className="relative z-10 text-white text-center">
                  <p className="text-8xl font-black mb-2 leading-none italic">HOT</p>
                  <p className="text-5xl font-bold border-t-4 border-white pt-2">BOXES</p>
                </div>
              </div>
            </motion.div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brutal-accent border-[3px] border-brutal-border -z-10 shadow-brutal-sm"></div>
            <div className="absolute -top-6 -right-6 w-48 h-48 bg-brutal-sea border-[3px] border-brutal-border -z-10 shadow-brutal-sm"></div>
          </div>
        </div>

        {/* Marquee */}
        <div className="bg-brutal-border text-brutal-accent py-5 mt-12 md:mt-24 border-y-[3px] border-brutal-border overflow-hidden flex whitespace-nowrap">
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
      <section id="how" className="p-8 md:p-24 border-b-[3px] border-brutal-border bg-brutal-card-mint/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-brutal-text leading-none mb-4">The WhatsApp Way</h3>
            <p className="text-xl font-mono font-bold text-brutal-muted">No apps to download. No websites to login. Just chat.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: MapPin, title: "Zone Check", desc: "Share location on WhatsApp. We instantly check if we serve your area." },
              { icon: Utensils, title: "Select Pack", desc: "Pick a plan (Starter, Regular, or Family) directly from the WhatsApp menu." },
              { icon: CreditCard, title: "Quick Pay", desc: "Pay securely via Razorpay link sent to your chat. Immediate activation." },
              { icon: Truck, title: "Eat Daily", desc: "Receive hot meals daily. Pause or resume anytime with a simple text." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -8 }}
                className="brutalist-card bg-white flex flex-col gap-6"
              >
                <div className="bg-brutal-border text-brutal-accent p-4 w-fit shadow-brutal-sm">
                  <item.icon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold uppercase mb-2 text-brutal-text">{item.title}</h4>
                  <p className="text-sm font-medium font-mono text-brutal-muted leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="p-8 md:p-24 border-b-[3px] border-brutal-border bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-brutal-text leading-none">Choose Your Pack</h3>
            <div className="bg-brutal-accent p-4 border-[3px] border-brutal-border shadow-brutal-sm">
              <p className="text-sm font-mono font-bold uppercase italic">Includes Delivery • Weekly Menus • Eco-Friendly Packaging</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                name: "Starter", 
                meals: 6, 
                price: "480", 
                color: "bg-brutal-card-peach",
                features: ["4 Butter Rotis", "Seasonal Veggie", "Dal Tadka", "Steamed Rice", "Salad & Pickle"]
              },
              { 
                name: "Regular", 
                meals: 12, 
                price: "900", 
                color: "bg-brutal-accent",
                popular: true,
                features: ["4 Butter Rotis", "Two Seasonal Veggies", "Premium Dal", "Basmati Rice", "Dessert (Fri)", "Salad & Pickle"]
              },
              { 
                name: "Family", 
                meals: 24, 
                price: "1680", 
                color: "bg-brutal-card-lilac",
                features: ["Standard Thali x 2", "Large Portions", "Extra Sides", "Full Week Variety", "Free Weekend Special"]
              }
            ].map((plan, idx) => (
              <div 
                key={idx} 
                className={`brutalist-card ${plan.color} flex flex-col h-full relative overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute top-8 -right-12 bg-brutal-pop text-white font-black text-[10px] uppercase py-1 px-12 rotate-45 border-y-2 border-brutal-border">
                    Most Chosen
                  </div>
                )}
                
                <h4 className="text-4xl font-black uppercase mb-2 text-brutal-text">{plan.name}</h4>
                <div className="font-mono font-bold text-sm mb-6 opacity-70 uppercase tracking-wider">{plan.meals} Full Meals</div>
                
                <div className="text-5xl font-black mb-8 border-b-2 border-brutal-border pb-4">
                  ₹{plan.price}
                </div>
                
                <ul className="flex-1 space-y-3 mb-10">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 font-medium text-sm">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-brutal-text" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                
                <a 
                  href={whatsappUrl}
                  className="bg-brutal-border text-white text-center py-4 font-bold uppercase shadow-brutal hover:bg-brutal-pop transition-colors flex items-center justify-center gap-2 group"
                >
                  Order This <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            ))}
          </div>
          
          <div className="mt-16 brutalist-card bg-brutal-card-lemon flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="bg-brutal-border text-white p-4 hidden sm:block">
                <Star className="w-8 h-8 fill-brutal-accent text-brutal-accent" />
              </div>
              <div>
                <h5 className="text-2xl font-bold uppercase text-brutal-text">One-Time Trial Pack</h5>
                <p className="font-mono text-sm font-medium text-brutal-muted">Try our quality for just ₹100. No commitment.</p>
              </div>
            </div>
            <a 
              href={whatsappUrl}
              className="w-full md:w-auto bg-white border-[3px] border-brutal-border px-8 py-3 font-bold uppercase shadow-brutal hover:translate-x-1 hover:-translate-y-1 transition-all text-center"
            >
              Get Trial Box
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brutal-pop p-10 md:p-24 border-b-[3px] border-brutal-border">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <h3 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-8">
            Hungry <br /> Already?
          </h3>
          <p className="text-xl md:text-3xl font-bold text-brutal-border mb-12 max-w-2xl leading-tight">
            Our kitchens are buzzing. The delivery bikes are ready. Your next great home meal is one text away.
          </p>
          <motion.a 
            href={whatsappUrl}
            whileHover={{ scale: 1.05 }}
            className="bg-white text-brutal-text text-2xl md:text-4xl font-black px-12 py-8 border-[3px] border-brutal-border shadow-brutal-lg uppercase flex items-center gap-6 group hover:bg-brutal-accent transition-colors"
          >
            Chat to Start <MessageCircle className="w-10 h-10 fill-brutal-pop text-brutal-pop" />
          </motion.a>
        </div>
      </section>

      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Tiffin Serv",
            "image": "https://tiffinserv.delivery/logo.png",
            "@id": "https://tiffinserv.delivery",
            "url": "https://tiffinserv.delivery",
            "telephone": "+919800111101",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Industrial Area 5, Block B",
              "addressLocality": "Delhi",
              "postalCode": "110001",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 28.6139,
              "longitude": 77.2090
            },
            "servesCuisine": "Indian",
            "priceRange": "₹",
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "08:00",
                "closes": "21:00"
              }
            ]
          })
        }}
      />

      {/* Footer */}
      <footer className="bg-brutal-bg p-12 border-b-[15px] border-brutal-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="w-6 h-6" />
              <h1 className="text-xl font-bold uppercase">Tiffin Serv</h1>
            </div>
            <p className="font-mono text-xs font-bold text-brutal-muted uppercase max-w-xs">
              Home-cooked excellence delivered hot since 2024. Industrial Area 5, Block B, Delhi.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4 font-bold uppercase text-sm">
            <a href="/blog" className="hover:text-brutal-pop">Blog</a>
            <a href="#" className="hover:text-brutal-pop">Instagram</a>
            <a href="#" className="hover:text-brutal-pop">Twitter</a>
            <a href="/privacy" className="hover:text-brutal-pop">Privacy</a>
            <a href="/terms" className="hover:text-brutal-pop">Terms</a>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <div className="bg-brutal-border text-white text-[10px] font-black uppercase px-2 py-1 mb-2">Powered by Meta Cloud</div>
            <p className="font-mono text-xs font-bold text-brutal-muted">© 2026 TIFFIN SERV OPERATIONS</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
