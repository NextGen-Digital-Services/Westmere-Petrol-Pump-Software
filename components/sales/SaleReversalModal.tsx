"use client";

import React, { useState } from "react";
import { Sale } from "@/types";
import { usePetroStore } from "@/store/usePetroStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPaise, formatLitres } from "@/lib/format";

interface SaleReversalModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SaleReversalModal: React.FC<SaleReversalModalProps> = ({
  sale,
  isOpen,
  onClose,
}) => {
  const store = usePetroStore();
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!sale) return null;

  const handleCommitReversal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg("A mandatory reason is required to reverse an issued transaction.");
      return;
    }

    store.reverseSale(sale.id, reason);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Authorise Transaction Reversal / Refund"
      subtitle={`Invoice: ${sale.receiptNumber} • ${sale.fuelType} (${formatLitres(sale.quantityLitres)})`}
      maxWidth="md"
    >
      <form onSubmit={handleCommitReversal} className="space-y-4">
        <div className="p-4 bg-brick/10 border border-brick/30 text-xs text-brick rounded-sm space-y-1">
          <p className="font-semibold">Financial Compliance Notice</p>
          <p className="text-[11px] leading-relaxed">
            Financial records are never deleted. Reversing this transaction will restore {formatLitres(sale.quantityLitres)} to Tank {sale.tankId}, adjust customer credit ledger (if applicable), refund physical cash from shift till (if cash tender was taken), and mark this record as REVERSED.
          </p>
        </div>

        <div className="p-3 bg-card-subtle border border-border-subtle rounded-sm text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-text-muted">Total Net Amount:</span>
            <span className="font-semibold tabular-nums text-text">{formatPaise(sale.netAmountPaise)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Payment Tender(s):</span>
            <span className="text-text">{sale.payments.map((p) => p.method).join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Authorized Reversal Officer:</span>
            <span className="font-medium text-text">{store.currentUser?.name} ({store.activeRole})</span>
          </div>
        </div>

        <Input
          label="Mandatory Reason for Cancellation / Reversal"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setErrorMsg("");
          }}
          required
          placeholder="e.g. Dispenser nozzle cutoff error / wrong fuel vehicle mismatch"
          error={errorMsg}
        />

        <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" type="submit">
            Commit Reversal
          </Button>
        </div>
      </form>
    </Modal>
  );
};
