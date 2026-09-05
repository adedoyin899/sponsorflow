"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, User, Briefcase, Zap, FolderOpen, Shield, Sparkles } from "lucide-react";
import { OnboardingProvider, useOnboarding } from "@/components/onboarding/OnboardingContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";

function ReviewSection({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ElementType;
  title: string;
  items: Array<{ label: string; value: string | null | undefined }>;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
        <Icon className="w-4 h-4 text-brand-aloe" />
        {title}
      </div>
      <div className="space-y-2">
        {items.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-4 text-xs">
            <span className="text-neutral-500 flex-shrink-0">{label}</span>
            <span className="text-neutral-900 font-medium text-right">{value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step10Content() {
  const router = useRouter();
  const { data, saveProfile } = useOnboarding();
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    setIsCompleting(true);
    setError("");

    const ok = await saveProfile({
      onboarding_complete: true,
      profile_complete_percent: 100,
    });

    if (!ok) {
      setError("Failed to complete setup. Please try again.");
      setIsCompleting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <OnboardingLayout step={10} hideNext hideBack={false}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-light text-neutral-900 tracking-tight">Review & Complete</h2>
          <p className="text-sm text-neutral-500">
            Everything looks good! Review your profile and complete setup when ready.
          </p>
        </div>

        {/* Summary cards */}
        <div className="space-y-3">
          <ReviewSection
            icon={User}
            title="Basic Info"
            items={[
              { label: "Name", value: `${data.first_name} ${data.last_name}`.trim() || undefined },
              { label: "Location", value: data.location },
              { label: "Experience", value: data.years_experience ? `${data.years_experience}+ years` : undefined },
              { label: "Target Role", value: data.target_job_title },
              { label: "LinkedIn", value: data.linkedin_url },
            ]}
          />

          <ReviewSection
            icon={Briefcase}
            title="Background"
            items={[
              { label: "Current Company", value: data.current_company },
              { label: "Industries", value: data.industries.join(", ") || undefined },
            ]}
          />

          <ReviewSection
            icon={Zap}
            title="Skills"
            items={[
              { label: "Design", value: data.skills.filter((s) => s.skill_category === "design").map((s) => s.skill_name).join(", ") || undefined },
              { label: "Tools", value: data.skills.filter((s) => s.skill_category === "tools").map((s) => s.skill_name).join(", ") || undefined },
            ]}
          />

          <ReviewSection
            icon={FolderOpen}
            title="Projects"
            items={
              data.projects.length > 0
                ? data.projects.map((p) => ({ label: p.project_name, value: `${p.company_name || ""}${p.year ? ` · ${p.year}` : ""}` }))
                : [{ label: "Projects", value: "None added" }]
            }
          />

          <ReviewSection
            icon={Shield}
            title="Sponsorship"
            items={[
              { label: "Needs sponsorship", value: data.requires_sponsorship === true ? "Yes" : data.requires_sponsorship === false ? "No" : undefined },
              { label: "Target salary", value: data.target_salary_gbp ? `£${data.target_salary_gbp.toLocaleString()}` : undefined },
              { label: "Availability", value: data.availability },
              { label: "Remote", value: data.remote_preference },
            ]}
          />

          <ReviewSection
            icon={Sparkles}
            title="Story & Tone"
            items={[
              { label: "Summary", value: data.professional_summary ? `${data.professional_summary.slice(0, 100)}…` : undefined },
              { label: "Writing tone", value: data.writing_tone ? data.writing_tone.charAt(0).toUpperCase() + data.writing_tone.slice(1) : undefined },
            ]}
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">{error}</div>
        )}

        {/* Complete CTA */}
        <div className="bg-black rounded-2xl p-6 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-aloe/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-brand-aloe" />
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium">Profile complete — ready to start outreach</p>
            <p className="text-neutral-400 text-xs">
              You can always edit your profile from the dashboard
            </p>
          </div>
          <Button
            id="onboarding-complete-btn"
            variant="aloe"
            size="lg"
            onClick={handleComplete}
            isLoading={isCompleting}
            className="w-full"
          >
            Complete Setup & Go to Dashboard
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}

export default function OnboardingStep10() {
  return <OnboardingProvider><Step10Content /></OnboardingProvider>;
}
