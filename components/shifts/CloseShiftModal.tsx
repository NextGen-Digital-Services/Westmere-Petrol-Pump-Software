"use client";

import React, { useState, useEffect } from "react";
import { Shift, CashDenominationSheet } from "@/types";
import { usePetroStore } from "@/store/usePetroStore";
import { calculateShiftReconciliation } from "@/lib/calc";
import { Modal } from "@/components/ui/Modal";
import { formatPaise, formatLitres } from "@/lib/format";
import { BRAND_COLORS } from "@/lib/theme";
import { CashIllustration } from "@/components/illustrations/PaymentIllustrations";
import { AlertCircle, CheckCircle2, Calculator, Sparkles } from "lucide-react";

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
  const [denominations, setDenominations] = useState({
    notes500: 0,
    notes200: 0,
    notes100: 0,
    notes50: 0,
    notes20: 0,
    notes10: 0,
    coins: 0,
  });

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

  // Auto-calculated total physical cash from denomination sheet
  const physicalCashRupees =
    denominations.notes500 * 500 +
    denominations.notes200 * 200 +
    denominations.notes100 * 100 +
    denominations.notes50 * 50 +
    denominations.notes20 * 20 +
    denominations.notes10 * 10 +
    denominations.coins;

  const actualCashPaise = Math.round(physicalCashRupees * 100);

  const reconciliation = calculateShiftReconciliation(
    totalSalesPaise,
    creditSalesPaise,
    upiPaise,
    cardPaise,
    shiftCashExpenses,
    actualCashPaise
  );

  const isMismatch = Math.abs(reconciliation.cashVariancePaise) > 0;
  const isLargeMismatch =
    Math.abs(reconciliation.cashVariancePaise) >
    (store.settings.maxManagerVarianceApprovalPaise || 50000);

  // Quick auto-fill helper for convenience
  const handleAutoFillExpected = () => {
    let remaining = Math.floor(reconciliation.expectedCashPaise / 100);
    const n500 = Math.floor(remaining / 500);
    remaining %= 500;
    const n200 = Math.floor(remaining / 200);
    remaining %= 200;
    const n100 = Math.floor(remaining / 100);
    remaining %= 100;
    const n50 = Math.floor(remaining / 50);
    remaining %= 50;
    const n20 = Math.floor(remaining / 20);
    remaining %= 20;
    const n10 = Math.floor(remaining / 10);
    remaining %= 10;
    const coins = remaining;

    setDenominations({
      notes500: n500,
      notes200: n200,
      notes100: n100,
      notes50: n50,
      notes20: n20,
      notes10: n10,
      coins,
    });
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actualCashPaise === 0 && reconciliation.expectedCashPaise > 0) {
      setErrorMsg("Please enter physical notes counted in the safe denomination sheet.");
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
      title={`Close Shift & Cashbox Reconcile: ${shift.name} (${shift.code})`}
      subtitle="Strict Indian Oil tender isolation: Cash, BHIM UPI, Card POS, and Fleet Credit"
      maxWidth="lg"
    >
      <form onSubmit={handleCloseSubmit} className="space-y-6">
        {/* Sales & Tender Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 rounded-2xl text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Sales</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-0.5 block">
              {formatPaise(totalSalesPaise)}
            </span>
            <span className="text-[10px] text-slate-400">{shiftSales.length} bills</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 block">UPI QR</span>
            <span className="text-sm font-extrabold text-violet-600 font-mono mt-0.5 block">
              {formatPaise(upiPaise)}
            </span>
            <span className="text-[10px] text-slate-400">Direct to Bank</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block">Card POS</span>
            <span className="text-sm font-extrabold text-sky-600 font-mono mt-0.5 block">
              {formatPaise(cardPaise)}
            </span>
            <span className="text-[10px] text-slate-400">T+1 Settlement</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">Fleet Credit</span>
            <span className="text-sm font-extrabold text-rose-600 font-mono mt-0.5 block">
              {formatPaise(creditSalesPaise)}
            </span>
            <span className="text-[10px] text-slate-400">Ledger Invoiced</span>
          </div>
        </div>

        {/* Expected Cash Calculation Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-200 block">
              Theoretical Expected Cash in Safe:
            </span>
            <span className="text-[11px] text-amber-700 dark:text-amber-300">
              Opening Float + Cash Sales − Shift Cash Expenses ({formatPaise(shiftCashExpenses)})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
              {formatPaise(reconciliation.expectedCashPaise)}
            </span>
            <button
              type="button"
              onClick={handleAutoFillExpected}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs flex items-center gap-1"
              title="Auto-fill exact count matching expected cash"
            >
              <Sparkles className="w-3 h-3" />
              <span>Exact Match</span>
            </button>
          </div>
        </div>

        {/* Denomination Sheet (Section 8.2) */}
        <div className="border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CashIllustration size={28} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-heading">
                Physical Cash Denomination Count
              </h4>
            </div>
            <span className="text-xs text-slate-500 font-medium">Count physical notes from station till</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* ₹500 */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">₹500 Notes</span>
              <input
                type="number"
                min="0"
                value={denominations.notes500 || ""}
                onChange={(e) =>
                  setDenominations({ ...denominations, notes500: parseInt(e.target.value) || 0 })
                }
                placeholder="Count"
                className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
              />
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                = ₹{(denominations.notes500 * 500).toLocaleString("en-IN")}
              </span>
            </div>

            {/* ₹200 */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">₹200 Notes</span>
              <input
                type="number"
                min="0"
                value={denominations.notes200 || ""}
                onChange={(e) =>
                  setDenominations({ ...denominations, notes200: parseInt(e.target.value) || 0 })
                }
                placeholder="Count"
                className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
              />
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                = ₹{(denominations.notes200 * 200).toLocaleString("en-IN")}
              </span>
            </div>

            {/* ₹100 */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">₹100 Notes</span>
              <input
                type="number"
                min="0"
                value={denominations.notes100 || ""}
                onChange={(e) =>
                  setDenominations({ ...denominations, notes100: parseInt(e.target.value) || 0 })
                }
                placeholder="Count"
                className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
              />
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                = ₹{(denominations.notes100 * 100).toLocaleString("en-IN")}
              </span>
            </div>

            {/* ₹50 */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">₹50 Notes</span>
              <input
                type="number"
                min="0"
                value={denominations.notes50 || ""}
                onChange={(e) =>
                  setDenominations({ ...denominations, notes50: parseInt(e.target.value) || 0 })
                }
                placeholder="Count"
                className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
              />
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                = ₹{(denominations.notes50 * 50).toLocaleString("en-IN")}
              </span>
            </div>

            {/* ₹20 */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">₹20 Notes</span>
              <input
                type="number"
                min="0"
                value={denominations.notes20 || ""}
                onChange={(e) =>
                  setDenominations({ ...denominations, notes20: parseInt(e.target.value) || 0 })
                }
                placeholder="Count"
                className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
              />
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                = ₹{(denominations.notes20 * 20).toLocaleString("en-IN")}
              </span>
            </div>

            {/* ₹10 */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">₹10 Notes</span>
              <input
                type="number"
                min="0"
                value={denominations.notes10 || ""}
                onChange={(e) =>
                  setDenominations({ ...denominations, notes10: parseInt(e.target.value) || 0 })
                }
                placeholder="Count"
                className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
              />
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                = ₹{(denominations.notes10 * 10).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Coins */}
            <div className="col-span-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Coins Total (₹)</span>
              <input
                type="number"
                min="0"
                value={denominations.coins || ""}
                onChange={(e) =>
                  setDenominations({ ...denominations, coins: parseInt(e.target.value) || 0 })
                }
                placeholder="₹ Coins"
                className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
              />
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                = ₹{denominations.coins.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Sum Total of Counted Cash */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-400">Total Counted Physical Cash:</span>
            <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-slate-100">
              ₹{physicalCashRupees.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Variance Feedback Card */}
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
            reconciliation.cashVariancePaise === 0
              ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : isLargeMismatch
              ? "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
              : "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
          }`}
        >
          {reconciliation.cashVariancePaise === 0 ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between font-bold text-sm">
              <span>
                {reconciliation.cashVariancePaise === 0
                  ? "Perfect Cash Reconciliation (Zero Variance)"
                  : reconciliation.cashVariancePaise > 0
                  ? `Cash Surplus (Excess in Till): +${formatPaise(reconciliation.cashVariancePaise)}`
                  : `Cash Shortage (Deficit in Till): ${formatPaise(reconciliation.cashVariancePaise)}`}
              </span>
            </div>
            <p className="mt-1 text-[11px] opacity-90 leading-relaxed">
              {reconciliation.cashVariancePaise === 0
                ? "Physical cash exactly matches meter sales minus verified cash expenses."
                : isLargeMismatch
                ? `CRITICAL: Discrepancy exceeds manager threshold (₹${(store.settings.maxManagerVarianceApprovalPaise / 100).toFixed(0)}). Owner approval is legally required.`
                : "Discrepancy recorded. Provide reason for shift handover audit."}
            </p>
          </div>
        </div>

        {/* Mandatory Variance Reason if mismatch */}
        {isMismatch && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Variance Explanation Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={varianceReason}
              onChange={(e) => setVarianceReason(e.target.value)}
              placeholder="e.g. Uncollected coin change during peak evening fueling rush"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
          >
            Confirm Shift Handover & Lock Till
          </button>
        </div>
      </form>
    </Modal>
  );
};
