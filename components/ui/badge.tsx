import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "aloe" | "pistachio" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default:
      "bg-neutral-100 text-neutral-800 border border-neutral-200 dark:bg-neutral-800/90 dark:text-neutral-200 dark:border-neutral-700",
    success:
      "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    warning:
      "bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    danger:
      "bg-red-50 text-red-800 border border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
    aloe:
      "bg-brand-aloe text-neutral-950 font-medium border border-emerald-300/60 dark:bg-brand-aloe/20 dark:text-[#a8f7c3] dark:border-brand-aloe/40",
    pistachio:
      "bg-brand-pistachio text-neutral-950 font-medium border border-emerald-200/80 dark:bg-brand-pistachio/20 dark:text-[#c1fbd4] dark:border-brand-pistachio/40",
    outline:
      "bg-transparent text-neutral-800 border border-neutral-300 dark:text-neutral-300 dark:border-neutral-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
