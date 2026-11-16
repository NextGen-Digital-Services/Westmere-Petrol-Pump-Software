import React from "react";
import { BRAND_COLORS } from "@/lib/theme";

interface IllustrationProps {
  className?: string;
  size?: number;
  color?: string;
}

export function TankerTruckIllustration({
  className = "",
  size = 64,
  color = BRAND_COLORS.ioclSaffron,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size * 0.65}
      viewBox="0 0 100 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="tankerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
      </defs>
      {/* Truck Cab */}
      <path
        d="M62 20 H78 C82 20 85 23 86 27 L90 38 C91 40 92 42 92 44 V52 H62 V20 Z"
        fill={BRAND_COLORS.ioclBlue}
      />
      {/* Cab Windshield */}
      <path d="M74 24 H80 L84 34 H74 V24 Z" fill="#93C5FD" opacity="0.9" />
      {/* Cab Bumper & Headlight */}
      <rect x="88" y="46" width="6" height="5" rx="1.5" fill="#FBBF24" />
      {/* Tanker Cylinder Body */}
      <rect x="8" y="14" width="56" height="32" rx="16" fill="url(#tankerGrad)" stroke="#94A3B8" strokeWidth="2" />
      {/* Brand Stripe on Tanker */}
      <rect x="8" y="28" width="56" height="6" fill={color} />
      {/* Chassis Frame */}
      <rect x="12" y="46" width="76" height="6" fill="#334155" rx="1" />
      {/* Wheels */}
      <circle cx="24" cy="52" r="7" fill="#0F172A" />
      <circle cx="24" cy="52" r="3.5" fill="#94A3B8" />
      <circle cx="42" cy="52" r="7" fill="#0F172A" />
      <circle cx="42" cy="52" r="3.5" fill="#94A3B8" />
      <circle cx="78" cy="52" r="7" fill="#0F172A" />
      <circle cx="78" cy="52" r="3.5" fill="#94A3B8" />
      {/* Manhole domes on top */}
      <rect x="20" y="10" width="10" height="4" rx="2" fill="#64748B" />
      <rect x="38" y="10" width="10" height="4" rx="2" fill="#64748B" />
    </svg>
  );
}

export function LubricantBottleIllustration({
  className = "",
  size = 48,
  color = BRAND_COLORS.lubricants,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="lubeBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>
      </defs>
      {/* Bottle Cap */}
      <rect x="25" y="8" width="14" height="6" rx="2" fill="#B45309" />
      {/* Bottle Neck */}
      <rect x="27" y="14" width="10" height="6" fill="#D97706" />
      {/* Handle & Shoulder */}
      <path
        d="M20 20 H44 C48 20 51 23 51 27 V52 C51 55 48 58 44 58 H20 C16 58 13 55 13 52 V27 C13 23 16 20 20 20 Z"
        fill="url(#lubeBody)"
        stroke={color}
        strokeWidth="2.5"
      />
      {/* Handle cutout */}
      <rect x="36" y="26" width="8" height="14" rx="4" fill="#FFFFFF" stroke={color} strokeWidth="1.5" />
      {/* Servo Label */}
      <rect x="18" y="32" width="16" height="20" rx="3" fill={color} />
      {/* Oil droplet icon on label */}
      <path
        d="M26 36 C26 36 22 41 22 43 C22 45.2 23.8 47 26 47 C28.2 47 30 45.2 30 43 C30 41 26 36 26 36 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function OilDrumIllustration({
  className = "",
  size = 48,
  color = BRAND_COLORS.ioclBlue,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Drum body */}
      <rect x="16" y="16" width="32" height="38" rx="6" fill={color} opacity="0.9" />
      {/* Rib lines on drum */}
      <line x1="16" y1="28" x2="48" y2="28" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.6" />
      <line x1="16" y1="42" x2="48" y2="42" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.6" />
      {/* Top rim ellipse */}
      <ellipse cx="32" cy="16" rx="16" ry="6" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
      {/* Bung hole / plug */}
      <circle cx="26" cy="16" r="2.5" fill="#F8FAFC" />
      <circle cx="38" cy="15" r="1.5" fill="#F8FAFC" />
      {/* Bottom rim */}
      <ellipse cx="32" cy="54" rx="16" ry="4" fill={color} stroke="#334155" strokeWidth="1.5" />
    </svg>
  );
}

export function HydrometerIllustration({
  className = "",
  size = 48,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Glass Cylinder / Jar */}
      <rect x="18" y="10" width="28" height="46" rx="4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" opacity="0.6" />
      {/* Liquid inside jar */}
      <rect x="20" y="24" width="24" height="30" rx="2" fill="#FDE68A" opacity="0.75" />
      {/* Hydrometer bulb floating in liquid */}
      <line x1="32" y1="8" x2="32" y2="36" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="32" cy="42" rx="5" ry="8" fill="#DC2626" />
      <circle cx="32" cy="50" r="3" fill="#1E293B" />
      {/* Calibration tick marks */}
      <line x1="29" y1="14" x2="35" y2="14" stroke="#0284C7" strokeWidth="1" />
      <line x1="30" y1="18" x2="34" y2="18" stroke="#0284C7" strokeWidth="1" />
      <line x1="29" y1="22" x2="35" y2="22" stroke="#0284C7" strokeWidth="1" />
      <line x1="30" y1="26" x2="34" y2="26" stroke="#0284C7" strokeWidth="1" />
    </svg>
  );
}

export function PressureGaugeIllustration({
  className = "",
  size = 48,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dial Casing */}
      <circle cx="32" cy="30" r="22" fill="#FFFFFF" stroke="#334155" strokeWidth="3" />
      {/* Dial Face Inner Circle */}
      <circle cx="32" cy="30" r="18" fill="#F8FAFC" />
      {/* Green / Red Zones */}
      <path d="M18 30 A14 14 0 0 1 32 16" stroke="#10B981" strokeWidth="2.5" fill="none" />
      <path d="M32 16 A14 14 0 0 1 46 30" stroke="#EF4444" strokeWidth="2.5" fill="none" />
      {/* Center Pivot */}
      <circle cx="32" cy="30" r="3" fill="#0F172A" />
      {/* Pointer Needle pointing to healthy green zone */}
      <line x1="32" y1="30" x2="26" y2="20" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      {/* Base Thread fitting */}
      <rect x="29" y="52" width="6" height="8" fill="#64748B" />
    </svg>
  );
}
