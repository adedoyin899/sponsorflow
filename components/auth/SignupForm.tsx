"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    passwordConfirm: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(
    searchParams.get("error") || null
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Clear error from URL after displaying it
  useEffect(() => {
    if (searchParams.get("error")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (values: SignupFormData) => {
    setServerError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      setUserEmail(values.email);
      setIsSuccess(true);
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred");
    }
  };

  const handleGoogleSignup = () => {
    // Redirect to our initiation route which builds the CSRF-safe OAuth URL
    window.location.href = "/api/auth/google";
  };

  if (isSuccess) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-12 h-12 bg-brand-aloe/20 text-brand-aloe rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold text-white">Check your email</h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
          We sent a verification link to <span className="text-white font-medium">{userEmail}</span>.
          Click the link to verify your email and begin onboarding.
        </p>
        <div className="pt-4">
          <Link href="/login">
            <Button variant="aloe" size="md">
              Proceed to Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {serverError}
        </div>
      )}

      <Input
        label="Work or Personal Email"
        type="email"
        placeholder="doyin@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Min 8 characters"
        error={errors.password?.message}
        {...register("password")}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Re-enter password"
        error={errors.passwordConfirm?.message}
        {...register("passwordConfirm")}
      />

      <Button
        type="submit"
        variant="aloe"
        size="lg"
        className="w-full mt-2"
        isLoading={isSubmitting}
      >
        Create Account <ArrowRight className="w-4 h-4 ml-1.5" />
      </Button>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-800" />
        </div>
        <span className="relative bg-black px-4 text-xs uppercase tracking-wider text-neutral-500">
          Or continue with
        </span>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={handleGoogleSignup}
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Sign in with Google
      </Button>
    </form>
  );
}
