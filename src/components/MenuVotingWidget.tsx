"use client";

import { useEffect, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Vote,
  Utensils,
  CheckCircle2,
  Lock,
  Sparkles,
  Clock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Phone,
} from "lucide-react";
import { getRecaptchaToken, useRecaptchaInit } from "@/lib/recaptcha";
import { appleSpring, appleFlickSpring } from "@/lib/motionTokens";

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  percent: number;
}

export interface PollData {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  totalVotes: number;
  closesAt?: string | null;
}

export type VotingStep = "SELECT" | "VOTED" | "NOT_SUBSCRIBER";

interface MenuVotingWidgetProps {
  /**
   * Optional custom plans anchor/URL for the CTA button in NOT_SUBSCRIBER step.
   * Defaults to "/#plans"
   */
  plansHref?: string;
  /**
   * Optional WhatsApp contact number for fallback ordering link.
   * Defaults to "917033558836"
   */
  whatsappNumber?: string;
}

/** Pure helper to format closesAt date string cleanly */
function formatClosesAt(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  } catch {
    return null;
  }
}

/**
 * Loads the active poll and guides dish selection, active subscriber verification,
 * and direct ballot casting. Zero-cost frictionless verification protected by
 * invisible reCAPTCHA v3 and distributed rate limiting.
 */
