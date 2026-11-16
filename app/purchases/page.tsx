"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { FuelDeliveryModal } from "@/components/purchases/FuelDeliveryModal";
import { PageTransition } from "@/components/animations/PageTransition";
import { TankerTruckIllustration } from "@/components/illustrations/EquipmentIllustrations";
import { formatPaise, formatLitres, formatDateTime, formatDate } from "@/lib/format";
import { BRAND_COLORS } from "@/lib/theme";
import {
  Plus,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Wallet,
  Calculator,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function PurchasesPage() {
  const store = usePetroStore();
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);

  // Tomorrow's loading calculator state
  const [plannedDieselKL, setPlannedDieselKL] = useState("12");
  const [plannedPetrolKL, setPlannedPetrolKL] = useState("8");

  const dieselPricePerKL = 81800; // ₹81.80/L = ₹81,800/KL
  const petrolPricePerKL = 88500; // ₹88.50/L = ₹88,500/KL

  const calculatedFundsRequiredPaise = Math.round(
    ((parseFloat(plannedDieselKL) || 0) * dieselPricePerKL +
      (parseFloat(plannedPetrolKL) || 0) * petrolPricePerKL) *
      100
  );

  const netRemittanceNeededPaise = Math.max(
    0,
    calculatedFundsRequiredPaise - (store.dealerAccount?.balancePaise || 0)
  );

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-slate-800">
        <div>
          <span className="text-[10px] tracking-wider uppercase text-amber-600 dark:text-amber-500 font-bold">
            Depot Procurement & Decanting
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-slate-100 mt-1">
            Fuel Purchases & Tanker Decantation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Depot tanker verification, seal checks, shortage analysis, multi-tank allocation, and IOCL dealer account.
          </p>
        </div>

        <button
          onClick={() => setDeliveryModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all"
        >
          <Truck className="w-4 h-4" />
          <span>Decant Road Tanker</span>
        </button>
      </div>

      {/* Dealer Account with IOCL Panel (Section 9.5) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
                  Dealer Account with Indian Oil (IOCL)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200">
                  Bijwasan Depot
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Terminal Credit A/c: <strong>IOCL-DEL-8902</strong> • Indent Credit Limit: {formatPaise(store.dealerAccount?.indentCreditLimitPaise || 250000000)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Current Prepaid Balance with IOCL
              </span>
              <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {formatPaise(store.dealerAccount?.balancePaise || 145000000)}
              </span>
            </div>
          </div>
        </div>

        {/* Funds Required for Tomorrow's Loading Calculator */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-heading">
              Indent Planning: Funds Required for Tomorrow&apos;s Depot Loading
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Planned Diesel (HSD) Indent (KL)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={plannedDieselKL}
                onChange={(e) => setPlannedDieselKL(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Planned Petrol (MS) Indent (KL)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={plannedPetrolKL}
                onChange={(e) => setPlannedPetrolKL(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                Total Indent Value
              </span>
              <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {formatPaise(calculatedFundsRequiredPaise)}
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                Net RTGS Remittance Needed
              </span>
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs font-mono font-extrabold text-amber-700 dark:text-amber-400">
                {netRemittanceNeededPaise > 0 ? formatPaise(netRemittanceNeededPaise) : "Fully Covered"}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bank Remittances */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Recent RTGS / CMS Remittances to IOCL
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {store.dealerAccount?.recentRemittances?.map((rem, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    UTR: {rem.utr}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{rem.bank} • {rem.date}</p>
                </div>
                <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatPaise(rem.amountPaise)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deliveries Register Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
              Verified Inward Tanker Consignments
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {store.deliveries.length} received consignments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Challan / Inv</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Date</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Supplier</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Product</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Inv Litres</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Rec Litres</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Shortage</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Rate / L</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Total Payable</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Verified By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {store.deliveries.map((del) => {
                const supplier = store.suppliers.find((s) => s.id === del.supplierId);
                return (
                  <tr key={del.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold font-mono text-slate-900 dark:text-slate-100">
                      <span>{del.challanNumber}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">{del.invoiceNumber}</span>
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono">{formatDate(del.invoiceDate)}</td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{supplier?.name || del.supplierId}</td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{del.fuelType}</td>
                    <td className="p-3.5 text-right font-mono text-slate-500">{formatLitres(del.invoiceLitres)}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">{formatLitres(del.receivedLitres)}</td>
                    <td className={`p-3.5 text-right font-mono font-semibold ${del.shortageLitres > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                      {del.shortageLitres > 0 ? `-${formatLitres(del.shortageLitres)}` : "0.00 L"}
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-500">{formatPaise(del.ratePerLitrePaise)}</td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-slate-900 dark:text-slate-100">{formatPaise(del.totalInvoicePaise)}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{del.verifiedBy}</span>
                      <span className="inline-block text-[10px] text-emerald-600 font-medium">Decanted & Stocked</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <FuelDeliveryModal
        isOpen={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
      />
    </PageTransition>
  );
}
