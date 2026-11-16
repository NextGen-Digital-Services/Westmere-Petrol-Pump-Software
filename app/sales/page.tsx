"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Sale, FuelType, PaymentMethod } from "@/types";
import { PosBillingForm } from "@/components/sales/PosBillingForm";
import { ReceiptModal } from "@/components/sales/ReceiptModal";
import { SaleReversalModal } from "@/components/sales/SaleReversalModal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatPaise, formatLitres, formatDateTime } from "@/lib/format";
import { hasPermission } from "@/lib/auth";
import { Receipt, Search, Filter, RotateCcw, Eye } from "lucide-react";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
            Point of Sale Telemetry & Slips
          </span>
          <h1 className="text-3xl font-serif font-light tracking-editorial text-text mt-1">
            Sales & Commercial Billing
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Forecourt POS billing, split payments, fleet authorization, and certified thermal receipts.
          </p>
        </div>
      </div>

      {/* POS Billing Screen */}
      <PosBillingForm onSaleCreated={(sale) => setActiveReceiptSale(sale)} />

      {/* Transactions Register */}
      <div className="bg-card border border-border rounded-sm overflow-hidden mt-8">
        <div className="p-5 border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-serif font-medium tracking-editorial text-text">
              Transaction Sales Ledger
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Every transaction updates tank stock, totalizers, and customer ledger immediately
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-40">
              <Input
                placeholder="Search slip/vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="w-28">
              <Select
                value={filterFuel}
                onChange={(e) => setFilterFuel(e.target.value)}
                className="h-8 text-xs py-0"
              >
                <option value="ALL">All Fuels</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Speed Petrol">Speed Petrol</option>
              </Select>
            </div>
            <div className="w-28">
              <Select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="h-8 text-xs py-0"
              >
                <option value="ALL">All Tenders</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="CREDIT">Credit</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle border-b border-border">
              <tr>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Invoice No.</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Date & Time</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Product</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Volume</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Rate / L</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Total Net</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Tender</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Vehicle</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Status</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredSales.map((sale) => {
                const isReversed = sale.status === "REVERSED";
                return (
                  <tr key={sale.id} className={`hover:bg-card-subtle/40 ${isReversed ? "opacity-60 bg-card-subtle/20" : ""}`}>
                    <td className="p-3 font-semibold text-text tabular-nums">{sale.receiptNumber}</td>
                    <td className="p-3 text-text-muted">{formatDateTime(sale.createdAt)}</td>
                    <td className="p-3 text-text font-medium">{sale.fuelType}</td>
                    <td className="p-3 text-right tabular-nums text-text">{formatLitres(sale.quantityLitres)}</td>
                    <td className="p-3 text-right tabular-nums text-text-muted">{formatPaise(sale.pricePerLitrePaise)}</td>
                    <td className={`p-3 text-right tabular-nums font-semibold ${isReversed ? "line-through text-text-muted" : "text-text"}`}>
                      {formatPaise(sale.netAmountPaise)}
                    </td>
                    <td className="p-3 text-text-muted font-medium">
                      {sale.payments.map((p) => p.method).join(" + ")}
                    </td>
                    <td className="p-3 text-text-muted font-mono text-[11px]">{sale.vehicleNumber || "Retail"}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] tracking-caps uppercase font-semibold border rounded-sm ${
                          isReversed
                            ? "bg-brick/15 text-brick border-brick/30"
                            : "bg-olive/15 text-olive border-olive/30"
                        }`}
                      >
                        {isReversed ? "Reversed" : "Completed"}
                      </span>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => setActiveReceiptSale(sale)}
                        className="p-1 text-text-muted hover:text-text rounded-sm transition-colors"
                        title="View / Print Receipt"
                      >
                        <Receipt className="w-3.5 h-3.5 inline" />
                      </button>
                      {!isReversed && canReverse && (
                        <button
                          onClick={() => setReversalTargetSale(sale)}
                          className="p-1 text-text-muted hover:text-brick rounded-sm transition-colors"
                          title="Authorise Reversal"
                        >
                          <RotateCcw className="w-3.5 h-3.5 inline" />
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
    </div>
  );
}
