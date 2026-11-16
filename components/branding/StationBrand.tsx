"use client";

import React from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { cn } from "@/lib/utils";

interface StationBrandProps {
  size?: "sm" | "md" | "lg" | "xl";
  showDetails?: boolean;
  className?: string;
  isLightModeOnDark?: boolean;
  stationName?: string;
  roCode?: string;
  oilCompany?: string;
  logoUrl?: string;
  variant?: "default" | "light" | string;
}

export const StationBrand: React.FC<StationBrandProps> = ({
  size = "md",
  showDetails = true,
  className,
  isLightModeOnDark = false,
  stationName,
  roCode,
  oilCompany,
  logoUrl,
  variant,
}) => {
  const { station } = usePetroStore();
  const activeRoCode = roCode || station.roCode;
  const activeOilCompany = oilCompany || station.oilCompany || "Indian Oil Corporation Limited";
  const activeLogoUrl = logoUrl !== undefined ? logoUrl : station.logoUrl;
  const isLightText = isLightModeOnDark || variant === "light";

  const logoSizes = {
    sm: "h-6 w-auto",
    md: "h-9 w-auto",
    lg: "h-12 w-auto",
    xl: "h-16 w-auto",
  }[size];

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-xl",
  }[size];

  return (
    <div className={cn("flex items-center space-x-3 select-none", className)}>
      {activeLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activeLogoUrl}
          alt={activeOilCompany || "Station Logo"}
          className={cn("object-contain rounded-sm", logoSizes)}
        />
      ) : (
        /* Neutral Petroflow IndianOil inspired wordmark badge */
        <div className="flex items-center space-x-1.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-iocl-saffron flex items-center justify-center text-white shadow-sm font-heading font-black text-base">
            <span>P</span>
          </div>
          <div className="w-2.5 h-8 rounded-sm bg-iocl-blue" />
        </div>
      )}

      {showDetails && (
        <div className="leading-tight truncate">
          <div className="flex items-center space-x-1.5">
            <span
              className={cn(
                "font-heading font-bold tracking-tight uppercase truncate",
                textSize,
                isLightText ? "text-white" : "text-text"
              )}
            >
              PETROFLOW
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-iocl-saffron/15 text-iocl-saffron uppercase tracking-wider">
              IOCL
            </span>
          </div>
          <p
            className={cn(
              "text-[10px] font-medium tracking-wide uppercase truncate mt-0.5",
              isLightText ? "text-slate-300" : "text-text-muted"
            )}
          >
            {activeRoCode ? `RO #${activeRoCode}` : "STATION OPS"} • {activeOilCompany}
          </p>
        </div>
      )}
    </div>
  );
};