export function MenuVotingWidget({
  plansHref = "/#plans",
  whatsappNumber = "917033558836",
}: MenuVotingWidgetProps) {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [step, setStep] = useState<VotingStep>("SELECT");
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const phoneInputId = useId();

  useRecaptchaInit();

  // 1. Fetch active poll on mount
  useEffect(() => {
    let isMounted = true;

    fetch("/api/poll/active", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load active poll");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setPoll(data.poll || null);
          setInitialLoading(false);
        }
      })
      .catch((err: unknown) => {
        console.error("Error fetching poll:", err);
        if (isMounted) {
          setInitialLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Standalone fetch for refreshing standings after vote
  async function refreshPoll() {
    try {
      const res = await fetch("/api/poll/active", { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      const loaded = (data.poll as PollData) || null;
      setPoll(loaded);
      return loaded;
    } catch (err: unknown) {
      console.error("Error refreshing poll:", err);
      return null;
    }
  }

  const formattedClosing = formatClosesAt(poll?.closesAt);
  const maxVotes = poll?.options?.length
    ? Math.max(...poll.options.map((o) => o.votes), 0)
    : 0;

  // Direct Phone Verification and Ballot Submission
  async function handleVote(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (loading || !poll) return;

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!selectedOption) {
      setErrorMsg("Please select a dish to vote for.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const recaptchaToken = await getRecaptchaToken("poll_vote");
      const res = await fetch("/api/poll/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanDigits,
          pollId: poll.id,
          optionId: selectedOption,
          recaptchaToken,
        }),
      });

      const data = await res.json();

      if (res.status === 403 || data.code === "NO_ACTIVE_PLAN") {
        setStep("NOT_SUBSCRIBER");
        return;
      }

      if (res.status === 409 || data.code === "ALREADY_VOTED") {
        if (data.votedOptionId) {
          setSelectedOption(data.votedOptionId);
        }
        await refreshPoll();
        setStep("VOTED");
        return;
      }

      if (!res.ok) {
        setErrorMsg(
          data.error ||
            data.message ||
            "Failed to cast your vote. Please check your number and try again."
        );
        return;
      }

      await refreshPoll();
      setStep("VOTED");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error. Please try again.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  // Initial loading state
  if (initialLoading) {
    return (
      <div className="frost flex justify-center gap-3 rounded-[1.75rem] p-8 text-center md:p-10">
        <RefreshCw className="h-5 w-5 animate-spin text-coral" strokeWidth={1.5} />
        <p className="text-[14px] font-medium text-muted">Loading Community Poll...</p>
      </div>
    );
  }

  // Empty state if no active poll exists
  if (!poll) {
    return (
      <div className="frost flex flex-col items-center gap-4 rounded-[1.75rem] p-8 text-center md:p-10">
        <span className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-amber to-coral text-white shadow-soft">
          <Utensils className="h-7 w-7" strokeWidth={1.5} />
        </span>
        <h3 className="text-xl font-semibold -tracking-[0.02em] text-ink">
          No active poll right now
        </h3>
        <p className="max-w-md text-[14px] leading-relaxed text-muted">
          Our chef is currently preparing the next weekly menu vote. Check back soon or explore our meal plans!
        </p>
        <a
          href={plansHref}
          className="press mt-1 inline-flex items-center gap-2 rounded-full bg-ink-solid px-6 py-3 text-[14px] font-semibold text-white shadow-lift transition-colors duration-150 hover:bg-[#0d5651]"
        >
          Explore meal plans <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </a>
      </div>
    );
  }

  const whatsappOrderNumber = whatsappNumber;

  return (
    <div className="frost-strong relative overflow-hidden rounded-[1.75rem] p-6 md:p-10">
      {/* Subtle corner aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-amber/25 to-coral/15 blur-3xl"
      />

      {/* Header Info */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-tealwash px-3.5 py-1.5 text-[12px] font-medium text-ink">
          <Vote className="h-3.5 w-3.5" strokeWidth={1.5} /> Subscriber weekly poll
        </span>

        {formattedClosing && (
          <span className="tabular inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3.5 py-1.5 text-[12px] font-medium text-muted">
            <Clock className="h-3.5 w-3.5 text-coral" strokeWidth={1.5} />
            Closes {formattedClosing}
          </span>
        )}
      </div>

      <h3 className="display-locked relative text-2xl text-ink md:text-3xl mb-2">
        {poll.title}
      </h3>

      {poll.description && (
        <p className="relative mb-8 text-[14px] leading-relaxed text-muted">
          {poll.description}
        </p>
      )}

      {/* Error Banner */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative mb-6 flex items-start gap-3 rounded-2xl bg-coral-soft px-4 py-3 text-ink"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-coral" strokeWidth={1.5} />
            <p className="text-[13px] font-medium leading-snug">{errorMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP: SELECT (Dish Selection & Direct Subscriber Verification) */}
      {step === "SELECT" && (
        <form onSubmit={handleVote} className="relative space-y-6">
          <div className="space-y-3">
            <span className="eyebrow block text-faint">
              Step 1 · Choose this week&apos;s special
            </span>

            <div className="grid grid-cols-1 gap-2.5" role="radiogroup" aria-label="Dish options">
              {poll.options.map((option) => {
                const isSelected = selectedOption === option.id;
                return (
                  <motion.div
                    key={option.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    transition={appleSpring}
                    onClick={() => {
                      setSelectedOption(option.id);
                      setErrorMsg(null);
                    }}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedOption(option.id);
                        setErrorMsg(null);
                      }
                    }}
                    className={`press flex cursor-pointer select-none items-center justify-between rounded-2xl border p-4 text-left ${
                      isSelected
                        ? "border-amber/60 bg-gradient-to-r from-amber-soft to-coral-soft shadow-soft"
                        : "border-hairline-soft bg-surface/90 hover:bg-surface hover:border-hairline"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          isSelected ? "bg-white text-amber-deep" : "bg-tealwash text-ink"
                        }`}
                      >
                        <Utensils className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                      <span className="text-[15px] font-semibold -tracking-[0.01em] text-ink">
                        {option.label}
                      </span>
                    </div>

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ${
                        isSelected ? "border-amber-deep bg-amber-deep text-white" : "border-hairline bg-surface"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2 className="h-3 w-3 fill-white" strokeWidth={2} />
                      )}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mobile Phone Input */}
          <div className="space-y-2 pt-1">
            <label
              htmlFor={phoneInputId}
              className="eyebrow flex items-center gap-1.5 text-faint"
            >
              <Phone className="h-3.5 w-3.5 text-coral" strokeWidth={1.5} />
              Step 2 · Subscriber mobile number
            </label>

            <div className="flex items-stretch overflow-hidden rounded-2xl border border-hairline bg-surface shadow-soft focus-within:border-[rgba(21,133,127,0.6)] focus-within:shadow-[0_0_0_4px_rgba(21,133,127,0.12)]">
              <span className="tabular border-r border-hairline-soft bg-paper px-4 py-3 text-[14px] font-medium text-ink">
                +91
              </span>
              <input
                id={phoneInputId}
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="98765 43210"
                maxLength={14}
                className="tabular flex-1 bg-transparent px-4 py-3 text-[15px] text-ink focus:outline-none placeholder:text-faint/60"
              />
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-faint">
              <Lock className="h-3 w-3" strokeWidth={1.5} />
              Instant verification for active subscribers. Protected by bot &amp; spam shield.
            </p>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={loading || !selectedOption ? undefined : { scale: 1.01 }}
            whileTap={loading || !selectedOption ? undefined : { scale: 0.98 }}
            transition={appleSpring}
            type="submit"
            disabled={loading || !selectedOption}
            className={`press w-full rounded-2xl py-4 text-[15px] font-semibold text-white transition-all duration-150 ${
              loading || !selectedOption
                ? "cursor-not-allowed bg-ink-solid/30"
                : "cursor-pointer bg-ink-solid shadow-lift hover:bg-[#0d5651]"
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                Verifying subscriber…
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <Vote className="h-4 w-4" strokeWidth={1.75} />
                Cast your vote
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </span>
            )}
          </motion.button>
        </form>
      )}

      {/* STEP: VOTED (Live Progress Bars) */}
      {step === "VOTED" && (
        <div className="relative space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={appleFlickSpring}
            className="flex items-center justify-between gap-4 rounded-2xl border border-hairline-soft bg-tealwash px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-whatsapp text-white shadow-soft">
                <CheckCircle2 className="h-5 w-5 fill-white" strokeWidth={1.75} />
              </span>
              <div>
                <h4 className="text-[15px] font-semibold -tracking-[0.01em] text-ink">
                  Vote cast successfully!
                </h4>
                <p className="text-[12px] text-muted">
                  Thank you for helping curate this week&apos;s special.
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="eyebrow block text-faint">Total cast</span>
              <span className="tabular text-xl font-semibold text-ink">{poll.totalVotes}</span>
            </div>
          </motion.div>

          {/* Results progress bars */}
          <div className="space-y-4">
            <div className="eyebrow flex justify-between text-faint">
              <span>Live community results</span>
              <span className="tabular">{poll.totalVotes} total</span>
            </div>

            {poll.options.map((option, idx) => {
              const isSelected = selectedOption === option.id;
              const isLeading = maxVotes > 0 && option.votes === maxVotes;

              return (
                <div
                  key={option.id}
                  className={`rounded-2xl border p-4 transition-colors duration-200 ${
                    isSelected ? "border-amber/60 bg-amber-soft/50" : "border-hairline-soft bg-surface/90"
                  }`}
                >
                  <div className="mb-2.5 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold -tracking-[0.01em] text-ink">
                        {option.label}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-deep px-2 py-0.5 text-[10px] font-medium text-white">
                          <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2} /> Your choice
                        </span>
                      )}
                      {isLeading && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-tealwash px-2 py-0.5 text-[10px] font-medium text-ink">
                          <Sparkles className="h-2.5 w-2.5" strokeWidth={1.5} /> Leading
                        </span>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="tabular text-[15px] font-semibold text-ink">
                        {option.percent}%
                      </span>
                      <span className="tabular block text-[11px] text-faint">
                        {option.votes} {option.votes === 1 ? "vote" : "votes"}
                      </span>
                    </div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-hairline-soft">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${option.percent}%` }}
                      transition={{
                        type: "spring",
                        damping: 30,
                        stiffness: 120,
                        delay: idx * 0.08,
                      }}
                      className={`h-full rounded-full ${
                        isSelected
                          ? "bg-amber-deep"
                          : isLeading
                          ? "bg-gradient-to-r from-amber to-coral"
                          : "bg-whatsapp"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => refreshPoll()}
              className="press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium text-muted transition-colors duration-150 hover:bg-tealwash hover:text-ink"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} /> Refresh live standings
            </button>
          </div>
        </div>
      )}

      {/* STEP: NOT_SUBSCRIBER */}
      {step === "NOT_SUBSCRIBER" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={appleSpring}
          className="frost relative flex flex-col items-center gap-5 rounded-2xl p-6 text-center md:p-8"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-coral to-coral-deep text-white shadow-lift">
            <Lock className="h-7 w-7" strokeWidth={1.5} />
          </span>

          <div>
            <span className="eyebrow inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1 text-amber-deep">
              <Sparkles className="h-3 w-3" strokeWidth={1.5} /> Subscriber privilege
            </span>
            <h4 className="mt-3 text-xl font-semibold -tracking-[0.02em] text-ink mb-2">
              Active meal pack required
            </h4>
            <p className="mx-auto max-w-md text-[13px] leading-relaxed text-muted">
              Voting is an exclusive perk reserved for active Mom&apos;s Kitchen meal subscribers.
              Subscribe to any weekly or monthly meal pack today to decide our Friday specials!
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <a
              href={plansHref}
              className="press inline-flex items-center justify-center gap-2 rounded-full bg-ink-solid px-6 py-3 text-[14px] font-semibold text-white shadow-lift transition-colors duration-150 hover:bg-[#0d5651]"
            >
              Explore meal packs <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </a>

            <button
              onClick={() => {
                setStep("SELECT");
                setErrorMsg(null);
              }}
              className="press rounded-full border border-hairline bg-surface px-6 py-3 text-[14px] font-medium text-ink transition-colors duration-150 hover:bg-tealwash"
            >
              Try another number
            </button>
          </div>

          <div className="w-full border-t border-hairline-soft pt-4">
            <a
              href={`https://wa.me/${whatsappOrderNumber}?text=Hello!%20I%20want%20to%20subscribe%20to%20a%20meal%20pack%20and%20vote%20on%20weekly%20menus.`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-medium text-muted transition-colors duration-150 hover:text-ink"
            >
              Order or subscribe via WhatsApp
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
