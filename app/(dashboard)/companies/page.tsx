import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UploadCloud, Search, ExternalLink, Mail, CheckCircle } from "lucide-react";

export default function CompaniesDirectoryPage() {
  const companies = [
    { name: "ClearBank", website: "https://clear.bank", industry: "Fintech", rating: "Worker (A rating)", hook: "Embedded clearing and payments infrastructure", status: "ready_to_send" },
    { name: "Canva", website: "https://canva.com", industry: "Design & SaaS", rating: "Worker (A rating)", hook: "Collaborative design suite and AI toolings", status: "contacted" },
    { name: "Cloudflare", website: "https://cloudflare.com", industry: "Cloud Infrastructure", rating: "Worker (A rating)", hook: "Edge security and developer platform", status: "replied" },
    { name: "Atlassian", website: "https://atlassian.com", industry: "Enterprise SaaS", rating: "Worker (A rating)", hook: "Team collaboration and agile workflows", status: "new" },
    { name: "Monzo", website: "https://monzo.com", industry: "Fintech", rating: "Worker (A rating)", hook: "Digital banking and automated savings experience", status: "new" },
    { name: "Wise", website: "https://wise.com", industry: "Fintech", rating: "Worker (A rating)", hook: "Cross-border payments transparency", status: "contacted" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Curated UK Tech Sponsors</h1>
          <p className="text-xs text-neutral-400">
            54 verified London tech sponsors with active Home Office Worker licenses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Import CSV File
          </Button>
          <Button variant="aloe" size="sm">
            Draft All Pending
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company name, industry, or keyword..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-aloe/50"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Badge variant="outline" className="cursor-pointer hover:border-white/30">All (54)</Badge>
          <Badge variant="aloe" className="cursor-pointer">Fintech (18)</Badge>
          <Badge variant="outline" className="cursor-pointer hover:border-white/30">SaaS (22)</Badge>
          <Badge variant="outline" className="cursor-pointer hover:border-white/30">HealthTech (14)</Badge>
        </div>
      </div>

      {/* Companies Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((c) => (
          <Card key={c.name} variant="glass" className="p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white text-base">{c.name}</h3>
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-brand-mint hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    {c.website.replace("https://", "")} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <Badge variant={c.status === "replied" ? "success" : c.status === "contacted" ? "aloe" : "outline"}>
                  {c.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs text-neutral-400 line-clamp-2">{c.hook}</p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-neutral-500">{c.rating}</span>
              <Button variant="secondary" size="sm">
                <Mail className="w-3.5 h-3.5 mr-1" /> Draft
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
