"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Shift } from "@/types";
import { CloseShiftModal } from "@/components/shifts/CloseShiftModal";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { PageTransition } from "@/components/animations/PageTransition";
import { LivePulseBadge } from "@/components/animations/LivePulseBadge";
import { formatPaise, formatDateTime, formatDate } from "@/lib/format";
import { hasPermission } from "@/lib/auth";
import { generatePdfReport } from "@/lib/export/exportPdf";
import { BRAND_COLORS } from "@/lib/theme";
import {
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Lock,
  Sparkles,
  ShieldCheck,
  Banknote,
  Receipt,
} from "lucide-react";

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

  // Running shift live sales
  const runningShiftSales = runningShift
    ? store.sales.filter((s) => s.shiftId === runningShift.id && s.status === "COMPLETED")
    : [];
  const runningShiftRevenue = runningShiftSales.reduce((acc, s) => acc + s.netAmountPaise, 0);

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
      `Shift: ${shift.name} | Opened by: ${shift.openedBy} | Expected Cash: ${formatPaise(
        shift.expectedCashPaise || 0
      )} | Actual Cash: ${formatPaise(shift.closingCashPaise || 0)} | Variance: ${formatPaise(
        shift.cashVariancePaise || 0
      )}`,
      headers,
      rows,
      store.station.name
    );
  };

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-slate-800">
        <div>
          <span className="text-[10px] tracking-wider uppercase text-amber-600 dark:text-amber-500 font-bold">
            Shift Operations & Cashbox Reconciliations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-slate-100 mt-1">
            Shift Management & Safe Handover
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Opening cash floats, meter handovers, denomination sheets, and managerial variance approvals.
          </p>
        </div>

        {!runningShift && (
          <button
            onClick={() => setOpenShiftModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Shift</span>
          </button>
        )}
      </div>

      {/* Active Running Shift Banner */}
      {runningShift ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <LivePulseBadge label="ACTIVE SHIFT" variant="saffron" size="sm" />
                <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                  {runningShift.code} ({runningShift.name})
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 dark:text-slate-100 mt-2">
                Shift Handover by {runningShift.openedBy}
              </h2>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Opened: {formatDateTime(runningShift.openedAt)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  Opening Float: <strong className="font-mono text-slate-900 dark:text-slate-100">{formatPaise(runningShift.openingCashPaise)}</strong>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5 text-amber-500" />
                  Current Billed: <strong className="font-mono text-slate-900 dark:text-slate-100">{formatPaise(runningShiftRevenue)}</strong> ({runningShiftSales.length} bills)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setSelectedShiftForClose(runningShift)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Close & Reconcile Shift</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Shift Currently Open</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Forecourt sales require an active operational shift to bill and assign receipts to pump operators.
          </p>
          <button
            onClick={() => setOpenShiftModal(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
          >
            Open Next Shift
          </button>
        </div>
      )}

      {/* Shift History & Audit Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mt-6">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
              Historical Shift Settlement & Denomination Log
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {store.shifts.length} shift handovers recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Shift Code</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Schedule</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Opened By</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Opening Float</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Expected Cash</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Actual Counted</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Cash Variance</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Status</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {store.shifts.map((shift) => {
                const variance = shift.cashVariancePaise || 0;
                const hasVariance = Math.abs(variance) > 0;
                const isPendingApproval = shift.status === "CLOSED" && hasVariance && !shift.varianceApproved;

                return (
                  <tr key={shift.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold font-mono text-slate-900 dark:text-slate-100">{shift.code}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      {shift.name} ({formatDate(shift.date, "dd MMM")})
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{shift.openedBy}</td>
                    <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                      {formatPaise(shift.openingCashPaise)}
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                      {shift.expectedCashPaise !== undefined ? formatPaise(shift.expectedCashPaise) : "Running"}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {shift.closingCashPaise !== undefined ? formatPaise(shift.closingCashPaise) : "—"}
                    </td>
                    <td
                      className={`p-3.5 text-right font-mono font-extrabold ${
                        variance === 0
                          ? "text-emerald-600"
                          : Math.abs(variance) > 50000
                          ? "text-rose-600"
                          : "text-amber-600"
                      }`}
                    >
                      {shift.closingCashPaise !== undefined
                        ? `${variance >= 0 ? "+" : ""}${formatPaise(variance)}`
                        : "—"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          shift.status === "OPEN"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400"
                            : isPendingApproval
                            ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
                        }`}
                      >
                        {isPendingApproval ? "Needs Sign-off" : shift.status === "LOCKED" ? "Reconciled" : shift.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center space-x-2">
                      <button
                        onClick={() => handlePrintShiftReport(shift)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Print / Export Shift PDF"
                      >
                        <Printer className="w-3.5 h-3.5 inline" />
                      </button>

                      {isPendingApproval && canApprove && (
                        <button
                          onClick={() => setApproveShiftId(shift.id)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Close Shift Modal with Denomination Sheet */}
      <CloseShiftModal
        shift={selectedShiftForClose}
        isOpen={!!selectedShiftForClose}
        onClose={() => setSelectedShiftForClose(null)}
      />

      {/* Start Shift Modal */}
      <Modal
        isOpen={openShiftModal}
        onClose={() => setOpenShiftModal(false)}
        title="Open Forecourt Shift"
        subtitle="Initialize cash float and unlock nozzles for fueling sales"
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
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Handover Remarks / Notes
            </label>
            <textarea
              rows={2}
              value={shiftNotes}
              onChange={(e) => setShiftNotes(e.target.value)}
              placeholder="e.g. Starting float counted & verified from safe till"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setOpenShiftModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
            >
              Start Shift Operations
            </button>
          </div>
        </form>
      </Modal>

      {/* Manager Variance Approval Modal */}
      <Modal
        isOpen={Boolean(approveShiftId)}
        onClose={() => setApproveShiftId(null)}
        title="Owner / GM Variance Approval"
        subtitle="Sign off on shift cash discrepancy for financial ledger closing"
        maxWidth="md"
      >
        <form onSubmit={handleApproveVariance} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Authorizing this variance confirms managerial review of dispenser meters against actual cash counted in the safe till.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Approval Justification Note
            </label>
            <textarea
              required
              rows={3}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="e.g. Reviewed shift audit: variance within normal forecourt coin tolerance"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setApproveShiftId(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
            >
              Authorize & Close Variance
            </button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
