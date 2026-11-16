import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  delta?: {
    percentage: number;
    isPositive: boolean;
    periodText: string;
  };
  className?: string;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  delta,
  className,
  badge,
}) => {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-sm p-5 flex flex-col justify-between transition-colors relative overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium tracking-caps uppercase text-text-muted">
          {label}
        </span>
        {badge && (
          <span className="text-[10px] tracking-caps uppercase px-1.5 py-0.5 border border-border text-text-faint rounded-sm">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-1">
        <div className="text-2xl lg:text-3xl font-light tabular-nums text-text font-sans">
          {value}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
          {delta ? (
            <div className="flex items-center space-x-1.5">
              <span
                className={cn(
                  "inline-flex items-center text-[11px] font-medium tabular-nums",
                  delta.isPositive ? "text-olive" : "text-brick"
                )}
              >
                {delta.isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={1.5} />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={1.5} />
                )}
                {delta.percentage > 0 ? `${delta.percentage.toFixed(1)}%` : "0.0%"}
              </span>
              <span className="text-[11px] text-text-faint">{delta.periodText}</span>
            </div>
          ) : (
            subtext && <span className="text-[11px] text-text-faint">{subtext}</span>
          )}
        </div>
      </div>
    </div>
  );
};
