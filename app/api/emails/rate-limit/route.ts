/**
 * GET /api/emails/rate-limit — Returns current sending limits and usage
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAndResetSendLimits } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawLimits = await getAndResetSendLimits(user.id);
    const limits = rawLimits || {
      daily_limit: 20,
      hourly_limit: 5,
      emails_sent_today: 0,
      emails_sent_this_hour: 0,
    };
    const remainingToday = Math.max(0, limits.daily_limit - limits.emails_sent_today);
    const remainingThisHour = Math.max(0, limits.hourly_limit - limits.emails_sent_this_hour);

    return NextResponse.json({
      success: true,
      daily_limit: limits.daily_limit,
      hourly_limit: limits.hourly_limit,
      emails_sent_today: limits.emails_sent_today,
      emails_sent_this_hour: limits.emails_sent_this_hour,
      remaining_today: remainingToday,
      remaining_this_hour: remainingThisHour,
      can_send: remainingToday > 0 && remainingThisHour > 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch rate limits" },
      { status: 500 }
    );
  }
}
