import React from "react";
import { Loader2, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  className?: string;
  fullPage?: boolean;
}

export function LoadingState({ message = "Loading THOFNAA verification portal...", className, fullPage = false }: LoadingStateProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center space-y-4", className)}>
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-thofnaa-navy/10 flex items-center justify-center animate-pulse">
          <GraduationCap className="w-8 h-8 text-thofnaa-navy" />
        </div>
        <Loader2 className="w-16 h-16 animate-spin text-thofnaa-gold absolute -inset-1" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-thofnaa-navy tracking-wide">{message}</p>
        <p className="text-xs text-thofnaa-charcoal-muted">THOFNAA INSTITUTE • Educational Verification</p>
      </div>
    </div>
  );

  if (fullPage) {
    return <div className="min-h-[60vh] flex items-center justify-center">{content}</div>;
  }

  return content;
}
