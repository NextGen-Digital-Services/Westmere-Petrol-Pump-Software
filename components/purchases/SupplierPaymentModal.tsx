"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Supplier } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatPaise } from "@/lib/format";

interface SupplierPaymentModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SupplierPaymentModal: React.FC<SupplierPaymentModalProps> = ({
  supplier,
  isOpen,
  onClose,
}) => {
  const store = usePetroStore();
  const [amountRupees, setAmountRupees] = useState("100000");
  const [method, setMethod] = useState<"BANK_TRANSFER" | "CHEQUE" | "RTGS" | "NEFT">("RTGS");
  const [refNumber, setRefNumber] = useState("RTGS/PUMP/" + Math.floor(Math.random() * 900000 + 100000));
  const [notes, setNotes] = useState("");

  if (!supplier) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountPaise = Math.round((parseFloat(amountRupees) || 0) * 100);

    store.createSupplierPayment({
      supplierId: supplier.id,
      amountPaise,
      paymentMethod: method,
      referenceNumber: refNumber,
      paymentDate: new Date().toISOString().split("T")[0],
      notes,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment to Supplier: ${supplier.name}`}
      subtitle={`Outstanding Balance: ${formatPaise(supplier.outstandingBalancePaise)} • GSTIN: ${supplier.gstin}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Remittance Amount (₹)"
          type="number"
          step="1"
          value={amountRupees}
          onChange={(e) => setAmountRupees(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Payment Mode"
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
          >
            <option value="RTGS">RTGS Banking</option>
            <option value="NEFT">NEFT Transfer</option>
            <option value="BANK_TRANSFER">Direct Net Banking</option>
            <option value="CHEQUE">Bank Cheque</option>
          </Select>
          <Input
            label="Transaction UTR / Cheque No."
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
            required
          />
        </div>

        <Input
          label="Payment Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Settlement for delivery invoice INV-IOCL-44129"
        />

        <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Post Supplier Remittance
          </Button>
        </div>
      </form>
    </Modal>
  );
};
