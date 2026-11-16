"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatPaise, formatLitres, formatDateTime, formatDate } from "@/lib/format";
import { generatePdfReport } from "@/lib/export/exportPdf";
import { generateExcelReport } from "@/lib/export/exportExcel";
import { Download, FileSpreadsheet, Printer, BarChart3 } from "lucide-react";

type ReportType =
  | "DAILY_SALES"
  | "STOCK_RECONCILIATION"
  | "FINANCIAL_PNL"
  | "NOZZLE_DISPENSING"
  | "EXPENSE_VOUCHERS"
  | "CREDIT_RECEIVABLES";

export default function ReportsPage() {
  const store = usePetroStore();
  const [reportType, setReportType] = useState<ReportType>("DAILY_SALES");
  const [fuelFilter, setFuelFilter] = useState("ALL");

  // Generate Report Data based on reportType
  let reportTitle = "Daily Sales & Tender Register";
  let reportSubtitle = "All completed transaction slips";
  let headers: string[] = [];
  let rows: (string | number)[][] = [];

  if (reportType === "DAILY_SALES") {
    reportTitle = "Daily Sales & Tender Settlement Register";
    reportSubtitle = "Transaction-wise commercial dispensing";
    headers = ["Receipt No.", "Time", "Product", "Volume", "Rate / L", "Total Net", "Payment Mode", "Vehicle"];
    rows = store.sales
      .filter((s) => (fuelFilter === "ALL" ? true : s.fuelType === fuelFilter))
      .map((s) => [
        s.receiptNumber,
        formatDateTime(s.createdAt),
        s.fuelType,
        formatLitres(s.quantityLitres),
        formatPaise(s.pricePerLitrePaise),
        formatPaise(s.netAmountPaise),
        s.payments.map((p) => p.method).join("+"),
        s.vehicleNumber || "Retail",
      ]);
  } else if (reportType === "STOCK_RECONCILIATION") {
    reportTitle = "Underground Tank Inventory & Stock Reconciliation";
    reportSubtitle = "Book stock vs physical dip verification";
    headers = ["Tank Code", "Product", "Capacity (L)", "Book Stock (L)", "Last Dip (cm)", "Status"];
    rows = store.tanks.map((t) => [
      t.code,
      t.fuelType,
      formatLitres(t.capacityLitres),
      formatLitres(t.currentStockLitres),
      t.lastDipCm ? `${t.lastDipCm.toFixed(1)} cm` : "Not recorded",
      t.currentStockLitres <= t.reorderLevelLitres ? "Low Stock" : "Normal",
    ]);
  } else if (reportType === "FINANCIAL_PNL") {
    reportTitle = "Station Financial Revenue & Gross Margin Statement";
    reportSubtitle = "Commercial revenue net of depot procurement rates";
    headers = ["Metric Classification", "Fuel / Source", "Litres", "Revenue / Cost", "Net Margin"];
    const totalSalesPaise = store.sales.filter((s) => s.status === "COMPLETED").reduce((a, s) => a + s.netAmountPaise, 0);
    const totalDeliveriesPaise = store.deliveries.reduce((a, d) => a + d.totalInvoicePaise, 0);
    const totalExpensesPaise = store.expenses.reduce((a, e) => a + e.amountPaise, 0);

    rows = [
      ["Gross Fuel Sales Revenue", "All Forecourt Dispensers", "—", formatPaise(totalSalesPaise), "—"],
      ["Fuel Bulk Procurement Cost", "IOCL / BPCL Depots", "—", formatPaise(totalDeliveriesPaise), "—"],
      ["Operating Overheads & Expenses", "Vouchers & Salaries", "—", formatPaise(totalExpensesPaise), "—"],
      ["Estimated Gross Trading Margin", "Net Operating Surplus", "—", "—", formatPaise(Math.max(0, totalSalesPaise - totalDeliveriesPaise * 0.85))],
    ];
  } else if (reportType === "NOZZLE_DISPENSING") {
    reportTitle = "Nozzle Totalizer Throughput Report";
    reportSubtitle = "Forecourt meter volumes per shift";
    headers = ["Timestamp", "Shift", "Nozzle", "Opening Meter", "Closing Meter", "Testing Deduction", "Commercial Sales"];
    rows = store.meterReadings.map((m) => {
      const n = store.nozzles.find((noz) => noz.id === m.nozzleId);
      return [
        formatDateTime(m.createdAt),
        m.shiftId,
        n?.code || m.nozzleId,
        formatLitres(m.openingLitres),
        formatLitres(m.closingLitres),
        formatLitres(m.testingLitres),
        formatLitres(m.saleLitres),
      ];
    });
  } else if (reportType === "EXPENSE_VOUCHERS") {
    reportTitle = "Station Expense Vouchers Ledger";
    reportSubtitle = "Operational disbursements across 9 statutory categories";
    headers = ["Voucher No", "Date", "Category", "Description", "Paid To", "Disbursement", "Amount"];
    rows = store.expenses.map((e) => [
      e.voucherNumber,
      formatDate(e.date),
      e.category,
      e.description,
      e.paidTo,
      e.paymentMethod,
      formatPaise(e.amountPaise),
    ]);
  } else if (reportType === "CREDIT_RECEIVABLES") {
    reportTitle = "Customer & Fleet Accounts Receivable Ageing";
    reportSubtitle = "Outstanding balances against authorized limits";
    headers = ["Account Code", "Customer Name", "Type", "Enrolled Vehicles", "Credit Limit", "Outstanding Balance"];
    rows = store.customers.map((c) => [
      c.code,
      c.name,
      c.type === "FLEET_COMPANY" ? "Fleet Company" : "Individual",
      `${c.vehicles.length} Vehicles`,
      formatPaise(c.creditLimitPaise),
      formatPaise(c.currentBalancePaise),
    ]);
  }

  const handleExportPdf = () => {
    generatePdfReport(reportTitle, reportSubtitle, headers, rows, store.station.name);
  };

  const handleExportExcel = () => {
    generateExcelReport(reportType.toLowerCase(), "StationReport", headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
            Audit Ready Business Intelligence
          </span>
          <h1 className="text-3xl font-serif font-light tracking-editorial text-text mt-1">
            Reports & Financial Statements
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Reconciled operational reports with drill-down verification, PDF generation, and Excel exports.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
          >
            Export Excel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportPdf}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filter / Category Selector Bar */}
      <div className="bg-card border border-border rounded-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <Select
            label="Report Classification"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
          >
            <option value="DAILY_SALES">Daily Sales & Tender Register</option>
            <option value="STOCK_RECONCILIATION">Underground Tank Stock Reconciliation</option>
            <option value="FINANCIAL_PNL">Revenue & Estimated Gross Margin</option>
            <option value="NOZZLE_DISPENSING">Nozzle Totalizer Throughput Report</option>
            <option value="EXPENSE_VOUCHERS">Operational Expense Vouchers</option>
            <option value="CREDIT_RECEIVABLES">Customer & Fleet Receivables Ledger</option>
          </Select>
        </div>

        {reportType === "DAILY_SALES" && (
          <div className="w-full md:w-48">
            <Select
              label="Fuel Product"
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
            >
              <option value="ALL">All Products</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Speed Petrol">Speed Petrol</option>
            </Select>
          </div>
        )}

        <div className="text-right text-xs text-text-muted self-end pb-1">
          <span>Records Generated: </span>
          <strong className="text-text tabular-nums">{rows.length} rows</strong>
        </div>
      </div>

      {/* Report Preview Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif font-medium tracking-editorial text-text">
              {reportTitle}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">{reportSubtitle}</p>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle sticky top-0 border-b border-border">
              <tr>
                {headers.map((h, idx) => (
                  <th
                    key={idx}
                    className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-card-subtle/40">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 text-text whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
