"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { QuickActionModals } from "@/components/dashboard/QuickActionModals";

export default function DashboardPage() {
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Editorial Header with Quick Actions */}
      <DashboardHeader
        onOpenNewShift={() => setShiftModalOpen(true)}
        onOpenFuelPurchase={() => setPurchaseModalOpen(true)}
        onOpenAddExpense={() => setExpenseModalOpen(true)}
        onOpenRecordPayment={() => setPaymentModalOpen(true)}
        onOpenDailyReport={() => setReportModalOpen(true)}
      />

      {/* Primary KPI Metrics & Gauges */}
      <DashboardMetrics />

      {/* Analytics Charts & Trends */}
      <DashboardCharts />

      {/* Action Modals */}
      <QuickActionModals
        shiftModalOpen={shiftModalOpen}
        onCloseShiftModal={() => setShiftModalOpen(false)}
        purchaseModalOpen={purchaseModalOpen}
        onClosePurchaseModal={() => setPurchaseModalOpen(false)}
        expenseModalOpen={expenseModalOpen}
        onCloseExpenseModal={() => setExpenseModalOpen(false)}
        paymentModalOpen={paymentModalOpen}
        onClosePaymentModal={() => setPaymentModalOpen(false)}
        reportModalOpen={reportModalOpen}
        onCloseReportModal={() => setReportModalOpen(false)}
      />
    </div>
  );
}
