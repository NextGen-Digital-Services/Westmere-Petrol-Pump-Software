"use client";

import React, { useState } from "react";
import { Tank } from "@/types";
import { usePetroStore } from "@/store/usePetroStore";
import { interpolateDipToLitres } from "@/lib/calc";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatLitres } from "@/lib/format";

interface CalibrationModalProps {
  tank: Tank | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  tank,
  isOpen,
  onClose,
}) => {
  const store = usePetroStore();
  const [testCm, setTestCm] = useState("100");

  const calibration = store.calibrations.find((c) => c.tankId === tank?.id);
  const testLitres = calibration && testCm
    ? interpolateDipToLitres(parseFloat(testCm) || 0, calibration.points)
    : 0;

  if (!tank) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Dip Calibration Chart: ${tank.name}`}
      subtitle="Certified statutory weights & measures tank strapping table"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Quick Test Calculator */}
        <div className="p-4 bg-card-subtle border border-border-subtle rounded-sm flex items-center justify-between">
          <div className="w-1/2 pr-4">
            <Input
              label="Test Dip (cm)"
              type="number"
              step="0.5"
              value={testCm}
              onChange={(e) => setTestCm(e.target.value)}
              placeholder="e.g. 100"
            />
          </div>
          <div className="w-1/2 pl-4 text-right">
            <span className="text-[10px] tracking-caps uppercase text-text-faint block">
              Interpolated Volume
            </span>
            <span className="text-2xl font-light tabular-nums font-sans text-accent block mt-1">
              {formatLitres(testLitres)}
            </span>
          </div>
        </div>

        {/* Calibration Points Table */}
        <div className="border border-border rounded-sm overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-card-subtle sticky top-0 border-b border-border">
                <tr>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">
                    Dip Height (cm)
                  </th>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">
                    Calibrated Volume (Litres)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {calibration?.points.map((p, idx) => (
                  <tr key={idx} className="hover:bg-card-subtle/50">
                    <td className="p-3 tabular-nums font-medium text-text">{p.dipCm.toFixed(1)} cm</td>
                    <td className="p-3 tabular-nums text-right text-text font-semibold">
                      {formatLitres(p.litres)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Chart
          </Button>
        </div>
      </div>
    </Modal>
  );
};
