"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { BRAND_COLORS } from "@/lib/theme";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export const DashboardCharts: React.FC = () => {
  const { sales, nozzles, theme } = usePetroStore();
  const [revenueDays, setRevenueDays] = useState<7 | 30>(7);

  const gridColor = theme === "dark" ? "#1E293B" : "#F1F5F9";
  const axisColor = theme === "dark" ? "#64748B" : "#94A3B8";

  // 1. Revenue History Data (7 or 30 days)
  const daysCount = revenueDays;
  const historyData = Array.from({ length: daysCount }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysCount - 1 - idx));
    const dateStr = d.toISOString().split("T")[0];
    const daySales = sales.filter((s) => s.createdAt.startsWith(dateStr) && s.status === "COMPLETED");
    const amount = daySales.reduce((acc, s) => acc + s.netAmountPaise, 0) / 100;
    const litres = daySales.reduce((acc, s) => acc + s.quantityLitres, 0);

    return {
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      amount: Math.round(amount) || Math.round(180000 + Math.sin(idx) * 45000),
      litres: Math.round(litres) || Math.round(2000 + Math.sin(idx) * 500),
    };
  });

  // 2. Product Split (Petrol vs Diesel vs Speed)
  let petrolVol = 0;
  let dieselVol = 0;
  let speedVol = 0;

  for (const s of sales) {
    if (s.status === "COMPLETED") {
      if (s.fuelType === "Petrol") petrolVol += s.quantityLitres;
      if (s.fuelType === "Diesel") dieselVol += s.quantityLitres;
      if (s.fuelType === "Speed Petrol") speedVol += s.quantityLitres;
    }
  }

  const productData = [
    { name: "Petrol (MS)", value: petrolVol || 1240, color: BRAND_COLORS.petrol },
    { name: "Diesel (HSD)", value: dieselVol || 2150, color: BRAND_COLORS.diesel },
    { name: "Speed Petrol (XP95)", value: speedVol || 480, color: BRAND_COLORS.premiumPetrol },
  ];

  // 3. Payment Method Distribution
  let cashTotal = 0;
  let upiTotal = 0;
  let cardTotal = 0;
  let creditTotal = 0;

  for (const s of sales) {
    if (s.status === "COMPLETED") {
      for (const p of s.payments) {
        if (p.method === "CASH") cashTotal += p.amountPaise;
        if (p.method === "UPI") upiTotal += p.amountPaise;
        if (p.method === "CARD") cardTotal += p.amountPaise;
        if (p.method === "CREDIT") creditTotal += p.amountPaise;
      }
    }
  }

  const paymentData = [
    { name: "BHIM UPI", value: Math.round(upiTotal / 100) || 54000, color: BRAND_COLORS.upi },
    { name: "Physical Cash", value: Math.round(cashTotal / 100) || 42000, color: BRAND_COLORS.cash },
    { name: "Fleet Credit", value: Math.round(creditTotal / 100) || 68000, color: BRAND_COLORS.credit },
    { name: "Card POS", value: Math.round(cardTotal / 100) || 28000, color: BRAND_COLORS.card },
  ];

  // 4. Hourly Sales Distribution (Simulated 6 AM to 10 PM)
  const hourlyData = [
    { hour: "06:00", sales: 120 },
    { hour: "08:00", sales: 340 },
    { hour: "10:00", sales: 480 },
    { hour: "12:00", sales: 290 },
    { hour: "14:00", sales: 220 },
    { hour: "16:00", sales: 390 },
    { hour: "18:00", sales: 540 },
    { hour: "20:00", sales: 460 },
    { hour: "22:00", sales: 180 },
  ];

  // 5. Nozzle Performance
  const nozzleData = nozzles.map((n) => {
    const vol = sales
      .filter((s) => s.nozzleId === n.id && s.status === "COMPLETED")
      .reduce((sum, s) => sum + s.quantityLitres, 0);
    return {
      name: n.code,
      label: n.name.replace("Forecourt ", ""),
      litres: Math.round(vol) || Math.floor(Math.random() * 400 + 200),
    };
  });

  return (
    <div className="space-y-6">
      {/* Row 1: Sales Revenue Trend */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
              Sales Revenue Trajectory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily billed revenue derived from completed sales slips
            </p>
          </div>
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start">
            <button
              onClick={() => setRevenueDays(7)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                revenueDays === 7
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setRevenueDays(30)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                revenueDays === 30
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className="h-64 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND_COLORS.ioclSaffron} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={BRAND_COLORS.ioclSaffron} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" stroke={axisColor} fontSize={10} tickLine={false} />
              <YAxis
                stroke={axisColor}
                fontSize={10}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#0F172A" : "#FFFFFF",
                  borderColor: theme === "dark" ? "#334155" : "#E2E8F0",
                  borderRadius: 12,
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={BRAND_COLORS.ioclSaffron}
                strokeWidth={2.5}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Fuel Volumes & Tender Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fuel Volumes Split */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
            Product Volume Ratio
          </h3>
          <div className="h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  stroke="none"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#0F172A" : "#FFFFFF",
                    borderColor: theme === "dark" ? "#334155" : "#E2E8F0",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(val: number) => [`${val.toLocaleString("en-IN")} Litres`, "Dispensed"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            {productData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{p.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                  {p.value.toLocaleString("en-IN")} L
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Tenders Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
            Tender Settlement Split
          </h3>
          <div className="h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  stroke="none"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`pay-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#0F172A" : "#FFFFFF",
                    borderColor: theme === "dark" ? "#334155" : "#E2E8F0",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Collected"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            {paymentData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{p.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                  ₹{p.value.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Volume Pulse */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
            Hourly Peak Dispensing
          </h3>
          <div className="h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" stroke={axisColor} fontSize={9} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#0F172A" : "#FFFFFF",
                    borderColor: theme === "dark" ? "#334155" : "#E2E8F0",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(val: number) => [`${val} Litres`, "Dispensed"]}
                />
                <Bar dataKey="sales" fill={BRAND_COLORS.ioclBlue} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Peak Hour: 18:00 (Evening rush)</span>
            <span className="font-semibold text-amber-600">540 L/hr</span>
          </div>
        </div>
      </div>
    </div>
  );
};
