import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "aloe" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-pill";

    const variantStyles = {
      // Shopify Dual-Track: Black pill on light canvas, white pill on dark canvas
      primary:
        "bg-neutral-950 text-white hover:bg-neutral-800 focus:ring-neutral-950 dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:focus:ring-white shadow-sm active:scale-[0.99]",
      secondary:
        "bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 focus:ring-neutral-400 dark:bg-neutral-900 dark:text-white dark:border-neutral-800 dark:hover:bg-neutral-800/90 dark:focus:ring-neutral-600 shadow-sm",
      outline:
        "bg-transparent text-neutral-950 border border-neutral-900 hover:bg-neutral-100/80 focus:ring-neutral-900 dark:text-white dark:border-white/30 dark:hover:bg-white/10 dark:focus:ring-white",
      ghost:
        "bg-transparent text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 focus:ring-neutral-400 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 dark:focus:ring-neutral-600",
      aloe:
        "bg-brand-aloe text-black font-semibold hover:bg-[#a8f7c3] border border-emerald-300/40 focus:ring-brand-aloe shadow-sm active:scale-[0.99]",
      danger:
        "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 focus:ring-red-500 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30 dark:hover:bg-red-500/25",
    };

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5 min-h-[32px]",
      md: "text-sm px-5 py-2.5 gap-2 min-h-[40px]",
      lg: "text-base px-7 py-3.5 gap-2.5 min-h-[48px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
