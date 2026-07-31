import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  goldHeaderBorder?: boolean;
}

export function Card({ className, goldHeaderBorder = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white text-thofnaa-charcoal shadow-card border border-gray-200/80 overflow-hidden transition-all duration-200",
        goldHeaderBorder && "border-t-4 border-t-thofnaa-gold",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-5 border-b border-gray-100 space-y-1.5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-bold text-thofnaa-navy tracking-tight font-serif", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-thofnaa-charcoal-muted leading-relaxed", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between", className)} {...props} />;
}
