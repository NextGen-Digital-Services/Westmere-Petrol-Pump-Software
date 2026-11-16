"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { FuelDeliveryModal } from "@/components/purchases/FuelDeliveryModal";
import { Button } from "@/components/ui/Button";
import { formatPaise, formatLitres, formatDateTime, formatDate } from "@/lib/format";
import { Plus, Truck, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function PurchasesPage() {
  const store = usePetroStore();
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
            Depot Procurement & Decanting
          </span>
          <h1 className="text-3xl font-serif font-light tracking-editorial text-text mt-1">
            Fuel Purchases & Tank Allocations
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Depot tanker delivery verification, shortage analysis, multi-tank allocation, and purchase ledgers.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setDeliveryModalOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Verify Fuel Delivery
        </Button>
      </div>

      {/* Deliveries Register Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-base font-serif font-medium tracking-editorial text-text">
            Verified Inward Tanker Challans
          </h3>
          <span className="text-xs text-text-muted">
            {store.deliveries.length} received consignments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle border-b border-border">
              <tr>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Challan / Inv</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Date</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Supplier</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Product</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Inv Litres</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Rec Litres</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Shortage</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Rate / L</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Total Payable</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Verified By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {store.deliveries.map((del) => {
                const supplier = store.suppliers.find((s) => s.id === del.supplierId);
                return (
                  <tr key={del.id} className="hover:bg-card-subtle/40">
                    <td className="p-3 font-semibold text-text">
                      <span>{del.challanNumber}</span>
                      <span className="block text-[10px] text-text-faint">{del.invoiceNumber}</span>
                    </td>
                    <td className="p-3 text-text-muted">{formatDate(del.invoiceDate)}</td>
                    <td className="p-3 font-medium text-text">{supplier?.name || del.supplierId}</td>
                    <td className="p-3 text-text-muted">{del.fuelType}</td>
                    <td className="p-3 text-right tabular-nums text-text-muted">{formatLitres(del.invoiceLitres)}</td>
                    <td className="p-3 text-right tabular-nums font-semibold text-text">{formatLitres(del.receivedLitres)}</td>
                    <td className={`p-3 text-right tabular-nums font-medium ${del.shortageLitres > 0 ? "text-brick" : "text-olive"}`}>
                      {del.shortageLitres > 0 ? `-${formatLitres(del.shortageLitres)}` : "0.00 L"}
                    </td>
                    <td className="p-3 text-right tabular-nums text-text-muted">{formatPaise(del.ratePerLitrePaise)}</td>
                    <td className="p-3 text-right tabular-nums font-semibold text-text">{formatPaise(del.totalInvoicePaise)}</td>
                    <td className="p-3 text-text-muted">
                      <span>{del.verifiedBy}</span>
                      <span className="block text-[10px] text-olive font-medium">Verified & Stocked</span>
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
    </div>
  );
}
