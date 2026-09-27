import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    const options = Array.isArray(poll.options) ? poll.options : [];
    const enrichedOptions = options.map((opt: any) => {
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
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
