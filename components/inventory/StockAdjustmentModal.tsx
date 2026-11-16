"use client";

import React, { useState } from "react";
import { Tank } from "@/types";
import { usePetroStore } from "@/store/usePetroStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatLitres } from "@/lib/format";

interface StockAdjustmentModalProps {
  tank: Tank | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  tank,
  isOpen,
  onClose,
}) => {
  const store = usePetroStore();
  const [adjustmentType, setAdjustmentType] = useState<
    "SHORTAGE" | "EXCESS" | "EVAPORATION" | "CALIBRATION_CORRECTION"
  >("EVAPORATION");
  const [litres, setLitres] = useState("");
  const [isDeduction, setIsDeduction] = useState(true);
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!tank) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg("A mandatory reason is required for all stock adjustments.");
      return;
    }

    const val = parseFloat(litres);
    if (!val || val <= 0) {
      setErrorMsg("Please enter a valid litre quantity.");
      return;
    }

    const signedLitres = isDeduction ? -Math.abs(val) : Math.abs(val);

    store.addStockAdjustment({
      tankId: tank.id,
      fuelType: tank.fuelType,
      adjustmentType,
      litres: signedLitres,
      reason,
      approvedBy: store.currentUser?.name || "Owner",
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Authorise Stock Adjustment: ${tank.name}`}
      subtitle="Manual inventory adjustment creates an uneditable audit trail"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Adjustment Classification"
          value={adjustmentType}
          onChange={(e) => {
            const val = e.target.value as any;
            setAdjustmentType(val);
            if (val === "EVAPORATION" || val === "SHORTAGE") {
              setIsDeduction(true);
            } else if (val === "EXCESS") {
              setIsDeduction(false);
            }
          }}
        >
          <option value="EVAPORATION">Evaporation Loss (Standard Monthly)</option>
          <option value="SHORTAGE">Transit / Handling Shortage</option>
          <option value="EXCESS">Operational Excess Surplus</option>
          <option value="CALIBRATION_CORRECTION">Dip Calibration Correction</option>
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Adjustment Litres"
            type="number"
            step="0.1"
            value={litres}
            onChange={(e) => {
              setLitres(e.target.value);
              setErrorMsg("");
            }}
            required
            placeholder="e.g. 25.5"
          />

          <Select
            label="Direction"
            value={isDeduction ? "DEDUCT" : "ADD"}
            onChange={(e) => setIsDeduction(e.target.value === "DEDUCT")}
          >
            <option value="DEDUCT">Deduct from Stock (-)</option>
            <option value="ADD">Add to Stock (+)</option>
          </Select>
        </div>

        <Input
          label="Mandatory Authorization Reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setErrorMsg("");
          }}
          required
          placeholder="e.g. Approved monthly temperature evaporation allowance"
          error={errorMsg}
        />

        <div className="p-3 bg-card-subtle border border-border-subtle rounded-sm text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-text-muted">Current Stock:</span>
            <span className="tabular-nums font-medium text-text">{formatLitres(tank.currentStockLitres)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Approved By:</span>
            <span className="font-medium text-text">{store.currentUser?.name} ({store.activeRole})</span>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" type="submit">
            Commit Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
