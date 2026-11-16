"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Fuel,
  Receipt,
  Scale,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { BRAND_COLORS } from "@/lib/theme";

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  highlightAction: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to PETROFLOW v2",
    subtitle: "Indian Oil Dealership Station Management",
    description:
      "Designed specifically for retail outlet owners and managers. Everything updates in real-time with zero manual spreadsheets, adhering to statutory Weights & Measures rules.",
    icon: Sparkles,
    badge: "Station Overview",
    highlightAction: "Ready to explore",
  },
  {
    title: "Today at the Station — 7-Step Workflow",
    subtitle: "The Master Daily Timeline",
    description:
      "Follow the guided daily sequence: 6:00 AM Price Revision → Tank Dips & Quality Tests → 5L Pump Measure → Open Shift Float → Continuous Sales → Tanker Decantation → Shift Handover & Denomination Count.",
    icon: Clock,
    badge: "Daily Operations",
    highlightAction: "Check Dashboard Timeline",
  },
  {
    title: "Live Tank Inventory & ATG Telemetry",
    subtitle: "Cutaway Tanks with Visual Wave Fills",
    description:
      "Monitor underground storage across Petrol (MS), Diesel (HSD), and XP95. Visual low-stock indicators pulse when inventory drops below statutory reorder levels.",
    icon: Fuel,
    badge: "Inventory Control",
    highlightAction: "View Tanks & Strapping",
  },
  {
    title: "High-Velocity POS & Fleet Credit Billing",
    subtitle: "Split Tenders: Cash, UPI, Card & Fleet",
    description:
      "Generate thermal slips in under 3 seconds. Enforce customer credit limits, log vehicle numbers, and generate fleet invoices with statutory VAT/Cess breakdown.",
    icon: Receipt,
    badge: "Sales & POS",
    highlightAction: "Open Billing Counter",
  },
  {
    title: "Safe Cash Denomination & Shift Reconciliation",
    subtitle: "Zero Cash Leakage Guarantee",
    description:
      "At shift end, enter currency note counts (₹500, ₹200, ₹100...). PETROFLOW compares counted cash with meter sales, flagging any overage or shortage for Owner approval.",
    icon: Scale,
    badge: "Financial Control",
    highlightAction: "Review Shift Closing",
  },
  {
    title: "Compliance Document Vault & Metrology Stamping",
    subtitle: "Audit-Ready Station Documents",
    description:
      "Never miss a Legal Metrology stamping deadline or PESO explosive license renewal. Track dispenser calibration due dates and daily density/temperature records.",
    icon: ShieldCheck,
    badge: "Statutory Vault",
    highlightAction: "Inspect Compliance Score",
  },
];

export function ProductTour({ isOpen, onClose }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
      setCurrentStep(0);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden z-10"
      >
        {/* Top Saffron / Blue Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-amber-600 to-blue-700" />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/80">
                {step.badge}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Visual Icon Card */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mb-5 shadow-sm">
            <Icon className="w-8 h-8" />
          </div>

          {/* Content */}
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
            {step.title}
          </h3>
          <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mt-1">
            {step.subtitle}
          </h4>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {step.description}
          </p>

          {/* Step Progress Indicators */}
          <div className="flex items-center gap-1.5 mt-8 mb-6">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? "w-8 bg-amber-500"
                    : idx < currentStep
                    ? "w-3 bg-slate-300 dark:bg-slate-700"
                    : "w-3 bg-slate-200 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2 py-1"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 inline-flex items-center gap-1.5 transition-all"
              >
                <span>{isLast ? "Get Started" : "Next Step"}</span>
                {isLast ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
