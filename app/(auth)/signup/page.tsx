import React from "react";
import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-aloe/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-aloe flex items-center justify-center text-black font-bold text-sm">
              S
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">SponsorFlow</span>
          </Link>
          <h1 className="text-2xl font-light text-white tracking-tight">Create your account</h1>
          <p className="text-xs text-neutral-400">
            Set up your profile and start acquiring UK sponsor interviews
          </p>
        </div>

        <Card variant="glass" className="p-8">
          <SignupForm />
        </Card>

        <p className="text-center text-xs text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
