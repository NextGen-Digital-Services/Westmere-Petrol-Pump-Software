"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePetroStore } from "@/store/usePetroStore";
import { hasPermission } from "@/lib/auth";
import { BRAND_COLORS } from "@/lib/theme";
import { AnimatedKpiCard } from "@/components/animations/AnimatedKpiCard";
import { AnimatedTank } from "@/components/animations/AnimatedTank";
import { calculateGrossMargin } from "@/lib/calc";
import {
  IndianRupee,
  Fuel,
  Droplet,
  TrendingUp,
  Banknote,
  QrCode,
  CreditCard,
  Users,
  Layers,
} from "lucide-react";

export const DashboardMetrics: React.FC = () => {
  const router = useRouter();
  const {
    sales,
    tanks,
    shifts,
    employees,
    activeRole,
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

  return (
    <div className="space-y-6">
      {/* Primary KPI Grid (LogiVenture Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Revenue */}
        <AnimatedKpiCard
          title="Today's Sales Revenue"
          value={`₹${(todayRevenuePaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${todaySales.length} completed forecourt receipts`}
          accentColor={BRAND_COLORS.ioclSaffron}
          icon={IndianRupee}
          delta={{ value: "8.4%", isPositive: true, label: "vs yesterday" }}
          onClick={() => router.push("/sales")}
        />

        {/* Card 2: Petrol (MS) Dispensed */}
        <AnimatedKpiCard
          title="Motor Spirit (Petrol)"
          value={Math.round(todayPetrolLitres)}
          suffix=" L"
          subtitle="MS & Speed Petrol 95"
          accentColor={BRAND_COLORS.petrol}
          icon={Fuel}
          delta={{ value: "5.1%", isPositive: true, label: "dispensed" }}
          onClick={() => router.push("/inventory")}
        />

        {/* Card 3: Diesel (HSD) Dispensed */}
        <AnimatedKpiCard
          title="High Speed Diesel (HSD)"
          value={Math.round(todayDieselLitres)}
          suffix=" L"
          subtitle="Commercial & fleet dispensing"
          accentColor={BRAND_COLORS.diesel}
          icon={Droplet}
          delta={{ value: "3.2%", isPositive: false, label: "dispensed" }}
          onClick={() => router.push("/inventory")}
        />

        {/* Card 4: Owner Commission / Total Volume */}
        {isOwner ? (
          <AnimatedKpiCard
            title="Owner Gross Margin"
            value={`₹${(totalGrossMarginPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle="IOCL dealer commission net of depot cost"
            accentColor={BRAND_COLORS.cash}
            icon={TrendingUp}
            delta={{ value: "6.8%", isPositive: true, label: "Owner view" }}
            onClick={() => router.push("/financials")}
          />
        ) : (
          <AnimatedKpiCard
            title="Total Forecourt Fuel"
            value={Math.round(todayPetrolLitres + todayDieselLitres)}
            suffix=" L"
            subtitle="Total volume across all active nozzles"
            accentColor={BRAND_COLORS.ioclBlue}
            icon={Layers}
            onClick={() => router.push("/dispensers")}
          />
        )}
      </div>

      {/* Tender Breakdown Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Cash Tender
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                ₹{(cashPaise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                BHIM UPI QR
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                ₹{(upiPaise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Card POS
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                ₹{(cardPaise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Fleet Credit
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                ₹{(creditPaise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Underground Tank Rack (Illustrated Cutaway with Liquid Animation) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Underground Storage Rack (Live Telemetry)
            </h3>
          </div>
          <button
            onClick={() => router.push("/inventory")}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700"
          >
            Dip Reading Wizard →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tanks.map((tank) => (
            <AnimatedTank
              key={tank.id}
              tankName={tank.name}
              fuelType={tank.fuelType}
              currentStockLitres={tank.currentStockLitres}
              capacityLitres={tank.capacityLitres}
              reorderLevelLitres={tank.reorderLevelLitres}
              deadStockLitres={tank.deadStockLitres}
              lastDipCm={tank.lastDipCm}
              onClick={() => router.push("/inventory")}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
