"use client";

import { useEffect, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Vote,
  Utensils,
  CheckCircle2,
  MessageCircle,
  Lock,
  Sparkles,
  Clock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

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

export type VotingStep = "SELECT" | "OTP" | "VOTED" | "NOT_SUBSCRIBER";

interface MenuVotingWidgetProps {
  /**
   * Optional custom plans anchor/URL for the CTA button in NOT_SUBSCRIBER step.
   * Defaults to "/#plans"
   */
  plansHref?: string;
}

export function MenuVotingWidget({ plansHref = "/#plans" }: MenuVotingWidgetProps) {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [step, setStep] = useState<VotingStep>("SELECT");
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [maskedPhone, setMaskedPhone] = useState<string>("");

  const phoneInputId = useId();
  const otpInputId = useId();

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
      if (!res.ok) return;
      const data = await res.json();
      setPoll(data.poll || null);
    } catch (err: unknown) {
      console.error("Error refreshing poll:", err);
    }
  }

  // 2. Countdown timer for OTP resend
  useEffect(() => {
    if (step !== "OTP" || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  // 3. Send OTP
  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!poll) return;

    const cleanDigits = phone.replace(/[^0-9]/g, "");
    if (cleanDigits.length < 10) {
      setErrorMsg("Please enter a valid 10-digit WhatsApp number.");
      return;
    }

    if (!selectedOption) {
      setErrorMsg("Please select a dish to vote for.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/poll/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanDigits,
          pollId: poll.id,
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
            "Failed to send verification code. Please check your WhatsApp number."
        );
        return;
      }

      setMaskedPhone(
        data.phoneMasked || `+91 ••••• •${cleanDigits.slice(-4)}`
      );
      setStep("OTP");
      setTimer(60);
      setOtp("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error. Please try again.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  // 4. Confirm Vote with OTP
  async function handleConfirmVote(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!poll) return;

    if (otp.trim().length !== 4) {
      setErrorMsg("Please enter the 4-digit code sent to your WhatsApp.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const cleanDigits = phone.replace(/[^0-9]/g, "");
      const res = await fetch("/api/poll/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanDigits,
          pollId: poll.id,
          optionId: selectedOption,
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 409 || data.code === "ALREADY_VOTED") {
        await refreshPoll();
        setStep("VOTED");
        return;
      }

      if (!res.ok) {
        setErrorMsg(
          data.error ||
            data.message ||
            "Verification code is incorrect or expired."
        );
        return;
      }

      // Re-fetch latest poll standings and advance to VOTED
      await refreshPoll();
      setStep("VOTED");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to confirm vote. Please try again.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  // Format closesAt date if present
  function formatClosesAt(dateStr?: string | null) {
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

  // Initial loading state
  if (initialLoading) {
    return (
      <div className="bg-brutal-bg border-[3px] border-brutal-border shadow-brutal-lg p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-brutal-accent border-2 border-brutal-border mb-4 animate-spin">
          <RefreshCw className="w-6 h-6 text-brutal-text" />
        </div>
        <p className="font-mono font-bold text-brutal-text uppercase tracking-wider">
          Loading Community Poll...
        </p>
      </div>
    );
  }

  // Empty state when no active poll
  if (!poll) {
    return (
      <div className="bg-brutal-bg border-[3px] border-brutal-border shadow-brutal-lg p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-brutal-accent border-2 border-brutal-border mb-4 shadow-brutal-sm">
          <Utensils className="w-8 h-8 text-brutal-text" />
        </div>
        <h4 className="text-2xl md:text-3xl font-black uppercase text-brutal-text tracking-tight mb-2">
          No Active Poll Right Now
        </h4>
        <p className="font-mono text-sm text-brutal-muted max-w-md mx-auto mb-6">
          Our kitchen posts weekly specials every Monday. Active subscribers get to vote on upcoming Friday meals. Check back soon!
        </p>
        <a
          href={plansHref}
          className="inline-flex items-center gap-2 bg-brutal-pop text-white font-black px-6 py-3 border-[3px] border-brutal-border shadow-brutal hover:bg-brutal-pop-hover transition-colors uppercase text-sm"
        >
          Explore Meal Plans <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  // Find leading option
  const maxVotes = Math.max(...poll.options.map((o) => o.votes), 0);
  const formattedClosing = formatClosesAt(poll.closesAt);

  return (
    <div className="bg-brutal-bg border-[3px] border-brutal-border shadow-brutal-lg p-6 md:p-10 relative overflow-hidden">
      {/* Decorative Corner Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
        <div className="bg-brutal-accent w-36 h-8 rotate-45 transform origin-bottom-left -translate-y-4 translate-x-2 border-y-2 border-brutal-border" />
      </div>

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="inline-flex items-center gap-2 bg-brutal-accent text-brutal-text text-xs font-mono font-bold uppercase px-3 py-1.5 border-2 border-brutal-border shadow-brutal-sm">
          <Vote className="w-4 h-4" /> Subscriber Weekly Poll
        </div>

        {formattedClosing && (
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brutal-muted bg-white px-3 py-1.5 border-2 border-brutal-border shadow-brutal-sm">
            <Clock className="w-3.5 h-3.5 text-brutal-pop" /> Closes: {formattedClosing}
          </div>
        )}
      </div>

      <h3 className="text-2xl md:text-4xl font-black uppercase text-brutal-text tracking-tight leading-tight mb-2">
        {poll.title}
      </h3>

      {poll.description && (
        <p className="text-sm md:text-base font-medium text-brutal-muted mb-8 leading-relaxed">
          {poll.description}
        </p>
      )}

      {/* Error Banner */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-brutal-card-pink border-2 border-brutal-border shadow-brutal-sm flex items-start gap-3 text-brutal-text"
          >
            <AlertCircle className="w-5 h-5 text-brutal-pop shrink-0 mt-0.5" />
            <div className="text-sm font-bold font-mono leading-tight">{errorMsg}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP: SELECT */}
      {step === "SELECT" && (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div className="space-y-3">
            <span className="block text-xs font-mono font-bold uppercase text-brutal-muted tracking-wider">
              Step 1: Choose This Week&apos;s Special Dish
            </span>

            <div className="grid grid-cols-1 gap-3">
              {poll.options.map((option) => {
                const isSelected = selectedOption === option.id;
                return (
                  <motion.div
                    key={option.id}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setSelectedOption(option.id);
                      setErrorMsg(null);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedOption(option.id);
                        setErrorMsg(null);
                      }
                    }}
                    className={`border-[3px] border-brutal-border p-4 transition-all text-left flex items-center justify-between gap-4 select-none ${
                      isSelected
                        ? "bg-brutal-accent text-brutal-text shadow-brutal translate-x-1 -translate-y-0.5"
                        : "bg-white hover:bg-brutal-card-mint shadow-brutal-sm text-brutal-text"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 border-2 border-brutal-border flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-white text-brutal-text" : "bg-brutal-bg text-brutal-muted"
                        }`}
                      >
                        <Utensils className="w-4 h-4" />
                      </div>
                      <span className="font-black text-base md:text-lg uppercase leading-snug">
                        {option.label}
                      </span>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 border-brutal-border flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-brutal-pop text-white" : "bg-white"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 fill-white text-brutal-border" />}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Phone Input */}
          <div className="space-y-2 pt-2">
            <label
              htmlFor={phoneInputId}
              className="text-xs font-mono font-bold uppercase text-brutal-text flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 fill-[#25D366] text-brutal-border" />
              Step 2: Enter WhatsApp Number (Active Subscribers Only)
            </label>

            <div className="flex items-stretch border-[3px] border-brutal-border bg-white shadow-brutal">
              <span className="bg-brutal-bg px-4 py-3 font-mono font-black border-r-[3px] border-brutal-border text-brutal-text flex items-center text-sm">
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
                className="flex-1 px-4 py-3 font-mono font-bold text-brutal-text text-base md:text-lg focus:outline-none bg-transparent placeholder:text-gray-400"
              />
            </div>
            <p className="text-[11px] font-mono text-brutal-muted">
              🔒 We verify your active subscription and send a 4-digit OTP via WhatsApp. No spam ever.
            </p>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !selectedOption}
            className={`w-full py-4 px-6 border-[3px] border-brutal-border shadow-brutal font-black uppercase text-base flex items-center justify-center gap-3 transition-colors ${
              loading || !selectedOption
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-brutal-pop text-white hover:bg-brutal-pop-hover"
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Verifying Subscriber...
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 fill-white" /> Verify &amp; Send Code
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>
      )}

      {/* STEP: OTP */}
      {step === "OTP" && (
        <form onSubmit={handleConfirmVote} className="space-y-6">
          <div className="p-4 bg-white border-[3px] border-brutal-border shadow-brutal-sm flex items-center gap-3">
            <div className="p-2 bg-[#25D366] border-2 border-brutal-border text-white">
              <MessageCircle className="w-5 h-5 fill-white" />
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase text-brutal-muted">
                OTP Sent via WhatsApp
              </p>
              <p className="font-bold text-sm md:text-base text-brutal-text">
                Check WhatsApp on <span className="font-mono font-black">{maskedPhone}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={otpInputId}
              className="text-xs font-mono font-bold uppercase text-brutal-text flex items-center gap-1.5"
            >
              Enter 4-Digit Verification Code
            </label>

            <input
              id={otpInputId}
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setOtp(val);
                setErrorMsg(null);
              }}
              placeholder="••••"
              autoFocus
              className="w-full text-center text-4xl font-mono font-black tracking-[0.5em] px-4 py-4 border-[3px] border-brutal-border bg-white shadow-brutal focus:outline-none focus:bg-brutal-card-lemon text-brutal-text"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            {timer > 0 ? (
              <span className="text-brutal-muted flex items-center gap-1 font-bold">
                <Clock className="w-3.5 h-3.5" /> Resend code in {timer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={loading}
                className="font-bold text-brutal-pop hover:underline uppercase flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Resend OTP via WhatsApp
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setStep("SELECT");
                setErrorMsg(null);
              }}
              className="text-brutal-muted hover:text-brutal-text underline uppercase font-bold"
            >
              Change Number
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || otp.trim().length !== 4}
            className={`w-full py-4 px-6 border-[3px] border-brutal-border shadow-brutal font-black uppercase text-base flex items-center justify-center gap-3 transition-colors ${
              loading || otp.trim().length !== 4
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#25D366] text-white hover:bg-[#20BA5A]"
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Recording Vote...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 fill-white text-brutal-border" /> Confirm Vote
              </>
            )}
          </motion.button>
        </form>
      )}

      {/* STEP: VOTED (Live Progress Bars) */}
      {step === "VOTED" && (
        <div className="space-y-6">
          <div className="p-4 bg-brutal-card-mint border-[3px] border-brutal-border shadow-brutal flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#25D366] text-white border-2 border-brutal-border">
                <CheckCircle2 className="w-6 h-6 fill-white text-brutal-border" />
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-black uppercase text-brutal-text leading-tight">
                  Vote Cast Successfully!
                </h4>
                <p className="font-mono text-xs font-bold text-brutal-muted uppercase">
                  Thank you for helping curate this week&apos;s special.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-mono text-xs font-bold text-brutal-muted block uppercase">
                Total Cast
              </span>
              <span className="text-2xl font-black text-brutal-text font-mono">
                {poll.totalVotes}
              </span>
            </div>
          </div>

          {/* Results progress bars */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono font-bold uppercase text-brutal-muted">
              <span>Live Community Results</span>
              <span>{poll.totalVotes} Total Votes</span>
            </div>

            {poll.options.map((option, idx) => {
              const isSelected = selectedOption === option.id;
              const isLeading = maxVotes > 0 && option.votes === maxVotes;

              return (
                <div
                  key={option.id}
                  className={`p-4 border-[3px] border-brutal-border bg-white shadow-brutal-sm relative transition-all ${
                    isSelected ? "ring-2 ring-brutal-pop bg-brutal-card-peach" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-sm md:text-base uppercase text-brutal-text">
                        {option.label}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 bg-brutal-pop text-white text-[10px] font-mono font-bold px-2 py-0.5 border border-brutal-border shadow-brutal-sm uppercase">
                          <CheckCircle2 className="w-3 h-3" /> Your Choice
                        </span>
                      )}
                      {isLeading && (
                        <span className="inline-flex items-center gap-1 bg-brutal-accent text-brutal-text text-[10px] font-mono font-bold px-2 py-0.5 border border-brutal-border shadow-brutal-sm uppercase">
                          <Sparkles className="w-3 h-3" /> Leading
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <span className="text-base md:text-lg font-black text-brutal-text">
                        {option.percent}%
                      </span>
                      <span className="text-xs text-brutal-muted block font-bold">
                        ({option.votes} {option.votes === 1 ? "vote" : "votes"})
                      </span>
                    </div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-full h-4 bg-gray-100 border-2 border-brutal-border overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${option.percent}%` }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: idx * 0.1,
                      }}
                      className={`h-full border-r-2 border-brutal-border ${
                        isSelected
                          ? "bg-brutal-pop"
                          : isLeading
                          ? "bg-brutal-accent"
                          : "bg-[#25D366]"
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
              className="text-xs font-mono font-bold text-brutal-muted hover:text-brutal-text uppercase inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Standings
            </button>
          </div>
        </div>
      )}

      {/* STEP: NOT_SUBSCRIBER */}
      {step === "NOT_SUBSCRIBER" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 md:p-8 bg-white border-[3px] border-brutal-border shadow-brutal text-center space-y-5"
        >
          <div className="inline-flex items-center justify-center p-4 bg-brutal-pop text-white border-2 border-brutal-border shadow-brutal-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 bg-brutal-card-lemon text-brutal-text font-mono font-bold text-xs px-3 py-1 border-2 border-brutal-border mb-3 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-brutal-pop" /> Exclusive Subscriber Privilege
            </span>
            <h4 className="text-2xl md:text-3xl font-black uppercase text-brutal-text tracking-tight mb-2">
              Active Meal Pack Required
            </h4>
            <p className="font-mono text-sm text-brutal-muted max-w-md mx-auto leading-relaxed">
              Voting is an exclusive perk reserved for active Mom&apos;s Kitchen meal subscribers.
              Subscribe to any weekly or monthly meal pack today to decide our Friday specials!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <a
              href={plansHref}
              className="bg-brutal-pop text-white font-black px-6 py-3.5 border-[3px] border-brutal-border shadow-brutal hover:bg-brutal-pop-hover transition-colors uppercase text-sm flex items-center justify-center gap-2"
            >
              Explore Meal Packs <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => {
                setStep("SELECT");
                setErrorMsg(null);
              }}
              className="bg-white text-brutal-text font-bold px-6 py-3.5 border-[3px] border-brutal-border shadow-brutal hover:bg-brutal-accent transition-colors uppercase text-sm"
            >
              Try Another Number
            </button>
          </div>

          <div className="pt-2 border-t-2 border-brutal-border">
            <a
              href="https://wa.me/917033558836?text=Hello!%20I%20want%20to%20subscribe%20to%20a%20meal%20pack%20and%20vote%20on%20weekly%20menus."
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono font-bold uppercase text-brutal-muted hover:text-[#25D366] inline-flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-[#25D366] text-transparent" /> Order or Subscribe via WhatsApp
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
