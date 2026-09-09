import React from "react";
import Link from "next/link";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { EmailApprovalUI } from "@/components/emails/EmailApprovalUI";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Sparkles,
  ArrowRight,
  UploadCloud,
  Mail,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-white/5 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 text-xs text-brand-aloe font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Job Acquisition Campaign: Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Welcome to SponsorFlow
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
            Targeting 54 curated UK tech sponsors. Review drafted emails below and initiate outbound dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Link href="/dashboard/companies">
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
      <DashboardStats
        totalCompanies={54}
        totalContacted={14}
        totalReplied={5}
        interviewsCount={2}
      />

      {/* Main Grid: Pending Approvals & Profile Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EmailApprovalUI />
        </div>

        <div className="space-y-6">
          {/* Onboarding Profile Progress */}
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Profile Readiness</h3>
              <Badge variant="aloe">100% Complete</Badge>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
              <div className="bg-brand-aloe h-full rounded-full w-full" />
            </div>
            <p className="text-xs text-neutral-400">
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
              <h3 className="text-sm font-semibold text-white">Priority Sponsors</h3>
              <Link href="/dashboard/companies" className="text-xs text-brand-aloe hover:underline">
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
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-white/5 text-xs"
                >
                  <div>
                    <span className="font-semibold text-white block">{item.name}</span>
                    <span className="text-[11px] text-neutral-400">{item.hook}</span>
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
