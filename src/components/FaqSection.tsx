"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "How does Mom's Kitchen tiffin service work?",
    a: 'Ordering is handled 100% via WhatsApp. Send your delivery pin, choose a meal pack (Starter, Regular, or Family), make payment via Razorpay, and receive hot homestyle meals daily. Pause or resume anytime by texting the bot.',
  },
  {
    q: "Which areas in Delhi NCR and Gurugram do you deliver to?",
    a: "We deliver across South Delhi, Central Delhi, North Delhi, and Gurugram (including Udyog Vihar, DLF phases, and Cyber City). Delivery eligibility is verified in seconds through WhatsApp location sharing.",
  },
  {
    q: "What time are meals delivered?",
    a: "Lunch is delivered between 12:00 PM and 2:00 PM. Dinner is delivered between 7:00 PM and 9:00 PM. Cutoff for lunch pause is 9:00 AM; cutoff for dinner pause is 4:00 PM.",
  },
  {
    q: "Can I try a single meal before subscribing?",
    a: "Yes! We offer a One-Time Trial Pack for just ₹100 so you can experience our quality, freshness, and authentic homestyle taste before committing to a plan.",
  },
  {
    q: "What is included in each homestyle tiffin box?",
    a: "Each meal includes freshly cooked butter rotis, seasonal sabzi, homestyle dal tadka, steamed basmati rice, fresh salad, and pickle, made with fresh daily ingredients and minimal oil.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      className="relative mx-auto max-w-3xl px-5 py-24 md:py-32 scroll-mt-24"
      aria-label="Frequently asked questions"
    >
      <p className="eyebrow text-coral mb-4 text-center">Good to know</p>
      <h2 className="display-locked mb-14 text-center text-4xl md:text-5xl text-ink">
        Questions,
        <br />
        answered.
      </h2>

      <Accordion.Root type="single" collapsible className="flex flex-col gap-3">
        {FAQ_ITEMS.map((item, i) => (
          <Accordion.Item
            key={item.q}
            value={`item-${i}`}
            className="frost overflow-hidden rounded-2xl"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                <span className="text-[15px] font-semibold -tracking-[0.01em] text-ink">
                  {item.q}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tealwash text-ink transition-transform duration-200 group-data-[state=open]:rotate-180">
                  <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="data-[state=closed]:animate-collapse data-[state=open]:animate-expand overflow-hidden">
              <p className="px-6 pb-6 text-[14px] leading-relaxed text-muted">
                {item.a}
              </p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
