import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, hint, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-neutral-800 dark:text-neutral-200">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "w-full rounded-xl bg-white text-neutral-900 border border-neutral-300 px-4 py-2.5 text-sm placeholder:text-neutral-400 transition-all duration-200 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950/20 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-neutral-900/90 dark:text-white dark:border-neutral-800 dark:placeholder:text-neutral-500 dark:focus:border-brand-aloe/50 dark:focus:ring-brand-aloe/50",
            error && "border-red-500/80 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>}
        {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
