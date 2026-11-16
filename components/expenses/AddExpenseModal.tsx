"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { ExpenseCategory } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const store = usePetroStore();
  const [category, setCategory] = useState<ExpenseCategory>("Maintenance");
  const [description, setDescription] = useState("");
  const [amountRupees, setAmountRupees] = useState("1200");
  const [paidTo, setPaidTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "BANK_TRANSFER">("CASH");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setReceiptUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountPaise = Math.round((parseFloat(amountRupees) || 0) * 100);
    if (amountPaise <= 0) {
      setErrorMsg("Please specify a valid expense amount.");
      return;
    }

    const runningShift = store.shifts.find((s) => s.status === "OPEN");

    store.addExpense({
      voucherNumber: "VCH-" + Math.floor(Math.random() * 90000 + 10000),
      shiftId: runningShift?.id,
      category,
      description,
      amountPaise,
      paidTo: paidTo || "Vendor",
      paymentMethod,
      isShiftExpense: paymentMethod === "CASH" && !!runningShift,
      approvedBy: store.currentUser?.name,
      status: "APPROVED",
      receiptUrl: receiptUrl || undefined,
      date: new Date().toISOString().split("T")[0],
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Station Operational Expense"
      subtitle="Creates expense voucher and automatically updates daily cashbook outflow"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Statutory Expense Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
        >
          <option value="Employee salaries">Employee salaries</option>
          <option value="Electricity">Electricity</option>
          <option value="Generator fuel">Generator fuel</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Transportation">Transportation</option>
          <option value="Office expenses">Office expenses</option>
          <option value="Equipment repair">Equipment repair</option>
          <option value="Miscellaneous">Miscellaneous</option>
        </Select>

        <Input
          label="Voucher Amount (₹)"
          type="number"
          step="0.01"
          value={amountRupees}
          onChange={(e) => setAmountRupees(e.target.value)}
          required
        />

        <Input
          label="Particulars / Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Forecourt canopy lighting servicing"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Paid To (Beneficiary)"
            value={paidTo}
            onChange={(e) => setPaidTo(e.target.value)}
            placeholder="e.g. Metro Electrics"
            required
          />

          <Select
            label="Disbursement Mode"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
          >
            <option value="CASH">Cash (Petty Cash / Till)</option>
            <option value="UPI">UPI</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium tracking-wide uppercase text-text-muted mb-1.5">
            Attach Bill / Receipt Voucher
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="text-xs text-text file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border file:border-border file:text-xs file:font-medium file:bg-card hover:file:bg-card-subtle"
          />
        </div>

        {errorMsg && <p className="text-xs text-brick">{errorMsg}</p>}

        <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Approve & Commit Voucher
          </Button>
        </div>
      </form>
    </Modal>
  );
};
