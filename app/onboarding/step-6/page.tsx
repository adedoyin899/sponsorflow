"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PoundSterling } from "lucide-react";
import { OnboardingProvider, useOnboarding } from "@/components/onboarding/OnboardingContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

const schema = z.object({
  requires_sponsorship: z.enum(["true", "false"], { required_error: "Please select an option" }),
  target_salary_gbp: z.coerce.number().int().min(20000, "Enter a realistic salary").max(500000),
  availability: z.string().min(1, "Please select your availability"),
  remote_preference: z.string().min(1, "Please select your remote preference"),
});

type FormData = z.infer<typeof schema>;

const AVAILABILITY = [
  "Immediately available",
  "Available in 2 weeks",
  "Available in 1 month",
  "Available in 3 months",
  "Open to opportunities only",
];

const REMOTE = [
  "Fully remote preferred",
  "Hybrid (2–3 days office)",
  "On-site preferred",
  "Flexible — no preference",
];

function Step6Content() {
  const { data, updateField, saveProfile } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      requires_sponsorship: data.requires_sponsorship === true ? "true" : data.requires_sponsorship === false ? "false" : undefined,
      target_salary_gbp: data.target_salary_gbp ?? undefined,
      availability: data.availability,
      remote_preference: data.remote_preference,
    },
  });

  const sponsorValue = watch("requires_sponsorship");

  const onNext = async () => {
    return new Promise<boolean>((resolve) => {
      handleSubmit(async (values) => {
        const requires = values.requires_sponsorship === "true";
        updateField("requires_sponsorship", requires);
        updateField("target_salary_gbp", Number(values.target_salary_gbp));
        updateField("availability", values.availability);
        updateField("remote_preference", values.remote_preference);

        setIsLoading(true);
        const ok = await saveProfile({
          requires_sponsorship: requires,
          target_salary_gbp: Number(values.target_salary_gbp),
          availability: values.availability,
          remote_preference: values.remote_preference,
          profile_complete_percent: 60,
        });
        setIsLoading(false);
        resolve(ok);
      }, () => resolve(false))();
    });
  };

  return (
    <OnboardingLayout step={6} onNext={onNext} isNextLoading={isLoading}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-light text-neutral-900 tracking-tight">Sponsorship & Availability</h2>
          <p className="text-sm text-neutral-500">
            This information helps us filter for companies that can sponsor you and craft accurate emails.
          </p>
        </div>

        <div className="space-y-5">
          {/* Sponsorship */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-700">
              Do you require UK Skilled Worker visa sponsorship? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "true", label: "Yes, I need sponsorship", desc: "Requires a licensed UK sponsor" },
                { value: "false", label: "No, I have right to work", desc: "British / EU settled / ILR" },
              ].map(({ value, label, desc }) => {
                const selected = sponsorValue === value;
                return (
                  <label
                    key={value}
                    className={`relative cursor-pointer border rounded-2xl p-4 space-y-1 transition-all ${
                      selected ? "border-black bg-neutral-50" : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <input type="radio" value={value} {...register("requires_sponsorship")} className="sr-only" />
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium text-neutral-900">{label}</span>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                        selected ? "border-black bg-black" : "border-neutral-300"
                      }`} />
                    </div>
                    <p className="text-xs text-neutral-500">{desc}</p>
                  </label>
                );
              })}
            </div>
            {errors.requires_sponsorship && (
              <p className="text-xs text-red-500">{errors.requires_sponsorship.message}</p>
            )}
          </div>

          {/* Salary */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">
              Target annual salary (GBP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="number"
                placeholder="75000"
                className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-aloe focus:border-brand-aloe"
                {...register("target_salary_gbp")}
              />
            </div>
            {errors.target_salary_gbp && (
              <p className="text-xs text-red-500">{errors.target_salary_gbp.message}</p>
            )}
          </div>

          {/* Availability */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">Availability <span className="text-red-500">*</span></label>
            <select
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-aloe"
              {...register("availability")}
            >
              <option value="">Select…</option>
              {AVAILABILITY.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            {errors.availability && <p className="text-xs text-red-500">{errors.availability.message}</p>}
          </div>

          {/* Remote */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">Remote preference <span className="text-red-500">*</span></label>
            <select
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-aloe"
              {...register("remote_preference")}
            >
              <option value="">Select…</option>
              {REMOTE.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.remote_preference && <p className="text-xs text-red-500">{errors.remote_preference.message}</p>}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}

export default function OnboardingStep6() {
  return <OnboardingProvider><Step6Content /></OnboardingProvider>;
}
