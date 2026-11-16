"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePetroStore } from "@/store/usePetroStore";
import {
  AlertTriangle,
  Clock,
  CreditCard,
  FileCheck2,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export function NeedsAttentionPanel() {
  const router = useRouter();
  const { tanks, shifts, customers, complianceDocs, nozzles } = usePetroStore();

  const attentionItems: {
    id: string;
    type: "CRITICAL" | "WARNING" | "INFO";
    title: string;
    desc: string;
    actionText: string;
    route: string;
    icon: React.ElementType;
  }[] = [];

  // 1. Tanks below reorder
  const lowTanks = tanks.filter((t) => t.currentStockLitres <= t.reorderLevelLitres);
  if (lowTanks.length > 0) {
    attentionItems.push({
      id: "low-stock",
      type: "CRITICAL",
      title: `${lowTanks.length} Underground Tank${lowTanks.length > 1 ? "s" : ""} Below Reorder`,
      desc: `${lowTanks.map((t) => t.name).join(", ")} reached minimum threshold. Indent tanker from IOCL depot.`,
      actionText: "Indent Fuel",
      route: "/purchases",
      icon: AlertTriangle,
    });
  }

  // 2. Shifts pending variance approval
  const pendingShifts = shifts.filter((s) => s.status === "CLOSED" && ((s.cashVariancePaise || s.variancePaise || 0) !== 0) && !s.varianceApproved);
  if (pendingShifts.length > 0) {
    attentionItems.push({
      id: "pending-shifts",
      type: "WARNING",
      title: `${pendingShifts.length} Shift Variance${pendingShifts.length > 1 ? "s" : ""} Awaiting Sign-off`,
      desc: "Cash count vs meter discrepancy recorded. Owner review and approval required.",
      actionText: "Review Shifts",
      route: "/shifts",
      icon: Clock,
    });
  }

  // 3. Customers above 80% credit limit
  const overCreditCustomers = customers.filter(
    (c) => c.creditLimitPaise > 0 && c.currentBalancePaise / c.creditLimitPaise >= 0.8
  );
  if (overCreditCustomers.length > 0) {
    attentionItems.push({
      id: "credit-limit",
      type: "WARNING",
      title: `${overCreditCustomers.length} Fleet Account${overCreditCustomers.length > 1 ? "s" : ""} Nearing Credit Limit`,
      desc: `${overCreditCustomers[0].name} has utilized >80% of sanctioned limit. Collect RTGS payment before unlocking nozzle chits.`,
      actionText: "Fleet Ledger",
      route: "/customers",
      icon: CreditCard,
    });
  }

  // 4. Compliance document due
  const expiringDocs = complianceDocs.filter((d) => d.status === "EXPIRING_SOON" || d.status === "EXPIRED");
  if (expiringDocs.length > 0) {
    attentionItems.push({
      id: "compliance-doc",
      type: "INFO",
      title: `${expiringDocs.length} Compliance Document Renewal Due`,
      desc: `${expiringDocs[0].title} is due for periodic inspection or statutory renewal.`,
      actionText: "Open Vault",
      route: "/compliance",
      icon: FileCheck2,
    });
  }

  // If no items, show a positive operational status
  if (attentionItems.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 font-heading">
              All Station Systems Operating Normally
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Zero pending shift variances, underground tanks healthy, all dispensers verified.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          Forecourt Ready
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Requires Action ({attentionItems.length})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {attentionItems.map((item) => {
          const Icon = item.icon;
          const isCritical = item.type === "CRITICAL";

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 transition-all ${
                isCritical
                  ? "bg-rose-50/60 border-rose-200/80 dark:bg-rose-950/20 dark:border-rose-900/40"
                  : "bg-amber-50/60 border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-900/40"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isCritical
                      ? "bg-rose-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4
                    className={`text-xs font-bold truncate ${
                      isCritical
                        ? "text-rose-900 dark:text-rose-200"
                        : "text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push(item.route)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all shadow-xs inline-flex items-center gap-1 ${
                  isCritical
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
              >
                <span>{item.actionText}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
