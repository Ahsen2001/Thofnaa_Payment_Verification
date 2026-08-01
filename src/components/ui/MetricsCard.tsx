import React from "react";
import { cn } from "@/lib/utils";

export interface MetricsCardProps {
  label?: string;
  title?: string;
  value: string | number;
  subtitle?: string;
  changeText?: string;
  changeType?: "positive" | "negative" | "warning" | "neutral";
  icon: React.ReactNode;
  variant?: "navy" | "emerald" | "amber" | "orange" | "purple";
  className?: string;
}

export function MetricsCard({
  label,
  title,
  value,
  subtitle,
  changeText,
  changeType,
  icon,
  variant,
  className,
}: MetricsCardProps) {
  const displayLabel = title || label || "";
  const displaySubtitle = changeText || subtitle || "";

  let resolvedVariant = variant || "navy";
  if (!variant && changeType) {
    if (changeType === "positive") resolvedVariant = "emerald";
    if (changeType === "warning") resolvedVariant = "amber";
    if (changeType === "negative") resolvedVariant = "orange";
  }
  const borderVariants = {
    navy: "border-l-4 border-l-thofnaa-navy",
    emerald: "border-l-4 border-l-thofnaa-emerald",
    amber: "border-l-4 border-l-amber-500",
    orange: "border-l-4 border-l-orange-500",
    purple: "border-l-4 border-l-purple-600",
  };

  const iconVariants = {
    navy: "bg-thofnaa-navy/10 text-thofnaa-navy",
    emerald: "bg-thofnaa-emerald/10 text-thofnaa-emerald",
    amber: "bg-amber-500/10 text-amber-600",
    orange: "bg-orange-500/10 text-orange-600",
    purple: "bg-purple-600/10 text-purple-600",
  };

  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-5 border border-gray-200/80 shadow-academic-subtle flex items-center justify-between transition-all duration-200 hover:shadow-md",
        borderVariants[resolvedVariant],
        className
      )}
    >
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-thofnaa-charcoal-muted font-mono block">
          {displayLabel}
        </span>
        <div className="text-2xl font-extrabold text-thofnaa-navy tracking-tight font-mono">
          {value}
        </div>
        {displaySubtitle && (
          <p className="text-[11px] text-thofnaa-charcoal-muted font-medium">
            {displaySubtitle}
          </p>
        )}
      </div>

      <div
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs",
          iconVariants[resolvedVariant]
        )}
      >
        {icon}
      </div>
    </div>
  );
}
