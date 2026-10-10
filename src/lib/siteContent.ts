import { supabase } from "./supabase";

/**
 * Dashboard-managed website content ("full content repo" sync).
 *
 * The dashboard edits the `site_content` table (key → JSON value);
 * the website reads it live on each request. If a key is missing or the
 * DB is unreachable, LOCAL_DEFAULTS below is used as a safe fallback so
 * the site never breaks.
 */

export interface HeroContent {
  badgeLine1: string;
  badgeLine2: string;
  titleLine1: string;
  titleAccent: string;
  titleLine2: string;
  subtitle: string;
}

export interface ContactContent {
  whatsappNumber: string;
  whatsappDisplay: string;
  whatsappMessage: string;
  email: string;
}

export interface ProcessContent {
  title: string;
  subtitle: string;
  steps: Array<{ icon: string; title: string; desc: string }>;
}

export interface TestimonialsContent {
  title: string;
  subtitle: string;
  items: Array<{ name: string; role: string; quote: string; color: string }>;
}

export interface VoteBannerDishOption {
  /** Display name of the dish (e.g. "Shahi Paneer"). */
  label: string;
}

export interface VoteBannerContent {
  title: string;
  subtitle: string;
  /** Weekly dish choices configured in the admin dashboard (min 2 when published). */
  dishOptions: VoteBannerDishOption[];
}

export interface SiteContent {
  hero: HeroContent;
  contact: ContactContent;
  process: ProcessContent;
  testimonials: TestimonialsContent;
  voteBanner: VoteBannerContent;
}

export const LOCAL_DEFAULTS: SiteContent = {
  hero: {
    badgeLine1: "Freshly Cooked",
    badgeLine2: "Delivered Hot Daily",
    titleLine1: "Eat Like",
    titleAccent: "Home,",
    titleLine2: "Anywhere.",
    subtitle:
      "Tiffin ordered in seconds. Homestyle dal, butter rotis, seasonal sabzi, and steamed rice delivered hot every day directly via WhatsApp.",
  },
  contact: {
    whatsappNumber: "917033558836",
    whatsappDisplay: "+91 70335 58836",
    whatsappMessage: "Hello! I want to order a tiffin.",
    email: "orders@momskitchen.com",
  },
  process: {
    title: "The WhatsApp Way",
    subtitle: "No apps to download. No websites to login. Just chat.",
    steps: [
      { icon: "MapPin", title: "Zone Check", desc: "Share location on WhatsApp. We instantly check if we serve your area." },
      { icon: "Utensils", title: "Select Pack", desc: "Pick a plan (Starter, Regular, or Family) directly from the WhatsApp menu." },
      { icon: "CreditCard", title: "Quick Pay", desc: "Pay securely via Razorpay link sent to your chat. Immediate activation." },
      { icon: "Truck", title: "Eat Daily", desc: "Receive hot meals daily. Pause or resume anytime with a simple text." },
    ],
  },
  testimonials: {
    title: "Word on the Street",
    subtitle: "What our regulars are saying.",
    items: [
      { name: "Rahul Verma", role: "Tech Lead", quote: "Finally found a tiffin that doesn't make me miss home. The Rajma Chawal is legendary.", color: "bg-brutal-card-pink" },
      { name: "Priya Singh", role: "Student", quote: "Saves me 2 hours of cooking every day. The portions are huge and packaging is spill-proof.", color: "bg-brutal-accent" },
      { name: "Amit Patel", role: "Banker", quote: "No acid reflux. No excessive oil. Just clean, delicious home food. Worth every penny.", color: "bg-brutal-card-lemon" },
    ],
  },
  voteBanner: {
    title: "Vote On Next Week's Menu",
    subtitle: "Exclusive to active subscribers. Decide Friday's chef special.",
    dishOptions: [
      { label: "Shahi Paneer" },
      { label: "Dal Makhani" },
      { label: "Chole Bhature" },
    ],
  },
};

function isValidArrayItem(item: unknown, arrayKey: string): boolean {
  if (!item || typeof item !== "object") return false;
  const obj = item as Record<string, unknown>;
  if (arrayKey === "steps") {
    return (
      typeof obj.icon === "string" &&
      obj.icon.trim().length > 0 &&
      typeof obj.title === "string" &&
      typeof obj.desc === "string"
    );
  }
  if (arrayKey === "dish_options") {
    return typeof obj.label === "string" && obj.label.trim().length > 0;
  }
  if (arrayKey === "items") {
    return (
      typeof obj.name === "string" &&
      typeof obj.quote === "string" &&
      typeof obj.color === "string" &&
      obj.color.trim().length > 0
    );
  }
  return true;
}

/**
 * Shallow-merges a DB section over its local fallback, preserving
 * fallback values for missing/empty strings and arrays. Validates array
 * items before replacing fallback arrays.
 */
function mergeSection<T extends object>(
  fallback: T,
  db: Record<string, unknown> | null
): T {
  if (!db) return fallback;

  const merged = { ...fallback } as Record<string, unknown>;
  // Local key uses camelCase; the database row uses snake_case.
  const localArrayKey =
    "steps" in fallback ? "steps" : "items" in fallback ? "items" : "dishOptions";
  const dbArrayKey =
    "steps" in fallback ? "steps" : "items" in fallback ? "items" : "dish_options";

  for (const key of Object.keys(fallback)) {
    if (key === localArrayKey) continue; // arrays handled below
    const value = db[key];
    if (typeof value === "string" && value.trim()) merged[key] = value;
  }

  const dbArray = db[dbArrayKey];
  if (
    Array.isArray(dbArray) &&
    dbArray.length > 0 &&
    dbArray.every((item) => isValidArrayItem(item, dbArrayKey))
  ) {
    merged[localArrayKey] = dbArray;
  }

  return merged as T;
}

/**
 * Fetches dashboard-managed sections and merges them over LOCAL_DEFAULTS.
 * Missing or blank strings and empty arrays retain their defaults; nonempty
 * arrays replace defaults only when their entries pass validation. Missing database
 * configuration, query errors, or caught exceptions return LOCAL_DEFAULTS.
 */
export async function getSiteContent(): Promise<SiteContent> {
  if (!supabase) return LOCAL_DEFAULTS;

  try {
    const { data: rows, error } = await supabase
      .from("site_content")
      .select("key, value");

    if (error || !rows) return LOCAL_DEFAULTS;

    const byKey = new Map<string, Record<string, unknown>>();
    for (const row of rows) {
      if (row.value && typeof row.value === "object") {
        byKey.set(row.key, row.value as Record<string, unknown>);
      }
    }

    const section = <K extends keyof SiteContent, DbKey extends string>(
      key: K,
      dbKey: DbKey
    ): SiteContent[K] =>
      mergeSection(LOCAL_DEFAULTS[key], byKey.get(dbKey) ?? null);

    return {
      hero: section("hero", "hero"),
      contact: section("contact", "contact"),
      process: section("process", "process"),
      testimonials: section("testimonials", "testimonials"),
      voteBanner: section("voteBanner", "vote_banner"),
    };
  } catch {
    return LOCAL_DEFAULTS;
  }
}
