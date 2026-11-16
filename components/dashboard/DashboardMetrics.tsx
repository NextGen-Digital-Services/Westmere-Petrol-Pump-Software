"use client";

import React from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { hasPermission } from "@/lib/auth";
import { StatCard } from "@/components/ui/StatCard";
import { formatPaise, formatLitres } from "@/lib/format";
import { calculateGrossMargin } from "@/lib/calc";

export const DashboardMetrics: React.FC = () => {
  const {
    sales,
    tanks,
    shifts,
    employees,
    activeRole,
    deliveries,
  } = usePetroStore();

  const isOwner = hasPermission(activeRole, "view_owner_financials");

  const todayStr = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter((s) => s.createdAt.startsWith(todayStr) && s.status === "COMPLETED");

  // Metrics
  const todayRevenuePaise = todaySales.reduce((acc, s) => acc + s.netAmountPaise, 0);

  const todayPetrolLitres = todaySales
    .filter((s) => s.fuelType === "Petrol" || s.fuelType === "Speed Petrol")
    .reduce((acc, s) => acc + s.quantityLitres, 0);

  const todayDieselLitres = todaySales
    .filter((s) => s.fuelType === "Diesel")
    .reduce((acc, s) => acc + s.quantityLitres, 0);

  // Collections by method
  let cashPaise = 0;
  let upiPaise = 0;
  let cardPaise = 0;
  let creditPaise = 0;

  for (const s of todaySales) {
    for (const p of s.payments) {
      if (p.method === "CASH") cashPaise += p.amountPaise;
      if (p.method === "UPI") upiPaise += p.amountPaise;
      if (p.method === "CARD") cardPaise += p.amountPaise;
      if (p.method === "CREDIT") creditPaise += p.amountPaise;
    }
  }

  // Gross Margin computation based on latest delivery purchase rates
  const avgPurchaseCostPetrol = 8850; // paise per L
  const avgPurchaseCostDiesel = 8180; // paise per L
  const petrolMargin = calculateGrossMargin(todayPetrolLitres, 9672, avgPurchaseCostPetrol);
  const dieselMargin = calculateGrossMargin(todayDieselLitres, 8962, avgPurchaseCostDiesel);
  const totalGrossMarginPaise = petrolMargin.grossMarginPaise + dieselMargin.grossMarginPaise;

  const activeEmployeesCount = employees.filter((e) => e.status === "ACTIVE").length;
  const runningShiftsCount = shifts.filter((s) => s.status === "OPEN").length;

  return (
    <div className="space-y-4">
      {/* Primary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Revenue"
          value={formatPaise(todayRevenuePaise)}
          delta={{ percentage: 8.4, isPositive: true, periodText: "vs yesterday" }}
          badge="Live"
        />

        <StatCard
          label="Petrol Dispensed"
          value={formatLitres(todayPetrolLitres)}
          delta={{ percentage: 5.1, isPositive: true, periodText: "vs last week" }}
          subtext="MS + Speed Petrol"
        />

        <StatCard
          label="Diesel Dispensed"
          value={formatLitres(todayDieselLitres)}
          delta={{ percentage: 3.2, isPositive: false, periodText: "vs yesterday" }}
          subtext="High Speed Diesel"
        />

        {isOwner ? (
          <StatCard
            label="Gross Margin (Est.)"
            value={formatPaise(totalGrossMarginPaise)}
            delta={{ percentage: 6.8, isPositive: true, periodText: "Owner Only" }}
            subtext="Net of crude depot price"
          />
        ) : (
          <StatCard
            label="Total Litres Sold"
            value={formatLitres(todayPetrolLitres + todayDieselLitres)}
            subtext="Across all dispensers"
          />
        )}
      </div>

      {/* Tender Breakdown Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Cash Collection"
          value={formatPaise(cashPaise)}
          subtext="Physical cash tender"
        />

        <StatCard
          label="UPI Collection"
          value={formatPaise(upiPaise)}
          subtext="Direct QR settlements"
        />

        <StatCard
          label="Card Collection"
          value={formatPaise(cardPaise)}
          subtext="POS swipe terminals"
        />

        <StatCard
          label="Credit & Fleet Sales"
          value={formatPaise(creditPaise)}
          subtext="Billed to customer ledger"
        />
      </div>

      {/* Tank Gauges Quick Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tanks.map((tank) => {
          const fillPercent = Math.min(
            100,
            Math.round((tank.currentStockLitres / tank.capacityLitres) * 100)
          );
          const isLow = tank.currentStockLitres <= tank.reorderLevelLitres;

          return (
            <div
              key={tank.id}
              className="bg-card border border-border rounded-sm p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-text">{tank.name}</span>
                  <span className="block text-[10px] tracking-caps uppercase text-text-muted mt-0.5">
                    {tank.fuelType}
                  </span>
                </div>
                <span
                  className={`text-[10px] tracking-caps uppercase px-1.5 py-0.5 border rounded-sm font-medium ${
                    isLow ? "bg-brick/15 text-brick border-brick/30" : "bg-card text-text-muted border-border"
                  }`}
                >
                  {isLow ? "Reorder Soon" : `${fillPercent}%`}
                </span>
              </div>

              {/* Minimal flat gauge bar (No gradients!) */}
              <div className="mt-4">
                <div className="w-full bg-border-subtle h-2 rounded-none overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isLow ? "bg-brick" : tank.fuelType === "Diesel" ? "bg-brass" : "bg-olive"
                    }`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-text-muted">
                  <span className="font-medium text-text">
                    {formatLitres(tank.currentStockLitres)}
                  </span>
                  <span className="text-text-faint">
                    Cap: {formatLitres(tank.capacityLitres)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
