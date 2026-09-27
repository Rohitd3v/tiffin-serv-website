import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { DEFAULT_PLANS, enrichPlan, Plan } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("active", true)
        .order("price", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const enrichedPlans: Plan[] = data.map(enrichPlan);
        return NextResponse.json(
          {
            success: true,
            source: "supabase",
            plans: enrichedPlans,
          },
          {
            headers: {
              "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
            },
          }
        );
      }
    }

    // Fallback if supabase client is not configured or query fails
    return NextResponse.json({
      success: true,
      source: "fallback",
      plans: DEFAULT_PLANS,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("API /api/plans error:", message);
    return NextResponse.json({
      success: true,
      source: "fallback",
      plans: DEFAULT_PLANS,
    });
  }
}
