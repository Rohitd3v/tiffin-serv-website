export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-home-style-meal-delivery-delhi-ncr",
    title: "Why Mom's Kitchen is the Best Home-Style Meal Delivery in Delhi NCR",
    excerpt: "Searching for the best meal service in Delhi? Learn how we combine traditional flavors with modern WhatsApp automation to deliver fresh hot meals.",
    date: "May 10, 2026",
    readTime: "5 min read",
    category: "Delhi Food Guide",
    content: `
      <p>Delhi is a city that never stops, and for thousands of professionals and students, finding a meal that tastes like home is a daily struggle. Whether you're in the busy offices of Connaught Place or a student housing area in North Delhi, the "Best Meal Service in Delhi" isn't just about the food—it's about reliability, hygiene, and that unmistakable home-cooked flavor.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">The Struggle for Authentic Meals in Delhi</h2>
      <p>The capital's fast-paced lifestyle often leads to a reliance on heavy restaurant food or oily street snacks. Over time, this affects health and productivity. Mom's Kitchen was born to bridge this gap. We provide a subscription-based model that brings the simplicity of a "Ghar ki Thali" (Home Plate) straight to your desk.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">What Makes Us Different?</h2>
      <ul class="list-disc pl-6 space-y-2">
        <li><strong>Freshly Sourced Ingredients:</strong> We shop daily from Delhi's local mandis to ensure peak freshness.</li>
        <li><strong>WhatsApp Integration:</strong> No more calling and waiting. Just text us to pause your meal if you're out for lunch.</li>
        <li><strong>Zero Industrial Fillers:</strong> We use minimal oil and no artificial preservatives—just real spices and real love.</li>
      </ul>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">Serving South, Central, and North Delhi</h2>
      <p>From the industrial areas of Okhla to the residential blocks of Rohini, Mom's Kitchen's delivery bikes are synchronized with your hunger. Our proprietary Finite State Machine (FSM) logic ensures that once you subscribe via WhatsApp, your delivery is tracked and guaranteed within our specific time slots.</p>
    `
  },
  {
    slug: "healthy-office-lunch-delivery-south-delhi",
    title: "Healthy Office Lunches: Delivered Hot Across South & Central Delhi",
    excerpt: "Boost your productivity with nutritious office lunches. Mom's Kitchen delivers fresh, balanced meals to offices in South and Central Delhi.",
    date: "May 12, 2026",
    readTime: "4 min read",
    category: "Healthy Living",
    content: `
      <p>South Delhi and Central Delhi are hubs for corporate excellence. However, office lunch hours are often spent scrolling through apps only to end up with a burger. Mom's Kitchen is changing the corporate lunch game with our "Regular" and "Warrior" packs designed for the modern professional.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">Balanced Nutrition for Busy Days</h2>
      <p>A typical Mom's Kitchen box includes a balanced mix of fiber, protein, and complex carbohydrates. Our "Warrior Pack" is specifically high in protein, featuring Chicken or Paneer mains, making it a favorite for those hitting the gym after work in areas like Greater Kailash or Hauz Khas.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">Efficiency via Automation</h2>
      <p>We know office schedules are unpredictable. That's why our WhatsApp bot allows you to "Toggle Pause" with one click. If an urgent meeting pops up in Connaught Place, you won't waste a meal. This flexibility makes us the most efficient meal service for Delhi's workforce.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">Sustainable Packaging</h2>
      <p>We are committed to reducing Delhi's plastic footprint. Our meals are delivered in eco-friendly, reusable containers that are kept hot until they reach your hands.</p>
    `
  },
  {
    slug: "cost-of-eating-out-vs-meal-subscription-delhi",
    title: "The Real Cost: Eating Out vs. Monthly Meal Subscription in Delhi",
    excerpt: "Is eating out daily in Delhi draining your wallet? Compare the costs and see how a Mom's Kitchen subscription can save you over ₹5,000 every month.",
    date: "May 15, 2026",
    readTime: "6 min read",
    category: "Savings",
    content: `
      <p>Living in an expensive metro like Delhi requires smart financial planning. One of the biggest "invisible" leaks in a monthly budget is daily food spending. Let's break down the math between ordering from restaurants versus subscribing to Mom's Kitchen.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">The Restaurant Math</h2>
      <p>An average "budget" meal in Delhi from a food delivery app costs roughly ₹250 to ₹350 once you include delivery fees, taxes, and platform surcharges. Over 24 working days, that totals between <strong>₹6,000 and ₹8,400</strong>.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">The Mom's Kitchen Math</h2>
      <p>Our <strong>Regular Pack (24 Meals)</strong> costs only <strong>₹1,680</strong> (roughly ₹70 per meal). This includes delivery and zero hidden charges. By switching to Mom's Kitchen, an average professional in Delhi can save over <strong>₹5,000 per month</strong>.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">Beyond the Money</h2>
      <p>Savings aren't just monetary. You save the time spent choosing what to eat and the health costs associated with long-term consumption of outside food. Our "Standard Thali" provides the nutritional variety your body needs without the financial strain.</p>
    `
  }
];
