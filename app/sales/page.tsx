"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Sale, FuelType, PaymentMethod } from "@/types";
import { PosBillingForm } from "@/components/sales/PosBillingForm";
import { ReceiptModal } from "@/components/sales/ReceiptModal";
import { SaleReversalModal } from "@/components/sales/SaleReversalModal";
import { PageTransition } from "@/components/animations/PageTransition";
import { formatPaise, formatLitres, formatDateTime } from "@/lib/format";
import { hasPermission } from "@/lib/auth";
import { BRAND_COLORS, getFuelColor, getPaymentMethodColor } from "@/lib/theme";
import { Receipt, Search, Filter, RotateCcw, Eye, Sparkles } from "lucide-react";

export default function SalesPage() {
  const store = usePetroStore();
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [reversalTargetSale, setReversalTargetSale] = useState<Sale | null>(null);

  // Filters
  const [filterFuel, setFilterFuel] = useState<string>("ALL");
  const [filterMethod, setFilterMethod] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const canReverse = hasPermission(store.activeRole, "reverse_sales");

  const filteredSales = store.sales.filter((s) => {
    if (filterFuel !== "ALL" && s.fuelType !== filterFuel) return false;
    if (filterMethod !== "ALL" && !s.payments.some((p) => p.method === filterMethod)) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchReceipt = s.receiptNumber.toLowerCase().includes(q);
      const matchVehicle = s.vehicleNumber && s.vehicleNumber.toLowerCase().includes(q);
      const matchNozzle = s.nozzleId.toLowerCase().includes(q);
      if (!matchReceipt && !matchVehicle && !matchNozzle) return false;
    }
    return true;
  });

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-slate-800">
        <div>
          <span className="text-[10px] tracking-wider uppercase text-amber-600 dark:text-amber-500 font-bold">
            Forecourt POS & Commercial Billing
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-slate-100 mt-1">
            Sales & Commercial POS Billing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fast forecourt billing, split tender payments, fleet credit limits, and certified 3-second thermal receipts.
          </p>
        </div>
      </div>

      {/* POS Billing Screen */}
      <PosBillingForm onSaleCreated={(sale) => setActiveReceiptSale(sale)} />

      {/* Transactions Register */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mt-8">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
              Transaction Sales Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Every transaction updates tank stock, totalizers, and customer ledger immediately
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-48 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search slip/vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <select
              value={filterFuel}
              onChange={(e) => setFilterFuel(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="ALL">All Fuels</option>
              <option value="Petrol">Petrol (MS)</option>
              <option value="Diesel">Diesel (HSD)</option>
              <option value="Speed Petrol">Speed Petrol (XP95)</option>
            </select>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="ALL">All Tenders</option>
              <option value="CASH">Cash</option>
              <option value="UPI">BHIM UPI</option>
              <option value="CARD">Card POS</option>
              <option value="CREDIT">Fleet Credit</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Invoice No.</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Date & Time</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Product</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Volume</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Rate / L</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Total Net</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Tender</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Vehicle</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Status</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.map((sale) => {
                const isReversed = sale.status === "REVERSED";
                const fuelColor = getFuelColor(sale.fuelType);

                return (
                  <tr
                    key={sale.id}
                    className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                      isReversed ? "opacity-60 bg-slate-50/30 dark:bg-slate-900/30" : ""
                    }`}
                  >
                    <td className="p-3.5 font-bold font-mono text-slate-900 dark:text-slate-100">
                      {sale.receiptNumber}
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono">{formatDateTime(sale.createdAt)}</td>
                    <td className="p-3.5 font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fuelColor }} />
                        <span className="text-slate-800 dark:text-slate-200">{sale.fuelType}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatLitres(sale.quantityLitres)}
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-500">
                      {formatPaise(sale.pricePerLitrePaise)}
                    </td>
                    <td
                      className={`p-3.5 text-right font-mono font-extrabold ${
                        isReversed ? "line-through text-slate-400" : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {formatPaise(sale.netAmountPaise)}
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {sale.payments.map((p, idx) => {
                          const tenderColor = getPaymentMethodColor(p.method);
                          return (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                              style={{
                                color: tenderColor,
                                borderColor: `${tenderColor}40`,
                                backgroundColor: `${tenderColor}12`,
                              }}
                            >
                              {p.method}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {sale.vehicleNumber || "Forecourt Retail"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          isReversed
                            ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
                        }`}
                      >
                        {isReversed ? "Reversed" : "Completed"}
                      </span>
                    </td>
                    <td className="p-3.5 text-center space-x-2">
                      <button
                        onClick={() => setActiveReceiptSale(sale)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View / Print Thermal Receipt"
                      >
                        <Receipt className="w-4 h-4 inline" />
                      </button>
                      {!isReversed && canReverse && (
                        <button
                          onClick={() => setReversalTargetSale(sale)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Authorise Reversal"
                        >
                          <RotateCcw className="w-4 h-4 inline" />
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

      {/* Modals */}
      <ReceiptModal
        sale={activeReceiptSale}
        station={store.station}
        isOpen={!!activeReceiptSale}
        onClose={() => setActiveReceiptSale(null)}
      />

      <SaleReversalModal
        sale={reversalTargetSale}
        isOpen={!!reversalTargetSale}
        onClose={() => setReversalTargetSale(null)}
      />
    </PageTransition>
  );
}
