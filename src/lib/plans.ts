import { supabase } from "./supabase";

export interface PublicPlan {
  id: string;
  code: string;
  name: string;
  meals: number;
  price: number; // in Rupees
  features: string[];
  popular: boolean;
  color: string;
}

export const DEFAULT_PLANS: PublicPlan[] = [
  {
    id: "default-starter",
    code: "starter",
    name: "Starter",
    meals: 6,
    price: 480,
    color: "bg-brutal-card-peach",
    popular: false,
    features: [
      "4 Butter Rotis",
      "Seasonal Veggie",
      "Dal Tadka",
      "Steamed Rice",
      "Salad & Pickle",
    ],
  },
  {
    id: "default-regular",
    code: "regular",
    name: "Regular",
    meals: 12,
    price: 900,
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
    id: "default-family",
    code: "family",
    name: "Family",
    meals: 24,
    price: 1680,
    color: "bg-brutal-card-lilac",
    popular: false,
    features: [
      "Standard Thali x 2",
      "Large Portions",
      "Extra Sides",
      "Full Week Variety",
      "Free Weekend Special",
    ],
  },
];

const CARD_COLORS = [
  "bg-brutal-card-peach",
  "bg-brutal-accent",
  "bg-brutal-card-lilac",
  "bg-brutal-card-lemon",
  "bg-brutal-card-mint",
];

/**
 * Returns active plans other than `one_time`, ordered by price, with card colors
 * and fallback features. Numeric prices are rounded from paise to whole rupees;
 * nonnumeric prices become zero. Missing configuration, empty results, query
 * errors, and caught exceptions return DEFAULT_PLANS.
 */
export async function getPublicPlans(): Promise<PublicPlan[]> {
  if (!supabase) {
    return DEFAULT_PLANS;
  }

  try {
    const { data, error } = await supabase
      .from("plans")
      .select("id, code, name, meals, price, features, popular, active")
      .eq("active", true)
      .neq("code", "one_time")
      .order("price", { ascending: true });

    if (error) {
      console.warn("Supabase fetch plans error, using defaults:", error.message);
      return DEFAULT_PLANS;
    }

    if (!data || data.length === 0) {
      return DEFAULT_PLANS;
    }

    return data.map((item, idx) => {
      // Map price from paise to rupees
      const priceRupees = typeof item.price === "number" ? Math.round(item.price / 100) : 0;
      const isPopular = Boolean(item.popular);
      const color = isPopular ? "bg-brutal-accent" : CARD_COLORS[idx % CARD_COLORS.length];

      const features = Array.isArray(item.features) && item.features.length > 0
        ? item.features
        : [
            "Fresh Butter Rotis",
            "Homestyle Seasonal Sabzi",
            "Healthy Dal Tadka",
            "Steamed Rice & Pickle",
          ];

      return {
        id: item.id || item.code,
        code: item.code,
        name: item.name,
        meals: item.meals,
        price: priceRupees,
        features,
        popular: isPopular,
        color,
      };
    });
  } catch (err) {
    console.warn("Error in getPublicPlans, using fallback defaults:", err);
    return DEFAULT_PLANS;
  }
}
