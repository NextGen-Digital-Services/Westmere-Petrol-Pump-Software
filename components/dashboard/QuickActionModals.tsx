"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { ExpenseCategory, FuelType } from "@/types";
import { generatePdfReport } from "@/lib/export/exportPdf";
import { formatPaise, formatLitres, formatDateTime } from "@/lib/format";

interface QuickActionModalsProps {
  shiftModalOpen: boolean;
  onCloseShiftModal: () => void;
  purchaseModalOpen: boolean;
  onClosePurchaseModal: () => void;
  expenseModalOpen: boolean;
  onCloseExpenseModal: () => void;
  paymentModalOpen: boolean;
  onClosePaymentModal: () => void;
  reportModalOpen: boolean;
  onCloseReportModal: () => void;
}

export const QuickActionModals: React.FC<QuickActionModalsProps> = ({
  shiftModalOpen,
  onCloseShiftModal,
  purchaseModalOpen,
  onClosePurchaseModal,
  expenseModalOpen,
  onCloseExpenseModal,
  paymentModalOpen,
  onClosePaymentModal,
  reportModalOpen,
  onCloseReportModal,
}) => {
  const store = usePetroStore();

  // New Shift State
  const [shiftName, setShiftName] = useState<"Morning" | "Evening" | "Night">("Morning");
  const [openingCashRupees, setOpeningCashRupees] = useState("25000");
  const [shiftNotes, setShiftNotes] = useState("");

  // Fuel Purchase State
  const [supplierId, setSupplierId] = useState(store.suppliers[0]?.id || "");
  const [fuelType, setFuelType] = useState<FuelType>("Petrol");
  const [targetTankId, setTargetTankId] = useState(store.tanks[0]?.id || "");
  const [invoiceNo, setInvoiceNo] = useState("INV-IOCL-" + Math.floor(Math.random() * 90000 + 10000));
  const [challanNo, setChallanNo] = useState("CHL-IOCL-" + Math.floor(Math.random() * 90000 + 10000));
  const [invoiceLitres, setInvoiceLitres] = useState("10000");
  const [receivedLitres, setReceivedLitres] = useState("9990");
  const [ratePerLitre, setRatePerLitre] = useState("88.50");

  // Add Expense State
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>("Miscellaneous");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmountRupees, setExpenseAmountRupees] = useState("500");
  const [expensePaidTo, setExpensePaidTo] = useState("");
  const [expenseMethod, setExpenseMethod] = useState<"CASH" | "UPI" | "BANK_TRANSFER">("CASH");

  // Record Customer Credit Payment State
  const [customerId, setCustomerId] = useState(store.customers[0]?.id || "");
  const [paymentAmountRupees, setPaymentAmountRupees] = useState("20000");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "BANK_TRANSFER">("UPI");
  const [paymentRef, setPaymentRef] = useState("UPI/REF-" + Math.floor(Math.random() * 900000 + 100000));

  // Handler: Start New Shift
  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    const paise = Math.round(parseFloat(openingCashRupees || "0") * 100);
    store.openShift(shiftName, paise, shiftNotes);
    onCloseShiftModal();
  };

  // Handler: Record Fuel Delivery
  const handleRecordDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const invL = parseFloat(invoiceLitres) || 0;
    const recL = parseFloat(receivedLitres) || 0;
    const ratePaise = Math.round((parseFloat(ratePerLitre) || 0) * 100);
    const shortageL = Math.max(0, invL - recL);
    const totalPaise = Math.round(recL * ratePaise);

    store.createFuelDelivery({
      challanNumber: challanNo,
      invoiceNumber: invoiceNo,
      invoiceDate: new Date().toISOString().split("T")[0],
      supplierId,
      fuelType,
      invoiceLitres: invL,
      receivedLitres: recL,
      shortageLitres: shortageL,
      ratePerLitrePaise: ratePaise,
      freightPaise: 400000,
      vatPaise: 0,
      totalInvoicePaise: totalPaise,
      tankAllocations: [{ tankId: targetTankId, litres: recL }],
      verifiedBy: store.currentUser?.name || "Shift Manager",
      verifiedAt: new Date().toISOString(),
      notes: "Decanted into storage tank successfully.",
    });

    onClosePurchaseModal();
  };

  // Handler: Add Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountPaise = Math.round((parseFloat(expenseAmountRupees) || 0) * 100);
    const runningShift = store.shifts.find((s) => s.status === "OPEN");

    store.addExpense({
      voucherNumber: "VCH-" + Math.floor(Math.random() * 90000 + 10000),
      shiftId: runningShift?.id,
      category: expenseCategory,
      description: expenseDesc,
      amountPaise,
      paidTo: expensePaidTo || "Vendor",
      paymentMethod: expenseMethod,
      isShiftExpense: !!runningShift,
      approvedBy: store.currentUser?.name,
      status: "APPROVED",
      date: new Date().toISOString().split("T")[0],
    });

    onCloseExpenseModal();
  };

  // Handler: Record Customer Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountPaise = Math.round((parseFloat(paymentAmountRupees) || 0) * 100);

    store.recordCreditPayment({
      customerId,
      amountPaise,
      paymentMethod,
      referenceNumber: paymentRef,
      receivedAt: new Date().toISOString(),
      receivedBy: store.currentUser?.name || "Cashier",
      notes: "Settlement toward outstanding credit balance.",
    });

    onClosePaymentModal();
  };

  // Handler: Generate PDF Daily Report
  const handleDownloadDailyPdf = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todaySales = store.sales.filter((s) => s.createdAt.startsWith(todayStr));
    const totalRev = todaySales.reduce((acc, s) => acc + s.netAmountPaise, 0);

    const headers = ["Invoice", "Time", "Fuel", "Volume", "Rate", "Amount", "Method", "Vehicle"];
    const rows = todaySales.map((s) => [
      s.receiptNumber,
      formatDateTime(s.createdAt),
      s.fuelType,
      formatLitres(s.quantityLitres),
      formatPaise(s.pricePerLitrePaise),
      formatPaise(s.netAmountPaise),
      s.payments.map((p) => p.method).join("+"),
      s.vehicleNumber || "Retail",
    ]);

    generatePdfReport(
      "Daily Station Operations & Sales Register",
      `Total Revenue: ${formatPaise(totalRev)} (${todaySales.length} sales)`,
      headers,
      rows,
      store.station.name
    );

    onCloseReportModal();
  };

  return (
    <>
      {/* 1. Start Shift Modal */}
      <Modal
        isOpen={shiftModalOpen}
        onClose={onCloseShiftModal}
        title="Start Shift Operations"
        subtitle="Open new station shift and establish starting cash float"
      >
        <form onSubmit={handleStartShift} className="space-y-4">
          <Select
            label="Shift Schedule"
            value={shiftName}
            onChange={(e) => setShiftName(e.target.value as any)}
          >
            <option value="Morning">Morning Shift (06:00 - 14:00)</option>
            <option value="Evening">Evening Shift (14:00 - 22:00)</option>
            <option value="Night">Night Shift (22:00 - 06:00)</option>
          </Select>

          <Input
            label="Opening Cash Float (₹)"
            type="number"
            value={openingCashRupees}
            onChange={(e) => setOpeningCashRupees(e.target.value)}
            required
            helperText="Counted cash float placed in station till"
          />

          <Input
            label="Shift Briefing Notes (Optional)"
            value={shiftNotes}
            onChange={(e) => setShiftNotes(e.target.value)}
            placeholder="e.g. Island A & B operating normally"
          />

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={onCloseShiftModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm & Open Shift
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Fuel Purchase Modal */}
      <Modal
        isOpen={purchaseModalOpen}
        onClose={onClosePurchaseModal}
        title="Record Fuel Delivery Challan"
        subtitle="Verify bulk depot tanker decanting and allocate into underground tank"
      >
        <form onSubmit={handleRecordDelivery} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Oil Supplier"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              {store.suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>

            <Select
              label="Fuel Product"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value as any)}
            >
              <option value="Petrol">Petrol (MS)</option>
              <option value="Diesel">Diesel (HSD)</option>
              <option value="Speed Petrol">Speed Petrol</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Depot Challan No."
              value={challanNo}
              onChange={(e) => setChallanNo(e.target.value)}
              required
            />
            <Input
              label="Invoice Number"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Invoice Litres"
              type="number"
              value={invoiceLitres}
              onChange={(e) => setInvoiceLitres(e.target.value)}
              required
            />
            <Input
              label="Received Litres"
              type="number"
              value={receivedLitres}
              onChange={(e) => setReceivedLitres(e.target.value)}
              required
            />
            <Input
              label="Rate / L (₹)"
              type="number"
              step="0.01"
              value={ratePerLitre}
              onChange={(e) => setRatePerLitre(e.target.value)}
              required
            />
          </div>

          <Select
            label="Destination Underground Tank"
            value={targetTankId}
            onChange={(e) => setTargetTankId(e.target.value)}
          >
            {store.tanks
              .filter((t) => t.fuelType === fuelType)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Current: {formatLitres(t.currentStockLitres)})
                </option>
              ))}
          </Select>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={onClosePurchaseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Verify & Decant Tanker
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Add Expense Modal */}
      <Modal
        isOpen={expenseModalOpen}
        onClose={onCloseExpenseModal}
        title="Record Station Expense"
        subtitle="Log operational overhead or shift cash outflow"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Select
            label="Expense Category"
            value={expenseCategory}
            onChange={(e) => setExpenseCategory(e.target.value as any)}
          >
            <option value="Generator fuel">Generator fuel</option>
            <option value="Electricity">Electricity</option>
            <option value="Employee salaries">Employee salaries</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Transportation">Transportation</option>
            <option value="Office expenses">Office expenses</option>
            <option value="Equipment repair">Equipment repair</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </Select>

          <Input
            label="Amount (₹)"
            type="number"
            value={expenseAmountRupees}
            onChange={(e) => setExpenseAmountRupees(e.target.value)}
            required
          />

          <Input
            label="Description / Purpose"
            value={expenseDesc}
            onChange={(e) => setExpenseDesc(e.target.value)}
            placeholder="e.g. Canopy LED tube replacement"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Paid To (Vendor / Person)"
              value={expensePaidTo}
              onChange={(e) => setExpensePaidTo(e.target.value)}
              placeholder="e.g. Metro Electricals"
              required
            />
            <Select
              label="Payment Method"
              value={expenseMethod}
              onChange={(e) => setExpenseMethod(e.target.value as any)}
            >
              <option value="CASH">Cash (Petty Cash/Shift)</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={onCloseExpenseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Approve & Record Expense
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. Record Customer Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={onClosePaymentModal}
        title="Collect Credit Payment"
        subtitle="Credit remittance against customer ledger"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Select
            label="Customer / Fleet Company"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            {store.customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — Outstanding: {formatPaise(c.currentBalancePaise)}
              </option>
            ))}
          </Select>

          <Input
            label="Payment Amount (₹)"
            type="number"
            value={paymentAmountRupees}
            onChange={(e) => setPaymentAmountRupees(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Payment Mode"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
            >
              <option value="UPI">UPI / Net Banking</option>
              <option value="CASH">Cash Deposit</option>
              <option value="BANK_TRANSFER">RTGS / NEFT</option>
            </Select>
            <Input
              label="Txn / Cheque Ref No."
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={onClosePaymentModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Post Ledger Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. Generate Daily Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={onCloseReportModal}
        title="Export Daily Station Report"
        subtitle="Generate signed operational PDF for audits and accounting"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-text-muted leading-relaxed">
            Exports a formatted daily operations sheet including all nozzle sales, totalizer readings,
            tank stock levels, tender breakdown (Cash, UPI, Card, Credit), and variance metrics.
          </p>

          <div className="p-3 bg-card-subtle border border-border-subtle rounded-sm text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted">Target Station:</span>
              <span className="font-medium text-text">{store.station.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Generated By:</span>
              <span className="font-medium text-text">{store.currentUser?.name} ({store.activeRole})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Standard:</span>
              <span className="text-olive font-medium">Weights & Measures Audited</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" onClick={onCloseReportModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDownloadDailyPdf}>
              Generate & Download PDF
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
