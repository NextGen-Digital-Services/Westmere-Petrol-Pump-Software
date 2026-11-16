import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "olive" | "brass" | "brick" | "neutral" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  children,
  ...props
}) => {
  const variantStyles = {
    olive: "bg-olive/15 text-olive border-olive/30",
    brass: "bg-brass/15 text-brass border-brass/30",
    brick: "bg-brick/15 text-brick border-brick/30",
    neutral: "bg-card-subtle text-text-muted border-border",
    outline: "bg-transparent text-text-muted border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-caps uppercase border rounded-sm",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
