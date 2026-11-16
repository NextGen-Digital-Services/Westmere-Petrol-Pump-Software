"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Modal } from "@/components/ui/Modal";
import { Nozzle } from "@/types";
import { PressureGaugeIllustration } from "@/components/illustrations/EquipmentIllustrations";

interface PumpTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultNozzle?: Nozzle | null;
}

export function PumpTestModal({ isOpen, onClose, defaultNozzle }: PumpTestModalProps) {
  const { nozzles, tanks, shifts, addPumpTest, currentUser } = usePetroStore();

  const [selectedNozzleId, setSelectedNozzleId] = useState(
    defaultNozzle?.id || nozzles[0]?.id || ""
  );
  const [dispensedLitres, setDispensedLitres] = useState("5.000");
  const [returnedToTank, setReturnedToTank] = useState(true);

  const selectedNozzle = nozzles.find((n) => n.id === selectedNozzleId) || nozzles[0];
  const targetTank = tanks.find((t) => t.id === selectedNozzle?.tankId) || tanks[0];
  const activeShift = shifts.find((s) => s.status === "OPEN");

  const dispensed = parseFloat(dispensedLitres) || 5.0;
  const standard = 5.0;
  // Variance ml: (dispensed - standard) * 1000
  const varianceMl = Math.round((dispensed - standard) * 1000);
  const variancePercent = parseFloat((((dispensed - standard) / standard) * 100).toFixed(2));
  // Permissible tolerance is ±25 ml (±0.5%)
  const passed = Math.abs(varianceMl) <= 25;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNozzle || !targetTank) return;

    addPumpTest({
      nozzleId: selectedNozzle.id,
      shiftId: activeShift?.id || "SH-MORNING",
      measureLitres: 5.0,
      dispensedLitres: dispensed,
      returnedToTank,
      tankId: targetTank.id,
      accuracyTolerancePercent: variancePercent,
      passed,
      testedBy: currentUser?.name || "Shift Manager",
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="5-Litre Conical Measure Pump Test"
      subtitle="Statutory Weights & Measures forecourt calibration accuracy verification"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info card */}
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 flex items-center gap-3">
          <PressureGaugeIllustration size={36} />
          <div className="text-xs text-blue-900 dark:text-blue-200">
            <span className="font-bold block">Legal Metrology Standard:</span>
            Permissible error limit on stamped 5,000 ml conical brass measure is ±25 ml (±0.5%). Fuel must be poured back into underground tank as a Test-Return.
          </div>
        </div>

        {/* Nozzle selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Testing Nozzle
          </label>
          <select
            value={selectedNozzleId}
            onChange={(e) => setSelectedNozzleId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {nozzles.map((n) => (
              <option key={n.id} value={n.id}>
                {n.code} — {n.name} ({n.fuelType})
              </option>
            ))}
          </select>
        </div>

        {/* 5L Dispensed measure */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Standard Measure
            </label>
            <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              5.000 Litres (5,000 ml)
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Dispensed Volume (Litres)
            </label>
            <input
              type="number"
              step="0.001"
              required
              value={dispensedLitres}
              onChange={(e) => setDispensedLitres(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Live Calculation feedback */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
            passed
              ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          <div>
            <span className="font-bold block">
              Difference: {varianceMl > 0 ? `+${varianceMl}` : varianceMl} ml ({variancePercent}%)
            </span>
            <span className="text-[11px] opacity-80">
              {passed ? "Within ±25 ml statutory limit" : "EXCEEDS LEGAL TOLERANCE — Recalibrate pulser"}
            </span>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
              passed
                ? "bg-emerald-500 text-white"
                : "bg-rose-500 text-white"
            }`}
          >
            {passed ? "PASS" : "FAIL"}
          </span>
        </div>

        {/* Pour back checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={returnedToTank}
              onChange={(e) => setReturnedToTank(e.target.checked)}
              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            <span>
              Fuel returned to underground tank (<strong>{targetTank?.name}</strong>)
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
          >
            Save Stamped Test Log
          </button>
        </div>
      </form>
    </Modal>
  );
}
