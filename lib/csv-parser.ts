import Papa from "papaparse";

export interface ParsedCompanyInput {
  company_name: string;
  website?: string | null;
  career_page?: string | null;
  industry?: string | null;
  location?: string | null;
  sponsor_rating?: string | null;
  personalization_hook?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_role?: string | null;
  [key: string]: any;
}

export interface CSVParseResult {
  companies: ParsedCompanyInput[];
  headers: string[];
  recognizedColumns: Record<string, string>;
  unrecognizedColumns: string[];
  totalRows: number;
  validRows: number;
}

/**
 * Standard column aliases mapped to normalized database fields
 */
const COLUMN_MAPPINGS: Record<string, keyof ParsedCompanyInput> = {
  // Company Name
  "company name": "company_name",
  "company": "company_name",
  "employer": "company_name",
  "organisation name": "company_name",
  "organization name": "company_name",
  "organisation": "company_name",
  "organization": "company_name",
  "name": "company_name",
  "business name": "company_name",
  "firm": "company_name",

  // Website
  "website": "website",
  "url": "website",
  "web": "website",
  "domain": "website",
  "company website": "website",
  "company url": "website",
  "site": "website",
  "homepage": "website",

  // Career Page
  "career page": "career_page",
  "careers": "career_page",
  "jobs": "career_page",
  "career url": "career_page",
  "careers url": "career_page",
  "job page": "career_page",

  // Industry
  "industry": "industry",
  "sector": "industry",
  "category": "industry",
  "vertical": "industry",
  "type": "industry",

  // Sponsor Rating / Status
  "sponsor rating": "sponsor_rating",
  "rating": "sponsor_rating",
  "type & rating": "sponsor_rating",
  "sponsor status": "sponsor_rating",
  "tier": "sponsor_rating",
  "license status": "sponsor_rating",
  "route": "sponsor_rating",

  // Location
  "location": "location",
  "city": "location",
  "town/city": "location",
  "town": "location",
  "headquarters": "location",
  "hq": "location",
  "address": "location",

  // Personalization Hook / Context
  "personalization hook": "personalization_hook",
  "hook": "personalization_hook",
  "angle": "personalization_hook",
  "notes": "personalization_hook",
  "note": "personalization_hook",
  "description": "personalization_hook",
  "focus": "personalization_hook",
  "tech stack": "personalization_hook",

  // Optional Contact Details
  "contact name": "contact_name",
  "contact": "contact_name",
  "lead": "contact_name",
  "person": "contact_name",
  "contact email": "contact_email",
  "email": "contact_email",
  "contact role": "contact_role",
  "role": "contact_role",
  "title": "contact_role",
  "job title": "contact_role",
};

/**
 * Normalize an input header string for matching (lowercase, stripped punctuation)
 */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/[^\w\s/&]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Infer industry vertical from company name, description, or notes if not provided
 */
export function inferIndustry(name: string, hook?: string | null): string {
  const text = `${name} ${hook || ""}`.toLowerCase();

  if (
    text.includes("bank") ||
    text.includes("pay") ||
    text.includes("fintech") ||
    text.includes("finance") ||
    text.includes("invest") ||
    text.includes("crypto") ||
    text.includes("wealth") ||
    text.includes("lending") ||
    text.includes("capital") ||
    text.includes("credit")
  ) {
    return "Fintech";
  }

  if (
    text.includes("health") ||
    text.includes("care") ||
    text.includes("clinic") ||
    text.includes("med") ||
    text.includes("patient") ||
    text.includes("pharma") ||
    text.includes("bio") ||
    text.includes("hospital") ||
    text.includes("nhs")
  ) {
    return "Healthcare";
  }

  if (
    text.includes("software") ||
    text.includes("cloud") ||
    text.includes("platform") ||
    text.includes("saas") ||
    text.includes("ai") ||
    text.includes("data") ||
    text.includes("app") ||
    text.includes("tech") ||
    text.includes("security") ||
    text.includes("infra")
  ) {
    return "SaaS & Tech";
  }

  return "Technology";
}

/**
 * Parse CSV string with flexible header auto-detection
 */
export function parseCSV(csvContent: string): CSVParseResult {
  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });

  const rawHeaders = parsed.meta.fields || [];
  const recognizedColumns: Record<string, string> = {};
  const unrecognizedColumns: string[] = [];

  // Map headers to canonical fields
  for (const raw of rawHeaders) {
    const norm = normalizeHeader(raw);
    const target = COLUMN_MAPPINGS[norm];
    if (target) {
      recognizedColumns[raw] = target as string;
    } else {
      unrecognizedColumns.push(raw);
    }
  }

  const companies: ParsedCompanyInput[] = [];

  for (const row of parsed.data) {
    const company: ParsedCompanyInput = {
      company_name: "",
    };

    // Populate recognized fields
    for (const [rawHeader, targetField] of Object.entries(recognizedColumns)) {
      const val = row[rawHeader];
      if (val && typeof val === "string" && val.trim().length > 0) {
        company[targetField] = val.trim();
      }
    }

    // Must have a company name
    if (!company.company_name || company.company_name.trim().length === 0) {
      continue;
    }

    // Normalize website URL if present
    if (company.website) {
      let site = company.website.trim();
      if (!site.startsWith("http://") && !site.startsWith("https://")) {
        site = `https://${site}`;
      }
      company.website = site;
    }

    // Auto-infer industry if missing
    if (!company.industry) {
      company.industry = inferIndustry(company.company_name, company.personalization_hook);
    }

    companies.push(company);
  }

  return {
    companies,
    headers: rawHeaders,
    recognizedColumns,
    unrecognizedColumns,
    totalRows: parsed.data.length,
    validRows: companies.length,
  };
}
