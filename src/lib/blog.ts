export interface BlogPostAuthor {
  name: string;
  role: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  author: BlogPostAuthor;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-home-style-meal-delivery-delhi-ncr",
    title: "Why Mom's Kitchen is the Best Home-Style Meal Delivery in Delhi NCR",
    excerpt: "Searching for the best meal service in Delhi? Learn how we combine traditional flavors with modern WhatsApp automation to deliver fresh hot meals.",
    date: "May 10, 2026",
    readTime: "5 min read",
    category: "Delhi Food Guide",
    author: {
      name: "Sunita Verma",
      role: "Co-Founder & Head of Kitchen",
    },
    content: `
      <p>Delhi is a city that never stops, and for thousands of professionals and students, finding a meal that tastes like home is a daily struggle. Whether you're in the busy offices of Connaught Place or a student housing area in North Delhi, the "Best Meal Service in Delhi" isn't just about the food—it's about reliability, hygiene, and that unmistakable home-cooked flavor.</p>

      <div class="my-8 p-6 bg-[#EBF7F5] border-l-4 border-[#0C4A48]">
        <p class="font-bold text-[#0C4A48] mb-1">Key Takeaway:</p>
        <p class="text-sm">Mom's Kitchen delivers daily freshly rolled butter rotis, slow-simmered dal tadka, and seasonal subzi with zero preservatives and minimal oil directly across Delhi NCR.</p>
      </div>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">The Struggle for Authentic Meals in Delhi</h2>
      <p>The capital's fast-paced lifestyle often leads to a reliance on heavy restaurant food or oily street snacks. Over time, this affects health and productivity. Mom's Kitchen was born to bridge this gap. We provide a subscription-based model that brings the simplicity of a "Ghar ki Thali" (Home Plate) straight to your desk.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">What Makes Us Different?</h2>
      <ul class="list-disc pl-6 space-y-2">
        <li><strong>Freshly Sourced Ingredients:</strong> We shop daily from Delhi's local mandis to ensure peak freshness.</li>
        <li><strong>WhatsApp Integration:</strong> No more calling and waiting. Just text us to pause your meal if you're out for lunch.</li>
        <li><strong>Zero Industrial Fillers:</strong> We use minimal oil and no artificial preservatives—just real spices and real love.</li>
        <li><strong>FSSAI Compliant Kitchens:</strong> Every batch is prepared under strict hygiene standards in our Udyog Vihar facility.</li>
      </ul>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">Serving South, Central, and North Delhi</h2>
      <p>From the industrial areas of Okhla to the residential blocks of Rohini, Mom's Kitchen's delivery bikes are synchronized with your hunger. Our proprietary dispatch logic ensures that once you subscribe via WhatsApp, your delivery is tracked and guaranteed within our specific time slots (Lunch: 12 PM - 2 PM, Dinner: 7 PM - 9 PM).</p>
    `,
  },
  {
    slug: "best-tiffin-service-gurugram-corporate-lunch",
    title: "Best Tiffin Service in Gurugram: Healthy Corporate Lunches for Udyog Vihar & Cyber City",
    excerpt: "Looking for hygienic, homestyle daily tiffin delivery in Gurugram? Learn why corporate teams in Cyber City and Udyog Vihar choose Mom's Kitchen.",
    date: "May 11, 2026",
    readTime: "5 min read",
    category: "Gurugram Food Guide",
    author: {
      name: "Pooja Sharma",
      role: "Lead Nutritionist & Menu Planner",
    },
    content: `
      <p>Corporate professionals in Gurugram face a universal lunchtime dilemma: canteen monotony, overpriced food delivery apps, or heavy cafeteria food that causes the dreaded 3 PM energy crash. Working long hours in Udyog Vihar, DLF Cyber City, or Golf Course Road demands steady, nutritious energy.</p>

      <div class="my-8 p-6 bg-[#FFF2EA] border-l-4 border-[#E85A34]">
        <p class="font-bold text-[#E85A34] mb-1">Corporate Lunch Highlights:</p>
        <p class="text-sm">Delivered hot between 12:00 PM and 1:30 PM across Gurugram. Reusable spill-proof containers, 4 rotis, 2 vegetables, dal, basmati rice, and salad.</p>
      </div>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">Why Office Workers in Gurugram Need Ghar Ka Khana</h2>
      <p>Eating restaurant gravies 5 days a week leads to bloating and fatigue. Our homestyle meals are prepared with cold-pressed mustard oil and light desi ghee, keeping sodium low and nutrition high. You get the comfort of home food without leaving your desk.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">Designed for Corporate Flexibility</h2>
      <ul class="list-disc pl-6 space-y-2">
        <li><strong>One-Click WhatsApp Pause:</strong> Stepping out for client meetings? Text "PAUSE" before 9:00 AM, and your meal credit rolls over automatically.</li>
        <li><strong>Zero App Login Fatigue:</strong> No separate accounts or corporate credit card forms. Group orders and individual subscriptions are setup in 60 seconds.</li>
        <li><strong>Eco-Friendly Packaging:</strong> We provide food-grade insulated thermal boxes that keep food hot for up to 90 minutes after drop-off.</li>
      </ul>
    `,
  },
  {
    slug: "healthy-office-lunch-delivery-south-delhi",
    title: "Healthy Office Lunches: Delivered Hot Across South & Central Delhi",
    excerpt: "Boost your productivity with nutritious office lunches. Mom's Kitchen delivers fresh, balanced meals to offices in South and Central Delhi.",
    date: "May 12, 2026",
    readTime: "4 min read",
    category: "Healthy Living",
    author: {
      name: "Pooja Sharma",
      role: "Lead Nutritionist & Menu Planner",
    },
    content: `
      <p>South Delhi and Central Delhi are hubs for corporate excellence. However, office lunch hours are often spent scrolling through apps only to end up with a burger. Mom's Kitchen is changing the corporate lunch game with our "Regular" and "Family" packs designed for the modern professional.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">Balanced Nutrition for Busy Days</h2>
      <p>A typical Mom's Kitchen box includes a balanced mix of fiber, protein, and complex carbohydrates. Our meal rotation includes high-protein dals (moong, arhar, rajma, chana), seasonal leafy greens, and fiber-rich rotis, making it a favorite for those hitting the gym after work in areas like Greater Kailash or Hauz Khas.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">Efficiency via Automation</h2>
      <p>We know office schedules are unpredictable. That's why our WhatsApp bot allows you to "Toggle Pause" with one click. If an urgent meeting pops up in Connaught Place, you won't waste a meal. This flexibility makes us the most efficient meal service for Delhi's workforce.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">Sustainable Packaging</h2>
      <p>We are committed to reducing Delhi's plastic footprint. Our meals are delivered in eco-friendly, reusable containers that are kept hot until they reach your hands.</p>
    `,
  },
  {
    slug: "hiring-cook-vs-tiffin-subscription-delhi-ncr",
    title: "Hiring a Cook vs. Monthly Tiffin Subscription in Delhi NCR: Honest Cost & Hassle Comparison",
    excerpt: "Should you hire a local maid/cook or subscribe to a daily tiffin service? We break down the real monthly numbers, grocery costs, and reliability factors.",
    date: "May 14, 2026",
    readTime: "6 min read",
    category: "Lifestyle & Savings",
    author: {
      name: "Sunita Verma",
      role: "Co-Founder & Head of Kitchen",
    },
    content: `
      <p>Every newcomer moving to Delhi NCR or Gurugram faces the same dilemma: should you hire a local cook (maid) or subscribe to an automated tiffin service? On paper, a cook seems inexpensive, but the hidden costs often surprise tenants and working couples.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">1. The Real Cost of a Private Cook</h2>
      <p>A typical domestic cook charges between ₹3,500 and ₹5,000 per month for 2 meals a day. However, you also have to pay for:</p>
      <ul class="list-disc pl-6 space-y-2">
        <li><strong>Monthly Groceries & Vegetables:</strong> ₹4,000 – ₹6,000 per person for atta, rice, dals, oils, and seasonal sabzi.</li>
        <li><strong>Gas & Electricity Overheads:</strong> ₹500 – ₹800 monthly LPG usage.</li>
        <li><strong>Vessel Cleaning & Dishwashing:</strong> Extra maid charges of ₹1,000 – ₹1,500.</li>
        <li><strong>Total Estimated Cost:</strong> <strong>₹9,000 – ₹13,000 per month</strong>.</li>
      </ul>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">2. The Reliability Factor</h2>
      <p>Cooks frequently take unplanned leaves, especially on Mondays or festivals. When your cook doesn't show up, you are forced to order emergency restaurant food. With Mom's Kitchen, your lunch and dinner arrive on schedule 6 days a week, rain or shine.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">3. The Mom's Kitchen Advantage</h2>
      <p>Our <strong>Regular Pack (12 Meals)</strong> is ₹900, and our <strong>Family Pack (24 Meals)</strong> is just ₹1,680. You pay only for what you eat, never have to wash greasy tiffins, and get consistent motherly taste every single day.</p>
    `,
  },
  {
    slug: "cost-of-eating-out-vs-meal-subscription-delhi",
    title: "The Real Cost: Eating Out vs. Monthly Meal Subscription in Delhi",
    excerpt: "Is eating out daily in Delhi draining your wallet? Compare the costs and see how a Mom's Kitchen subscription can save you over ₹5,000 every month.",
    date: "May 15, 2026",
    readTime: "6 min read",
    category: "Savings",
    author: {
      name: "Sunita Verma",
      role: "Co-Founder & Head of Kitchen",
    },
    content: `
      <p>Living in an expensive metro like Delhi requires smart financial planning. One of the biggest "invisible" leaks in a monthly budget is daily food spending. Let's break down the math between ordering from restaurants versus subscribing to Mom's Kitchen.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">The Restaurant Math</h2>
      <p>An average "budget" meal in Delhi from a food delivery app costs roughly ₹250 to ₹350 once you include delivery fees, taxes, and platform surcharges. Over 24 working days, that totals between <strong>₹6,000 and ₹8,400</strong>.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">The Mom's Kitchen Math</h2>
      <p>Our <strong>Regular Pack (24 Meals)</strong> costs only <strong>₹1,680</strong> (roughly ₹70 per meal). This includes delivery and zero hidden charges. By switching to Mom's Kitchen, an average professional in Delhi can save over <strong>₹5,000 per month</strong>.</p>

      <h2 class="text-3xl font-black uppercase mt-8 mb-4">Beyond the Money</h2>
      <p>Savings aren't just monetary. You save the time spent choosing what to eat and the health costs associated with long-term consumption of outside food. Our "Standard Thali" provides the nutritional variety your body needs without the financial strain.</p>
    `,
  },
];
