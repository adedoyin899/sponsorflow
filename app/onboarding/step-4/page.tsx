"use client";

import React, { useState } from "react";
import { OnboardingProvider, useOnboarding, Skill } from "@/components/onboarding/OnboardingContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";

const DESIGN_SKILLS = [
  "User Research", "Wireframing", "Prototyping", "Interaction Design",
  "Visual Design", "Design Systems", "Service Design", "UX Writing",
  "Information Architecture", "Accessibility", "Motion Design", "Brand Design",
];

const TOOL_SKILLS = [
  "Figma", "Sketch", "Adobe XD", "InVision", "Zeplin",
  "Miro", "FigJam", "Framer", "Webflow", "Notion",
  "Jira", "Confluence", "Hotjar", "Mixpanel", "Maze",
];

function SkillChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
        selected
          ? "bg-black border-black text-white"
          : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400"
      }`}
    >
      {label}
    </button>
  );
}

function Step4Content() {
  const { data, updateField, saveProfile } = useOnboarding();
  const [otherSkills, setOtherSkills] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleSkill = (name: string, category: "design" | "tools") => {
    const current = data.skills;
    const exists = current.find((s) => s.skill_name === name);
    const next: Skill[] = exists
      ? current.filter((s) => s.skill_name !== name)
      : [...current, { skill_name: name, skill_category: category }];
    updateField("skills", next);
    setError("");
  };

  const isSelected = (name: string) => data.skills.some((s) => s.skill_name === name);

  const onNext = async () => {
    const designSkills = data.skills.filter((s) => s.skill_category === "design");
    if (designSkills.length < 1) {
      setError("Please select at least 1 design skill");
      return false;
    }

    // Merge other/custom skills
    const allSkills: Skill[] = [...data.skills];
    if (otherSkills.trim()) {
      otherSkills.split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => {
        if (!allSkills.find((sk) => sk.skill_name === s)) {
          allSkills.push({ skill_name: s, skill_category: "other" });
        }
      });
      updateField("skills", allSkills);
    }

    setIsLoading(true);
    const ok = await saveProfile({ skills: allSkills }, "/api/profile/skills");
    if (ok) await saveProfile({ profile_complete_percent: 40 });
    setIsLoading(false);
    return ok;
  };

  return (
    <OnboardingLayout step={4} onNext={onNext} isNextLoading={isLoading}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-light text-neutral-900 tracking-tight">Skills</h2>
          <p className="text-sm text-neutral-500">Select your key skills — these appear in your cold emails as credibility signals.</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              Design Skills <span className="text-neutral-400 font-normal">(select your strengths)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DESIGN_SKILLS.map((s) => (
                <SkillChip key={s} label={s} selected={isSelected(s)} onClick={() => toggleSkill(s, "design")} />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              Tools <span className="text-neutral-400 font-normal">(select tools you&apos;re proficient in)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TOOL_SKILLS.map((s) => (
                <SkillChip key={s} label={s} selected={isSelected(s)} onClick={() => toggleSkill(s, "tools")} />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">Other skills (comma-separated)</label>
            <Input
              placeholder="e.g. Design Ops, Agile, B2B SaaS, Fintech"
              value={otherSkills}
              onChange={(e) => setOtherSkills(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-500">
            {data.skills.length} skills selected
            {data.skills.length > 0 && ": "}
            {data.skills.slice(0, 5).map((s) => s.skill_name).join(", ")}
            {data.skills.length > 5 && ` +${data.skills.length - 5} more`}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}

export default function OnboardingStep4() {
  return <OnboardingProvider><Step4Content /></OnboardingProvider>;
}
