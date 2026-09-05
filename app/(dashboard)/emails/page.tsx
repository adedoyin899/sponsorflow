"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EmailGenerator } from "@/components/emails/EmailGenerator";
import { EmailApprovalUI } from "@/components/emails/EmailApprovalUI";
import { GmailConnectBanner } from "@/components/emails/GmailConnectBanner";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, Send, CheckCircle2, Building2, UploadCloud } from "lucide-react";

export default function EmailsDashboardPage() {
  const [refreshCount, setRefreshCount] = useState(0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-brand-aloe font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Personalization Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Outreach Pipeline & Approvals
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Generate tailored cold emails with Claude AI, review personalized hooks, and approve for outbound dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/companies/import">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" /> Import Companies
            </Button>
          </Link>
          <Link href="/dashboard/emails/draft">
            <Button variant="aloe" size="sm" className="gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Draft Single Sponsor
            </Button>
          </Link>
        </div>
      </div>

      {/* Gmail Connection Status */}
      <GmailConnectBanner />

      {/* Main Grid: Interactive Generator + Review Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-semibold text-white">Live Email Draft Generator</h2>
          <EmailGenerator onEmailUpdated={() => setRefreshCount((c) => c + 1)} />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <EmailApprovalUI refreshTrigger={refreshCount} />
        </div>
      </div>
    </div>
  );
}
