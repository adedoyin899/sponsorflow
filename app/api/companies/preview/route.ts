/**
 * POST /api/companies/preview
 * Accepts CSV file (multipart/form-data) or raw CSV text,
 * parses columns, and flags existing duplicates for user review.
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseCSV } from "@/lib/csv-parser";
import { checkDuplicateCompanies, normalizeCompanyName } from "@/lib/db";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let csvText = "";
    let fileName = "upload.csv";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      fileName = file.name;
      csvText = await file.text();
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      csvText = body.csvContent || "";
      fileName = body.fileName || "upload.csv";
    } else {
      csvText = await req.text();
    }

    if (!csvText || csvText.trim().length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    // Parse CSV
    const result = parseCSV(csvText);

    if (result.validRows === 0) {
      return NextResponse.json(
        { error: "No valid company records found. Ensure your CSV has a 'Company Name' or 'Company' column." },
        { status: 400 }
      );
    }

    // Check duplicates against DB
    const names = result.companies.map((c) => c.company_name);
    const existingMap = await checkDuplicateCompanies(user.id, names);

    let duplicatesCount = 0;
    const previewCompanies = result.companies.map((c) => {
      const norm = normalizeCompanyName(c.company_name);
      const isDup = existingMap.has(norm);
      if (isDup) duplicatesCount++;

      return {
        ...c,
        is_duplicate: isDup,
        normalized_name: norm,
      };
    });

    return NextResponse.json({
      success: true,
      fileName,
      totalFound: previewCompanies.length,
      duplicatesCount,
      newCount: previewCompanies.length - duplicatesCount,
      headers: result.headers,
      recognizedColumns: result.recognizedColumns,
      unrecognizedColumns: result.unrecognizedColumns,
      companies: previewCompanies,
    });
  } catch (error: any) {
    console.error("CSV Preview error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process CSV preview" },
      { status: 500 }
    );
  }
}
