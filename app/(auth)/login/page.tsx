import React, { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Log In — SponsorFlow",
  description: "Sign in to your SponsorFlow account to manage your outreach campaigns.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-aloe flex items-center justify-center text-black font-bold text-sm">
              S
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">SponsorFlow</span>
          </Link>
          <h1 className="text-2xl font-light text-white tracking-tight">Welcome back</h1>
          <p className="text-xs text-neutral-400">
            Log in to manage your outreach campaigns and replies
          </p>
        </div>

        <Card variant="glass" className="p-8">
          {/* LoginForm uses useSearchParams — must be wrapped in Suspense */}
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-neutral-900" />}>
            <LoginForm />
          </Suspense>
        </Card>

        <p className="text-center text-xs text-neutral-500">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="text-white hover:underline font-medium">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
