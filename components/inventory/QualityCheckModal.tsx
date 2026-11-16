"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Modal } from "@/components/ui/Modal";
import { FuelType } from "@/types";
import { HydrometerIllustration } from "@/components/illustrations/EquipmentIllustrations";
import { BRAND_COLORS } from "@/lib/theme";

interface QualityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QualityCheckModal({ isOpen, onClose }: QualityCheckModalProps) {
  const { tanks, addQualityCheck, currentUser } = usePetroStore();

  const [selectedTankId, setSelectedTankId] = useState(tanks[0]?.id || "");
  const [density, setDensity] = useState("742.5");
  const [temperature, setTemperature] = useState("22.5");
  const [waterPasteResult, setWaterPasteResult] = useState<"PASS" | "FAIL">("PASS");
  const [filterPaperResult, setFilterPaperResult] = useState<"PASS" | "FAIL">("PASS");
  const [appearance, setAppearance] = useState<"CLEAR" | "HAZY" | "PARTICULATE">("CLEAR");
  const [notes, setNotes] = useState("");

  const selectedTank = tanks.find((t) => t.id === selectedTankId) || tanks[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTank) return;

    addQualityCheck({
      tankId: selectedTank.id,
      fuelType: selectedTank.fuelType,
      date: new Date().toISOString(),
      densityReported: parseFloat(density) || 740,
      temperatureC: parseFloat(temperature) || 20,
      waterPasteResult,
      filterPaperResult,
      appearance,
      status: waterPasteResult === "PASS" && filterPaperResult === "PASS" ? "APPROVED" : "FLAGGED",
      verifiedBy: currentUser?.name || "Shift Manager",
      notes: notes || "Daily quality check verified at morning shift opening.",
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Fuel Quality & Density Test"
      subtitle="Statutory morning density (at 15°C), water-finding paste & filter paper verification"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-center gap-3">
          <HydrometerIllustration size={36} />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <span className="font-bold block">IOCL Quality Standard:</span>
            Permissible density variation is within ±3.0 kg/m³ of depot invoice. Water-finding paste must indicate 0 mm free water.
          </div>
        </div>

        {/* Tank Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Underground Storage Tank
          </label>
          <select
            value={selectedTankId}
            onChange={(e) => setSelectedTankId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {tanks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.fuelType}) — Current: {Math.round(t.currentStockLitres)} L
              </option>
            ))}
          </select>
        </div>

        {/* Density & Temperature Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Observed Density (kg/m³)
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={density}
              onChange={(e) => setDensity(e.target.value)}
              placeholder="e.g. 742.5"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Hydrometer reading</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Fuel Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="e.g. 22.5"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Mercury thermometer</span>
          </div>
        </div>

        {/* Test Results: Water paste, Filter paper, Appearance */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Water Finding Paste
            </label>
            <select
              value={waterPasteResult}
              onChange={(e) => setWaterPasteResult(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100"
            >
              <option value="PASS">PASS (No Pink / 0mm)</option>
              <option value="FAIL">FAIL (Pink Stain detected)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Filter Paper Test
            </label>
            <select
              value={filterPaperResult}
              onChange={(e) => setFilterPaperResult(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100"
            >
              <option value="PASS">PASS (Clean Evaporation)</option>
              <option value="FAIL">FAIL (Residue / Stain)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Visual Appearance
            </label>
            <select
              value={appearance}
              onChange={(e) => setAppearance(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100"
            >
              <option value="CLEAR">CLEAR & Bright</option>
              <option value="HAZY">HAZY (Moisture)</option>
              <option value="PARTICULATE">PARTICULATE / Sediment</option>
            </select>
          </div>
        </div>

        {/* Remarks / Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Inspection Remarks / Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Sample clear, converted density 742.0 @ 15°C approved"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
          />
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
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm shadow-amber-500/20"
          >
            Record Quality Log
          </button>
        </div>
      </form>
    </Modal>
  );
}
