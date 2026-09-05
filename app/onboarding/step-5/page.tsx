"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { OnboardingProvider, useOnboarding, Project } from "@/components/onboarding/OnboardingContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const INDUSTRIES = [
  "Fintech", "Healthcare", "SaaS", "E-commerce", "Marketplace",
  "EdTech", "B2B Enterprise", "Consumer", "Media", "Other",
];

function emptyProject(): Project {
  return {
    id: Math.random().toString(36).slice(2),
    project_name: "",
    company_name: "",
    year: new Date().getFullYear(),
    description: "",
    role: "",
    industry: "",
    impact: "",
  };
}

function ProjectCard({
  project,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  project: Project;
  index: number;
  onChange: (field: keyof Project, value: string | number | null) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Project {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-neutral-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <Input
        label="Project Name *"
        placeholder="e.g. Monzo Business Onboarding Redesign"
        value={project.project_name}
        onChange={(e) => onChange("project_name", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Company / Client"
          placeholder="e.g. Monzo"
          value={project.company_name || ""}
          onChange={(e) => onChange("company_name", e.target.value)}
        />
        <Input
          label="Year"
          type="number"
          placeholder="2024"
          value={project.year || ""}
          onChange={(e) => onChange("year", parseInt(e.target.value) || null)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Your Role"
          placeholder="e.g. Lead Designer"
          value={project.role || ""}
          onChange={(e) => onChange("role", e.target.value)}
        />
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-700">Industry</label>
          <select
            className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-aloe"
            value={project.industry || ""}
            onChange={(e) => onChange("industry", e.target.value)}
          >
            <option value="">Select…</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-neutral-700">Description</label>
        <textarea
          className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-aloe resize-none"
          rows={2}
          placeholder="What did you design? What was the brief?"
          value={project.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-neutral-700">
          Impact / Result <span className="text-neutral-400 text-xs font-normal">(include metrics if possible)</span>
        </label>
        <textarea
          className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-aloe resize-none"
          rows={2}
          placeholder="e.g. Reduced onboarding drop-off by 34%, shipped in 6 weeks"
          value={project.impact || ""}
          onChange={(e) => onChange("impact", e.target.value)}
        />
      </div>
    </div>
  );
}

function Step5Content() {
  const { data, updateField, saveProfile } = useOnboarding();
  const [projects, setProjects] = useState<Project[]>(
    data.projects.length > 0 ? data.projects : [emptyProject()]
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateProject = (id: string, field: keyof Project, value: string | number | null) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
    setError("");
  };

  const addProject = () => {
    if (projects.length < 6) setProjects((prev) => [...prev, emptyProject()]);
  };

  const removeProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const onNext = async () => {
    const valid = projects.filter((p) => p.project_name.trim());
    if (valid.length === 0) {
      setError("Please add at least 1 project");
      return false;
    }
    updateField("projects", valid);
    setIsLoading(true);
    const ok = await saveProfile({ projects: valid }, "/api/profile/projects");
    if (ok) await saveProfile({ profile_complete_percent: 50 });
    setIsLoading(false);
    return ok;
  };

  return (
    <OnboardingLayout step={5} onNext={onNext} isNextLoading={isLoading} nextLabel="Save Projects">
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-light text-neutral-900 tracking-tight">Key Projects</h2>
          <p className="text-sm text-neutral-500">
            Add 3–5 projects that best showcase your skills. These are referenced when generating personalised emails.
          </p>
        </div>

        <div className="space-y-4">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onChange={(field, value) => updateProject(project.id, field, value)}
              onRemove={() => removeProject(project.id)}
              canRemove={projects.length > 1}
            />
          ))}

          {projects.length < 6 && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={addProject}
              className="w-full gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Add Another Project
            </Button>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </OnboardingLayout>
  );
}

export default function OnboardingStep5() {
  return <OnboardingProvider><Step5Content /></OnboardingProvider>;
}
