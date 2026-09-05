"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { OnboardingProvider, useOnboarding } from "@/components/onboarding/OnboardingContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

const schema = z.object({
  professional_summary: z.string().min(50, "Please write at least 50 characters — this is your AI's voice"),
  unique_thing: z.string().min(10, "Required — this makes your emails memorable").optional().or(z.literal("")),
  writing_tone: z.enum(["direct", "warm", "formal"]),
});

type FormData = z.infer<typeof schema>;

const TONES = [
  {
    value: "direct" as const,
    label: "Direct",
    desc: "Confident and concise — gets to the point fast. Great for startups and scale-ups.",
  },
  {
    value: "warm" as const,
    label: "Warm",
    desc: "Friendly and human — builds rapport quickly. Great for teams that value culture.",
  },
  {
    value: "formal" as const,
    label: "Formal",
    desc: "Professional and measured — signals gravitas. Great for enterprise and regulated sectors.",
  },
];

function Step9Content() {
  const { data, updateField, saveProfile } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      professional_summary: data.professional_summary,
      unique_thing: data.unique_thing,
      writing_tone: data.writing_tone,
    },
  });

  const toneValue = watch("writing_tone");

  const onNext = async () => {
    return new Promise<boolean>((resolve) => {
      handleSubmit(async (values) => {
        updateField("professional_summary", values.professional_summary);
        updateField("unique_thing", values.unique_thing || "");
        updateField("writing_tone", values.writing_tone);

        setIsLoading(true);
        const ok = await saveProfile({
          professional_summary: values.professional_summary,
          unique_thing: values.unique_thing || null,
          writing_tone: values.writing_tone,
          profile_complete_percent: 90,
        });
        setIsLoading(false);
        resolve(ok);
      }, () => resolve(false))();
    });
  };

  return (
    <OnboardingLayout step={9} onNext={onNext} isNextLoading={isLoading} nextLabel="Save Story">
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-light text-neutral-900 tracking-tight">Your Story</h2>
          <p className="text-sm text-neutral-500">
            This is the voice Claude uses when writing your emails. Be genuine — authenticity converts better than polish.
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">
              Professional summary <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-neutral-400">
              How would you introduce yourself to a hiring manager in 1–2 paragraphs? Avoid clichés — be specific.
            </p>
            <textarea
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-aloe resize-none"
              rows={6}
              placeholder="e.g. I'm a product designer with 7 years building financial services products across Monzo, HSBC, and two early-stage fintechs. I specialise in complex, high-stakes flows — onboarding, KYC, payments — where trust and clarity aren't just nice to have, they're the product..."
              {...register("professional_summary")}
            />
            {errors.professional_summary && (
              <p className="text-xs text-red-500">{errors.professional_summary.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">One thing not on your CV</label>
            <p className="text-xs text-neutral-400">Something memorable that makes you human. Optional but powerful.</p>
            <textarea
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-aloe resize-none"
              rows={2}
              placeholder="e.g. I ran a fintech newsletter for 3,000 readers. Or: I taught myself Figma in 2 weeks to prototype a side project that got 800 Product Hunt upvotes..."
              {...register("unique_thing")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-700">
              Email writing tone <span className="text-red-500">*</span>
            </label>
            <div className="grid gap-2">
              {TONES.map(({ value, label, desc }) => {
                const selected = toneValue === value;
                return (
                  <label
                    key={value}
                    className={`cursor-pointer border rounded-xl p-4 flex items-start gap-3 transition-all ${
                      selected ? "border-black bg-neutral-50" : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value={value}
                      className="sr-only"
                      {...register("writing_tone")}
                      onChange={() => setValue("writing_tone", value)}
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                      selected ? "border-black bg-black" : "border-neutral-300"
                    }`} />
                    <div>
                      <span className="text-sm font-medium text-neutral-900">{label}</span>
                      <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.writing_tone && <p className="text-xs text-red-500">{errors.writing_tone.message}</p>}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}

export default function OnboardingStep9() {
  return <OnboardingProvider><Step9Content /></OnboardingProvider>;
}
