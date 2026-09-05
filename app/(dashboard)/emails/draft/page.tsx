"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EmailGenerator } from "@/components/emails/EmailGenerator";
import { EmailApprovalUI } from "@/components/emails/EmailApprovalUI";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, Sparkles, Building2 } from "lucide-react";

export default function EmailDraftPage() {
  const [refreshCount, setRefreshCount] = useState(0);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-brand-aloe font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Claude AI Cold Outreach Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Draft Personalized Outreach
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Select any target UK sponsor company. Claude will synthesize your positioning into high-converting 70–150 word peer outreach.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/emails">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> All Outreach
            </Button>
          </Link>
          <Link href="/dashboard/companies">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Target Companies
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Drafting Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <EmailGenerator onEmailUpdated={() => setRefreshCount((c) => c + 1)} />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <EmailApprovalUI refreshTrigger={refreshCount} />
        </div>
      </div>
    </div>
  );
}
