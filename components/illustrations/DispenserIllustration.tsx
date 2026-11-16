"use client";

import React from "react";
import { BRAND_COLORS } from "@/lib/theme";

interface DispenserIllustrationProps {
  size?: number;
  litres?: string | number;
  amount?: string | number;
  className?: string;
  isActive?: boolean;
}

export const DispenserIllustration: React.FC<DispenserIllustrationProps> = ({
  size = 64,
  litres = "0.00",
  amount = "0.00",
  className = "",
  isActive = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Base Foundation */}
      <rect x="14" y="68" width="52" height="6" rx="2" fill="#334155" />

      {/* Main Dispenser Housing Body */}
      <rect x="18" y="22" width="44" height="47" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
      <rect x="19" y="23" width="42" height="4" fill={BRAND_COLORS.ioclBlue} />

      {/* Top Canopy / Header */}
      <rect x="16" y="10" width="48" height="13" rx="3" fill={BRAND_COLORS.ioclBlue} />
      <rect x="22" y="14" width="36" height="5" rx="1.5" fill={BRAND_COLORS.ioclSaffron} />

      {/* Side Nozzle Holsters & Hoses */}
      {/* Left Nozzle (Petrol) */}
      <path d="M18 36H13C11 36 10 38 10 40V58C10 62 14 64 16 64" stroke="#475569" strokeWidth="2" fill="none" />
      <rect x="10" y="32" width="5" height="10" rx="1.5" fill={BRAND_COLORS.petrol} />

      {/* Right Nozzle (Diesel) */}
      <path d="M62 36H67C69 36 70 38 70 40V58C70 62 66 64 64 64" stroke="#475569" strokeWidth="2" fill="none" />
      <rect x="65" y="32" width="5" height="10" rx="1.5" fill={BRAND_COLORS.diesel} />

      {/* Digital Backlit LCD Panel */}
      <rect x="24" y="30" width="32" height="24" rx="2" fill="#0F172A" />

      {/* Litres Display */}
      <text
        x="53"
        y="39"
        fill="#38BDF8"
        fontSize="6.5"
        fontFamily="monospace"
        fontWeight="bold"
        textAnchor="end"
      >
        {String(litres).slice(0, 6)}
      </text>

      {/* Currency Amount Display */}
      <text
        x="53"
        y="49"
        fill="#4ADE80"
        fontSize="6.5"
        fontFamily="monospace"
        fontWeight="bold"
        textAnchor="end"
      >
        ₹{String(amount).slice(0, 6)}
      </text>

      {/* Live Status LED */}
      <circle
        cx="51"
        cy="16"
        r="2"
        fill={isActive ? "#22C55E" : "#94A3B8"}
        className={isActive ? "animate-pulse" : ""}
      />
    </svg>
  );
};
