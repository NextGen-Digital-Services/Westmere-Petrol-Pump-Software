"use client";

import React from "react";
import { Tank } from "@/types";
import { formatLitres, formatDateTime } from "@/lib/format";
import { TankIllustration } from "@/components/illustrations/TankIllustration";
import { getFuelColor, BRAND_COLORS } from "@/lib/theme";
import { Droplet, AlertTriangle, Ruler, Sliders, ShieldCheck } from "lucide-react";

interface TankGaugesProps {
  tanks: Tank[];
  onOpenDipModal: (tank: Tank) => void;
  onOpenAdjustModal: (tank: Tank) => void;
  onOpenCalibrationModal: (tank: Tank) => void;
}

export const TankGauges: React.FC<TankGaugesProps> = ({
  tanks,
  onOpenDipModal,
  onOpenAdjustModal,
  onOpenCalibrationModal,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tanks.map((tank) => {
        const fillPercent = Math.min(
          100,
          Math.round((tank.currentStockLitres / tank.capacityLitres) * 100)
        );
        const isLow = tank.currentStockLitres <= tank.reorderLevelLitres;
        const isNearFull = fillPercent >= 95;
        const fuelColor = getFuelColor(tank.fuelType);

        return (
          <div
            key={tank.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md"
          >
            {/* Top Accent Stripe in Fuel Color */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: fuelColor }}
            />

            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: fuelColor }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      {tank.code}
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100 mt-1">
                    {tank.name}
                  </h3>
                  <span
                    className="inline-block mt-0.5 text-xs font-semibold"
                    style={{ color: fuelColor }}
                  >
                    {tank.fuelType}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                      isLow
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
                        : isNearFull
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                    }`}
                  >
                    {isLow ? "Low Reorder" : isNearFull ? "Near Capacity" : "Optimal"}
                  </span>
                  <span className="block text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {fillPercent}%
                  </span>
                </div>
              </div>

              {/* Tank Cutaway SVG Visual */}
              <div className="flex justify-center py-4 my-2">
                <TankIllustration
                  fuelType={tank.fuelType}
                  fillPercent={fillPercent}
                  size={150}
                />
              </div>

              {/* Detailed Metrics */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Current Stock:</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                    {formatLitres(tank.currentStockLitres)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Gross Capacity:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {formatLitres(tank.capacityLitres)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Reorder Threshold:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">
                    {formatLitres(tank.reorderLevelLitres)}
                  </span>
                </div>
              </div>

              {/* Physical Dip Status */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Droplet className="w-3.5 h-3.5 text-slate-400" />
                    Last Physical Dip:
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {tank.lastDipCm ? `${tank.lastDipCm.toFixed(1)} cm` : "Not recorded today"}
                  </span>
                </div>
                {tank.lastDipTimestamp && (
                  <p className="text-[10px] text-slate-400">
                    Recorded: {formatDateTime(tank.lastDipTimestamp)}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => onOpenDipModal(tank)}
                className="flex-1 py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Record Dip</span>
              </button>

              <button
                onClick={() => onOpenCalibrationModal(tank)}
                className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                title="View Strapping Calibration Table"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Strapping</span>
              </button>

              <button
                onClick={() => onOpenAdjustModal(tank)}
                className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center justify-center"
                title="Adjust Stock with Audit"
              >
                <span>Adjust</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
