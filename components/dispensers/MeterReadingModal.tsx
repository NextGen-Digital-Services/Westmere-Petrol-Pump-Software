"use client";

import React, { useState, useEffect } from "react";
import { Nozzle } from "@/types";
import { usePetroStore } from "@/store/usePetroStore";
import { calculateNozzleVolume, calculateSaleLitres } from "@/lib/calc";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatLitres } from "@/lib/format";

interface MeterReadingModalProps {
  nozzle: Nozzle | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MeterReadingModal: React.FC<MeterReadingModalProps> = ({
  nozzle,
  isOpen,
  onClose,
}) => {
  const store = usePetroStore();
  const [opening, setOpening] = useState("");
  const [closing, setClosing] = useState("");
  const [testingLitres, setTestingLitres] = useState("0.0");
  const [isRollover, setIsRollover] = useState(false);
  const [rolloverMax, setRolloverMax] = useState("999999.99");
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (nozzle) {
      setOpening(nozzle.currentTotalizerLitres.toString());
      setClosing((nozzle.currentTotalizerLitres + 150.0).toFixed(2));
      setTestingLitres("5.0");
      setIsRollover(false);
      setReason("");
      setErrorMsg("");
    }
  }, [nozzle]);

  if (!nozzle) return null;

  const openNum = parseFloat(opening) || 0;
  const closeNum = parseFloat(closing) || 0;
  const testNum = parseFloat(testingLitres) || 0;
  const maxNum = parseFloat(rolloverMax) || 999999.99;

  const volumeLitres = calculateNozzleVolume(openNum, closeNum, isRollover, maxNum);
  const saleLitres = calculateSaleLitres(volumeLitres, testNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (closeNum < openNum && !isRollover) {
      setErrorMsg("Closing meter cannot be lower than opening meter without flagging meter rollover.");
      return;
    }

    if (isRollover && !reason.trim()) {
      setErrorMsg("A reason is mandatory when recording a mechanical meter rollover.");
      return;
    }

    const runningShift = store.shifts.find((s) => s.status === "OPEN");

    store.recordMeterReading({
      shiftId: runningShift?.id || "SH-MANUAL",
      nozzleId: nozzle.id,
      openingLitres: openNum,
      closingLitres: closeNum,
      volumeLitres,
      testingLitres: testNum,
      saleLitres,
      isRollover,
      rolloverMaxMeter: isRollover ? maxNum : undefined,
      reason: reason || undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Totalizer Reading: ${nozzle.name}`}
      subtitle={`Fuel Product: ${nozzle.fuelType} • Forecourt Code: ${nozzle.code}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Opening Meter (L)"
            type="number"
            step="0.01"
            value={opening}
            onChange={(e) => {
              setOpening(e.target.value);
              setErrorMsg("");
            }}
            required
          />
          <Input
            label="Closing Meter (L)"
            type="number"
            step="0.01"
            value={closing}
            onChange={(e) => {
              setClosing(e.target.value);
              setErrorMsg("");
            }}
            required
            error={errorMsg}
          />
        </div>

        <Input
          label="Pump Testing / Calibration Pours (L)"
          type="number"
          step="0.1"
          value={testingLitres}
          onChange={(e) => setTestingLitres(e.target.value)}
          helperText="Deducted for mandatory 5-litre W&M morning nozzle verification"
        />

        {/* Calculation Result Preview Box */}
        <div className="p-4 bg-card-subtle border border-border-subtle rounded-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Total Gross Volume:</span>
            <span className="tabular-nums font-medium text-text">{formatLitres(volumeLitres)}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border-subtle">
            <span className="text-text font-semibold">Net Commercial Sale Litres:</span>
            <span className="text-lg font-light tabular-nums font-sans text-accent">
              {formatLitres(saleLitres)}
            </span>
          </div>
        </div>

        {/* Meter Rollover Handling */}
        <div className="pt-2 border-t border-border-subtle">
          <label className="flex items-center space-x-2 text-xs text-text cursor-pointer">
            <input
              type="checkbox"
              checked={isRollover}
              onChange={(e) => setIsRollover(e.target.checked)}
              className="rounded-sm border-border text-accent focus:ring-accent"
            />
            <span className="font-medium">Totalizer Rollover (Meter flipped over 999,999.99)</span>
          </label>

          {isRollover && (
            <div className="mt-3 space-y-3 pl-5 border-l-2 border-brass">
              <Input
                label="Maximum Totalizer Digits"
                type="number"
                value={rolloverMax}
                onChange={(e) => setRolloverMax(e.target.value)}
              />
              <Input
                label="Rollover Verification Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                placeholder="e.g. Dispenser 01 mechanical totalizer reached limit"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Commit Meter Reading
          </Button>
        </div>
      </form>
    </Modal>
  );
};
