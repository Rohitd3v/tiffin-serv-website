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

export interface VoteBannerContent {
  title: string;
  subtitle: string;
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
  },
};

/**
 * Shallow-merges a DB section over its local fallback, preserving
 * fallback values for missing/empty strings and arrays.
 */
function mergeSection(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fallback: any,
  db: Record<string, unknown> | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (!db) return fallback;
  const merged = { ...fallback } as Record<string, unknown>;
  for (const key of Object.keys(fallback)) {
    if (key === "steps" || key === "items") continue; // arrays handled below
    const v = db[key];
    if (typeof v === "string" && v.trim()) merged[key] = v;
  }
  const arrayKey = "steps" in fallback ? "steps" : "items";
  const dbArr = db[arrayKey];
  if (Array.isArray(dbArr) && dbArr.length > 0) {
    merged[arrayKey] = dbArr;
  }
  return merged;
}

/**
 * Fetches all dashboard-managed content in a single roundtrip.
 * Returns LOCAL_DEFAULTS merged with whatever keys exist in the DB,
 * so partial data never blanks out the site.
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

    return {
      hero: mergeSection(LOCAL_DEFAULTS.hero, byKey.get("hero") ?? null) as HeroContent,
      contact: mergeSection(LOCAL_DEFAULTS.contact, byKey.get("contact") ?? null) as ContactContent,
      process: mergeSection(LOCAL_DEFAULTS.process, byKey.get("process") ?? null) as ProcessContent,
      testimonials: mergeSection(LOCAL_DEFAULTS.testimonials, byKey.get("testimonials") ?? null) as TestimonialsContent,
      voteBanner: mergeSection(LOCAL_DEFAULTS.voteBanner, byKey.get("vote_banner") ?? null) as VoteBannerContent,
    };
  } catch {
    return LOCAL_DEFAULTS;
  }
}
