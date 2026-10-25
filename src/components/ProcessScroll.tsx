"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MapPin,
  Utensils,
  Truck,
  Star,
  CreditCard,
  MessageCircle,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

/** Icon lookup for dashboard-editable process steps. */
const PROCESS_ICONS: Record<string, LucideIcon> = {
  MapPin,
  Utensils,
  Truck,
  Star,
  CreditCard,
  MessageCircle,
  CheckCircle2,
};

export interface ProcessStep {
  icon: string;
  title: string;
  desc: string;
}

interface ProcessScrollProps {
  title: string;
  subtitle: string;
  steps: ProcessStep[];
}

/**
 * Apple keynote-style scroll storytelling: the left rail (headline + progress)
 * stays pinned while each step drives the viewport, spotlighting as it passes
 * through. GSAP does the smoothing; React state only drives the spotlight.
 */
export function ProcessScroll({ title, subtitle, steps }: ProcessScrollProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const rail = railRef.current;
    const panels = section?.querySelectorAll("[data-step-panel]") ?? [];

    if (prefersReducedMotion || !section || panels.length === 0) {
      return;
    }

    const triggers: ScrollTrigger[] = [];

    // Step spotlight: each panel fades/lifts in while crossing the viewport.
    panels.forEach((panel, i) => {
      const el = panel as HTMLElement;
      gsap.fromTo(
        el,
        { opacity: 0.12, y: 56, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            end: "top 34%",
            scrub: true,
            onToggle: (self) => {
              if (self.isActive) setActive(i);
            },
          },
        }
      );
    });

    // Progress rail fill tied to the whole story.
    if (rail) {
      const fill = rail.querySelector("[data-rail-fill]") as HTMLElement | null;
      if (fill) {
        gsap.fromTo(
          fill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top center",
            scrollTrigger: {
              trigger: section,
              start: "top 60%",
              end: "bottom 75%",
              scrub: true,
            },
          }
        );
      }
      triggers.push(ScrollTrigger.create({ trigger: section, start: "top 60%", end: "bottom 75%"}));
    }

    return () => {
      triggers.forEach((t) => t.kill());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [steps.length]);

  return (
    <section
      ref={sectionRef}
      id="how"
      className="relative mx-auto max-w-6xl px-5 py-24 md:py-36 scroll-mt-24"
      aria-label="How ordering works"
    >
      <div className="grid gap-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Pinned left rail */}
        <div className="md:sticky md:top-28 md:self-start">
          <p className="eyebrow text-coral mb-4">{subtitle}</p>
          <h2 className="display-locked text-4xl md:text-5xl text-ink mb-8">{title}</h2>
          <div className="hidden md:flex items-stretch gap-4">
            <div ref={railRef} className="relative w-1 rounded-full bg-hairline-soft overflow-hidden">
              <div data-rail-fill className="absolute inset-0 rounded-full bg-gradient-to-b from-amber to-coral" />
            </div>
            <ol className="flex flex-col justify-between gap-2 py-0.5">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  className={`text-[13px] font-medium -tracking-[0.01em] transition-all duration-300 ${
                    i === active ? "text-ink translate-x-1" : "text-faint"
                  }`}
                >
                  <span className="tabular mr-2 text-[11px]">{String(i + 1).padStart(2, "0")}</span>
                  {step.title}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Scrolling step vignettes */}
        <div className="flex flex-col gap-10 md:gap-6">
          {steps.map((step, i) => {
            const Icon = PROCESS_ICONS[step.icon] || Utensils;
            const isSpot = i === active;
            return (
              <article
                key={`${step.title}-${i}`}
                data-step-panel
                className="frost-strong relative flex flex-col gap-5 rounded-[1.75rem] p-7 md:p-10 mt-auto"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300 ${
                      isSpot ? "bg-gradient-to-br from-amber to-coral text-white shadow-lift" : "bg-tealwash text-ink"
                    }`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <span className="tabular text-[11px] font-semibold text-faint">
                    {String(i + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold -tracking-[0.02em] text-ink mb-2">{step.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted">{step.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
