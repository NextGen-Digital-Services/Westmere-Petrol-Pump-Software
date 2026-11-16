"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  BookOpen,
  HelpCircle,
  Keyboard,
  ExternalLink,
  ShieldCheck,
  Fuel,
  PlayCircle,
} from "lucide-react";
import { BRAND_COLORS } from "@/lib/theme";

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

interface GlossaryItem {
  term: string;
  hindiTerm?: string;
  category: "Stock" | "Dispenser" | "Accounting" | "Compliance";
  explanation: string;
  formulaOrStandard?: string;
}

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: "Book Stock vs Physical Stock",
    category: "Stock",
    explanation:
      "Book Stock is the theoretical inventory calculated as Opening Stock + Receipts - Recorded Sales. Physical Stock is the actual fuel physically present in the underground tank measured via dip rod or ATG sensor. The difference is the Stock Variance.",
    formulaOrStandard: "Variance (L) = Physical Dip Stock - Book Stock",
  },
  {
    term: "Dip Reading & Strapping Chart",
    category: "Stock",
    explanation:
      "Underground horizontal cylindrical tanks have non-linear volume per centimetre of depth. A calibration strapping chart issued by Weights & Measures maps dip depth in centimetres/millimetres to exact litres.",
    formulaOrStandard: "Strapping table interpolation between dip cm points",
  },
  {
    term: "Density at 15°C (Hydrometer & Thermometer)",
    category: "Compliance",
    explanation:
      "Fuel expands in heat and contracts in cold. IOCL invoices density standardized to 15°C. At tanker decantation, observed density and temperature are recorded and converted using ASTM 53B tables. Variance from invoice must be within ±3.0 kg/m³.",
    formulaOrStandard: "Permissible variation: ±3.0 kg/m³ from invoice density",
  },
  {
    term: "5-Litre Pump Measure & Stamping",
    category: "Dispenser",
    explanation:
      "Every morning before shift sales, each nozzle is tested using a government-stamped 5-Litre conical brass measure. Permissible delivery tolerance is ±25 ml per 5 Litres (±0.5%). Fuel dispensed is poured back into the underground tank as a Test Return.",
    formulaOrStandard: "Tolerance: ±25 ml per 5,000 ml measure",
  },
  {
    term: "Totalizer Rollover (Meter Overflow)",
    category: "Dispenser",
    explanation:
      "Mechanical and electronic totalizers have a finite display (usually 999,999.99 Litres). When the counter rolls past 999,999.99 back to 0, PETROFLOW handles rollover automatically so volume calculations are never negative.",
    formulaOrStandard: "Formula: (1,000,000 - Opening) + Closing",
  },
  {
    term: "Safe Cash Denomination Sheet",
    category: "Accounting",
    explanation:
      "At shift closing, cashiers physically count individual currency notes (₹500, ₹200, ₹100, ₹50, ₹20, ₹10, coins). The system compares total physically counted cash against Expected Cash (Opening Float + Cash Sales - Cash Expenses - Shift Drops).",
    formulaOrStandard: "Cash Variance = Counted Cash - Expected Cash",
  },
  {
    term: "Water Finding Paste & Filter Paper Test",
    category: "Compliance",
    explanation:
      "Water Finding Paste applied to the dip rod bottom turns from golden/green to bright pink/red if free water is present at the tank bottom. Whatman 581 filter paper is used for Petrol clarity: a fuel drop must evaporate completely within 2 minutes without leaving an oily pink/brown ring.",
    formulaOrStandard: "Water paste: 0mm water. Filter paper: 100% clean evaporation.",
  },
  {
    term: "Daily Stock Register (DSR)",
    category: "Compliance",
    explanation:
      "Statutory daily log mandated by the Petroleum & Explosives Safety Organization (PESO) and state sales tax departments recording opening stock, receipts, sales, closing physical stock, and transit losses.",
  },
];

export function HelpDrawer({ isOpen, onClose, onStartTour }: HelpDrawerProps) {
  const [activeTab, setActiveTab] = useState<"glossary" | "guides" | "shortcuts">("glossary");
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredGlossary = GLOSSARY_ITEMS.filter(
    (item) =>
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: BRAND_COLORS.ioclBlue }}
            >
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 font-heading">
                Station Help & Knowledge Base
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Indian Oil retail outlet standard operating procedures
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guided Tour Banner */}
        {onStartTour && (
          <div className="p-4 mx-4 mt-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                New to PETROFLOW v2?
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                Take the 2-minute visual walkthrough of daily station operations.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onStartTour();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all shrink-0"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Start Tour</span>
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-3">
          <button
            onClick={() => setActiveTab("glossary")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "glossary"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Glossary & Terms
          </button>
          <button
            onClick={() => setActiveTab("guides")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "guides"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Step-by-Step SOPs
          </button>
          <button
            onClick={() => setActiveTab("shortcuts")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "shortcuts"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Shortcuts
          </button>
        </div>

        {/* Tab 1: Glossary */}
        {activeTab === "glossary" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search terms (e.g. dip, variance, stamping, hydrometer)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-3">
              {filteredGlossary.map((g, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-heading">
                      {g.term}
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {g.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {g.explanation}
                  </p>
                  {g.formulaOrStandard && (
                    <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] font-mono text-amber-700 dark:text-amber-400 border border-slate-200/60 dark:border-slate-700/60">
                      {g.formulaOrStandard}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: SOP Guides */}
        {activeTab === "guides" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">SOP #1</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Daily 06:00 AM Shift Opening
                </h4>
                <ol className="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside">
                  <li>Check 6:00 AM dynamic fuel price updates received from IOCL.</li>
                  <li>Record physical Dip readings on Tanks 1, 2, and 3 using water paste.</li>
                  <li>Perform 5-Litre brass measure pump testing on each nozzle; record Test-Returns.</li>
                  <li>Open the Shift in PETROFLOW with the verified opening cash float.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">SOP #2</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Tanker Decantation Checklist
                </h4>
                <ol className="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside">
                  <li>Park tanker on earthing master bonding point; attach fire extinguishers.</li>
                  <li>Check unbroken IOCL brass seals on all compartment domes.</li>
                  <li>Take dip and hydrometer reading; calculate density at 15°C.</li>
                  <li>Take before-dip on destination underground tank; ensure ullage space exists.</li>
                  <li>Decant into correct tank manifold; record final after-dip in wizard.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">SOP #3</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Shift Handover & Safe Reconciliation
                </h4>
                <ol className="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside">
                  <li>Lock closing meter totalizers for all active nozzles.</li>
                  <li>Count physical currency in safe denomination sheet (₹500 to coins).</li>
                  <li>Collect UPI settlement receipts and credit chits signed by fleet drivers.</li>
                  <li>Submit shift for Owner / General Manager variance sign-off.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Shortcuts */}
        {activeTab === "shortcuts" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {[
              { key: "⌘ + K / Ctrl + K", label: "Open Universal Command Search & Quick Actions" },
              { key: "?", label: "Open this Help Drawer & Glossary" },
              { key: "Esc", label: "Close active modal, drawer, or dropdown" },
              { key: "Shift + S", label: "Jump to Sales & POS Billing" },
              { key: "Shift + D", label: "Jump to Dispensers & Meter Readings" },
              { key: "Shift + I", label: "Jump to Tank Inventory & Dip Readings" },
            ].map((sc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
              >
                <span className="text-slate-700 dark:text-slate-300 font-medium">{sc.label}</span>
                <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-semibold text-slate-800 dark:text-slate-200 text-[11px] shadow-sm">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
