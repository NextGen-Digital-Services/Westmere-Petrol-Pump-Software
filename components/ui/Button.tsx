import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", icon, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-40 disabled:cursor-not-allowed select-none";

    const variantStyles = {
      primary: "bg-accent text-bg hover:opacity-90 active:scale-[0.99]",
      secondary: "bg-card-subtle text-text hover:bg-border active:scale-[0.99]",
      outline: "border border-border bg-transparent text-text hover:bg-card-subtle active:scale-[0.99]",
      danger: "bg-danger text-ivory hover:opacity-90 active:scale-[0.99]",
      ghost: "bg-transparent text-text-muted hover:text-text hover:bg-card-subtle",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs tracking-wide",
      md: "h-10 px-4 text-sm tracking-wide",
      lg: "h-12 px-6 text-base tracking-wide",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {icon && <span className="mr-2 inline-flex items-center">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
