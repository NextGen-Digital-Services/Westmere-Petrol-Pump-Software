"use client";

import React, { useState, useEffect } from "react";
import { Tank } from "@/types";
import { usePetroStore } from "@/store/usePetroStore";
import { interpolateDipToLitres } from "@/lib/calc";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatLitres } from "@/lib/format";

interface DipEntryModalProps {
  tank: Tank | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DipEntryModal: React.FC<DipEntryModalProps> = ({ tank, isOpen, onClose }) => {
  const store = usePetroStore();
  const [dipCm, setDipCm] = useState("");
  const [waterDipCm, setWaterDipCm] = useState("0.0");
  const [temperature, setTemperature] = useState("28.5");
  const [density, setDensity] = useState("742.0");
  const [notes, setNotes] = useState("");

  const calibration = store.calibrations.find((c) => c.tankId === tank?.id);
  const calculatedLitres = tank && calibration && dipCm
    ? interpolateDipToLitres(parseFloat(dipCm) || 0, calibration.points)
    : 0;

  const varianceLitres = tank ? calculatedLitres - tank.currentStockLitres : 0;

  useEffect(() => {
    if (tank?.lastDipCm) {
      setDipCm(tank.lastDipCm.toString());
    } else {
      setDipCm("150.0");
    }
  }, [tank]);

  if (!tank) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cm = parseFloat(dipCm) || 0;
    const waterCm = parseFloat(waterDipCm) || 0;
    const runningShift = store.shifts.find((s) => s.status === "OPEN");

    store.recordTankDip({
      tankId: tank.id,
      shiftId: runningShift?.id,
      dipCm: cm,
      calculatedLitres,
      waterDipCm: waterCm,
      temperatureC: parseFloat(temperature) || undefined,
      densityKgM3: parseFloat(density) || undefined,
      recordedBy: store.currentUser?.name || "Shift Manager",
      notes,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Physical Dip: ${tank.name}`}
      subtitle={`Fuel Product: ${tank.fuelType} • Calibration: ${calibration?.chartName || "Standard"}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Dip Rod Reading (cm)"
            type="number"
            step="0.1"
            value={dipCm}
            onChange={(e) => setDipCm(e.target.value)}
            required
            helperText="Calibrated steel dipstick reading"
          />
          <Input
            label="Water Bottom Dip (cm)"
            type="number"
            step="0.1"
            value={waterDipCm}
            onChange={(e) => setWaterDipCm(e.target.value)}
            helperText="Water finding paste indication"
          />
        </div>

        {/* Interpolated Volume Live Calculation Box */}
        <div className="p-4 bg-card-subtle border border-border-subtle rounded-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Interpolated Physical Litres:</span>
            <span className="text-xl font-light tabular-nums font-sans text-accent">
              {formatLitres(calculatedLitres)}
            </span>
          </div>

          <div className="mt-2 pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
            <span className="text-text-muted">Book Stock in System:</span>
            <span className="tabular-nums text-text">{formatLitres(tank.currentStockLitres)}</span>
          </div>

          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-text-muted">Physical vs Book Variance:</span>
            <span
              className={`tabular-nums font-semibold ${
                Math.abs(varianceLitres) > 50
                  ? "text-brick"
                  : varianceLitres >= 0
                  ? "text-olive"
                  : "text-text"
              }`}
            >
              {varianceLitres >= 0 ? `+${formatLitres(varianceLitres)}` : formatLitres(varianceLitres)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Temperature (°C)"
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
          />
          <Input
            label="Density @ 15°C (kg/m³)"
            type="number"
            step="0.1"
            value={density}
            onChange={(e) => setDensity(e.target.value)}
          />
        </div>

        <Input
          label="Verification Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Daily morning shift physical dip verification"
        />

        <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Dip Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};
