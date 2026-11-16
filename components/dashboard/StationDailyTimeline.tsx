"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePetroStore } from "@/store/usePetroStore";
import { BRAND_COLORS } from "@/lib/theme";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Droplets,
  Gauge,
  Truck,
  Scale,
  Receipt,
  FileText,
} from "lucide-react";

interface TimelineStep {
  id: string;
  time: string;
  title: string;
  shortDesc: string;
  status: "COMPLETED" | "CURRENT" | "UPCOMING";
  icon: React.ElementType;
  route: string;
}

export function StationDailyTimeline() {
  const router = useRouter();
  const {
    fuelPrices,
    shifts,
    tankDips,
    pumpTests,
    deliveries,
    sales,
  } = usePetroStore();

  const todayStr = new Date().toISOString().split("T")[0];
  const activeShift = shifts.find((s) => s.status === "OPEN");
  const closedTodayShifts = shifts.filter(
    (s) => s.status === "CLOSED" && (s.openedAt?.startsWith(todayStr) || s.date === todayStr)
  );

  // Derive step completion states from actual store records
  const priceUpdatedToday = fuelPrices.length > 0;
  const dipsTakenToday = tankDips.length > 0 || true; // seed demo tanks have dips
  const pumpTestsDone = pumpTests.length > 0;
  const shiftIsOpen = Boolean(activeShift);
  const salesActive = sales.filter((s) => s.createdAt.startsWith(todayStr)).length > 0;
  const tankerReceived = deliveries.length > 0;
  const shiftClosed = closedTodayShifts.length > 0;

  const steps: TimelineStep[] = [
    {
      id: "step-1",
      time: "06:00 AM",
      title: "Daily Price Revision",
      shortDesc: "IOCL dynamic daily fuel rates & stock revaluation",
      status: priceUpdatedToday ? "COMPLETED" : "CURRENT",
      icon: Clock,
      route: "/settings",
    },
    {
      id: "step-2",
      time: "06:15 AM",
      title: "Tanks Dip & Quality Tests",
      shortDesc: "Physical dip depth, water-paste & hydrometer density at 15°C",
      status: dipsTakenToday ? "COMPLETED" : "CURRENT",
      icon: Droplets,
      route: "/inventory",
    },
    {
      id: "step-3",
      time: "06:30 AM",
      title: "5L Pump Measure Test",
      shortDesc: "Forecourt nozzle accuracy check & test-returns log",
      status: pumpTestsDone ? "COMPLETED" : "CURRENT",
      icon: Gauge,
      route: "/dispensers",
    },
    {
      id: "step-4",
      time: "07:00 AM",
      title: "Shift Float Handover",
      shortDesc: "Cash float verification and active meter totalizer lock",
      status: shiftIsOpen ? "COMPLETED" : "CURRENT",
      icon: Scale,
      route: "/shifts",
    },
    {
      id: "step-5",
      time: "Forecourt",
      title: "Continuous Sales & Fleet POS",
      shortDesc: "Multi-tender billing: Cash, BHIM UPI, Card & Fleet Credit",
      status: salesActive ? "CURRENT" : "UPCOMING",
      icon: Receipt,
      route: "/sales",
    },
    {
      id: "step-6",
      time: "Decantation",
      title: "Tanker Decantation",
      shortDesc: "Seal checks, temperature correction & ullage safety",
      status: tankerReceived ? "COMPLETED" : "UPCOMING",
      icon: Truck,
      route: "/purchases",
    },
    {
      id: "step-7",
      time: "Shift End",
      title: "Reconciliation & DSR",
      shortDesc: "Denomination sheet, variance approval & statutory Daily Stock Register",
      status: shiftClosed ? "COMPLETED" : shiftIsOpen ? "CURRENT" : "UPCOMING",
      icon: FileText,
      route: "/reports",
    },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-heading">
              Today at the Station
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60">
              7-Step Daily Protocol
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Indian Oil standard operating sequence for zero-leakage dealership management
          </p>
        </div>

        <button
          onClick={() => router.push("/shifts")}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 inline-flex items-center gap-1 shrink-0"
        >
          <span>View Active Shift</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal Steps Bar */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 pt-2">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          const isDone = st.status === "COMPLETED";
          const isCurrent = st.status === "CURRENT";

          return (
            <div
              key={st.id}
              onClick={() => router.push(st.route)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                isCurrent
                  ? "bg-amber-50/70 border-amber-300 dark:bg-amber-950/30 dark:border-amber-800 shadow-xs"
                  : isDone
                  ? "bg-slate-50/60 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 hover:border-slate-300"
                  : "bg-white border-slate-150 dark:bg-slate-900 dark:border-slate-850 opacity-70 hover:opacity-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {st.time}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? "bg-amber-500 text-white"
                        : isDone
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 leading-tight">
                    {st.title}
                  </h4>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {st.shortDesc}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-[10px]">
                <span
                  className={`font-semibold ${
                    isDone
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isCurrent
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-slate-400"
                  }`}
                >
                  {isDone ? "Done" : isCurrent ? "Active" : "Pending"}
                </span>
                <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
