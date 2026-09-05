/**
 * POST /api/companies/import
 * Imports parsed companies into the database with duplicate resolution strategy.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { parseCSV } from "@/lib/csv-parser";
import { importCompanies } from "@/lib/db";

const companyItemSchema = z.object({
  company_name: z.string().min(1),
  website: z.string().nullable().optional(),
  career_page: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  sponsor_rating: z.string().nullable().optional(),
  personalization_hook: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  contact_email: z.string().nullable().optional(),
  contact_role: z.string().nullable().optional(),
});

const jsonImportSchema = z.object({
  companies: z.array(companyItemSchema).min(1),
  fileName: z.string().default("imported_companies.csv"),
  campaignTag: z.string().optional(),
  duplicateResolution: z.enum(["skip", "replace", "merge"]).default("skip"),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const campaignTag = (formData.get("campaignTag") as string) || undefined;
      const duplicateResolution = (formData.get("duplicateResolution") as "skip" | "replace" | "merge") || "skip";

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const csvText = await file.text();
      const parsed = parseCSV(csvText);

      if (parsed.validRows === 0) {
        return NextResponse.json(
          { error: "No valid company records found in CSV" },
          { status: 400 }
        );
      }

      const result = await importCompanies(user.id, parsed.companies, {
        fileName: file.name,
        fileSize: file.size,
        campaignTag,
        duplicateResolution,
      });

      return NextResponse.json({
        success: true,
        import_id: result.importId,
        total: result.totalFound,
        imported: result.importedCount,
        duplicates: result.duplicatesCount,
        duplicate_list: result.duplicateList,
      });
    }

    // JSON payload with pre-parsed / confirmed company list
    const body = await req.json();
    const parsed = jsonImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { companies, fileName, campaignTag, duplicateResolution } = parsed.data;

    const result = await importCompanies(user.id, companies, {
      fileName,
      campaignTag,
      duplicateResolution,
    });

    return NextResponse.json({
      success: true,
      import_id: result.importId,
      total: result.totalFound,
      imported: result.importedCount,
      duplicates: result.duplicatesCount,
      duplicate_list: result.duplicateList,
    });
  } catch (error: any) {
    console.error("Company import error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import companies" },
      { status: 500 }
    );
  }
}
