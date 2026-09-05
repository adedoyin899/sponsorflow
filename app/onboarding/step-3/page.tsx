"use client";

import React, { useState } from "react";
import { OnboardingProvider, useOnboarding } from "@/components/onboarding/OnboardingContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";

const INDUSTRIES = [
  "Fintech", "Healthcare", "SaaS", "E-commerce", "Marketplace",
  "EdTech", "PropTech", "InsurTech", "LegalTech", "GovTech",
  "B2B Enterprise", "Consumer", "Media & Entertainment", "Logistics",
];

function Step3Content() {
  const { data, updateField, saveProfile } = useOnboarding();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleIndustry = (ind: string) => {
    const current = data.industries;
    const next = current.includes(ind)
      ? current.filter((i) => i !== ind)
      : [...current, ind];
    updateField("industries", next);
    setError("");
  };

  const onNext = async () => {
    if (data.industries.length === 0) {
      setError("Please select at least one industry");
      return false;
    }
    setIsLoading(true);

    // Save basic background fields
    const profileOk = await saveProfile({
      current_company: data.current_company || null,
      current_role: data.current_role || null,
      profile_complete_percent: 30,
    });

    // Save selected industries as background industries (basic, no positioning yet)
    if (profileOk) {
      const industryPayload = data.industries.map((ind) => ({
        industry: ind,
        years_experience: 0,
        experience_description: null,
        problems_solved: null,
        motivation: null,
      }));
      await saveProfile({ industries: industryPayload }, "/api/profile/industries");
    }

    setIsLoading(false);
    return profileOk;
  };

  return (
    <OnboardingLayout step={3} onNext={onNext} isNextLoading={isLoading}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-light text-neutral-900 tracking-tight">Professional Background</h2>
          <p className="text-sm text-neutral-500">Tell us about your current role and the industries you&apos;ve worked in.</p>
        </div>

        <div className="space-y-4">
          <Input
            label="Current Company (optional)"
            placeholder="e.g. Monzo, HSBC, NHS"
            value={data.current_company}
            onChange={(e) => updateField("current_company", e.target.value)}
          />
          <Input
            label="Current Role (optional)"
            placeholder="e.g. Senior Product Designer"
            value={data.current_role}
            onChange={(e) => updateField("current_role", e.target.value)}
          />

          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-700">
              Industries you&apos;ve worked in <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-neutral-400">Select all that apply — these shape your positioning copy.</p>
            <div className="grid grid-cols-2 gap-2">
              {INDUSTRIES.map((ind) => {
                const selected = data.industries.includes(ind);
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => toggleIndustry(ind)}
                    className={`
                      text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all
                      ${selected
                        ? "bg-black border-black text-white"
                        : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400"
                      }
                    `}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}

export default function OnboardingStep3() {
  return <OnboardingProvider><Step3Content /></OnboardingProvider>;
}
