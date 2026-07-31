import React from "react";
import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, badgeText = "THOFNAA Portal", action, className }: PageHeaderProps) {
  return (
    <div className={cn("bg-thofnaa-navy text-white rounded-2xl p-6 md:p-8 shadow-academic gold-border-top relative overflow-hidden mb-8", className)}>
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-6 translate-y-6">
        <GraduationCap className="w-48 h-48 text-white" />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          {badgeText && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-thofnaa-gold/20 text-thofnaa-gold border border-thofnaa-gold/30">
              {badgeText}
            </span>
          )}
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-thofnaa-ivory/80 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
