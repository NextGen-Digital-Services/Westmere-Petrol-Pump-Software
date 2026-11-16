"use client";

import React from "react";
import { getFuelColor } from "@/lib/theme";

interface NozzleIllustrationProps {
  fuelType?: string;
  size?: number;
  className?: string;
  isDispensing?: boolean;
}

export const NozzleIllustration: React.FC<NozzleIllustrationProps> = ({
  fuelType = "Petrol",
  size = 48,
  className = "",
  isDispensing = false,
}) => {
  const gripColor = getFuelColor(fuelType);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hose */}
      <path
        d="M8 56C8 44 14 38 22 38"
        stroke="#475569"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Handle Body */}
      <path
        d="M22 38L32 28L40 36L30 46C26 48 22 44 22 38Z"
        fill="#334155"
      />
      {/* Coloured Grip */}
      <path
        d="M25 35L33 27C34 26 36 26 37 27L41 31C42 32 42 34 41 35L33 43C31 44 29 44 27 42L25 35Z"
        fill={gripColor}
      />
      {/* Trigger Guard */}
      <path
        d="M28 42C30 46 36 46 38 42"
        stroke="#64748B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Trigger Lever */}
      <path
        d="M32 39L35 43"
        stroke="#94A3B8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Metallic Spout */}
      <path
        d="M36 24L48 12C49 11 51 11 52 12L56 16L53 19L44 28"
        stroke="#94A3B8"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Spout Tip Hook */}
      <path
        d="M56 16L58 14"
        stroke="#64748B"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Animated Fuel Droplets if dispensing */}
      {isDispensing && (
        <g className="animate-bounce">
          <circle cx="60" cy="22" r="2" fill={gripColor} />
          <circle cx="58" cy="28" r="1.5" fill={gripColor} />
        </g>
      )}
    </svg>
  );
};
