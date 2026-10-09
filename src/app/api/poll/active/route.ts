import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Returns the newest active poll with vote counts and rounded percentages,
 * or { poll: null } when none exists. At or after its deadline, attempts to
 * close the poll and record its leading option (null without votes), then
 * returns no poll even if the update reports an error. Vote-query errors
 * with no data are treated as zero votes. Missing configuration, poll-query
 * errors, and caught exceptions return a JSON error with status 500.
 */
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    // 1. Fetch current active poll
    const { data: poll, error } = await supabase
      .from("polls")
      .select("id, title, description, options, status, closes_at, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-close: if the active poll's deadline has passed, tag the winner,
    // mark it closed, and return no active poll to the client.
    if (
      poll &&
      poll.closes_at &&
      new Date(poll.closes_at).getTime() <= Date.now()
    ) {
      const { data: deadlineVotes } = await supabase
        .from("poll_votes")
        .select("option_id")
        .eq("poll_id", poll.id);

      const deadlineCounts: Record<string, number> = {};
      for (const v of deadlineVotes || []) {
        deadlineCounts[v.option_id] = (deadlineCounts[v.option_id] || 0) + 1;
      }

      let winnerId: string | null = null;
      let maxCount = 0;
      for (const [optId, count] of Object.entries(deadlineCounts)) {
        if (count > maxCount) {
          maxCount = count;
          winnerId = optId;
        }
      }

      await supabase
        .from("polls")
        .update({
          status: "closed",
          closed_at: new Date().toISOString(),
          winner_option_id: winnerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", poll.id);

      return NextResponse.json({ poll: null });
    }

    if (!poll) {
      return NextResponse.json({ poll: null });
    }

    // 2. Fetch all votes for this poll
    const { data: votes } = await supabase
      .from("poll_votes")
      .select("option_id")
      .eq("poll_id", poll.id);

    const voteCounts: Record<string, number> = {};
    const totalVotes = votes ? votes.length : 0;

    if (votes) {
      for (const v of votes) {
        voteCounts[v.option_id] = (voteCounts[v.option_id] || 0) + 1;
      }
    }

    const options = Array.isArray(poll.options) ? (poll.options as Array<{ id: string; label?: string; text?: string }>) : [];
    const enrichedOptions = options.map((opt) => {
      const count = voteCounts[opt.id] || 0;
      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return {
        id: opt.id,
        label: opt.label || opt.text || "Dish Option",
        votes: count,
        percent,
      };
    });

    return NextResponse.json({
      poll: {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        options: enrichedOptions,
        totalVotes,
        closesAt: poll.closes_at,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
