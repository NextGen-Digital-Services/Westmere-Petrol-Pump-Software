import React from "react";
import { BRAND_COLORS } from "@/lib/theme";

interface EmptyStateProps {
  className?: string;
  size?: number;
  title?: string;
  subtitle?: string;
}

export function EmptyStateIllustration({
  className = "",
  size = 120,
  title = "No records found",
  subtitle = "Items will appear here once recorded.",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 text-center ${className}`}>
      <svg
        width={size}
        height={size * 0.8}
        viewBox="0 0 120 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-3"
      >
        <circle cx="60" cy="48" r="42" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
        {/* Soft floating box */}
        <rect x="36" y="28" width="48" height="38" rx="6" fill="#EEF2FB" stroke={BRAND_COLORS.ioclBlue} strokeWidth="2" />
        <line x1="44" y1="38" x2="76" y2="38" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <line x1="44" y1="46" x2="68" y2="46" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <line x1="44" y1="54" x2="60" y2="54" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        {/* Saffron spark */}
        <circle cx="86" cy="24" r="5" fill={BRAND_COLORS.ioclSaffron} />
        <circle cx="32" cy="68" r="3" fill={BRAND_COLORS.ioclSaffron} opacity="0.6" />
      </svg>
      {title && <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h4>}
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{subtitle}</p>}
    </div>
  );
}
