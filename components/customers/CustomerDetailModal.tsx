"use client";

import React from "react";
import { Customer } from "@/types";
import { usePetroStore } from "@/store/usePetroStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatPaise, formatLitres, formatDateTime } from "@/lib/format";
import { generatePdfReport } from "@/lib/export/exportPdf";
import { Download, CreditCard, Truck, AlertCircle } from "lucide-react";

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPayment: (customer: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onOpenPayment,
}) => {
  const store = usePetroStore();

  if (!customer) return null;

  // Credit sales for this customer
  const customerSales = store.sales.filter(
    (s) => s.customerId === customer.id && s.status === "COMPLETED"
  );

  // Payments from this customer
  const customerPayments = store.creditPayments.filter(
    (p) => p.customerId === customer.id
  );

  const utilizationPercent = Math.min(
    100,
    Math.round((customer.currentBalancePaise / customer.creditLimitPaise) * 100)
  );
  const isOverLimit = customer.currentBalancePaise > customer.creditLimitPaise;

  const handleExportStatementPdf = () => {
    const headers = ["Invoice / Date", "Vehicle", "Fuel", "Litres", "Rate", "Amount Billed"];
    const rows = customerSales.map((s) => [
      `${s.receiptNumber} (${formatDateTime(s.createdAt)})`,
      s.vehicleNumber || "Fleet",
      s.fuelType,
      formatLitres(s.quantityLitres),
      formatPaise(s.pricePerLitrePaise),
      formatPaise(s.netAmountPaise),
    ]);

    generatePdfReport(
      `Monthly Fleet Statement: ${customer.name}`,
      `Account Code: ${customer.code} • Outstanding Balance: ${formatPaise(customer.currentBalancePaise)} • Credit Limit: ${formatPaise(customer.creditLimitPaise)}`,
      headers,
      rows,
      store.station.name
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customer & Fleet Ledger: ${customer.name}`}
      subtitle={`Account Code: ${customer.code} • Type: ${customer.type === "FLEET_COMPANY" ? "Fleet Company" : "Individual Corporate"}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Credit Limit Gauge */}
        <div className="p-4 bg-card-subtle border border-border-subtle rounded-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold block">
                Credit Limit Utilization
              </span>
              <span className="text-xl font-light tabular-nums font-sans text-text block mt-0.5">
                {formatPaise(customer.currentBalancePaise)}{" "}
                <span className="text-xs text-text-muted font-normal">
                  / {formatPaise(customer.creditLimitPaise)} ({utilizationPercent}%)
                </span>
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenPayment(customer)}
              icon={<CreditCard className="w-3.5 h-3.5" />}
            >
              Collect Payment
            </Button>
          </div>

          <div className="w-full bg-border-subtle h-2 rounded-none overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOverLimit ? "bg-brick" : utilizationPercent > 80 ? "bg-warning" : "bg-olive"
              }`}
              style={{ width: `${utilizationPercent}%` }}
            />
          </div>

          {isOverLimit && (
            <p className="text-xs text-brick flex items-center space-x-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Credit limit exceeded. Future credit sales require manager override.</span>
            </p>
          )}
        </div>

        {/* Registered Fleet Vehicles */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-text">
              Authorized Fleet Vehicles ({customer.vehicles.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {customer.vehicles.map((v) => (
              <div
                key={v.id}
                className="p-3 bg-card border border-border rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                    <span className="font-semibold text-text">{v.vehicleNumber}</span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {v.model || "Commercial Truck"} • {v.fuelType}
                  </p>
                  {v.driverName && (
                    <p className="text-[10px] text-text-faint">
                      Driver: {v.driverName} ({v.driverPhone || "N/A"})
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] tracking-caps uppercase text-text-faint block">
                    Monthly Quota
                  </span>
                  <span className="tabular-nums font-medium text-text">
                    {v.monthlyQuotaLitres ? formatLitres(v.monthlyQuotaLitres) : "No Limit"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Credit Sales Ledger */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-text">
              Credit Sales History
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportStatementPdf}
              icon={<Download className="w-3.5 h-3.5" />}
              className="text-xs h-7"
            >
              Export Statement PDF
            </Button>
          </div>

          <div className="border border-border rounded-sm overflow-hidden mt-3 max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-card-subtle sticky top-0 border-b border-border">
                <tr>
                  <th className="p-2.5 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Invoice</th>
                  <th className="p-2.5 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Vehicle</th>
                  <th className="p-2.5 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Product</th>
                  <th className="p-2.5 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Volume</th>
                  <th className="p-2.5 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {customerSales.map((s) => (
                  <tr key={s.id} className="hover:bg-card-subtle/40">
                    <td className="p-2.5 font-medium text-text tabular-nums">{s.receiptNumber}</td>
                    <td className="p-2.5 font-mono text-[11px] text-text-muted">{s.vehicleNumber || "Fleet"}</td>
                    <td className="p-2.5 text-text-muted">{s.fuelType}</td>
                    <td className="p-2.5 text-right tabular-nums text-text-muted">{formatLitres(s.quantityLitres)}</td>
                    <td className="p-2.5 text-right tabular-nums font-semibold text-text">{formatPaise(s.netAmountPaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Ledger
          </Button>
        </div>
      </div>
    </Modal>
  );
};
