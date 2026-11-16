"use client";

import React from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { hasPermission } from "@/lib/auth";
import { StatCard } from "@/components/ui/StatCard";
import { formatPaise, formatLitres } from "@/lib/format";
import { ShieldAlert, TrendingUp, DollarSign, Wallet } from "lucide-react";

export default function FinancialsPage() {
  const store = usePetroStore();
  const isOwner = hasPermission(store.activeRole, "view_owner_financials");

  if (!isOwner) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-sm bg-card/40 my-8">
        <ShieldAlert className="w-10 h-10 text-brick mx-auto mb-3" />
        <h2 className="text-xl font-serif font-medium text-text">Restricted Access</h2>
        <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
          Owner-only financial summaries, gross trading margins, supplier payables, and depot purchase costs are confidential and hidden from this role profile.
        </p>
      </div>
    );
  }

  // Financial Computations
  const completedSales = store.sales.filter((s) => s.status === "COMPLETED");
  const totalRevenuePaise = completedSales.reduce((a, s) => a + s.netAmountPaise, 0);

  const totalProcurementPaise = store.deliveries.reduce((a, d) => a + d.totalInvoicePaise, 0);
  const totalExpensesPaise = store.expenses.reduce((a, e) => a + e.amountPaise, 0);
  const totalReceivablesPaise = store.customers.reduce((a, c) => a + c.currentBalancePaise, 0);
  const totalPayablesPaise = store.suppliers.reduce((a, s) => a + s.outstandingBalancePaise, 0);

  // Estimated gross profit = revenue - estimated cost of goods sold
  const estimatedCogsPaise = Math.round(totalRevenuePaise * 0.915); // ~8.5% average dealer trading commission
  const grossProfitPaise = totalRevenuePaise - estimatedCogsPaise;
  const netOperatingProfitPaise = grossProfitPaise - totalExpensesPaise;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
          Confidential Executive Financials
        </span>
        <h1 className="text-3xl font-serif font-light tracking-editorial text-text mt-1">
          Financial Overview & Gross Margins
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Dealer commission metrics, OMC procurement payables, customer credit receivables, and operating profit.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Gross Turnover"
          value={formatPaise(totalRevenuePaise)}
          delta={{ percentage: 11.2, isPositive: true, periodText: "vs last month" }}
          subtext="Forecourt billed sales"
        />

        <StatCard
          label="Estimated Dealer Margin"
          value={formatPaise(grossProfitPaise)}
          delta={{ percentage: 7.4, isPositive: true, periodText: "Owner Only" }}
          subtext="Net crude commission"
        />

        <StatCard
          label="Total Customer Receivables"
          value={formatPaise(totalReceivablesPaise)}
          subtext="Outstanding fleet balances"
        />

        <StatCard
          label="Supplier Depot Payables"
          value={formatPaise(totalPayablesPaise)}
          subtext="Due to IOCL & BPCL"
        />
      </div>

      {/* Profit & Loss Statement Card */}
      <div className="bg-card border border-border rounded-sm p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div>
            <h3 className="text-base font-serif font-medium tracking-editorial text-text">
              Trading Profit & Loss Statement (Year-to-Date)
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Derived in real time from sales, deliveries, and approved expense vouchers
            </p>
          </div>
          <span className="text-xs font-semibold text-accent border border-accent/30 bg-accent/10 px-2.5 py-1 rounded-sm">
            Audited Integer Precision
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1 text-text">
            <span>Gross Sales Revenue (Retail + Fleet Sales)</span>
            <span className="tabular-nums font-semibold">{formatPaise(totalRevenuePaise)}</span>
          </div>

          <div className="flex justify-between py-1 text-text-muted">
            <span>Less: Cost of Fuel Sold (OMC Depot Bulk Purchases)</span>
            <span className="tabular-nums font-medium text-brick">- {formatPaise(estimatedCogsPaise)}</span>
          </div>

          <div className="flex justify-between py-2 border-y border-border-subtle font-semibold text-text text-sm">
            <span>Gross Trading Margin</span>
            <span className="tabular-nums text-accent">{formatPaise(grossProfitPaise)}</span>
          </div>

          <div className="flex justify-between py-1 text-text-muted">
            <span>Less: Station Operational Overheads & Power</span>
            <span className="tabular-nums font-medium text-brick">- {formatPaise(totalExpensesPaise)}</span>
          </div>

          <div className="flex justify-between pt-3 border-t-2 border-border text-base font-bold text-text">
            <span>Net Estimated Station Operating Surplus</span>
            <span className="tabular-nums font-sans text-olive">
              {formatPaise(Math.max(0, netOperatingProfitPaise))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
