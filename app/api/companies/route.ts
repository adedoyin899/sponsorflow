import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    total: 54,
    companies: [
      { name: "ClearBank", industry: "Fintech", rating: "Worker (A rating)" },
      { name: "Canva", industry: "Design & SaaS", rating: "Worker (A rating)" },
      { name: "Cloudflare", industry: "Cloud Infrastructure", rating: "Worker (A rating)" },
    ],
  });
}
