"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Building2,
  Trash2,
  RefreshCw,
  Sparkles,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PreviewCompany {
  company_name: string;
  website?: string | null;
  industry?: string | null;
  sponsor_rating?: string | null;
  location?: string | null;
  personalization_hook?: string | null;
  is_duplicate?: boolean;
}

export default function CompaniesImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string>("");

  // Preview Data
  const [previewCompanies, setPreviewCompanies] = useState<PreviewCompany[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [duplicatesCount, setDuplicatesCount] = useState(0);
  const [newCount, setNewCount] = useState(0);

  // Import options
  const [duplicateResolution, setDuplicateResolution] = useState<"skip" | "replace" | "merge">("skip");
  const [campaignTag, setCampaignTag] = useState<string>("london_shortlist_v1");
  const [importResult, setImportResult] = useState<{
    total: number;
    imported: number;
    duplicates: number;
  } | null>(null);

  const [previewFilter, setPreviewFilter] = useState<"all" | "new" | "duplicates">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (uploadedFile: File) => {
    setError("");
    setImportResult(null);
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setIsPreviewLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const res = await fetch("/api/companies/preview", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse CSV file");
      }

      setPreviewCompanies(data.companies || []);
      setTotalFound(data.totalFound || 0);
      setDuplicatesCount(data.duplicatesCount || 0);
      setNewCount(data.newCount || 0);
    } catch (err: any) {
      setError(err.message || "Failed to process file");
      setPreviewCompanies([]);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleUseSampleCSV = async () => {
    setError("");
    setIsPreviewLoading(true);
    try {
      const res = await fetch("/api/companies/sample");
      const blob = await res.blob();
      const sampleFile = new File([blob], "sponsorflow_uk_tech_sponsors_54.csv", { type: "text/csv" });
      await processFile(sampleFile);
    } catch (err: any) {
      setError("Failed to load sample CSV");
      setIsPreviewLoading(false);
    }
  };

  const executeImport = async () => {
    if (previewCompanies.length === 0) return;
    setIsImporting(true);
    setError("");

    try {
      const res = await fetch("/api/companies/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companies: previewCompanies,
          fileName: fileName || "sponsorflow_import.csv",
          campaignTag: campaignTag.trim() || undefined,
          duplicateResolution,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setImportResult({
        total: data.total,
        imported: data.imported,
        duplicates: data.duplicates,
      });
    } catch (err: any) {
      setError(err.message || "Failed to complete import");
    } finally {
      setIsImporting(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setFileName("");
    setPreviewCompanies([]);
    setTotalFound(0);
    setDuplicatesCount(0);
    setNewCount(0);
    setError("");
    setImportResult(null);
  };

  const filteredPreview = previewCompanies.filter((c) => {
    if (previewFilter === "new" && c.is_duplicate) return false;
    if (previewFilter === "duplicates" && !c.is_duplicate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.company_name.toLowerCase().includes(q) ||
        (c.industry && c.industry.toLowerCase().includes(q)) ||
        (c.personalization_hook && c.personalization_hook.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-brand-aloe font-medium mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Target Acquisition Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Import Sponsor Companies
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Upload any CSV or spreadsheet containing target companies, websites, and outreach hooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/companies">
            <Button variant="outline" size="sm">
              Back to Companies
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open("/api/companies/sample", "_blank")}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Sample CSV
          </Button>
        </div>
      </div>

      {/* Success Modal / Banner */}
      {importResult && (
        <Card variant="glass" className="p-6 border-brand-aloe/40 bg-brand-aloe/5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-aloe/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-brand-aloe" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-white">Import Successfully Completed</h3>
              <p className="text-xs text-neutral-300">
                Successfully processed <strong className="text-brand-aloe">{importResult.total}</strong> companies.{" "}
                <strong className="text-white">{importResult.imported}</strong> companies were added/updated in your directory, and{" "}
                <strong className="text-neutral-400">{importResult.duplicates}</strong> duplicates were resolved via{" "}
                <span className="capitalize font-mono text-[11px] text-brand-aloe">{duplicateResolution}</span> strategy.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Link href="/dashboard/companies">
              <Button variant="aloe" size="sm" className="gap-1.5">
                View Companies Directory <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link href="/dashboard/emails">
              <Button variant="secondary" size="sm">
                Generate Claude Outreach
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={resetAll}>
              Import Another File
            </Button>
          </div>
        </Card>
      )}

      {/* Upload Zone (Only show if no preview yet or during re-upload) */}
      {previewCompanies.length === 0 && !importResult && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileInput}
          />

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all ${
              dragActive
                ? "border-brand-aloe bg-brand-aloe/10 scale-[1.01]"
                : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/60"
            }`}
          >
            <div className="mx-auto w-14 h-14 rounded-2xl bg-neutral-800/80 flex items-center justify-center mb-4 text-brand-aloe">
              {isPreviewLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <h3 className="text-sm sm:text-base font-medium text-white mb-1">
              {isPreviewLoading ? "Analyzing & Parsing CSV..." : "Drag and drop your company CSV here"}
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mb-5">
              Supports CSV exports from LinkedIn, Apollo, Google Sheets, or Home Office Sponsor lists. We auto-detect column headers like <span className="text-neutral-300">Company Name</span>, <span className="text-neutral-300">Website</span>, <span className="text-neutral-300">Industry</span>, and <span className="text-neutral-300">Hook</span>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="aloe"
                size="sm"
                type="button"
                disabled={isPreviewLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Files
              </Button>

              <Button
                variant="secondary"
                size="sm"
                type="button"
                disabled={isPreviewLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUseSampleCSV();
                }}
                className="gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-aloe" /> Load 54 Curated UK Sponsors
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Preview & Confirmation Screen */}
      {previewCompanies.length > 0 && !importResult && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="glass" className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-medium">
                  Companies Found
                </span>
                <span className="text-2xl font-light text-white">{totalFound}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </Card>

            <Card variant="glass" className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-medium">
                  New Records
                </span>
                <span className="text-2xl font-light text-brand-aloe">{newCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-aloe/10 flex items-center justify-center text-brand-aloe">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </Card>

            <Card variant="glass" className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-medium">
                  Duplicates Detected
                </span>
                <span className="text-2xl font-light text-amber-400">{duplicatesCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </Card>
          </div>

          {/* Import Configuration Panel */}
          <Card variant="glass" className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-sm font-semibold text-white">Import Settings & Deduplication</h3>
                <p className="text-xs text-neutral-400">
                  Choose how existing companies in your database should be treated.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-mono">{fileName}</span>
                <Button variant="ghost" size="sm" onClick={resetAll} className="text-neutral-400 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duplicate Strategy */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-neutral-300 block">
                  Duplicate Resolution Strategy
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      duplicateResolution === "skip"
                        ? "border-brand-aloe bg-brand-aloe/10 text-white"
                        : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="dupResolution"
                      value="skip"
                      checked={duplicateResolution === "skip"}
                      onChange={() => setDuplicateResolution("skip")}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-semibold">Skip duplicates (Recommended)</div>
                      <div className="text-[11px] text-neutral-400">
                        Only import the {newCount} new companies. Existing records will remain untouched.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      duplicateResolution === "replace"
                        ? "border-brand-aloe bg-brand-aloe/10 text-white"
                        : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="dupResolution"
                      value="replace"
                      checked={duplicateResolution === "replace"}
                      onChange={() => setDuplicateResolution("replace")}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-semibold">Replace & update existing</div>
                      <div className="text-[11px] text-neutral-400">
                        Update {duplicatesCount} existing records with fresh personalization hooks and data from this CSV.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      duplicateResolution === "merge"
                        ? "border-brand-aloe bg-brand-aloe/10 text-white"
                        : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="dupResolution"
                      value="merge"
                      checked={duplicateResolution === "merge"}
                      onChange={() => setDuplicateResolution("merge")}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-semibold">Import all (Allow duplicates)</div>
                      <div className="text-[11px] text-neutral-400">
                        Imports every row regardless of existing records, tagging them with this campaign.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Campaign Tag */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Campaign Tag (Optional)
                  </label>
                  <p className="text-xs text-neutral-400 mb-2">
                    Used to filter, group, and track metrics across outreach batches.
                  </p>
                  <input
                    type="text"
                    value={campaignTag}
                    onChange={(e) => setCampaignTag(e.target.value)}
                    placeholder="e.g. london_fintech_q3"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-aloe/50 font-mono"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/5 space-y-1.5 text-xs">
                  <div className="text-neutral-300 font-medium">Ready to import:</div>
                  <div className="text-neutral-400">
                    {duplicateResolution === "skip"
                      ? `${newCount} new companies will be added`
                      : duplicateResolution === "replace"
                      ? `${newCount} new + ${duplicatesCount} updated companies`
                      : `${totalFound} total companies will be imported`}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    variant="aloe"
                    size="md"
                    disabled={isImporting}
                    onClick={executeImport}
                    className="w-full gap-2"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Importing Companies...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" /> Complete Import ({duplicateResolution === "skip" ? newCount : totalFound})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Live Preview Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white">Parsed Data Preview</span>
                <span className="text-xs text-neutral-500 font-mono">({filteredPreview.length} shown)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1 text-[11px]">
                  <button
                    onClick={() => setPreviewFilter("all")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      previewFilter === "all" ? "bg-neutral-800 text-white font-medium" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    All ({totalFound})
                  </button>
                  <button
                    onClick={() => setPreviewFilter("new")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      previewFilter === "new" ? "bg-brand-aloe/20 text-brand-aloe font-medium" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    New ({newCount})
                  </button>
                  <button
                    onClick={() => setPreviewFilter("duplicates")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      previewFilter === "duplicates" ? "bg-amber-400/20 text-amber-300 font-medium" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Duplicates ({duplicatesCount})
                  </button>
                </div>

                <div className="relative w-44 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search rows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-aloe/50"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-neutral-900/40 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-neutral-900 text-neutral-400 border-b border-white/5 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Company Name</th>
                    <th className="py-2.5 px-4">Website</th>
                    <th className="py-2.5 px-4">Industry</th>
                    <th className="py-2.5 px-4">Rating / License</th>
                    <th className="py-2.5 px-4">Personalization Hook</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  {filteredPreview.map((c, idx) => (
                    <tr key={idx} className="hover:bg-neutral-800/30">
                      <td className="py-2.5 px-4">
                        {c.is_duplicate ? (
                          <Badge variant="outline" className="border-amber-400/40 text-amber-300 text-[10px] px-1.5 py-0.5">
                            Duplicate
                          </Badge>
                        ) : (
                          <Badge variant="aloe" className="text-[10px] px-1.5 py-0.5">
                            New
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-white">{c.company_name}</td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-neutral-400">
                        {c.website ? (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-brand-aloe underline decoration-white/20"
                          >
                            {c.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-300">{c.industry || "—"}</td>
                      <td className="py-2.5 px-4 text-neutral-400">{c.sponsor_rating || "Worker (A rating)"}</td>
                      <td className="py-2.5 px-4 text-neutral-400 max-w-xs truncate" title={c.personalization_hook || ""}>
                        {c.personalization_hook || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
