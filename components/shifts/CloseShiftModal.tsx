"use client";

import React, { useState } from "react";
import { Shift } from "@/types";
import { usePetroStore } from "@/store/usePetroStore";
import { calculateShiftReconciliation } from "@/lib/calc";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPaise, formatLitres } from "@/lib/format";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface CloseShiftModalProps {
  shift: Shift | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CloseShiftModal: React.FC<CloseShiftModalProps> = ({
  shift,
  isOpen,
  onClose,
}) => {
  const store = usePetroStore();
  const [actualCashRupees, setActualCashRupees] = useState("");
  const [varianceReason, setVarianceReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!shift) return null;

  // Aggregate sales in this shift
  const shiftSales = store.sales.filter((s) => s.shiftId === shift.id && s.status === "COMPLETED");
  const totalSalesPaise = shiftSales.reduce((acc, s) => acc + s.netAmountPaise, 0);

  let creditSalesPaise = 0;
  let upiPaise = 0;
  let cardPaise = 0;

  for (const s of shiftSales) {
    for (const p of s.payments) {
      if (p.method === "CREDIT") creditSalesPaise += p.amountPaise;
      if (p.method === "UPI") upiPaise += p.amountPaise;
      if (p.method === "CARD") cardPaise += p.amountPaise;
    }
  }

  // Shift expenses paid in cash
  const shiftCashExpenses = store.expenses
    .filter((e) => e.shiftId === shift.id && e.paymentMethod === "CASH" && e.status === "APPROVED")
    .reduce((acc, e) => acc + e.amountPaise, 0);

  const actualCashPaise = Math.round((parseFloat(actualCashRupees || "0") || 0) * 100);

  const reconciliation = calculateShiftReconciliation(
    totalSalesPaise,
    creditSalesPaise,
    upiPaise,
    cardPaise,
    shiftCashExpenses,
    actualCashPaise
  );

  const isMismatch = Math.abs(reconciliation.cashVariancePaise) > 0;
  const isLargeMismatch = Math.abs(reconciliation.cashVariancePaise) > (store.settings.maxManagerVarianceApprovalPaise || 50000);

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualCashRupees) {
      setErrorMsg("Please enter the physical closing cash counted from station till.");
      return;
    }

    if (isMismatch && !varianceReason.trim()) {
      setErrorMsg("A variance reason is mandatory whenever physical cash differs from expected collection.");
      return;
    }

    store.closeShift(
      shift.id,
      actualCashPaise,
      reconciliation.expectedCashPaise,
      varianceReason || undefined
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Close Shift & Reconcile: ${shift.name} (${shift.code})`}
      subtitle="Strict tender reconciliation — Cash, UPI, and Card are isolated"
      maxWidth="lg"
    >
      <form onSubmit={handleCloseSubmit} className="space-y-6">
        {/* Sales & Tender Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-card-subtle border border-border-subtle rounded-sm text-xs">
          <div>
            <span className="text-[10px] tracking-caps uppercase text-text-faint block">Total Sales</span>
            <span className="text-sm font-semibold tabular-nums text-text block mt-0.5">
              {formatPaise(totalSalesPaise)}
            </span>
          </div>

          <div>
            <span className="text-[10px] tracking-caps uppercase text-text-faint block">Credit Billed</span>
            <span className="text-sm font-semibold tabular-nums text-text block mt-0.5">
              {formatPaise(creditSalesPaise)}
            </span>
          </div>

          <div>
            <span className="text-[10px] tracking-caps uppercase text-text-faint block">UPI Settled</span>
            <span className="text-sm font-semibold tabular-nums text-brass block mt-0.5">
              {formatPaise(upiPaise)}
            </span>
          </div>

          <div>
            <span className="text-[10px] tracking-caps uppercase text-text-faint block">Card POS</span>
            <span className="text-sm font-semibold tabular-nums text-text block mt-0.5">
              {formatPaise(cardPaise)}
            </span>
          </div>
        </div>

        {/* Expected Cash Reconciliation Formula Card */}
        <div className="p-4 bg-card border border-border rounded-sm space-y-2 text-xs">
          <div className="flex justify-between text-text-muted">
            <span>Expected Commercial Collection (Sales - Credit):</span>
            <span className="tabular-nums font-medium text-text">{formatPaise(reconciliation.expectedCollectionPaise)}</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>Less: Digital Settlements (UPI + Card):</span>
            <span className="tabular-nums font-medium text-text">- {formatPaise(upiPaise + cardPaise)}</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>Less: Shift Cash Expenses Incurred:</span>
            <span className="tabular-nums font-medium text-text">- {formatPaise(shiftCashExpenses)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border-subtle text-sm font-bold text-text">
            <span>Expected Till Cash Collection:</span>
            <span className="tabular-nums text-accent">{formatPaise(reconciliation.expectedCashPaise)}</span>
          </div>
        </div>

        {/* Physical Cash Input */}
        <div>
          <Input
            label="Physical Cash Counted in Station Till (₹)"
            type="number"
            step="0.01"
            value={actualCashRupees}
            onChange={(e) => {
              setActualCashRupees(e.target.value);
              setErrorMsg("");
            }}
            required
            placeholder="e.g. 18450"
            helperText="Total currency notes and coins physically verified"
            error={errorMsg}
          />
        </div>

        {/* Live Variance Calculation Alert */}
        {actualCashRupees && (
          <div
            className={`p-4 border rounded-sm text-xs flex items-start space-x-3 ${
              reconciliation.cashVariancePaise === 0
                ? "bg-olive/10 border-olive/30 text-olive"
                : isLargeMismatch
                ? "bg-brick/15 border-brick/40 text-brick"
                : "bg-warning/15 border-warning/30 text-warning"
            }`}
          >
            {reconciliation.cashVariancePaise === 0 ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-sm">
                Cash Variance:{" "}
                <span className="tabular-nums font-bold">
                  {reconciliation.cashVariancePaise >= 0 ? "+" : ""}
                  {formatPaise(reconciliation.cashVariancePaise)}
                </span>
                {reconciliation.cashVariancePaise === 0 ? " (Perfect Reconciliation)" : ""}
              </p>
              {isMismatch && (
                <p className="mt-1 text-[11px] leading-relaxed">
                  {isLargeMismatch
                    ? "Discrepancy exceeds standard manager threshold (₹500.00). Closing will require Owner approval to permanently lock."
                    : "Discrepancy within manager threshold. Requires documented variance explanation."}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Mandatory Variance Reason */}
        {isMismatch && actualCashRupees && (
          <Input
            label="Mandatory Variance Reason"
            value={varianceReason}
            onChange={(e) => {
              setVarianceReason(e.target.value);
              setErrorMsg("");
            }}
            required
            placeholder="e.g. Denomination rounding variance or customer coin shortage"
          />
        )}

        <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Close & Commit Reconciliation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
