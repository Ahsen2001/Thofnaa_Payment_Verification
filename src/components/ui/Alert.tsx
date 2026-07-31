import React from "react";
import { cn } from "@/lib/utils";
import { Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className,
  ...props
}: AlertProps) {
  const configs = {
    info: {
      bg: "bg-blue-50/90",
      border: "border-blue-200",
      titleText: "text-thofnaa-navy font-bold",
      bodyText: "text-blue-900",
      icon: <Info className="w-5 h-5 text-thofnaa-navy shrink-0 mt-0.5" aria-hidden="true" />,
    },
    success: {
      bg: "bg-emerald-50/90",
      border: "border-emerald-300",
      titleText: "text-emerald-950 font-bold",
      bodyText: "text-emerald-900",
      icon: <CheckCircle2 className="w-5 h-5 text-thofnaa-emerald shrink-0 mt-0.5" aria-hidden="true" />,
    },
    warning: {
      bg: "bg-amber-50/90",
      border: "border-amber-300",
      titleText: "text-amber-950 font-bold",
      bodyText: "text-amber-900",
      icon: <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />,
    },
    error: {
      bg: "bg-red-50/90",
      border: "border-red-300",
      titleText: "text-red-950 font-bold",
      bodyText: "text-red-900",
      icon: <XCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />,
    },
  };

  const config = configs[variant];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "rounded-2xl border p-4 shadow-xs flex items-start gap-3 transition-all",
        config.bg,
        config.border,
        className
      )}
      {...props}
    >
      {config.icon}
      <div className="flex-1 space-y-1 text-xs text-left">
        {title && <h5 className={cn("text-xs font-bold tracking-tight uppercase font-mono", config.titleText)}>{title}</h5>}
        <div className={cn("text-xs leading-relaxed font-sans", config.bodyText)}>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss alert"
          className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
