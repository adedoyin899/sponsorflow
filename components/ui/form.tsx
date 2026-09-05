"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  error?: string | null;
  success?: string | null;
}

export function Form({ className, error, success, children, ...props }: FormProps) {
  return (
    <form className={cn("space-y-4", className)} {...props}>
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          {success}
        </div>
      )}
      {children}
    </form>
  );
}

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function FormGroup({
  className,
  label,
  error,
  hint,
  required,
  children,
  ...props
}: FormGroupProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {label && (
        <label className="block text-xs font-medium text-neutral-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
