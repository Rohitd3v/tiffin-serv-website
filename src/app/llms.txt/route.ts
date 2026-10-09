import { NextResponse } from "next/server";
import { getPublicPlans } from "@/lib/plans";

export const revalidate = 3600; // Cache for 1 hour with stale-while-revalidate

export async function GET() {
  const plans = await getPublicPlans();

  const plansMarkdown = plans
    .map(
      (p) =>
        `- **${p.name} Pack** (${p.meals} Meals): ₹${p.price} (~₹${Math.round(p.price / Math.max(p.meals, 1))}/meal)\n  - Includes: ${p.features.join(", ")}`
    )
    .join("\n");

  const markdown = `# Mom's Kitchen

> Authentic Homestyle Tiffin & Meal Subscription in Delhi NCR & Gurugram.

Mom's Kitchen delivers freshly cooked, nutritious Indian meals (ghar ka khana) daily to homes and offices across Delhi NCR and Gurugram. Subscriptions, schedule customizations, and daily pauses are handled seamlessly via WhatsApp (+91 70335 58836).

## Subscription Plans & Pricing (Dynamic Catalog)

${plansMarkdown}
- **One-Time Trial Pack** (1 Meal): ₹100 quality test box with zero commitment.

*Note: Pricing and active plans sync dynamically from our live catalog. For real-time offers and custom schedules, visit https://momskitchen.co.in/#plans.*

## Delivery Windows & Coverage

- **Coverage**: South Delhi, Central Delhi, North Delhi, and Gurugram (Udyog Vihar, Cyber City, DLF phases).
- **Kitchen Address**: Udyog Vihar Phase 4, Sector 18, Gurugram, Haryana 122022, India.
- **Delivery Windows**:
  - Lunch: 12:00 PM – 2:00 PM (Cutoff to pause/order: 9:00 AM)
  - Dinner: 7:00 PM – 9:00 PM (Cutoff to pause/order: 4:00 PM)

## Official Resources

- [Home & Live Plans](https://momskitchen.co.in/): Instant WhatsApp subscription and live menu.
- [Weekly Menu Voting](https://momskitchen.co.in/vote): Subscriber portal to curate Friday chef specials.
- [Delhi Food Blog](https://momskitchen.co.in/blog): Delhi tiffin guides, nutrition tips, and cost breakdowns.
- [Terms & Conditions](https://momskitchen.co.in/terms): Delivery and subscription policies.
- [Privacy Policy](https://momskitchen.co.in/privacy): WhatsApp data and location handling.
`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
