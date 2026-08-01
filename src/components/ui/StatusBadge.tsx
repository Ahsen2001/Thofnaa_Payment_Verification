import React from "react";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export type PaymentStatus = "PENDING" | "VERIFIED" | "REJECTED" | "CLARIFICATION_NEEDED";

export interface StatusBadgeProps {
  status: PaymentStatus | string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({ status, label, size = "md", className }: StatusBadgeProps) {
  const normalizedStatus = (status || "PENDING").toUpperCase();

  const configs: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    PENDING: {
      label: "Pending Verification",
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-300",
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    },
    VERIFIED: {
      label: "Verified & Approved",
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-300",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-thofnaa-emerald" />,
    },
    REJECTED: {
      label: "Rejected",
      bg: "bg-red-50",
      text: "text-red-800",
      border: "border-red-300",
      icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
    },
    CLARIFICATION_NEEDED: {
      label: "Clarification Needed",
      bg: "bg-orange-50",
      text: "text-orange-800",
      border: "border-orange-300",
      icon: <AlertCircle className="w-3.5 h-3.5 text-orange-600" />,
    },
  };

  const config = configs[normalizedStatus] || configs.PENDING;

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-xs font-semibold gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-semibold gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium shadow-xs",
        config.bg,
        config.text,
        config.border,
        sizeStyles[size],
        className
      )}
    >
      {config.icon}
      <span>{label || config.label}</span>
    </span>
  );
}
