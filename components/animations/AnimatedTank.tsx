"use client";

import React from "react";
import { motion } from "framer-motion";
import { TankIllustration } from "@/components/illustrations/TankIllustration";
import { getFuelColor } from "@/lib/theme";
import { AlertTriangle, Droplets } from "lucide-react";

interface AnimatedTankProps {
  tankName: string;
  fuelType: string;
  currentStockLitres: number;
  capacityLitres: number;
  reorderLevelLitres: number;
  deadStockLitres?: number;
  lastDipCm?: number;
  onClick?: () => void;
  className?: string;
}

export function AnimatedTank({
  tankName,
  fuelType,
  currentStockLitres,
  capacityLitres,
  reorderLevelLitres,
  deadStockLitres = 500,
  lastDipCm,
  onClick,
  className = "",
}: AnimatedTankProps) {
  const fillPercent = capacityLitres > 0 ? (currentStockLitres / capacityLitres) * 100 : 0;
  const isLowStock = currentStockLitres <= reorderLevelLitres;
  const fuelColor = getFuelColor(fuelType);

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={onClick}
      className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm transition-all hover:shadow-md relative overflow-hidden ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Top Accent line in fuel product color */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: fuelColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: fuelColor }}
            />
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
              {tankName}
            </h4>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 inline-block">
            {fuelType}
          </span>
        </div>

        {isLowStock ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60">
            <AlertTriangle className="w-3 h-3" />
            REORDER
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60">
            HEALTHY
          </span>
        )}
      </div>

      {/* Center Visual: Illustrated Tank Cutaway */}
      <div className="flex justify-center py-1">
        <TankIllustration
          fuelType={fuelType}
          fillPercent={fillPercent}
          size={140}
        />
      </div>

      {/* Stock Figures */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">Current Stock</span>
          <div className="text-right">
            <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {Math.round(currentStockLitres).toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">L</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, fillPercent))}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: fuelColor }}
          />
        </div>

        {/* Footer Stats: Total Capacity & Last Dip */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Capacity: {capacityLitres.toLocaleString("en-IN")} L</span>
          {lastDipCm !== undefined && (
            <span className="inline-flex items-center gap-1 font-mono">
              <Droplets className="w-3 h-3 text-slate-400" />
              Dip: {lastDipCm.toFixed(1)} cm
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
