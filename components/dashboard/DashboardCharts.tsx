"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { formatPaise, formatLitres } from "@/lib/format";
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

  const gridColor = theme === "dark" ? "#2B3026" : "#E2DDCF";
  const axisColor = theme === "dark" ? "#74786D" : "#8A8D83";

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
      amount: Math.round(amount),
      litres: Math.round(litres),
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
    { name: "Petrol (MS)", value: petrolVol || 1240, color: "#737B54" },
    { name: "Diesel (HSD)", value: dieselVol || 2150, color: "#B69A63" },
    { name: "Speed Petrol", value: speedVol || 480, color: "#9E473D" },
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
    { name: "UPI QR", value: Math.round(upiTotal / 100) || 54000, color: "#B69A63" },
    { name: "Cash", value: Math.round(cashTotal / 100) || 42000, color: "#737B54" },
    { name: "Credit/Fleet", value: Math.round(creditTotal / 100) || 68000, color: "#9E473D" },
    { name: "Card POS", value: Math.round(cardTotal / 100) || 28000, color: "#5F6644" },
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
    <div className="space-y-4">
      {/* Row 1: Sales Revenue Trend */}
      <div className="bg-card border border-border rounded-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-subtle gap-2">
          <div>
            <h3 className="text-base font-serif font-medium tracking-editorial text-text">
              Sales Revenue Trajectory
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Daily billed revenue derived from completed sales slips
            </p>
          </div>
          <div className="flex items-center space-x-1 bg-card-subtle p-0.5 border border-border rounded-sm self-start">
            <button
              onClick={() => setRevenueDays(7)}
              className={`px-2.5 py-1 text-xs rounded-sm transition-colors ${
                revenueDays === 7 ? "bg-accent text-bg font-semibold" : "text-text-muted hover:text-text"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setRevenueDays(30)}
              className={`px-2.5 py-1 text-xs rounded-sm transition-colors ${
                revenueDays === 30 ? "bg-accent text-bg font-semibold" : "text-text-muted hover:text-text"
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className="h-64 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" stroke={axisColor} fontSize={10} tickLine={false} />
              <YAxis stroke={axisColor} fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#20231E" : "#FAF8F4",
                  borderColor: theme === "dark" ? "#31362D" : "#D8D2C2",
                  borderRadius: 2,
                  fontSize: 12,
                }}
                formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#B69A63"
                strokeWidth={1.5}
                fill="#B69A63"
                fillOpacity={0.12}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Fuel Volumes & Tender Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fuel Volumes Split */}
        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="text-base font-serif font-medium tracking-editorial text-text pb-4 border-b border-border-subtle">
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
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  stroke="none"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#20231E" : "#FAF8F4",
                    borderColor: "#31362D",
                    borderRadius: 2,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v.toFixed(1)} L`, "Dispensed"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {productData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: p.color }} />
                  <span className="text-text-muted">{p.name}</span>
                </div>
                <span className="tabular-nums font-medium text-text">
                  {formatLitres(p.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="text-base font-serif font-medium tracking-editorial text-text pb-4 border-b border-border-subtle">
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
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  stroke="none"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-pay-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#20231E" : "#FAF8F4",
                    borderColor: "#31362D",
                    borderRadius: 2,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Collected"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {paymentData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: p.color }} />
                  <span className="text-text-muted">{p.name}</span>
                </div>
                <span className="tabular-nums font-medium text-text">
                  ₹{p.value.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nozzle Volumes Bar */}
        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="text-base font-serif font-medium tracking-editorial text-text pb-4 border-b border-border-subtle">
            Nozzle Dispenser Output
          </h3>
          <div className="h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nozzleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#20231E" : "#FAF8F4",
                    borderColor: "#31362D",
                    borderRadius: 2,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v} L`, "Total Volume"]}
                />
                <Bar dataKey="litres" fill="#737B54" barSize={20} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-text-faint mt-3 text-center">
            Island A & B forecourt totalizer comparison
          </p>
        </div>
      </div>
    </div>
  );
};
