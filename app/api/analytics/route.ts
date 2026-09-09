import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserAnalytics } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframeParam = searchParams.get("timeframe") || "30d";
    const timeframe = ["7d", "14d", "30d", "all"].includes(timeframeParam)
      ? (timeframeParam as "7d" | "14d" | "30d" | "all")
      : "30d";

    const user = await getCurrentUser();

    if (user) {
      const analytics = await getUserAnalytics(user.id, timeframe);
      return NextResponse.json({
        success: true,
        analytics,
      });
    }

    // Unauthenticated fallback for development previews
    return NextResponse.json({
      success: true,
      analytics: {
        kpis: {
          totalCompanies: 54,
          totalContacted: 18,
          emailsSent: 18,
          emailsOpened: 12,
          openRate: 67,
          repliesReceived: 5,
          replyRate: 28,
          positiveReplies: 3,
          positiveRate: 60,
          interviewsScheduled: 2,
          offersCount: 0,
        },
        funnel: [
          { stage: "Targeted Sponsors", count: 54, percentage: 100, subtext: "Curated UK tech sponsors" },
          { stage: "Outreach Dispatched", count: 18, percentage: 33, subtext: "Personalized cold emails" },
          { stage: "Inbound Responses", count: 5, percentage: 28, subtext: "Replies to primary inbox" },
          { stage: "Warm / Positive Leads", count: 3, percentage: 60, subtext: "Interested leads & CV requests" },
          { stage: "Interviews Scheduled", count: 2, percentage: 67, subtext: "Screening & technical chats" },
          { stage: "Offers Extended", count: 0, percentage: 0, subtext: "Sponsored job offers" },
        ],
        industryBreakdown: [
          { industry: "Fintech", companiesTargeted: 16, emailsSent: 8, replies: 3, positiveReplies: 2, replyRate: 38 },
          { industry: "Design & Creative SaaS", companiesTargeted: 12, emailsSent: 4, replies: 1, positiveReplies: 1, replyRate: 25 },
          { industry: "Cloud Infrastructure", companiesTargeted: 14, emailsSent: 4, replies: 1, positiveReplies: 0, replyRate: 25 },
          { industry: "HealthTech", companiesTargeted: 8, emailsSent: 2, replies: 0, positiveReplies: 0, replyRate: 0 },
          { industry: "Cybersecurity", companiesTargeted: 4, emailsSent: 0, replies: 0, positiveReplies: 0, replyRate: 0 },
        ],
        sentimentDistribution: {
          positive: 2,
          interested: 1,
          question: 1,
          out_of_office: 0,
          rejection: 1,
          other: 0,
        },
        activityTimeline: [
          { date: "2026-08-27", label: "27 Aug", sent: 2, opened: 1, replied: 0 },
          { date: "2026-08-28", label: "28 Aug", sent: 3, opened: 2, replied: 1 },
          { date: "2026-08-29", label: "29 Aug", sent: 0, opened: 0, replied: 0 },
          { date: "2026-08-30", label: "30 Aug", sent: 4, opened: 3, replied: 1 },
          { date: "2026-08-31", label: "31 Aug", sent: 2, opened: 1, replied: 0 },
          { date: "2026-09-01", label: "1 Sep", sent: 0, opened: 0, replied: 0 },
          { date: "2026-09-02", label: "2 Sep", sent: 3, opened: 2, replied: 1 },
          { date: "2026-09-03", label: "3 Sep", sent: 1, opened: 1, replied: 0 },
          { date: "2026-09-04", label: "4 Sep", sent: 2, opened: 1, replied: 1 },
          { date: "2026-09-05", label: "5 Sep", sent: 1, opened: 1, replied: 1 },
        ],
      },
    });
  } catch (err: any) {
    console.error("Failed to generate analytics:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate analytics" },
      { status: 500 }
    );
  }
}
