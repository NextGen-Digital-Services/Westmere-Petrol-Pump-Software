"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StationDailyTimeline } from "@/components/dashboard/StationDailyTimeline";
import { NeedsAttentionPanel } from "@/components/dashboard/NeedsAttentionPanel";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { QuickActionModals } from "@/components/dashboard/QuickActionModals";
import { PageTransition } from "@/components/animations/PageTransition";

export default function DashboardPage() {
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <PageTransition className="space-y-6">
      {/* Editorial Header with Quick Actions */}
      <DashboardHeader
        onOpenNewShift={() => setShiftModalOpen(true)}
        onOpenFuelPurchase={() => setPurchaseModalOpen(true)}
        onOpenAddExpense={() => setExpenseModalOpen(true)}
        onOpenRecordPayment={() => setPaymentModalOpen(true)}
        onOpenDailyReport={() => setReportModalOpen(true)}
      />

      {/* "Today at the Station" 7-Step Operational Timeline */}
      <StationDailyTimeline />

      {/* Smart Needs Attention Panel (Alerts, Pending Approvals, Stamping) */}
      <NeedsAttentionPanel />

      {/* Primary KPI Metrics & Underground Tank Rack */}
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
    </PageTransition>
  );
}
