"use client";

import React from "react";
import { Tank } from "@/types";
import { formatLitres, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Droplet, AlertTriangle } from "lucide-react";

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

        return (
          <div
            key={tank.id}
            className="bg-card border border-border rounded-sm p-5 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold block">
                    {tank.code}
                  </span>
                  <h3 className="text-base font-serif font-medium text-text mt-0.5">
                    {tank.name}
                  </h3>
                  <span className="inline-block mt-1 text-[11px] font-medium text-accent">
                    {tank.fuelType}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] tracking-caps uppercase font-semibold border rounded-sm ${
                      isLow
                        ? "bg-brick/15 text-brick border-brick/30"
                        : isNearFull
                        ? "bg-warning/15 text-warning border-warning/30"
                        : "bg-olive/15 text-olive border-olive/30"
                    }`}
                  >
                    {isLow ? "Low Buffer" : isNearFull ? "Near Capacity" : "Optimal"}
                  </span>
                  <span className="block text-2xl font-light tabular-nums font-sans text-text mt-1">
                    {fillPercent}%
                  </span>
                </div>
              </div>

              {/* Minimal Flat Gauge Bar */}
              <div className="mt-5 space-y-2">
                <div className="w-full bg-border-subtle h-3.5 rounded-none overflow-hidden relative">
                  {/* Reorder line indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-brick z-10"
                    style={{ left: `${(tank.reorderLevelLitres / tank.capacityLitres) * 100}%` }}
                    title={`Reorder threshold (${formatLitres(tank.reorderLevelLitres)})`}
                  />
                  {/* Fill fill */}
                  <div
                    className={`h-full transition-all duration-300 ${
                      isLow ? "bg-brick" : tank.fuelType === "Diesel" ? "bg-brass" : "bg-olive"
                    }`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs tabular-nums text-text-muted">
                  <span>Current: <strong className="text-text">{formatLitres(tank.currentStockLitres)}</strong></span>
                  <span>Cap: {formatLitres(tank.capacityLitres)}</span>
                </div>
              </div>

              {/* Physical Dip Status */}
              <div className="mt-4 pt-3 border-t border-border-subtle text-xs text-text-muted space-y-1">
                <div className="flex justify-between">
                  <span>Last Dip Reading:</span>
                  <span className="tabular-nums font-medium text-text">
                    {tank.lastDipCm ? `${tank.lastDipCm.toFixed(1)} cm` : "Not recorded today"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dip Timestamp:</span>
                  <span className="text-[11px] text-text-faint">
                    {tank.lastDipTimestamp ? formatDateTime(tank.lastDipTimestamp) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenDipModal(tank)}
                className="flex-1 text-xs"
              >
                Record Dip
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenAdjustModal(tank)}
                className="flex-1 text-xs"
              >
                Adjust Stock
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenCalibrationModal(tank)}
                className="text-xs px-2"
                title="View Dip Calibration Chart"
              >
                Chart
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
