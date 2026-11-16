"use client";

import React from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { Plus, Clock, Truck, Wallet, FileText, CreditCard } from "lucide-react";

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
  const { station, shifts } = usePetroStore();
  const runningShift = shifts.find((s) => s.status === "OPEN");

  return (
    <div className="space-y-4">
      {/* Editorial Title Block */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center space-x-2 text-xs font-medium tracking-caps uppercase text-text-muted">
            <span>{station.name}</span>
            <span>•</span>
            <span className="text-accent font-semibold">RO CODE: {station.roCode}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-serif font-light tracking-editorial text-text mt-1">
            Station Executive Overview
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Operational telemetry for {formatDate(new Date(), "EEEE, dd MMMM yyyy")}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenNewShift}
            icon={<Clock className="w-3.5 h-3.5" />}
          >
            {runningShift ? "Active Shift" : "Start New Shift"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFuelPurchase}
            icon={<Truck className="w-3.5 h-3.5" />}
          >
            Record Purchase
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAddExpense}
            icon={<Wallet className="w-3.5 h-3.5" />}
          >
            Add Expense
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenRecordPayment}
            icon={<CreditCard className="w-3.5 h-3.5" />}
          >
            Record Payment
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenDailyReport}
            icon={<FileText className="w-3.5 h-3.5" />}
          >
            Daily Report
          </Button>
        </div>
      </div>
    </div>
  );
};
