import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-sm bg-card/40 my-4",
        className
      )}
    >
      {icon && <div className="mb-4 text-text-faint">{icon}</div>}
      <h4 className="text-base font-serif font-medium tracking-editorial text-text">
        {title}
      </h4>
      <p className="mt-1 text-xs text-text-muted max-w-sm tracking-wide">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className="mt-5"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
