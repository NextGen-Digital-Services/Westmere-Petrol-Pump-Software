import React from "react";
import { getFuelColor } from "@/lib/theme";

interface TankIllustrationProps {
  fuelType?: string;
  fillPercent?: number; // 0 to 100
  className?: string;
  size?: number;
  showDipPipe?: boolean;
}

export function TankIllustration({
  fuelType = "Petrol",
  fillPercent = 65,
  className = "",
  size = 120,
  showDipPipe = true,
}: TankIllustrationProps) {
  const color = getFuelColor(fuelType);
  const clampedPercent = Math.max(0, Math.min(100, fillPercent));
  // Tank height inside inner cylinder: y goes from 30 (top) to 90 (bottom) -> height 60
  const liquidHeight = (clampedPercent / 100) * 56;
  const liquidY = 88 - liquidHeight;

  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={`${fuelType} Tank illustration with ${clampedPercent}% stock`}
    >
      <defs>
        {/* Tank 3D Gradient */}
        <linearGradient id="tankBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Liquid Gradient */}
        <linearGradient id={`tankLiquidGrad-${fuelType.replace(/\s+/g, "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>

        {/* Liquid Surface Highlight */}
        <linearGradient id="liquidSurface" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.5" />
        </linearGradient>

        {/* Tank Inner Mask */}
        <clipPath id="tankInnerClip">
          <rect x="22" y="32" width="116" height="56" rx="28" />
        </clipPath>
      </defs>

      {/* Tank Saddle Feet / Stands */}
      <path d="M42 86 L36 106 H54 L50 86 Z" fill="#64748B" />
      <path d="M118 86 L114 106 H132 L126 86 Z" fill="#64748B" />
      <rect x="30" y="104" width="28" height="4" rx="2" fill="#475569" />
      <rect x="108" y="104" width="28" height="4" rx="2" fill="#475569" />

      {/* Tank Outer Shell (Cylinder Capsule) */}
      <rect x="20" y="30" width="120" height="60" rx="30" fill="url(#tankBodyGrad)" stroke="#94A3B8" strokeWidth="2.5" />

      {/* Liquid Fill Clipped inside cylinder */}
      <g clipPath="url(#tankInnerClip)">
        <rect
          x="20"
          y={liquidY}
          width="120"
          height={liquidHeight + 10}
          fill={`url(#tankLiquidGrad-${fuelType.replace(/\s+/g, "")})`}
        />
        {/* Subtle wave on surface */}
        {clampedPercent > 0 && (
          <ellipse
            cx="80"
            cy={liquidY}
            rx="56"
            ry="4"
            fill="url(#liquidSurface)"
          />
        )}
      </g>

      {/* Graduation Markings on Tank End */}
      <g stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6">
        <line x1="26" y1="46" x2="36" y2="46" />
        <line x1="26" y1="60" x2="42" y2="60" />
        <line x1="26" y1="74" x2="36" y2="74" />
      </g>

      {/* Top Manhole Collar & Inspection Hatch */}
      <rect x="70" y="24" width="20" height="8" rx="2" fill="#64748B" stroke="#475569" strokeWidth="1.5" />
      <ellipse cx="80" cy="24" rx="10" ry="3" fill="#94A3B8" stroke="#475569" strokeWidth="1" />

      {/* Dip Pipe */}
      {showDipPipe && (
        <g>
          <line x1="80" y1="12" x2="80" y2="24" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="11" r="3" fill="#F37021" stroke="#D65A10" strokeWidth="1" />
        </g>
      )}

      {/* Vent Pipe on Left */}
      <path d="M46 30 V16 Q46 12 42 12 H38" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="37" cy="12" r="2.5" fill="#475569" />

      {/* Percentage Pill Badge at center */}
      <g transform="translate(62, 52)">
        <rect x="0" y="0" width="36" height="18" rx="9" fill="#0F172A" opacity="0.82" />
        <text
          x="18"
          y="13"
          fill="#FFFFFF"
          fontSize="10"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="bold"
          textAnchor="middle"
        >
          {Math.round(clampedPercent)}%
        </text>
      </g>
    </svg>
  );
}
