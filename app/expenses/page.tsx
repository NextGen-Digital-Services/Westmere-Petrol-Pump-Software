"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
import { CashbookModal } from "@/components/expenses/CashbookModal";
import { Button } from "@/components/ui/Button";
import { formatPaise, formatDateTime, formatDate } from "@/lib/format";
import { generatePdfReport } from "@/lib/export/exportPdf";
import { Plus, Wallet, ArrowDownRight, ArrowUpRight, Building2, Download } from "lucide-react";

export default function ExpensesPage() {
  const store = usePetroStore();
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [cashbookModalOpen, setCashbookModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"EXPENSES" | "CASHBOOK">("EXPENSES");

  const totalExpensePaise = store.expenses.reduce((acc, e) => acc + e.amountPaise, 0);
  const currentCashInHand = store.cashbook[0]?.balanceAfterPaise || 0;

  // Category breakdown calculation
  const categoryTotals = store.expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amountPaise;
    return acc;
  }, {} as Record<string, number>);

  const handleExportExpensesPdf = () => {
    const headers = ["Voucher No", "Date", "Category", "Description", "Paid To", "Mode", "Amount"];
    const rows = store.expenses.map((e) => [
      e.voucherNumber,
      formatDate(e.date),
      e.category,
      e.description,
      e.paidTo,
      e.paymentMethod,
      formatPaise(e.amountPaise),
    ]);

    generatePdfReport(
      "Station Operational Expenses & Voucher Ledger",
      `Total Expenditure: ${formatPaise(totalExpensePaise)} (${store.expenses.length} vouchers)`,
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
            Voucher Management & Physical Till Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-text mt-1">
            Expenses & Daily Cashbook
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Operational overhead, petty cash vouchers, bank deposits, and automated cash balance tracking.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExpensesPdf}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCashbookModalOpen(true)}
            icon={<Building2 className="w-3.5 h-3.5" />}
          >
            Bank Cash Deposit
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setExpenseModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Record Expense
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold block">
            Station Cash In Hand
          </span>
          <span className="text-2xl font-bold tabular-nums font-heading text-accent block mt-1">
            {formatPaise(currentCashInHand)}
          </span>
          <span className="text-xs text-text-muted mt-1 block">Live cashbook balance</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold block">
            Total Incurred Expenses
          </span>
          <span className="text-2xl font-bold tabular-nums font-heading text-text block mt-1">
            {formatPaise(totalExpensePaise)}
          </span>
          <span className="text-xs text-text-muted mt-1 block">{store.expenses.length} approved vouchers</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold block">
            Highest Category
          </span>
          <span className="text-lg font-bold text-text block mt-1 truncate">
            Electricity & Power
          </span>
          <span className="text-xs text-text-muted mt-1 block">Monthly canopy & pump usage</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold block">
            Generator Fuel Reserve
          </span>
          <span className="text-lg font-bold text-text block mt-1">
            Internal Stock Transfer
          </span>
          <span className="text-xs text-text-muted mt-1 block">Audited station diesel draw</span>
        </div>
      </div>

      {/* View Switcher: Expenses vs Cashbook */}
      <div className="flex border-b border-border space-x-6">
        <button
          onClick={() => setActiveTab("EXPENSES")}
          className={`pb-3 text-xs font-heading uppercase tracking-wider transition-colors relative ${
            activeTab === "EXPENSES"
              ? "text-accent font-bold border-b-2 border-accent"
              : "text-text-muted hover:text-text font-medium"
          }`}
        >
          Expense Vouchers ({store.expenses.length})
        </button>
        <button
          onClick={() => setActiveTab("CASHBOOK")}
          className={`pb-3 text-xs font-heading uppercase tracking-wider transition-colors relative ${
            activeTab === "CASHBOOK"
              ? "text-accent font-bold border-b-2 border-accent"
              : "text-text-muted hover:text-text font-medium"
          }`}
        >
          Daily Cashbook Ledger ({store.cashbook.length})
        </button>
      </div>

      {/* Tab 1: Expense Register */}
      {activeTab === "EXPENSES" && (
        <div className="space-y-6">
          {/* Category Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(categoryTotals).map(([cat, amount]) => (
              <div key={cat} className="p-3 bg-card border border-border rounded-sm text-xs">
                <span className="text-[10px] tracking-caps uppercase text-text-faint block truncate">
                  {cat}
                </span>
                <span className="text-sm font-semibold tabular-nums text-text block mt-1">
                  {formatPaise(amount)}
                </span>
              </div>
            ))}
          </div>

          {/* Vouchers Table */}
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-card-subtle border-b border-border">
                  <tr>
                    <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Voucher No</th>
                    <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Date</th>
                    <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Category</th>
                    <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Description</th>
                    <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Paid To</th>
                    <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Mode</th>
                    <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Amount</th>
                    <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {store.expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-card-subtle/40">
                      <td className="p-3 font-semibold text-text tabular-nums">{expense.voucherNumber}</td>
                      <td className="p-3 text-text-muted">{formatDate(expense.date)}</td>
                      <td className="p-3 text-accent font-medium">{expense.category}</td>
                      <td className="p-3 text-text">{expense.description}</td>
                      <td className="p-3 text-text-muted">{expense.paidTo}</td>
                      <td className="p-3 text-text-muted font-medium">{expense.paymentMethod}</td>
                      <td className="p-3 text-right tabular-nums font-semibold text-text">{formatPaise(expense.amountPaise)}</td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 text-[10px] tracking-caps uppercase font-semibold border border-olive/30 bg-olive/10 text-olive rounded-sm">
                          {expense.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cashbook Ledger */}
      {activeTab === "CASHBOOK" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-base font-heading font-bold text-text">
              Automated Daily Cashbook (Inflows, Outflows & Bankings)
            </h3>
            <span className="text-xs text-text-muted">
              Current Till Balance: <strong className="text-accent">{formatPaise(currentCashInHand)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-card-subtle border-b border-border">
                <tr>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Timestamp</th>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Type</th>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Source</th>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Description</th>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Inflow (+)</th>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Outflow (-)</th>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {store.cashbook.map((entry) => {
                  const isInflow = entry.entryType === "INFLOW";
                  return (
                    <tr key={entry.id} className="hover:bg-card-subtle/40">
                      <td className="p-3 text-text-muted">{formatDateTime(entry.createdAt)}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] tracking-caps uppercase font-semibold border rounded-sm ${
                            isInflow
                              ? "bg-olive/15 text-olive border-olive/30"
                              : "bg-brick/15 text-brick border-brick/30"
                          }`}
                        >
                          {isInflow ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          <span>{entry.entryType}</span>
                        </span>
                      </td>
                      <td className="p-3 text-text-muted font-medium">{entry.source}</td>
                      <td className="p-3 text-text">{entry.description}</td>
                      <td className="p-3 text-right tabular-nums font-semibold text-olive">
                        {isInflow ? `+${formatPaise(entry.amountPaise)}` : "—"}
                      </td>
                      <td className="p-3 text-right tabular-nums font-semibold text-brick">
                        {!isInflow ? `-${formatPaise(entry.amountPaise)}` : "—"}
                      </td>
                      <td className="p-3 text-right tabular-nums font-bold text-text">
                        {formatPaise(entry.balanceAfterPaise)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
      />

      <CashbookModal
        isOpen={cashbookModalOpen}
        onClose={() => setCashbookModalOpen(false)}
      />
    </div>
  );
}
