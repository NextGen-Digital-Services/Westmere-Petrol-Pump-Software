import React from "react";
import { BRAND_COLORS } from "@/lib/theme";

interface IllustrationProps {
  className?: string;
  size?: number;
  color?: string;
}

export function ShiftClockIllustration({ className = "", size = 48, color = BRAND_COLORS.ioclSaffron }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="32" cy="32" r="24" fill="#FFF7ED" stroke={color} strokeWidth="3" />
      {/* 12, 3, 6, 9 ticks */}
      <line x1="32" y1="12" x2="32" y2="16" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="52" y1="32" x2="48" y2="32" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="52" x2="32" y2="48" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="32" x2="16" y2="32" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
      {/* Clock Hands pointing to 6:00 AM (shift handover) */}
      <line x1="32" y1="32" x2="32" y2="20" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      <line x1="32" y1="32" x2="32" y2="44" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="4" fill={color} />
    </svg>
  );
}

export function EmployeeBadgeIllustration({ className = "", size = 48, color = BRAND_COLORS.ioclBlue }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Lanyard Clip */}
      <rect x="27" y="6" width="10" height="5" rx="1.5" fill="#64748B" />
      {/* Badge Card */}
      <rect x="15" y="10" width="34" height="46" rx="4" fill="#FFFFFF" stroke={color} strokeWidth="2" />
      {/* Photo Avatar box */}
      <rect x="23" y="17" width="18" height="18" rx="3" fill="#E2E8F0" />
      <circle cx="32" cy="23" r="4" fill="#64748B" />
      <path d="M26 33 C26 29.5 28.5 28 32 28 C35.5 28 38 29.5 38 33 Z" fill="#64748B" />
      {/* Details Lines */}
      <line x1="20" y1="40" x2="44" y2="40" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="46" x2="40" y2="46" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Bottom IOCL bar */}
      <rect x="15" y="52" width="34" height="4" fill={BRAND_COLORS.ioclSaffron} />
    </svg>
  );
}

export function ShieldAuditIllustration({ className = "", size = 48 }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Shield shape */}
      <path
        d="M32 8 L48 14 V29 C48 40.5 41.2 50.8 32 54 C22.8 50.8 16 40.5 16 29 V14 L32 8 Z"
        fill="#EEF2FB"
        stroke={BRAND_COLORS.ioclBlue}
        strokeWidth="2.5"
      />
      {/* Verified Checkmark */}
      <path
        d="M24 30 L29 35 L40 23"
        stroke="#1E9E5A"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReportDocumentIllustration({ className = "", size = 48 }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Document Sheet */}
      <path
        d="M18 10 H38 L48 20 V54 H18 V10 Z"
        fill="#FFFFFF"
        stroke="#64748B"
        strokeWidth="2"
      />
      {/* Folded corner */}
      <path d="M38 10 V20 H48 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
      {/* Report Chart Lines */}
      <line x1="24" y1="26" x2="42" y2="26" stroke={BRAND_COLORS.ioclSaffron} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="33" x2="36" y2="33" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="40" x2="42" y2="40" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      {/* Mini Bar Graph */}
      <rect x="24" y="45" width="4" height="4" fill={BRAND_COLORS.ioclBlue} />
      <rect x="30" y="43" width="4" height="6" fill={BRAND_COLORS.ioclBlue} />
      <rect x="36" y="41" width="4" height="8" fill={BRAND_COLORS.ioclBlue} />
    </svg>
  );
}

export function PriceTagIllustration({ className = "", size = 48, color = BRAND_COLORS.ioclSaffron }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M14 30 L32 12 H48 V28 L30 46 L14 30 Z"
        fill="#FFF7ED"
        stroke={color}
        strokeWidth="2.5"
      />
      {/* Tag Hole */}
      <circle cx="41" cy="19" r="3" fill="#FFFFFF" stroke={color} strokeWidth="2" />
      {/* Rupee Symbol */}
      <text
        x="29"
        y="32"
        fill={color}
        fontSize="12"
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        ₹
      </text>
    </svg>
  );
}

export function CalculatorIllustration({ className = "", size = 48 }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Calculator Body */}
      <rect x="16" y="10" width="32" height="44" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="2" />
      {/* LCD Screen */}
      <rect x="20" y="14" width="24" height="9" rx="1.5" fill="#84CC16" />
      <text x="42" y="21" fill="#14532D" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="end">
        89,620.00
      </text>
      {/* Button Grid */}
      <g fill="#475569">
        <circle cx="23" cy="29" r="2" />
        <circle cx="32" cy="29" r="2" />
        <circle cx="41" cy="29" r="2" fill="#F37021" />
        <circle cx="23" cy="36" r="2" />
        <circle cx="32" cy="36" r="2" />
        <circle cx="41" cy="36" r="2" fill="#F37021" />
        <circle cx="23" cy="43" r="2" />
        <circle cx="32" cy="43" r="2" />
        <circle cx="41" cy="43" r="2" fill="#1E9E5A" />
        <rect x="21" y="47" width="13" height="3" rx="1.5" fill="#94A3B8" />
        <circle cx="41" cy="48" r="2" fill="#1E9E5A" />
      </g>
    </svg>
  );
}
