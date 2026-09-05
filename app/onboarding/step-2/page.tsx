"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { OnboardingProvider, useOnboarding } from "@/components/onboarding/OnboardingContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  location: z.string().min(1, "Location is required"),
  years_experience: z.coerce.number().int().min(0).max(50),
  target_job_title: z.string().min(1, "Target job title is required"),
  linkedin_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  portfolio_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

const LOCATIONS = [
  "London, UK", "Manchester, UK", "Birmingham, UK", "Bristol, UK",
  "Leeds, UK", "Edinburgh, UK", "Glasgow, UK", "Liverpool, UK",
  "Sheffield, UK", "Cardiff, UK", "Other UK City", "Outside UK",
];

const JOB_TITLES = [
  "Product Designer", "Senior Product Designer", "Lead Product Designer",
  "UX Designer", "Senior UX Designer", "UI/UX Designer",
  "Head of Design", "Design Director", "Principal Designer",
  "UX Researcher", "Interaction Designer", "Service Designer",
  "Product Manager", "Senior Product Manager", "Engineering Manager",
  "Software Engineer", "Senior Software Engineer", "Other",
];

function Step2Content() {
  const { data, setData, saveProfile } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: data.first_name,
      last_name: data.last_name,
      location: data.location,
      years_experience: data.years_experience ?? undefined,
      target_job_title: data.target_job_title,
      linkedin_url: data.linkedin_url,
      portfolio_url: data.portfolio_url,
    },
  });

  const onNext = async () => {
    return new Promise<boolean>((resolve) => {
      handleSubmit(async (values) => {
        setIsLoading(true);
        setData((prev) => ({ ...prev, ...values, years_experience: Number(values.years_experience) }));
        const ok = await saveProfile({
          first_name: values.first_name,
          last_name: values.last_name,
          location: values.location,
          years_experience: Number(values.years_experience),
          target_job_title: values.target_job_title,
          linkedin_url: values.linkedin_url || null,
          portfolio_url: values.portfolio_url || null,
          profile_complete_percent: 20,
        });
        setIsLoading(false);
        resolve(ok);
      }, () => resolve(false))();
    });
  };

  return (
    <OnboardingLayout step={2} onNext={onNext} isNextLoading={isLoading}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-light text-neutral-900 tracking-tight">Basic Info</h2>
          <p className="text-sm text-neutral-500">Tell us a bit about yourself so we can personalise your outreach.</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" placeholder="Doyin" error={errors.first_name?.message} {...register("first_name")} />
            <Input label="Last Name" placeholder="Adedoyin" error={errors.last_name?.message} {...register("last_name")} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">Location</label>
            <select
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-aloe focus:border-brand-aloe"
              {...register("location")}
            >
              <option value="">Select city…</option>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">Years of Experience</label>
            <select
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-aloe focus:border-brand-aloe"
              {...register("years_experience")}
            >
              <option value="">Select…</option>
              {[1,2,3,4,5,6,7,8,9,10,12,15,20].map((y) => (
                <option key={y} value={y}>{y}+ years</option>
              ))}
            </select>
            {errors.years_experience && <p className="text-xs text-red-500">{errors.years_experience.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">Target Job Title</label>
            <select
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-aloe focus:border-brand-aloe"
              {...register("target_job_title")}
            >
              <option value="">Select role…</option>
              {JOB_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.target_job_title && <p className="text-xs text-red-500">{errors.target_job_title.message}</p>}
          </div>

          <Input
            label="LinkedIn URL (optional)"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            error={errors.linkedin_url?.message}
            {...register("linkedin_url")}
          />
          <Input
            label="Portfolio / Website URL (optional)"
            type="url"
            placeholder="https://yourportfolio.com"
            error={errors.portfolio_url?.message}
            {...register("portfolio_url")}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
}

export default function OnboardingStep2() {
  return <OnboardingProvider><Step2Content /></OnboardingProvider>;
}
