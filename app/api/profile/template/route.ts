import { NextResponse } from "next/server";
import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from "docx";

export async function GET() {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "SponsorFlow — Personalization & Positioning Template",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: "Fill in your background offline. When ready, paste your responses into the SponsorFlow onboarding wizard or use them to craft high-converting outreach.",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "Candidate Name: ____________________________________", bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Email Address: ____________________________________", bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Date: ________________________", bold: true }),
              ],
            }),
            new Paragraph({ text: "" }),

            // SECTION 1
            new Paragraph({
              text: "SECTION 1: FINTECH POSITIONING",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "1. Your Fintech Experience:", bold: true }),
              ],
            }),
            new Paragraph({
              text: "[Write 2-3 sentences about your background with payments, banking, compliance, lending, crypto, or B2B financial tools.]",
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "2. Concrete Problems You've Solved:", bold: true }),
              ],
            }),
            new Paragraph({
              text: "[Describe 1-2 concrete achievements with metrics, e.g., 'Reduced onboarding drop-off by 24% for KYC flow' or 'Redesigned fraud review dashboard reducing analyst handling time by 35%']",
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "3. What Draws You to Fintech:", bold: true }),
              ],
            }),
            new Paragraph({
              text: "[Why are you interested in fintech products? What excites you about the industry's complex regulatory and UX challenges?]",
            }),
            new Paragraph({ text: "" }),

            // SECTION 2
            new Paragraph({
              text: "SECTION 2: HEALTHCARE & HEALTHTECH POSITIONING",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "1. Your Healthcare Experience:", bold: true }),
              ],
            }),
            new Paragraph({
              text: "[Write 2-3 sentences about your background in healthtech, clinical portals, patient tracking, or med-tech.]",
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "2. Concrete Problems You've Solved:", bold: true }),
              ],
            }),
            new Paragraph({
              text: "[Describe 1-2 achievements with metrics, e.g., 'Designed accessible medication schedule UI achieving 98% patient compliance' or 'Streamlined clinical notes flow']",
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "3. What Draws You to Healthcare:", bold: true }),
              ],
            }),
            new Paragraph({
              text: "[Why do you care about solving healthcare problems?]",
            }),
            new Paragraph({ text: "" }),

            // SECTION 3
            new Paragraph({
              text: "SECTION 3: SAAS & ENTERPRISE POSITIONING",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "1. Your SaaS Experience & Achievements:", bold: true }),
              ],
            }),
            new Paragraph({
              text: "[Describe multi-tenant platforms, complex workflows, design systems, or self-serve onboarding improvements.]",
            }),
            new Paragraph({ text: "" }),

            // SECTION 4
            new Paragraph({
              text: "SECTION 4: YOUR PROFESSIONAL STORY & TONE",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "1. Professional Summary (1-2 paragraphs):", bold: true }),
              ],
            }),
            new Paragraph({
              text: "[How would you introduce yourself directly to a VP of Design or Head of Engineering?]",
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "2. One Memorable Thing Not On Your Resume:", bold: true }),
              ],
            }),
            new Paragraph({
              text: "[A unique project, personal hobby, hackathon win, or unusual background story that makes you stand out.]",
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "3. Preferred Writing Voice:", bold: true }),
              ],
            }),
            new Paragraph({
              text: "[Direct & Concise / Warm & Conversational / Formal & Structured]",
            }),
            new Paragraph({ text: "" }),

            // GUIDANCE
            new Paragraph({
              text: "CRITICAL TIPS FOR HIGH CONVERSION:",
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              text: "• Be specific and quantitative — include percentage gains, revenue impacts, and user scale.",
            }),
            new Paragraph({
              text: "• Avoid generic buzzwords like 'passionate visionary', 'results-driven ninja', or 'hard worker'.",
            }),
            new Paragraph({
              text: "• Focus on the problems the hiring manager is facing right now.",
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="Personalization_Template.docx"',
      },
    });
  } catch (error: any) {
    console.error("Error generating DOCX template:", error);
    return NextResponse.json(
      { error: "Failed to generate template document" },
      { status: 500 }
    );
  }
}
