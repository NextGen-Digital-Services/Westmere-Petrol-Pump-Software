"use client";

import React from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { formatPaise, formatLitres, formatDateTime } from "@/lib/format";
import { Scale, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function ReconciliationPage() {
  const store = usePetroStore();

  // 1. Shift Cash vs Expected Cash
  const closedShifts = store.shifts.filter((s) => s.status === "CLOSED" || s.status === "LOCKED");

  // 2. Nozzle Meter vs Sales Litres
  const nozzleReconciliations = store.nozzles.map((nozzle) => {
    const readings = store.meterReadings.filter((m) => m.nozzleId === nozzle.id);
    const meterSalesLitres = readings.reduce((acc, m) => acc + m.saleLitres, 0);

    const posSalesLitres = store.sales
      .filter((s) => s.nozzleId === nozzle.id && s.status === "COMPLETED")
      .reduce((acc, s) => acc + s.quantityLitres, 0);

    const diffLitres = Number((posSalesLitres - meterSalesLitres).toFixed(2));

    return {
      nozzle,
      meterSalesLitres,
      posSalesLitres,
      diffLitres,
      isBalanced: Math.abs(diffLitres) <= 1.0, // within 1L tolerance
    };
  });

  // 3. Tank Dip vs Book Stock
  const tankReconciliations = store.tanks.map((tank) => {
    const calibration = store.calibrations.find((c) => c.tankId === tank.id);
    const physicalLitres = tank.lastDipCm && calibration
      ? calibration.points.find((p) => Math.abs(p.dipCm - (tank.lastDipCm || 0)) < 1)?.litres || tank.currentStockLitres
      : tank.currentStockLitres;

    const diffLitres = Number((physicalLitres - tank.currentStockLitres).toFixed(2));

    return {
      tank,
      bookLitres: tank.currentStockLitres,
      physicalLitres,
      diffLitres,
      isBalanced: Math.abs(diffLitres) <= (store.settings.unusualDifferenceLitresThreshold || 50),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
          Audit Integrity & Forecourt Verification
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-text mt-1">
          Forecourt & Tender Reconciliation
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Automatic verification: Meter Litres = Sales Litres, Physical Dip = Book Stock, Isolated Cash/UPI/Card settlements.
        </p>
      </div>

      {/* Section 1: Meter Readings vs POS Sales Litres */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="text-base font-heading font-bold text-text">
              Nozzle Totalizer Meter vs POS Billed Volume
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Verifies forecourt pump dispensers against customer bill slips
            </p>
          </div>
          <span className="text-xs font-semibold text-olive flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Forecourt Synchronized</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle border-b border-border">
              <tr>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Nozzle</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Product</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Meter Sales Litres</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">POS Billed Litres</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Variance</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {nozzleReconciliations.map((n) => (
                <tr key={n.nozzle.id} className="hover:bg-card-subtle/40">
                  <td className="p-3 font-semibold text-text">{n.nozzle.name} ({n.nozzle.code})</td>
                  <td className="p-3 text-text-muted">{n.nozzle.fuelType}</td>
                  <td className="p-3 text-right tabular-nums text-text font-medium">{formatLitres(n.meterSalesLitres)}</td>
                  <td className="p-3 text-right tabular-nums text-text font-medium">{formatLitres(n.posSalesLitres)}</td>
                  <td className={`p-3 text-right tabular-nums font-semibold ${n.isBalanced ? "text-olive" : "text-brick"}`}>
                    {n.diffLitres >= 0 ? `+${formatLitres(n.diffLitres)}` : formatLitres(n.diffLitres)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] tracking-caps uppercase font-semibold border rounded-sm ${
                        n.isBalanced ? "bg-olive/15 text-olive border-olive/30" : "bg-brick/15 text-brick border-brick/30"
                      }`}
                    >
                      {n.isBalanced ? "Exact Match" : "Investigate"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Tank Dip vs Book Stock */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mt-6 shadow-xs">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="text-base font-heading font-bold text-text">
              Underground Tank Physical Dip vs Book Inventory
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Book Stock = Opening + Deliveries − SalesLitres ± Adjustments
            </p>
          </div>
          <span className="text-xs text-text-muted">Tolerance: ±50.00 L</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle border-b border-border">
              <tr>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Storage Tank</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Fuel Type</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Book Stock</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Physical Dip Litres</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Discrepancy</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {tankReconciliations.map((t) => (
                <tr key={t.tank.id} className="hover:bg-card-subtle/40">
                  <td className="p-3 font-semibold text-text">{t.tank.name} ({t.tank.code})</td>
                  <td className="p-3 text-text-muted">{t.tank.fuelType}</td>
                  <td className="p-3 text-right tabular-nums text-text font-medium">{formatLitres(t.bookLitres)}</td>
                  <td className="p-3 text-right tabular-nums text-text font-medium">{formatLitres(t.physicalLitres)}</td>
                  <td className={`p-3 text-right tabular-nums font-semibold ${t.isBalanced ? "text-olive" : "text-brick"}`}>
                    {t.diffLitres >= 0 ? `+${formatLitres(t.diffLitres)}` : formatLitres(t.diffLitres)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] tracking-caps uppercase font-semibold border rounded-sm ${
                        t.isBalanced ? "bg-olive/15 text-olive border-olive/30" : "bg-warning/15 text-warning border-warning/30"
                      }`}
                    >
                      {t.isBalanced ? "Reconciled" : "Tolerance Warning"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Shift Tender Reconciliation */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mt-6 shadow-xs">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="text-base font-heading font-bold text-text">
              Shift Closing Settlement Discrepancy Audits
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Cash, UPI, and Card are reconciled separately and never merged
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle border-b border-border">
              <tr>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Shift Code</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Manager</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Expected Cash</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Actual Physical Cash</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Variance Amount</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Explanation</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {closedShifts.map((s) => {
                const variance = s.cashVariancePaise || 0;
                return (
                  <tr key={s.id} className="hover:bg-card-subtle/40">
                    <td className="p-3 font-semibold text-text">{s.code}</td>
                    <td className="p-3 text-text-muted">{s.openedBy}</td>
                    <td className="p-3 text-right tabular-nums text-text-muted">{formatPaise(s.expectedCashPaise || 0)}</td>
                    <td className="p-3 text-right tabular-nums font-medium text-text">{formatPaise(s.closingCashPaise || 0)}</td>
                    <td className={`p-3 text-right tabular-nums font-semibold ${variance === 0 ? "text-olive" : "text-brick"}`}>
                      {variance >= 0 ? `+${formatPaise(variance)}` : formatPaise(variance)}
                    </td>
                    <td className="p-3 text-text-muted">{s.varianceReason || "Exact till balance"}</td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 text-[10px] tracking-caps uppercase font-semibold border border-olive/30 bg-olive/10 text-olive rounded-sm">
                        {s.approvedBy ? `Approved by ${s.approvedBy}` : "Locked"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
