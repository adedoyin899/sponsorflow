import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, CheckCircle2, FileText } from "lucide-react";

export default function ProfilePositioningPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-light text-neutral-950 dark:text-white tracking-tight">Profile & Positioning</h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Define your core narrative and sector positioning for Claude AI cold email drafts.
          </p>
        </div>
        <Button variant="secondary" size="sm">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Download DOCX Template
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Basic Info */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-white/5">
            <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">Basic Information & Visa Status</h2>
            <Badge variant="aloe">UK Skilled Worker Required</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Target Role" defaultValue="Lead Product Designer / Senior UX" />
            <Input label="Target Salary (GBP)" defaultValue="£85,000" />
            <Input label="Location Preference" defaultValue="London / Hybrid" />
            <Input label="Years Experience" defaultValue="6+ Years" />
            <Input label="LinkedIn URL" defaultValue="https://linkedin.com/in/doyin" />
            <Input label="Portfolio Website" defaultValue="https://doyindesign.com" />
          </div>
        </Card>

        {/* Fintech Positioning */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-white/5">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">Fintech Positioning Angle</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Used when drafting to banks, payments, and embedded finance companies.</p>
            </div>
            <Badge variant="aloe">Active</Badge>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Key Fintech Achievement</label>
              <textarea
                rows={3}
                defaultValue="Redesigned high-friction multi-step KYC onboarding flow resulting in 40% reduction in customer drop-off and full regulatory compliance."
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl p-3 text-xs text-neutral-900 dark:text-white focus:border-brand-aloe/80 focus:outline-none shadow-sm leading-relaxed"
              />
            </div>
          </div>
        </Card>

        {/* Healthcare Positioning */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-white/5">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">Healthcare & MedTech Positioning Angle</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Used when reaching healthtech and clinical workflow sponsors.</p>
            </div>
            <Badge variant="outline">Configured</Badge>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Key Healthcare Achievement</label>
              <textarea
                rows={3}
                defaultValue="Designed clinician-facing telemetry dashboard reducing error rates in triage and improving patient admission turnaround times."
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl p-3 text-xs text-neutral-900 dark:text-white focus:border-brand-aloe/80 focus:outline-none shadow-sm leading-relaxed"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="aloe" size="md">
          Save Positioning Profile
        </Button>
      </div>
    </div>
  );
}
