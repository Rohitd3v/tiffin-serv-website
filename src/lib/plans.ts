export interface Plan {
  id?: string;
  code: string;
  name: string;
  meals: number;
  price: number; // in Rupees
  pricePaise?: number;
  active: boolean;
  description?: string;
  popular?: boolean;
  savingsPercent?: number;
  badge?: string;
  features: string[];
}

export type MealSlot = "lunch" | "dinner" | "both";

export const DEFAULT_PLANS: Plan[] = [
  {
    id: "a0503a56-746b-41f3-91fa-0e86af110990",
    code: "starter",
    name: "Starter Pack",
    meals: 6,
    price: 480,
    pricePaise: 48000,
    active: true,
    description: "6 meals pack - Ideal for weekly trial",
    savingsPercent: 33,
    badge: "Flexible Weekly",
    features: [
      "4 Butter Rotis",
      "Seasonal Homestyle Sabzi",
      "Dal Tadka",
      "Steamed Basmati Rice",
      "Fresh Salad & Pickle",
      "Free Doorstep Delivery",
    ],
  },
  {
    id: "0c80e304-a8f1-4d27-89ff-c77ea4b9a5ba",
    code: "regular",
    name: "Regular Pack",
    meals: 12,
    price: 900,
    pricePaise: 90000,
    active: true,
    popular: true,
    description: "12 meals pack - Our most chosen plan",
    savingsPercent: 38,
    badge: "Most Chosen",
    features: [
      "4 Butter Rotis",
      "Two Seasonal Veggies",
      "Signature Dal Fry / Tadka",
      "Jeera / Basmati Rice",
      "Friday Sweet Dish Included",
      "Salad, Pickle & Mint Chutney",
      "Free Doorstep Delivery",
    ],
  },
  {
    id: "4bfe3f0e-0760-4f30-a9b2-330165bc503f",
    code: "family",
    name: "Family Pack",
    meals: 24,
    price: 1680,
    pricePaise: 168000,
    active: true,
    description: "24 meals pack - Maximum value & portions",
    savingsPercent: 42,
    badge: "Best Value",
    features: [
      "Standard Thali x 2 (Large Portions)",
      "Daily Two Gourmet Curries",
      "Special Dal Makhani / Dal Tadka",
      "Extra Butter Rotis (8 Pcs)",
      "Basmati Rice + Weekend Special",
      "Priority Hot Dispatch",
      "Free Doorstep Delivery",
    ],
  },
  {
    id: "c728cfcb-7f07-4535-8e24-1f28ec6b7265",
    code: "one_time",
    name: "One-Time Trial Box",
    meals: 1,
    price: 120,
    pricePaise: 12000,
    active: true,
    description: "1 meal trial with disposable tray",
    savingsPercent: 0,
    badge: "No Commitment",
    features: [
      "Full Deluxe Thali",
      "4 Fresh Butter Rotis",
      "Paneer / Special Sabzi",
      "Dal Tadka & Rice",
      "Salad, Pickle & Sweet",
      "Delivered Hot Within 45 Mins",
    ],
  },
];

export interface RawPlan {
  id?: string;
  code?: string;
  name?: string;
  meals?: number;
  price?: number;
  active?: boolean;
  description?: string;
}

/**
 * Enriches raw plan rows from Supabase with display attributes
 */
export function enrichPlan(rawPlan: RawPlan): Plan {
  const code = String(rawPlan.code || "").toLowerCase();
  const priceInRupees =
    typeof rawPlan.price === "number"
      ? rawPlan.price > 1000
        ? Math.round(rawPlan.price / 100) // from paise
        : rawPlan.price
      : 500;

  const defaultMatch = DEFAULT_PLANS.find((p) => p.code === code);
  const meals =
    typeof rawPlan.meals === "number" ? rawPlan.meals : defaultMatch?.meals || 6;

  let savingsPercent = 0;
  if (meals > 1) {
    const singleMealPrice = 120;
    const effectivePerMeal = priceInRupees / meals;
    savingsPercent = Math.max(
      0,
      Math.round(((singleMealPrice - effectivePerMeal) / singleMealPrice) * 100)
    );
  }

  return {
    id: rawPlan.id || defaultMatch?.id,
    code,
    name: rawPlan.name || defaultMatch?.name || "Tiffin Pack",
    meals,
    price: priceInRupees,
    pricePaise: rawPlan.price,
    active: rawPlan.active !== false,
    description: rawPlan.description || defaultMatch?.description,
    popular: code === "regular" || Boolean(defaultMatch?.popular),
    savingsPercent: savingsPercent || defaultMatch?.savingsPercent || 0,
    badge: defaultMatch?.badge || (code === "regular" ? "Most Chosen" : undefined),
    features: defaultMatch?.features || [
      "Fresh Butter Rotis",
      "Daily Seasonal Sabzi",
      "Dal Tadka & Steamed Rice",
      "Salad & Pickle",
      "Free Hot Delivery",
    ],
  };
}

export interface OrderCalculation {
  totalMeals: number;
  basePrice: number;
  perMealPrice: number;
  mealsPerDay: number;
  estimatedDays: number;
  finalTotal: number;
  savingsTotal: number;
}

export function calculateOrderPricing(
  plan: Plan,
  slot: MealSlot
): OrderCalculation {
  const totalMeals = plan.meals;
  const basePrice = plan.price;
  const mealsPerDay = slot === "both" ? 2 : 1;
  const estimatedDays = Math.ceil(totalMeals / mealsPerDay);

  const finalTotal = basePrice;
  const perMealPrice = Math.round(finalTotal / totalMeals);

  // Compare to single meal baseline (₹120)
  const baselineTotal = 120 * totalMeals;
  const savingsTotal = Math.max(0, baselineTotal - finalTotal);

  return {
    totalMeals,
    basePrice,
    perMealPrice,
    mealsPerDay,
    estimatedDays,
    finalTotal,
    savingsTotal,
  };
}

export function generateWhatsAppOrderUrl(
  plan: Plan,
  slot: MealSlot,
  calc: OrderCalculation
): string {
  const phone = "917033558836";
  const slotLabel =
    slot === "lunch"
      ? "Lunch (12:30 PM - 1:30 PM)"
      : slot === "dinner"
      ? "Dinner (7:30 PM - 8:30 PM)"
      : "Both Lunch & Dinner (2 meals/day)";

  const durationText =
    plan.meals === 1
      ? "Single Day Trial"
      : slot === "both"
      ? `~${Math.ceil(calc.estimatedDays / 6)} Week (${calc.estimatedDays} delivery days)`
      : `~${Math.ceil(calc.estimatedDays / 6)} Weeks (${calc.estimatedDays} delivery days)`;

  const message = `Hello Mom's Kitchen! 🍲

I would like to order a tiffin pack:
📦 *Plan:* ${plan.name} (${plan.meals} Meals)
⏰ *Slot:* ${slotLabel}
📅 *Schedule:* Mon - Sat (${durationText})
💰 *Total:* ₹${calc.finalTotal.toLocaleString("en-IN")} (₹${calc.perMealPrice}/meal${calc.savingsTotal > 0 ? ` • Saved ₹${calc.savingsTotal}` : ""})

Please check delivery availability for my location!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
