"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePetroStore } from "@/store/usePetroStore";
import { formatDate } from "@/lib/format";
import {
  Clock,
  Truck,
  Wallet,
  FileText,
  CreditCard,
  Receipt,
  Gauge,
  Sparkles,
} from "lucide-react";

interface DashboardHeaderProps {
  onOpenNewShift: () => void;
  onOpenFuelPurchase: () => void;
  onOpenAddExpense: () => void;
  onOpenRecordPayment: () => void;
  onOpenDailyReport: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenNewShift,
  onOpenFuelPurchase,
  onOpenAddExpense,
  onOpenRecordPayment,
  onOpenDailyReport,
}) => {
  const router = useRouter();
  const { station, shifts } = usePetroStore();
  const runningShift = shifts.find((s) => s.status === "OPEN");

  return (
    <div className="space-y-4">
      {/* Title & Quick Actions Row */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            <span>{station.oilCompany || "Indian Oil Corporation Limited"}</span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-extrabold font-mono">
              RO: {station.roCode}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-slate-100 mt-1">
            Station Executive Overview
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Forecourt operational telemetry for {formatDate(new Date(), "EEEE, dd MMMM yyyy")}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick POS Billing */}
          <button
            onClick={() => router.push("/sales")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 inline-flex items-center gap-1.5 transition-all"
          >
            <Receipt className="w-4 h-4" />
            <span>POS Billing</span>
          </button>

          <button
            onClick={onOpenNewShift}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{runningShift ? "Active Shift" : "Start Shift"}</span>
          </button>

          <button
            onClick={onOpenFuelPurchase}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Receive Tanker</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={onOpenDailyReport}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 transition-all shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>DSR Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
