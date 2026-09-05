"use client";

/**
 * OnboardingContext — shared state across all 10 onboarding steps.
 *
 * Stores the in-progress wizard data in memory and provides:
 *  - updateField(key, value) — update a single field
 *  - saveStep(step, data) — POST/PUT to API and advance step
 *  - isSaving / saveStatus — auto-save UX feedback
 */

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Industry {
  industry: string;
  years_experience: number;
  experience_description: string;
  problems_solved: string;
  motivation: string;
}

export interface Project {
  id: string; // local uuid for list management
  project_name: string;
  company_name: string;
  year: number | null;
  description: string;
  role: string;
  industry: string;
  impact: string;
}

export interface Skill {
  skill_name: string;
  skill_category: "design" | "tools" | "other";
}

export interface OnboardingData {
  // Step 2
  first_name: string;
  last_name: string;
  location: string;
  years_experience: number | null;
  target_job_title: string;
  linkedin_url: string;
  portfolio_url: string;
  // Step 3
  current_company: string;
  current_role: string;
  industries: string[]; // selected industry names
  // Step 4
  skills: Skill[];
  // Step 5
  projects: Project[];
  // Step 6
  requires_sponsorship: boolean | null;
  target_salary_gbp: number | null;
  availability: string;
  remote_preference: string;
  // Step 7 — Fintech
  fintech_experience: string;
  fintech_problems: string;
  fintech_motivation: string;
  // Step 8 — Healthcare
  healthcare_experience: string;
  healthcare_problems: string;
  healthcare_motivation: string;
  // Step 9 — Story
  professional_summary: string;
  unique_thing: string;
  writing_tone: "direct" | "warm" | "formal";
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface OnboardingContextValue {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  updateField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  saveStatus: SaveStatus;
  saveProfile: (fields: Partial<Record<string, unknown>>, endpoint?: string) => Promise<boolean>;
}

// ── Defaults ─────────────────────────────────────────────────────────────────

export const defaultData: OnboardingData = {
  first_name: "",
  last_name: "",
  location: "",
  years_experience: null,
  target_job_title: "",
  linkedin_url: "",
  portfolio_url: "",
  current_company: "",
  current_role: "",
  industries: [],
  skills: [],
  projects: [],
  requires_sponsorship: null,
  target_salary_gbp: null,
  availability: "",
  remote_preference: "",
  fintech_experience: "",
  fintech_problems: "",
  fintech_motivation: "",
  healthcare_experience: "",
  healthcare_problems: "",
  healthcare_motivation: "",
  professional_summary: "",
  unique_thing: "",
  writing_tone: "direct",
};

// ── Context ──────────────────────────────────────────────────────────────────

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateField = useCallback(<K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveProfile = useCallback(async (
    fields: Partial<Record<string, unknown>>,
    endpoint = "/api/profile"
  ): Promise<boolean> => {
    setSaveStatus("saving");
    try {
      const method = endpoint === "/api/profile" ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      setSaveStatus("saved");
      // Reset to idle after 2.5s
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaveStatus("idle"), 2500);
      return true;
    } catch {
      setSaveStatus("error");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaveStatus("idle"), 3000);
      return false;
    }
  }, []);

  return (
    <OnboardingContext.Provider value={{ data, setData, updateField, saveStatus, saveProfile }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside <OnboardingProvider>");
  return ctx;
}
