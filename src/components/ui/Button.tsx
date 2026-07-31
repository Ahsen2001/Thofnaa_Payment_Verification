import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-thofnaa-navy text-white hover:bg-thofnaa-navy-600 active:bg-thofnaa-navy-800 focus-visible:ring-thofnaa-navy shadow-sm border border-thofnaa-navy-800",
      secondary:
        "bg-thofnaa-gold text-thofnaa-navy font-semibold hover:bg-thofnaa-gold-600 active:bg-thofnaa-gold-700 focus-visible:ring-thofnaa-gold shadow-sm border border-thofnaa-gold-600",
      danger:
        "bg-red-700 text-white hover:bg-red-800 active:bg-red-900 focus-visible:ring-red-700 shadow-sm border border-red-800",
      success:
        "bg-thofnaa-emerald text-white hover:bg-thofnaa-emerald-700 active:bg-thofnaa-emerald-800 focus-visible:ring-thofnaa-emerald shadow-sm",
      outline:
        "bg-white border-2 border-thofnaa-navy text-thofnaa-navy hover:bg-thofnaa-navy hover:text-white focus-visible:ring-thofnaa-navy shadow-xs",
      ghost:
        "bg-transparent text-thofnaa-charcoal hover:bg-thofnaa-navy/10 active:bg-thofnaa-navy/20 focus-visible:ring-thofnaa-navy",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
      md: "px-4 py-2 text-sm gap-2 rounded-xl",
      lg: "px-6 py-3 text-base gap-2.5 rounded-xl font-semibold",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0" aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
