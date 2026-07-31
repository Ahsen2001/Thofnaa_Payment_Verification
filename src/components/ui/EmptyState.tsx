import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-300 space-y-3", className)}>
      <div className="w-12 h-12 rounded-full bg-thofnaa-navy/5 flex items-center justify-center text-thofnaa-navy">
        {icon || <FolderOpen className="w-6 h-6 text-thofnaa-charcoal-muted" />}
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-semibold text-thofnaa-navy font-serif">{title}</h4>
        {description && <p className="text-xs text-thofnaa-charcoal-muted leading-relaxed">{description}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
