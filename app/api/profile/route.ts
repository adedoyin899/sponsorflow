import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      location: "London, UK",
      years_experience: 6,
      target_job_title: "Lead Product Designer",
      requires_sponsorship: true,
      target_salary_gbp: 85000,
      onboarding_complete: true,
      profile_complete_percent: 100,
    },
  });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
