"use client";

import React, { useState } from "react";
import { Download, FileText } from "lucide-react";
import { OnboardingProvider, useOnboarding } from "@/components/onboarding/OnboardingContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";

function TextArea({
  label, hint, placeholder, value, onChange,
}: {
  label: string; hint?: string; placeholder: string; value: string; onChange: (v: string) => void;
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

function Step8Content() {
  const { data, updateField, saveProfile } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const onNext = async () => {
    setIsLoading(true);

    // Merge healthcare positioning into industry array
    const updatedIndustries = data.industries.map((ind) => {
      if (ind === "Healthcare") {
        return {
          industry: ind,
          years_experience: 0,
          experience_description: data.healthcare_experience || null,
          problems_solved: data.healthcare_problems || null,
          motivation: data.healthcare_motivation || null,
        };
      }
      // For fintech (already saved in step 7), preserve existing
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
    if (ok) await saveProfile({ profile_complete_percent: 80 });
    setIsLoading(false);
    return ok;
  };

  return (
    <OnboardingLayout step={8} onNext={onNext} isNextLoading={isLoading} nextLabel="Save & Continue">
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-light text-neutral-900 tracking-tight">Healthcare Positioning</h2>
          <p className="text-sm text-neutral-500">
            Same structure as Fintech — used to write healthcare-targeted emails.
          </p>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-white font-medium text-sm">
              <FileText className="w-4 h-4 text-brand-aloe" />
              Personalization Template (DOCX)
            </div>
            <p className="text-neutral-400 text-xs">Download, fill with AI help, upload back in Step 10</p>
          </div>
          <Button variant="aloe" size="sm" onClick={() => window.open("/api/profile/template", "_blank")} className="gap-1.5 flex-shrink-0">
            <Download className="w-3.5 h-3.5" /> Download
          </Button>
        </div>

        <div className="space-y-4">
          <TextArea
            label="Your healthcare experience"
            hint="Healthtech, NHS, med-tech products you've worked on"
            placeholder="e.g. I designed patient-facing dashboards for an NHS digital health project, working within strict clinical governance requirements..."
            value={data.healthcare_experience}
            onChange={(v) => updateField("healthcare_experience", v)}
          />
          <TextArea
            label="Problems you've solved"
            hint="Clinical workflow improvements, compliance challenges, patient outcomes"
            placeholder="e.g. Redesigned triage workflow reducing A&E administrative time by 18%. Built an accessible medication tracking UI for elderly users with 97% task completion rate..."
            value={data.healthcare_problems}
            onChange={(v) => updateField("healthcare_problems", v)}
          />
          <TextArea
            label="What draws you to healthcare"
            hint="Why do you want to work in health tech?"
            placeholder="e.g. Healthcare is where design can literally save lives. I'm motivated by the opportunity to reduce friction in clinical workflows so clinicians can spend more time with patients..."
            value={data.healthcare_motivation}
            onChange={(v) => updateField("healthcare_motivation", v)}
          />
        </div>

        <p className="text-xs text-neutral-400 text-center">
          Skip and leave blank if Healthcare is not one of your target industries.
        </p>
      </div>
    </OnboardingLayout>
  );
}

export default function OnboardingStep8() {
  return <OnboardingProvider><Step8Content /></OnboardingProvider>;
}
