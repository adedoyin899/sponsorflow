import React from "react";
import Link from "next/link";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { EmailApprovalUI } from "@/components/emails/EmailApprovalUI";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  UploadCloud,
  Mail,
  Building2,
  ArrowRight,
} from "lucide-react";

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl glass-card relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 dark:text-brand-aloe font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Job Acquisition Campaign: Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-neutral-950 dark:text-white tracking-tight">
            Welcome to SponsorFlow
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
            Targeting 54 curated UK tech sponsors. Review drafted emails below and initiate outbound dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Link href="/dashboard/companies/import">
            <Button variant="secondary" size="md">
              <UploadCloud className="w-4 h-4 mr-1.5" /> Import CSV
            </Button>
          </Link>
          <Link href="/dashboard/emails">
            <Button variant="aloe" size="md">
              <Mail className="w-4 h-4 mr-1.5" /> Draft Emails
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <DashboardStats />

      {/* Main Grid: Pending Approvals & Profile Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EmailApprovalUI />
        </div>

        <div className="space-y-6">
          {/* Onboarding Profile Progress */}
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">Profile Readiness</h3>
              <Badge variant="aloe">100% Complete</Badge>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
              <div className="bg-brand-aloe h-full rounded-full w-full" />
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Your Fintech, Healthcare, and SaaS positioning models are configured for Claude email generation.
            </p>
            <Link href="/dashboard/profile" className="block">
              <Button variant="outline" size="sm" className="w-full">
                Edit Positioning & Story
              </Button>
            </Link>
          </Card>

          {/* Top Target Sponsors */}
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">Priority Sponsors</h3>
              <Link href="/dashboard/companies" className="text-xs text-emerald-700 dark:text-brand-aloe hover:underline font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-2.5">
              {[
                { name: "ClearBank", ind: "Fintech", hook: "Cloud Core Banking" },
                { name: "Canva", ind: "Design SaaS", hook: "Design System & Collaboration" },
                { name: "Cloudflare", ind: "Security", hook: "Zero Trust Architecture" },
                { name: "Monzo", ind: "Banking", hook: "Consumer Experience" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-white/5 text-xs transition-colors"
                >
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-white block">{item.name}</span>
                    <span className="text-[11px] text-neutral-600 dark:text-neutral-400">{item.hook}</span>
                  </div>
                  <Badge variant="outline">{item.ind}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
