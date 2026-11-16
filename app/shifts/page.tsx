"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Shift } from "@/types";
import { CloseShiftModal } from "@/components/shifts/CloseShiftModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatPaise, formatDateTime, formatDate } from "@/lib/format";
import { hasPermission } from "@/lib/auth";
import { generatePdfReport } from "@/lib/export/exportPdf";
import { Clock, Plus, CheckCircle, AlertTriangle, Printer, Lock } from "lucide-react";

export default function ShiftsPage() {
  const store = usePetroStore();
  const [selectedShiftForClose, setSelectedShiftForClose] = useState<Shift | null>(null);
  const [openShiftModal, setOpenShiftModal] = useState(false);
  const [approveShiftId, setApproveShiftId] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");

  // New Shift Form
  const [shiftName, setShiftName] = useState<"Morning" | "Evening" | "Night">("Morning");
  const [openingCash, setOpeningCash] = useState("25000");
  const [shiftNotes, setShiftNotes] = useState("");

  const canApprove = hasPermission(store.activeRole, "approve_shift_variance");
  const runningShift = store.shifts.find((s) => s.status === "OPEN");

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    const paise = Math.round((parseFloat(openingCash) || 0) * 100);
    store.openShift(shiftName, paise, shiftNotes);
    setOpenShiftModal(false);
  };

  const handleApproveVariance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveShiftId) return;
    store.approveShiftVariance(approveShiftId, approvalNotes);
    setApproveShiftId(null);
    setApprovalNotes("");
  };

  const handlePrintShiftReport = (shift: Shift) => {
    const shiftSales = store.sales.filter((s) => s.shiftId === shift.id);
    const totalRev = shiftSales.reduce((acc, s) => acc + s.netAmountPaise, 0);

    const headers = ["Invoice", "Time", "Fuel", "Volume (L)", "Amount", "Method"];
    const rows = shiftSales.map((s) => [
      s.receiptNumber,
      formatDateTime(s.createdAt),
      s.fuelType,
      s.quantityLitres.toFixed(2),
      formatPaise(s.netAmountPaise),
      s.payments.map((p) => p.method).join("+"),
    ]);

    generatePdfReport(
      `Shift Closing Settlement (${shift.code})`,
      `Shift: ${shift.name} | Opened by: ${shift.openedBy} | Expected Cash: ${formatPaise(shift.expectedCashPaise || 0)} | Actual Cash: ${formatPaise(shift.closingCashPaise || 0)} | Variance: ${formatPaise(shift.cashVariancePaise || 0)}`,
      headers,
      rows,
      store.station.name
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
            Shift Operations & Cashbox Reconciliations
          </span>
          <h1 className="text-3xl font-serif font-light tracking-editorial text-text mt-1">
            Shift Management
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Opening cash floats, meter handovers, strict isolated tender settlement, and managerial discrepancy approval.
          </p>
        </div>

        {!runningShift && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setOpenShiftModal(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Start New Shift
          </Button>
        )}
      </div>

      {/* Active Running Shift Banner */}
      {runningShift ? (
        <div className="bg-card border-2 border-accent/40 rounded-sm p-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-olive animate-pulse" />
                <span className="text-[10px] tracking-caps uppercase text-accent font-bold">
                  Active Running Shift ({runningShift.name})
                </span>
                <span className="text-text-faint text-xs">•</span>
                <span className="text-xs text-text-muted font-medium">{runningShift.code}</span>
              </div>
              <h2 className="text-2xl font-serif font-medium text-text mt-1">
                Started by {runningShift.openedBy} at {formatDateTime(runningShift.openedAt)}
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Opening Cash Float: <strong className="text-text font-semibold">{formatPaise(runningShift.openingCashPaise)}</strong>
                {runningShift.notes && ` • Notes: ${runningShift.notes}`}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => setSelectedShiftForClose(runningShift)}
                className="bg-accent text-bg hover:opacity-90 font-semibold"
              >
                Close & Reconcile Shift
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-card border border-dashed border-border rounded-sm text-center">
          <Clock className="w-6 h-6 text-text-faint mx-auto mb-2" />
          <h3 className="text-sm font-medium text-text">No Shift Currently Open</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Forecourt sales require an active operational shift to bill and assign receipts.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenShiftModal(true)}
            className="mt-4"
          >
            Open Next Shift
          </Button>
        </div>
      )}

      {/* Shift History & Audit Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-base font-serif font-medium tracking-editorial text-text">
            Historical Shift Settlement Log
          </h3>
          <span className="text-xs text-text-muted">{store.shifts.length} recorded shifts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle border-b border-border">
              <tr>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Shift Code</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Schedule</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Opened By</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Opening Float</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Expected Cash</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Actual Cash</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Variance</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Status</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {store.shifts.map((shift) => {
                const variance = shift.cashVariancePaise || 0;
                const hasVariance = Math.abs(variance) > 0;
                const isPendingApproval = shift.status === "CLOSED" && hasVariance;

                return (
                  <tr key={shift.id} className="hover:bg-card-subtle/40">
                    <td className="p-3 font-semibold text-text">{shift.code}</td>
                    <td className="p-3 text-text-muted">
                      {shift.name} ({formatDate(shift.date, "dd MMM")})
                    </td>
                    <td className="p-3 text-text-muted">{shift.openedBy}</td>
                    <td className="p-3 text-right tabular-nums text-text-muted">
                      {formatPaise(shift.openingCashPaise)}
                    </td>
                    <td className="p-3 text-right tabular-nums text-text-muted">
                      {shift.expectedCashPaise !== undefined ? formatPaise(shift.expectedCashPaise) : "Running"}
                    </td>
                    <td className="p-3 text-right tabular-nums text-text">
                      {shift.closingCashPaise !== undefined ? formatPaise(shift.closingCashPaise) : "—"}
                    </td>
                    <td
                      className={`p-3 text-right tabular-nums font-semibold ${
                        variance === 0
                          ? "text-olive"
                          : Math.abs(variance) > 50000
                          ? "text-brick"
                          : "text-warning"
                      }`}
                    >
                      {shift.closingCashPaise !== undefined
                        ? `${variance >= 0 ? "+" : ""}${formatPaise(variance)}`
                        : "—"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] tracking-caps uppercase font-semibold border rounded-sm ${
                          shift.status === "OPEN"
                            ? "bg-accent/15 text-accent border-accent/30"
                            : shift.status === "LOCKED"
                            ? "bg-card text-text-muted border-border"
                            : "bg-brick/15 text-brick border-brick/30"
                        }`}
                      >
                        {shift.status === "CLOSED" ? "Needs Approval" : shift.status}
                      </span>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      {isPendingApproval && canApprove && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setApproveShiftId(shift.id)}
                          className="h-6 text-[10px] px-2 text-brass border-brass/40 hover:bg-brass/10"
                        >
                          Approve
                        </Button>
                      )}
                      <button
                        onClick={() => handlePrintShiftReport(shift)}
                        className="p-1 text-text-muted hover:text-text rounded-sm transition-colors"
                        title="Print / Export Shift Report"
                      >
                        <Printer className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Close Shift Modal */}
      <CloseShiftModal
        shift={selectedShiftForClose}
        isOpen={!!selectedShiftForClose}
        onClose={() => setSelectedShiftForClose(null)}
      />

      {/* Start Shift Modal */}
      <Modal
        isOpen={openShiftModal}
        onClose={() => setOpenShiftModal(false)}
        title="Open Station Shift"
        subtitle="Specify shift schedule and starting cash till float"
        maxWidth="md"
      >
        <form onSubmit={handleOpenShift} className="space-y-4">
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
            value={openingCash}
            onChange={(e) => setOpeningCash(e.target.value)}
            required
            helperText="Counted currency placed into station drawer"
          />

          <Input
            label="Shift Notes"
            value={shiftNotes}
            onChange={(e) => setShiftNotes(e.target.value)}
            placeholder="e.g. Island A & B assigned to morning operators"
          />

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={() => setOpenShiftModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm & Open Shift
            </Button>
          </div>
        </form>
      </Modal>

      {/* Approve Shift Variance Modal */}
      <Modal
        isOpen={!!approveShiftId}
        onClose={() => setApproveShiftId(null)}
        title="Owner / General Manager Variance Approval"
        subtitle="Review cash discrepancy and lock shift record permanently"
        maxWidth="md"
      >
        <form onSubmit={handleApproveVariance} className="space-y-4">
          <p className="text-xs text-text-muted leading-relaxed">
            Approving this discrepancy marks the shift as <strong>LOCKED</strong> and updates station reconciliation audits.
          </p>

          <Input
            label="Approval Comments"
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="e.g. Small denomination variance verified against forecourt CCTV"
          />

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={() => setApproveShiftId(null)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit">
              Approve & Lock Shift
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
