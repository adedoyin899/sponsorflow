"use client";

/**
 * Step 7 — Fintech Positioning
 * + DOCX template download
 */

import React, { useState } from "react";
import { Download, FileText } from "lucide-react";
import { OnboardingProvider, useOnboarding } from "@/components/onboarding/OnboardingContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";

function TextArea({
  label,
  hint,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-neutral-700">{label}</label>
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
      <textarea
        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-aloe resize-none"
        rows={4}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function downloadTemplate() {
  // Generate a simple DOCX-like text file download
  // (Full DOCX generation via the `docx` package is handled server-side in /api/profile/template)
  window.open("/api/profile/template", "_blank");
}

function Step7Content() {
  const { data, updateField, saveProfile } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const onNext = async () => {
    setIsLoading(true);

    // Build full industry array with fintech positioning merged in
    const updatedIndustries = data.industries.map((ind) => {
      if (ind === "Fintech") {
        return {
          industry: ind,
          years_experience: 0,
          experience_description: data.fintech_experience || null,
          problems_solved: data.fintech_problems || null,
          motivation: data.fintech_motivation || null,
        };
      }
      return { industry: ind, years_experience: 0, experience_description: null, problems_solved: null, motivation: null };
    });

    const ok = await saveProfile({ industries: updatedIndustries }, "/api/profile/industries");
    if (ok) await saveProfile({ profile_complete_percent: 70 });
    setIsLoading(false);
    return ok;
  };

  return (
    <OnboardingLayout step={7} onNext={onNext} isNextLoading={isLoading} nextLabel="Save & Continue">
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-light text-neutral-900 tracking-tight">Fintech Positioning</h2>
          <p className="text-sm text-neutral-500">
            This copy is used by Claude AI to write fintech-specific cold emails. Be concrete and specific.
          </p>
        </div>

        {/* Template download CTA */}
        <div className="bg-neutral-900 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-white font-medium text-sm">
              <FileText className="w-4 h-4 text-brand-aloe" />
              Personalization Template (DOCX)
            </div>
            <p className="text-neutral-400 text-xs">
              Download, fill offline with AI help, upload back in Step 10
            </p>
          </div>
          <Button variant="aloe" size="sm" onClick={downloadTemplate} className="gap-1.5 flex-shrink-0">
            <Download className="w-3.5 h-3.5" /> Download
          </Button>
        </div>

        <div className="space-y-4">
          <TextArea
            label="Your fintech experience"
            hint="What fintech products, features, or systems have you worked on?"
            placeholder="e.g. I led the redesign of Monzo's business onboarding flow, serving 200k+ SMEs. I've worked on payment rails UX, KYC flows, and real-time transaction dashboards..."
            value={data.fintech_experience}
            onChange={(v) => updateField("fintech_experience", v)}
          />
          <TextArea
            label="Problems you've solved"
            hint="Concrete challenges + measurable outcomes (include metrics if possible)"
            placeholder="e.g. Reduced business sign-up drop-off by 34% by redesigning the identity verification step. Cut support tickets related to payment failures by 22%..."
            value={data.fintech_problems}
            onChange={(v) => updateField("fintech_problems", v)}
          />
          <TextArea
            label="What draws you to fintech"
            hint="Why do you specifically want to work in fintech?"
            placeholder="e.g. I'm drawn to fintech because financial services affect everyone, yet the UX is often needlessly complex. I believe great design can democratise access to financial tools..."
            value={data.fintech_motivation}
            onChange={(v) => updateField("fintech_motivation", v)}
          />
        </div>

        <p className="text-xs text-neutral-400 text-center">
          Skip and leave blank if Fintech is not one of your target industries.
        </p>
      </div>
    </OnboardingLayout>
  );
}

export default function OnboardingStep7() {
  return <OnboardingProvider><Step7Content /></OnboardingProvider>;
}
