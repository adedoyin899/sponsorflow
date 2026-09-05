import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    emails: [
      { id: "1", companyName: "ClearBank", status: "ready_to_send" },
      { id: "2", companyName: "Canva", status: "draft" },
    ],
  });
}
