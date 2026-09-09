import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "dark" | "light" | "aloe" | "pistachio";
}

export function Card({ className, variant = "glass", children, ...props }: CardProps) {
  const variantStyles = {
    // Level 3 Elevation (stacked paper halo shadow) on light canvas; Level 1 sheen on dark
    glass:
      "bg-white dark:bg-[#12181b]/80 text-neutral-900 dark:text-white border border-neutral-200/80 dark:border-white/10 rounded-2xl shadow-paper dark:shadow-elevated transition-all duration-200",
    dark:
      "bg-neutral-950 text-white border border-neutral-850 rounded-2xl shadow-elevated",
    light:
      "bg-white text-neutral-950 border border-neutral-200/80 rounded-2xl shadow-paper",
    aloe:
      "bg-brand-aloe text-neutral-950 border border-emerald-300/60 rounded-2xl shadow-sm",
    pistachio:
      "bg-brand-pistachio text-neutral-950 border border-emerald-200/80 rounded-2xl shadow-sm",
  };

  return (
    <div className={cn(variantStyles[variant], "p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-1.5 pb-4 border-b border-neutral-200/70 dark:border-white/5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base sm:text-lg font-medium text-neutral-900 dark:text-white tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-4", className)} {...props}>
      {children}
    </div>
  );
}
