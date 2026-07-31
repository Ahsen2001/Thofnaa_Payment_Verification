import React from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormErrorProps {
  title?: string;
  message?: string | null;
  className?: string;
}

export function FormError({ title = "Form Submission Error", message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className={cn("rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-red-900 shadow-xs", className)}>
      <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div className="space-y-1 text-left">
        {title && <h5 className="text-xs font-bold uppercase tracking-wider text-red-800">{title}</h5>}
        <p className="text-xs text-red-700 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
