"use client";

import React, { useState } from "react";
import { Employee } from "@/types";
import { usePetroStore } from "@/store/usePetroStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatPaise } from "@/lib/format";

interface SalaryPaymentModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SalaryPaymentModal: React.FC<SalaryPaymentModalProps> = ({
  employee,
  isOpen,
  onClose,
}) => {
  const store = usePetroStore();
  const [monthYear, setMonthYear] = useState("2026-11");
  const [advanceDeductionRupees, setAdvanceDeductionRupees] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "CASH" | "CHEQUE">("BANK_TRANSFER");
  const [notes, setNotes] = useState("");

  if (!employee) return null;

  const grossPaise = employee.monthlySalaryPaise;
  const advanceDeductionPaise = Math.round((parseFloat(advanceDeductionRupees) || 0) * 100);
  const netPaidPaise = Math.max(0, grossPaise - advanceDeductionPaise);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    store.recordSalaryPayment({
      employeeId: employee.id,
      monthYear,
      grossSalaryPaise: grossPaise,
      advanceDeductionPaise,
      netPaidPaise,
      paymentMethod,
      paidAt: new Date().toISOString(),
      notes,
    });

    // Also record in station expenses under "Employee salaries"
    store.addExpense({
      voucherNumber: "SAL-" + Math.floor(Math.random() * 90000 + 10000),
      category: "Employee salaries",
      description: `Monthly salary payout for ${employee.name} (${monthYear})`,
      amountPaise: netPaidPaise,
      paidTo: employee.name,
      paymentMethod: paymentMethod === "CASH" ? "CASH" : "BANK_TRANSFER",
      isShiftExpense: false,
      approvedBy: store.currentUser?.name,
      status: "APPROVED",
      date: new Date().toISOString().split("T")[0],
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Disburse Monthly Salary: ${employee.name}`}
      subtitle={`Code: ${employee.employeeCode} • Role: ${employee.role}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Payroll Month (YYYY-MM)"
          type="month"
          value={monthYear}
          onChange={(e) => setMonthYear(e.target.value)}
          required
        />

        <div className="p-3 bg-card-subtle border border-border-subtle rounded-sm space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-text-muted">Standard Gross Salary:</span>
            <span className="font-semibold tabular-nums text-text">{formatPaise(grossPaise)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Current Salary Advance Balance:</span>
            <span className="tabular-nums font-medium text-brick">{formatPaise(employee.currentAdvancePaise)}</span>
          </div>
        </div>

        <Input
          label="Salary Advance Recovery Deduction (₹)"
          type="number"
          value={advanceDeductionRupees}
          onChange={(e) => setAdvanceDeductionRupees(e.target.value)}
          helperText="Deducted from gross salary toward outstanding advance"
        />

        <Select
          label="Payment Disbursement Mode"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as any)}
        >
          <option value="BANK_TRANSFER">Bank Direct Account Transfer</option>
          <option value="CASH">Station Cash</option>
          <option value="CHEQUE">Bank Cheque</option>
        </Select>

        <div className="p-3 bg-card border border-border rounded-sm flex items-center justify-between text-xs font-semibold">
          <span>Net Salary Disbursed:</span>
          <span className="text-base tabular-nums font-bold text-accent">{formatPaise(netPaidPaise)}</span>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Disburse Salary Voucher
          </Button>
        </div>
      </form>
    </Modal>
  );
};
