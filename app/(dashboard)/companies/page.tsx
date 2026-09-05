"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  Search,
  ExternalLink,
  Mail,
  Building2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  MapPin,
} from "lucide-react";

interface Company {
  id: string;
  company_name: string;
  website: string | null;
  career_page: string | null;
  industry: string | null;
  location: string | null;
  sponsor_rating: string | null;
  personalization_hook: string | null;
  status: string;
}

const FALLBACK_COMPANIES: Company[] = [
  { id: "1", company_name: "ClearBank", website: "https://clear.bank", career_page: null, industry: "Fintech", location: "London", sponsor_rating: "Worker (A rating)", personalization_hook: "Embedded clearing and payments infrastructure with real-time settlement rails.", status: "ready_to_send" },
  { id: "2", company_name: "Canva", website: "https://canva.com", career_page: null, industry: "Design & SaaS", location: "London", sponsor_rating: "Worker (A rating)", personalization_hook: "Visual suite collaboration and generative AI design systems.", status: "contacted" },
  { id: "3", company_name: "Cloudflare", website: "https://cloudflare.com", career_page: null, industry: "Cloud Infrastructure", location: "London", sponsor_rating: "Worker (A rating)", personalization_hook: "Zero Trust edge security and developer serverless platform.", status: "replied" },
  { id: "4", company_name: "Atlassian", website: "https://atlassian.com", career_page: null, industry: "Enterprise SaaS", location: "London", sponsor_rating: "Worker (A rating)", personalization_hook: "Jira & Confluence agile workflows and team velocity tooling.", status: "new" },
  { id: "5", company_name: "Monzo", website: "https://monzo.com", career_page: null, industry: "Fintech", location: "London", sponsor_rating: "Worker (A rating)", personalization_hook: "Consumer digital banking and transparent money management UX.", status: "new" },
  { id: "6", company_name: "Wise", website: "https://wise.com", career_page: null, industry: "Fintech", location: "London", sponsor_rating: "Worker (A rating)", personalization_hook: "Cross-border payments transparency and real-time currency exchange.", status: "contacted" },
];

export default function CompaniesDirectoryPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();

      if (res.ok && data.companies && data.companies.length > 0) {
        setCompanies(data.companies);
      } else {
        // Show fallback sample sponsors if user database has none yet
        setCompanies(FALLBACK_COMPANIES);
      }
    } catch {
      setCompanies(FALLBACK_COMPANIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const industries = ["All", "Fintech", "SaaS", "Healthcare", "Design & Tech"];

  const filtered = companies.filter((c) => {
    const matchesIndustry =
      selectedIndustry === "All" ||
      (c.industry && c.industry.toLowerCase().includes(selectedIndustry.toLowerCase()));

    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      c.company_name.toLowerCase().includes(q) ||
      (c.industry && c.industry.toLowerCase().includes(q)) ||
      (c.personalization_hook && c.personalization_hook.toLowerCase().includes(q));

    return matchesIndustry && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-brand-aloe font-medium mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Target Acquisition Database</span>
          </div>
          <h1 className="text-2xl font-light text-white tracking-tight">Curated UK Tech Sponsors</h1>
          <p className="text-xs text-neutral-400">
            Verified tech sponsors with active Home Office Worker licenses and Claude personalization hooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/companies/import">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" /> Import CSV File
            </Button>
          </Link>
          <Link href="/dashboard/emails">
            <Button variant="aloe" size="sm" className="gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Draft Outreach
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name, industry, or personalization hook..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-aloe/50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                selectedIndustry === ind
                  ? "bg-brand-aloe/20 text-brand-aloe border border-brand-aloe/40 font-medium"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State when no matches */}
      {filtered.length === 0 && !isLoading && (
        <Card variant="glass" className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-white">No companies found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              No target sponsors matched your search or filters. Try adjusting your query or import new companies from a CSV.
            </p>
          </div>
          <Link href="/dashboard/companies/import">
            <Button variant="aloe" size="sm">
              <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Import CSV File
            </Button>
          </Link>
        </Card>
      )}

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Card key={c.id || c.company_name} variant="glass" className="p-5 space-y-3 flex flex-col justify-between hover:border-white/10 transition-colors">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white text-base tracking-tight">{c.company_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {c.website && (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-brand-mint hover:underline inline-flex items-center gap-1 font-mono"
                      >
                        {c.website.replace(/^https?:\/\//, "").replace(/\/$/, "")} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {c.location && (
                      <span className="text-[10px] text-neutral-500 inline-flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" /> {c.location}
                      </span>
                    )}
                  </div>
                </div>

                <Badge
                  variant={
                    c.status === "replied"
                      ? "success"
                      : c.status === "contacted"
                      ? "aloe"
                      : "outline"
                  }
                >
                  {c.status.replace("_", " ")}
                </Badge>
              </div>

              {c.personalization_hook && (
                <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                  {c.personalization_hook}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-neutral-500 text-[11px] inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-aloe" /> {c.sponsor_rating || "Worker (A rating)"}
              </span>
              <Link href="/dashboard/emails">
                <Button variant="secondary" size="sm" className="h-7 text-xs px-2.5">
                  <Mail className="w-3 h-3 mr-1" /> Draft
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
