"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatPaise } from "@/lib/format";

interface CashbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashbookModal: React.FC<CashbookModalProps> = ({ isOpen, onClose }) => {
  const store = usePetroStore();
  const [entryType, setEntryType] = useState<"BANK_DEPOSIT" | "BANK_WITHDRAWAL">("BANK_DEPOSIT");
  const [amountRupees, setAmountRupees] = useState("50000");
  const [bankName, setBankName] = useState("HDFC Bank (Current A/c 502000881920)");
  const [refNumber, setRefNumber] = useState("CHQ-" + Math.floor(Math.random() * 90000 + 10000));
  const [desc, setDesc] = useState("");

  const currentCashBalance = store.cashbook[0]?.balanceAfterPaise || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountPaise = Math.round((parseFloat(amountRupees) || 0) * 100);
    const isInflow = entryType === "BANK_WITHDRAWAL"; // Withdrawal brings cash into station
    const newBalance = isInflow
      ? currentCashBalance + amountPaise
      : currentCashBalance - amountPaise;

    store.addCashbookEntry({
      date: new Date().toISOString().split("T")[0],
      entryType: isInflow ? "INFLOW" : "OUTFLOW",
      source: entryType,
      referenceId: refNumber,
      description: desc || `${entryType === "BANK_DEPOSIT" ? "Station Cash Deposited to" : "Cash Withdrawn from"} ${bankName}`,
      amountPaise,
      balanceAfterPaise: newBalance,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bank Cash Management: Deposit / Withdrawal"
      subtitle={`Current Station Cash-in-Hand: ${formatPaise(currentCashBalance)}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Transaction Type"
          value={entryType}
          onChange={(e) => setEntryType(e.target.value as any)}
        >
          <option value="BANK_DEPOSIT">Deposit Cash to Bank (Outflow from Station Till)</option>
          <option value="BANK_WITHDRAWAL">Withdraw Cash from Bank (Inflow to Station Float)</option>
        </Select>

        <Input
          label="Amount (₹)"
          type="number"
          step="1"
          value={amountRupees}
          onChange={(e) => setAmountRupees(e.target.value)}
          required
        />

        <Input
          label="Bank Account Details"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          required
        />

        <Input
          label="Deposit Slip / Cheque Ref No."
          value={refNumber}
          onChange={(e) => setRefNumber(e.target.value)}
          required
        />

        <Input
          label="Remarks (Optional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="e.g. Daily forecourt cash collection banked"
        />

        <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Commit Banking Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
};
