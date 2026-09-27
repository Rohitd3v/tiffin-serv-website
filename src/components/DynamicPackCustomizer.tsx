"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  MessageCircle,
  Plus,
  Utensils,
  Calendar,
  Flame,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  Plan,
  MealSlot,
  DEFAULT_PLANS,
  ADDON_OPTIONS,
  calculateOrderPricing,
  generateWhatsAppOrderUrl,
} from "@/lib/plans";

export function DynamicPackCustomizer() {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [selectedCode, setSelectedCode] = useState<string>("regular");
  const [slot, setSlot] = useState<MealSlot>("lunch");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveSource, setIsLiveSource] = useState(false);

  // Fetch live plans from Supabase via API route
  useEffect(() => {
    let isMounted = true;
    async function loadPlans() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/plans");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.plans && json.plans.length > 0) {
            setPlans(json.plans);
            if (json.source === "supabase") {
              setIsLiveSource(true);
            }
          }
        }
      } catch (e) {
        console.warn("Using offline/fallback meal plans", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const activePlan = useMemo(() => {
    return plans.find((p) => p.code === selectedCode) || plans[0] || DEFAULT_PLANS[1];
  }, [plans, selectedCode]);

  // For one-time meal, 'both' slot is not applicable as per kitchen cutoff logic
  const effectiveSlot = useMemo(() => {
    if (activePlan.meals === 1 && slot === "both") {
      return "lunch";
    }
    return slot;
  }, [activePlan.meals, slot]);

  const pricing = useMemo(() => {
    return calculateOrderPricing(activePlan, effectiveSlot, selectedAddonIds);
  }, [activePlan, effectiveSlot, selectedAddonIds]);

  const whatsappOrderUrl = useMemo(() => {
    return generateWhatsAppOrderUrl(activePlan, effectiveSlot, selectedAddonIds, pricing);
  }, [activePlan, effectiveSlot, selectedAddonIds, pricing]);

  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  return (
    <div className="w-full">
      {/* Live Sync Status Pill */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="inline-flex items-center gap-2 bg-white border-2 border-brutal-border px-3 py-1 text-xs font-mono font-bold text-brutal-text shadow-brutal-sm">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
          <span>{isLiveSource ? "Live Kitchen Database Synced" : "Daily Menu Active"}</span>
          {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-brutal-muted" />}
        </div>
        <div className="text-xs font-mono font-bold text-brutal-muted uppercase">
          Zero commitment • Pause or swap meals anytime
        </div>
      </div>

      {/* Step 1: Pack Selection Cards */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-brutal-pop text-white font-mono text-xs font-black px-2 py-0.5 border border-brutal-border">
            STEP 1
          </span>
          <h4 className="text-xl md:text-2xl font-black uppercase text-brutal-text">
            Choose Your Pack Size
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isSelected = plan.code === selectedCode;
            const singleMealCost = Math.round(plan.price / plan.meals);

            return (
              <motion.div
                key={plan.code}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCode(plan.code)}
                className={`cursor-pointer brutalist-card relative flex flex-col justify-between transition-all ${
                  isSelected
                    ? "bg-white ring-4 ring-brutal-pop shadow-brutal-lg"
                    : "bg-brutal-card hover:bg-white"
                }`}
              >
                {/* Popular or Savings Badge */}
                {plan.popular ? (
                  <div className="absolute -top-3.5 right-4 bg-brutal-pop text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 border-2 border-brutal-border shadow-brutal-sm flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-white" /> Most Chosen
                  </div>
                ) : plan.savingsPercent && plan.savingsPercent > 0 ? (
                  <div className="absolute -top-3.5 right-4 bg-brutal-accent text-brutal-text text-[10px] font-black uppercase tracking-wider py-1 px-3 border-2 border-brutal-border shadow-brutal-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-current" /> Save {plan.savingsPercent}%
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-2xl font-black uppercase text-brutal-text leading-tight">
                      {plan.name}
                    </h5>
                    <div
                      className={`w-6 h-6 rounded-full border-2 border-brutal-border flex items-center justify-center transition-colors ${
                        isSelected ? "bg-brutal-pop text-white" : "bg-white"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 fill-white text-brutal-pop" />}
                    </div>
                  </div>

                  <div className="inline-block bg-brutal-card-lemon px-2.5 py-0.5 border border-brutal-border text-xs font-mono font-bold text-brutal-text mb-4">
                    {plan.meals} {plan.meals === 1 ? "Trial Meal" : "Full Meals"}
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-black text-brutal-text">
                      ₹{plan.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-mono font-bold text-brutal-muted">
                      (₹{singleMealCost}/meal)
                    </span>
                  </div>

                  <ul className="space-y-2 mb-6 border-t-2 border-brutal-border/20 pt-4">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-medium text-brutal-text">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-brutal-pop" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`py-2 px-3 text-center font-bold text-xs uppercase border-2 border-brutal-border transition-colors ${
                    isSelected
                      ? "bg-brutal-pop text-white font-black"
                      : "bg-white text-brutal-text hover:bg-brutal-accent"
                  }`}
                >
                  {isSelected ? "Selected Pack ✓" : "Select Pack"}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Customizer Options & Live Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Slot & Add-ons (8 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 2: Meal Slot Selection */}
          <div className="brutalist-card bg-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-brutal-accent text-brutal-text font-mono text-xs font-black px-2 py-0.5 border border-brutal-border">
                STEP 2
              </span>
              <h4 className="text-xl font-black uppercase text-brutal-text">
                Select Delivery Slot
              </h4>
            </div>

            <p className="text-xs font-mono text-brutal-muted mb-4">
              Cooked hot and delivered in insulated spill-proof containers at your preferred timing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "lunch" as MealSlot,
                  title: "Lunch Slot",
                  time: "12:30 PM - 1:30 PM",
                  desc: "1 meal / day",
                  disabled: false,
                },
                {
                  id: "dinner" as MealSlot,
                  title: "Dinner Slot",
                  time: "7:30 PM - 8:30 PM",
                  desc: "1 meal / day",
                  disabled: false,
                },
                {
                  id: "both" as MealSlot,
                  title: "Both Meals",
                  time: "Lunch & Dinner",
                  desc: "2 meals / day",
                  disabled: activePlan.meals === 1,
                },
              ].map((s) => {
                const isSelected = effectiveSlot === s.id;
                return (
                  <button
                    type="button"
                    key={s.id}
                    disabled={s.disabled}
                    onClick={() => setSlot(s.id)}
                    className={`p-4 text-left border-2 border-brutal-border transition-all flex flex-col justify-between ${
                      s.disabled
                        ? "opacity-40 cursor-not-allowed bg-gray-100"
                        : isSelected
                        ? "bg-brutal-accent text-brutal-text shadow-brutal-sm ring-2 ring-brutal-border"
                        : "bg-brutal-bg hover:bg-white text-brutal-text"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black uppercase text-sm">{s.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brutal-border" />}
                      </div>
                      <div className="font-mono text-xs font-bold text-brutal-muted flex items-center gap-1 mb-2">
                        <Clock className="w-3 h-3" /> {s.time}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/70 px-2 py-0.5 border border-brutal-border w-fit">
                      {s.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Add-on Enhancements */}
          <div className="brutalist-card bg-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-brutal-sea text-white font-mono text-xs font-black px-2 py-0.5 border border-brutal-border">
                STEP 3
              </span>
              <h4 className="text-xl font-black uppercase text-brutal-text">
                Add-on Enhancements
              </h4>
              <span className="text-xs font-mono font-bold text-brutal-muted ml-auto">
                (Optional)
              </span>
            </div>

            <p className="text-xs font-mono text-brutal-muted mb-4">
              Fresh additions packed daily with each meal in your subscription.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ADDON_OPTIONS.map((addon) => {
                const isSelected = selectedAddonIds.includes(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-4 border-2 border-brutal-border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-brutal-card-lemon ring-2 ring-brutal-border shadow-brutal-sm"
                        : "bg-brutal-bg hover:bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-bold text-sm text-brutal-text leading-snug">
                          {addon.name}
                        </span>
                        <div
                          className={`w-5 h-5 shrink-0 border-2 border-brutal-border flex items-center justify-center transition-colors ${
                            isSelected ? "bg-brutal-pop text-white" : "bg-white"
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="w-3.5 h-3.5 fill-white text-brutal-pop" />
                          ) : (
                            <Plus className="w-3 h-3 text-brutal-muted" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-mono text-brutal-muted leading-tight mb-3">
                        {addon.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-brutal-border/20 pt-2 text-xs font-mono font-bold">
                      <span className="text-brutal-pop">+₹{addon.pricePerMeal} / meal</span>
                      <span className="text-brutal-muted">
                        (+₹{addon.pricePerMeal * activePlan.meals} total)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Price Engine & WhatsApp Summary (5 cols) */}
        <div className="lg:col-span-5 sticky top-28">
          <div className="brutalist-card bg-brutal-card-warm p-6 md:p-8 relative overflow-hidden border-[3px] border-brutal-border shadow-brutal-lg">
            {/* Top Ribbon */}
            <div className="flex items-center justify-between border-b-2 border-brutal-border pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brutal-muted block">
                  Configured Pack
                </span>
                <h5 className="text-3xl font-black uppercase text-brutal-text leading-tight">
                  {activePlan.name}
                </h5>
              </div>
              <div className="text-right">
                <span className="bg-brutal-pop text-white text-xs font-mono font-black uppercase px-2.5 py-1 border border-brutal-border shadow-brutal-sm inline-block">
                  {pricing.totalMeals} Meals
                </span>
              </div>
            </div>

            {/* Dynamic Breakdown List */}
            <div className="space-y-3 font-mono text-sm mb-6">
              <div className="flex justify-between items-center text-brutal-text">
                <span className="font-bold flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-brutal-pop" /> Base Meal Pack:
                </span>
                <span className="font-black text-base">₹{pricing.basePrice.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center text-brutal-text">
                <span className="font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brutal-pop" /> Delivery Timing:
                </span>
                <span className="font-bold text-xs uppercase bg-white px-2 py-0.5 border border-brutal-border">
                  {effectiveSlot === "lunch" ? "Lunch" : effectiveSlot === "dinner" ? "Dinner" : "Both (2x)"}
                </span>
              </div>

              <div className="flex justify-between items-center text-brutal-text">
                <span className="font-bold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brutal-pop" /> Estimated Duration:
                </span>
                <span className="font-bold text-xs">
                  {activePlan.meals === 1
                    ? "1 Day Trial"
                    : `${pricing.estimatedDays} Delivery Days (~${Math.ceil(
                        pricing.estimatedDays / 6
                      )} Wks)`}
                </span>
              </div>

              {pricing.addonsTotal > 0 && (
                <div className="flex justify-between items-center text-brutal-pop border-t border-dashed border-brutal-border/40 pt-2">
                  <span className="font-bold">
                    Add-ons ({selectedAddonIds.length} chosen):
                  </span>
                  <span className="font-black text-base">+₹{pricing.addonsTotal}</span>
                </div>
              )}
            </div>

            {/* Total and Per-Meal Highlights */}
            <div className="bg-white border-2 border-brutal-border p-4 mb-6 shadow-brutal-sm">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-mono text-xs font-bold uppercase text-brutal-muted">
                  Total Payable Amount
                </span>
                {pricing.savingsTotal > 0 && (
                  <span className="bg-brutal-accent text-brutal-text text-[10px] font-black uppercase px-2 py-0.5 border border-brutal-border">
                    Saved ₹{pricing.savingsTotal}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-4xl md:text-5xl font-black text-brutal-text">
                  ₹{pricing.finalTotal.toLocaleString("en-IN")}
                </div>
                <div className="text-right font-mono text-xs font-bold text-brutal-muted">
                  <div>Just <strong className="text-brutal-text text-sm">₹{pricing.perMealPrice}</strong> / meal</div>
                  <div className="text-[10px] text-green-700 font-bold">Delivery Included</div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <motion.a
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-[#25D366] text-white text-lg md:text-xl font-black py-4 px-6 border-[3px] border-brutal-border shadow-brutal hover:bg-[#20BA5A] transition-all flex items-center justify-center gap-3 uppercase mb-4"
            >
              <MessageCircle className="w-6 h-6 fill-white" />
              Order on WhatsApp
              <ArrowRight className="w-5 h-5 ml-auto" />
            </motion.a>

            {/* Trust and Bot Integration Guarantee */}
            <div className="flex items-center justify-center gap-4 text-[11px] font-mono font-bold text-brutal-muted">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-brutal-pop" /> Secure Link
              </span>
              <span>•</span>
              <span>Direct WhatsApp Bot Auto-Reply</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
