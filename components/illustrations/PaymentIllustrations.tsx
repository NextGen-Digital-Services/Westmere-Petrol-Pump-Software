import React from "react";
import { BRAND_COLORS } from "@/lib/theme";

interface IllustrationProps {
  className?: string;
  size?: number;
}

export function CashIllustration({ className = "", size = 48 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background stacked note */}
      <rect x="12" y="14" width="40" height="24" rx="4" fill="#A7F3D0" stroke="#059669" strokeWidth="1.5" transform="rotate(-6 32 26)" />
      {/* Foreground ₹ note */}
      <rect x="10" y="22" width="44" height="26" rx="4" fill="#D1FAE5" stroke="#10B981" strokeWidth="2" />
      {/* Note Inner Border */}
      <rect x="14" y="26" width="36" height="18" rx="2" stroke="#059669" strokeWidth="1" strokeDasharray="2 2" />
      {/* Rupee Symbol Circle */}
      <circle cx="32" cy="35" r="7" fill="#10B981" />
      <text
        x="32"
        y="39"
        fill="#FFFFFF"
        fontSize="10"
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        ₹
      </text>
    </svg>
  );
}

export function UpiIllustration({ className = "", size = 48 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Standee Base */}
      <rect x="14" y="52" width="36" height="4" rx="2" fill="#4B5563" />
      {/* Standee Board Frame */}
      <rect x="16" y="8" width="32" height="44" rx="4" fill="#FFFFFF" stroke={BRAND_COLORS.upi} strokeWidth="2" />
      {/* Header bar */}
      <rect x="16" y="8" width="32" height="8" rx="2" fill={BRAND_COLORS.upi} />
      <text x="32" y="14" fill="#FFFFFF" fontSize="6" fontWeight="bold" textAnchor="middle">
        BHIM UPI
      </text>
      {/* QR Code Matrix Elements */}
      <rect x="22" y="20" width="8" height="8" fill="#1E1B4B" />
      <rect x="24" y="22" width="4" height="4" fill="#FFFFFF" />
      <rect x="34" y="20" width="8" height="8" fill="#1E1B4B" />
      <rect x="36" y="22" width="4" height="4" fill="#FFFFFF" />
      <rect x="22" y="32" width="8" height="8" fill="#1E1B4B" />
      <rect x="24" y="34" width="4" height="4" fill="#FFFFFF" />
      {/* QR center dots */}
      <rect x="34" y="32" width="3" height="3" fill="#1E1B4B" />
      <rect x="39" y="32" width="3" height="3" fill="#1E1B4B" />
      <rect x="34" y="37" width="8" height="3" fill="#1E1B4B" />
      {/* Scan & Pay label */}
      <text x="32" y="47" fill="#6B4EFF" fontSize="5" fontWeight="bold" textAnchor="middle">
        SCAN & PAY
      </text>
    </svg>
  );
}

export function CardPosIllustration({ className = "", size = 48 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* POS Terminal Body */}
      <rect x="18" y="10" width="28" height="46" rx="5" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
      {/* LCD Screen */}
      <rect x="22" y="15" width="20" height="14" rx="2" fill="#38BDF8" opacity="0.9" />
      <text x="32" y="24" fill="#0C4A6E" fontSize="6" fontWeight="bold" textAnchor="middle">
        ₹ 2,450.00
      </text>
      {/* Keypad Grid */}
      <g fill="#94A3B8">
        <circle cx="25" cy="34" r="1.5" />
        <circle cx="32" cy="34" r="1.5" />
        <circle cx="39" cy="34" r="1.5" />
        <circle cx="25" cy="40" r="1.5" />
        <circle cx="32" cy="40" r="1.5" />
        <circle cx="39" cy="40" r="1.5" />
        <circle cx="25" cy="46" r="1.5" />
        <circle cx="32" cy="46" r="1.5" />
        <circle cx="39" cy="46" r="1.5" />
      </g>
      {/* Card Swipe Slot on Top */}
      <path d="M22 6 H42 L40 10 H24 Z" fill="#64748B" />
      {/* Inserted Card */}
      <rect x="26" y="4" width="12" height="6" rx="1" fill="#F59E0B" stroke="#D97706" strokeWidth="0.5" />
    </svg>
  );
}

export function CreditLedgerIllustration({ className = "", size = 48 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ledger Book Cover */}
      <rect x="14" y="10" width="36" height="44" rx="4" fill="#FCE7F3" stroke={BRAND_COLORS.credit} strokeWidth="2" />
      {/* Spine */}
      <path d="M14 10 H20 V54 H14 Z" fill={BRAND_COLORS.credit} />
      {/* Binder rings */}
      <circle cx="17" cy="18" r="1.5" fill="#FFFFFF" />
      <circle cx="17" cy="32" r="1.5" fill="#FFFFFF" />
      <circle cx="17" cy="46" r="1.5" fill="#FFFFFF" />
      {/* Ledger entries / lines */}
      <line x1="24" y1="20" x2="44" y2="20" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="28" x2="44" y2="28" stroke="#DB2777" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="36" x2="40" y2="36" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="44" x2="36" y2="44" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SafeVaultIllustration({ className = "", size = 48 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Safe Box */}
      <rect x="12" y="12" width="40" height="42" rx="5" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
      {/* Door Bevel */}
      <rect x="16" y="16" width="32" height="34" rx="3" fill="#334155" />
      {/* Dial Combination Lock */}
      <circle cx="32" cy="33" r="8" fill="#64748B" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="32" cy="33" r="3" fill="#F37021" />
      {/* Dial Ticks */}
      <line x1="32" y1="26" x2="32" y2="28" stroke="#CBD5E1" strokeWidth="1.5" />
      <line x1="32" y1="38" x2="32" y2="40" stroke="#CBD5E1" strokeWidth="1.5" />
      <line x1="26" y1="33" x2="28" y2="33" stroke="#CBD5E1" strokeWidth="1.5" />
      <line x1="36" y1="33" x2="38" y2="33" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* Vault Handle */}
      <rect x="41" y="29" width="4" height="8" rx="1.5" fill="#E2E8F0" />
      {/* Safe Base Feet */}
      <rect x="14" y="54" width="8" height="3" rx="1" fill="#0F172A" />
      <rect x="42" y="54" width="8" height="3" rx="1" fill="#0F172A" />
    </svg>
  );
}
