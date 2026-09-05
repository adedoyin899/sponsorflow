import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    stats: {
      emails_sent: 14,
      open_rate: 0.625,
      reply_rate: 0.229,
      interviews_scheduled: 2,
    },
  });
}
