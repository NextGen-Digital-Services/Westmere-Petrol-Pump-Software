"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { FuelType } from "@/types";
import { PageTransition } from "@/components/animations/PageTransition";
import { StationBrand } from "@/components/branding/StationBrand";
import { Input } from "@/components/ui/Input";
import { formatPaise, formatDateTime, formatLitres } from "@/lib/format";
import { BRAND_COLORS, getFuelColor } from "@/lib/theme";
import {
  Download,
  Upload,
  RotateCcw,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Settings,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  Building2,
  ShieldAlert,
  Clock,
} from "lucide-react";

export default function SettingsPage() {
  const store = usePetroStore();
  const [activeTab, setActiveTab] = useState<"PRICING" | "BRANDING" | "TAX" | "DATA">("PRICING");
  const [actionNotice, setActionNotice] = useState("");

  // Fuel Price Form & Revaluation
  const [selectedFuel, setSelectedFuel] = useState<FuelType>("Petrol");
  const [newPriceRupees, setNewPriceRupees] = useState("96.72");
  const [priceReason, setPriceReason] = useState("IOCL 06:00 AM daily dynamic revision");

  // Station Info Form
  const [stationName, setStationName] = useState(store.station.name);
  const [dealerName, setDealerName] = useState(store.station.dealerName);
  const [phone, setPhone] = useState(store.station.phone);
  const [email, setEmail] = useState(store.station.email);
  const [roCode, setRoCode] = useState(store.station.roCode);
  const [oilCompany, setOilCompany] = useState(store.station.oilCompany || "Indian Oil Corporation Limited");
  const [logoUrl, setLogoUrl] = useState<string>(store.station.logoUrl || "");

  // Tax Profile Form
  const [fuelGstApplicable, setFuelGstApplicable] = useState(store.settings.taxProfile.fuelGstApplicable);
  const [stateVatRate, setStateVatRate] = useState(store.settings.taxProfile.stateVatRatePercent.toString());
  const [cessPaise, setCessPaise] = useState((store.settings.taxProfile.stateCessPerLitrePaise / 100).toString());

  // Stock revaluation preview calculation
  const currentPriceObj = store.fuelPrices.find((p) => p.fuelType === selectedFuel);
  const currentPriceRupees = (currentPriceObj?.salePricePaise || 9672) / 100;
  const targetNewPriceRupees = parseFloat(newPriceRupees) || currentPriceRupees;
  const deltaRupeesPerLitre = targetNewPriceRupees - currentPriceRupees;

  const matchingTanks = store.tanks.filter((t) => t.fuelType === selectedFuel);
  const activeStockLitres = matchingTanks.reduce((sum, t) => sum + t.currentStockLitres, 0);
  const stockRevaluationRupees = activeStockLitres * deltaRupeesPerLitre;

  const handleUpdatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    const paise = Math.round((parseFloat(newPriceRupees) || 0) * 100);
    const result = store.setFuelPriceWithRevaluation(selectedFuel, paise, priceReason);

    setActionNotice(
      `Revised ${selectedFuel} price to ₹${parseFloat(newPriceRupees).toFixed(2)}/L. Stock revaluation impact: ${
        result.revaluationDeltaPaise >= 0 ? "+" : ""
      }${formatPaise(result.revaluationDeltaPaise)} across ${Math.round(activeStockLitres)} Litres.`
    );
    setTimeout(() => setActionNotice(""), 6000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo file size exceeds 2MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoUrl(result);
        store.updateSettings({
          station: {
            ...store.station,
            logoUrl: result,
          },
        });
        setActionNotice("Official station logo updated successfully.");
        setTimeout(() => setActionNotice(""), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStationInfo = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings({
      station: {
        ...store.station,
        name: stationName,
        dealerName,
        phone,
        email,
        roCode,
        oilCompany,
        logoUrl,
      },
    });
    setActionNotice("Station master details and branding successfully updated.");
    setTimeout(() => setActionNotice(""), 4000);
  };

  const handleSaveTaxProfile = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings({
      taxProfile: {
        ...store.settings.taxProfile,
        fuelGstApplicable,
        stateVatRatePercent: parseFloat(stateVatRate) || 0,
        stateCessPerLitrePaise: Math.round((parseFloat(cessPaise) || 0) * 100),
      },
    });
    setActionNotice("Statutory tax schedule configuration updated.");
    setTimeout(() => setActionNotice(""), 4000);
  };

  // Data Lifecycle Handlers
  const handleExportData = () => {
    const jsonStr = store.exportDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `petroflow_backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setActionNotice("Complete station database JSON export downloaded.");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const ok = store.importDataJSON(text);
        if (ok) {
          setActionNotice("Station data restored successfully from backup JSON.");
        } else {
          setActionNotice("Error: Invalid or corrupted JSON backup file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetDemo = () => {
    if (confirm("Reset station storage to original verified Indian Oil 30-day demo dataset?")) {
      store.resetToDemoData();
      setActionNotice("Reset database to 30-day Indian Oil demo seed data.");
    }
  };

  const handleClearAll = () => {
    if (
      confirm(
        "WARNING: Clear all station data for production empty state? This removes all transactions, tanks, and shifts."
      )
    ) {
      store.clearAllData();
      setActionNotice("All station records cleared. Application is in production blank mode.");
    }
  };

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/90 dark:border-slate-800">
        <span className="text-[10px] tracking-wider uppercase text-amber-600 dark:text-amber-500 font-bold">
          Station Configuration & System Maintenance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-slate-100 mt-1">
          Settings & Dealership Control
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Effective-dated 6:00 AM fuel pricing, stock revaluation, official Indian Oil logo branding, statutory VAT/Cess, and local data persistence.
        </p>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        {[
          { key: "PRICING", label: "06:00 AM Price Revision & Stock Revaluation" },
          { key: "BRANDING", label: "Station Profile & Logo Branding" },
          { key: "TAX", label: "Statutory Tax & VAT Profile" },
          { key: "DATA", label: "Data Lifecycle (Backup / Reset)" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === tab.key
                ? "text-amber-600 dark:text-amber-400 border-amber-500"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Fuel Pricing & Revaluation */}
      {activeTab === "PRICING" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
                Daily 06:00 AM Dynamic Fuel Revision
              </h3>
            </div>

            <form onSubmit={handleUpdatePrice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Fuel Product
                </label>
                <select
                  value={selectedFuel}
                  onChange={(e) => setSelectedFuel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100"
                >
                  <option value="Petrol">Petrol (Motor Spirit - MS)</option>
                  <option value="Diesel">High Speed Diesel (HSD)</option>
                  <option value="Speed Petrol">Speed Petrol (XP95)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                <span className="text-slate-500">Current Effective Selling Price:</span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100">
                  ₹{currentPriceRupees.toFixed(2)}/L
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  New Revised Selling Price / Litre (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPriceRupees}
                  onChange={(e) => setNewPriceRupees(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Stock Revaluation Calculator Feedback (Section 9.1) */}
              <div
                className={`p-3.5 rounded-2xl border text-xs ${
                  deltaRupeesPerLitre === 0
                    ? "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                    : deltaRupeesPerLitre > 0
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Stock Revaluation Impact:</span>
                  <span className="font-mono text-sm">
                    {deltaRupeesPerLitre >= 0 ? "+" : ""}₹{Math.abs(stockRevaluationRupees).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="mt-1 text-[11px] opacity-90">
                  Applied across <strong>{Math.round(activeStockLitres).toLocaleString("en-IN")} Litres</strong> in storage. {deltaRupeesPerLitre > 0 ? "Inventory appreciation gain." : deltaRupeesPerLitre < 0 ? "Inventory depreciation loss." : "No price change."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Regulatory / Revision Reason
                </label>
                <input
                  type="text"
                  required
                  value={priceReason}
                  onChange={(e) => setPriceReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm shadow-amber-500/20"
              >
                Broadcast 06:00 AM Revision & Revalue Stock
              </button>
            </form>
          </div>

          <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
                Historical Fuel Price Revision Schedule
              </h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Effective From</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Product</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Price / Litre</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Authorized By</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {store.fuelPrices.map((p) => {
                  const fuelColor = getFuelColor(p.fuelType);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono text-slate-500">{formatDateTime(p.effectiveFrom)}</td>
                      <td className="p-3.5 font-bold">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fuelColor }} />
                          <span className="text-slate-800 dark:text-slate-200">{p.fuelType}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-extrabold text-amber-600 dark:text-amber-400">
                        {formatPaise(p.salePricePaise)}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{p.changedBy}</td>
                      <td className="p-3.5 text-slate-500">{p.notes || "Statutory rate"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Station Profile & Logo Branding */}
      {activeTab === "BRANDING" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 max-w-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-6 h-6 text-amber-500" />
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
                Station Dealership Profile & Official Logo Branding
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your official Indian Oil dealership logo or use the default wordmark.
              </p>
            </div>
          </div>

          {/* Current Logo Preview */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Live Branding Preview
              </span>
              <StationBrand
                stationName={stationName}
                roCode={roCode}
                oilCompany={oilCompany}
                logoUrl={logoUrl}
                size="md"
              />
            </div>

            <div>
              <label className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-amber-500 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
                <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>Upload Official IOCL Logo</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <span className="block text-[10px] text-slate-400 mt-1">PNG, JPG or SVG (max 2MB)</span>
            </div>
          </div>

          <form onSubmit={handleSaveStationInfo} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Station Trade Name"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                required
              />

              <Input
                label="Retail Outlet (RO) Code"
                value={roCode}
                onChange={(e) => setRoCode(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Authorized Dealer / Enterprise"
                value={dealerName}
                onChange={(e) => setDealerName(e.target.value)}
                required
              />

              <Input
                label="Oil Marketing Company (OMC)"
                value={oilCompany}
                onChange={(e) => setOilCompany(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Station Contact Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <Input
                label="Manager Contact Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
              >
                Save Dealership Master Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Statutory Tax Profile */}
      {activeTab === "TAX" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 max-w-2xl shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
              Statutory Petroleum Tax & State VAT Schedule
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory regulatory profile compliant with Section 9(2) of the Central Goods & Services Tax (CGST) Act
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <span className="font-bold block">Statutory Indian Petroleum Notice:</span>
            <p className="leading-relaxed">
              Motor Spirit (Petrol) and High-Speed Diesel (HSD) are currently kept OUTSIDE the levy of GST under Section 9(2) of the CGST Act. Sales are subject to state VAT and provincial Road Infrastructure Cess. Packaged Servo lubricants are subject to standard 18% GST.
            </p>
          </div>

          <form onSubmit={handleSaveTaxProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="State VAT Rate (%)"
                type="number"
                step="0.01"
                value={stateVatRate}
                onChange={(e) => setStateVatRate(e.target.value)}
                required
              />

              <Input
                label="State Road Infrastructure Cess (₹/L)"
                type="number"
                step="0.01"
                value={cessPaise}
                onChange={(e) => setCessPaise(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
              >
                Save Tax Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Data Lifecycle */}
      {activeTab === "DATA" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 max-w-2xl shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
              Station Data Lifecycle & Persistence
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Backup, restore, or reset local station storage state
            </p>
          </div>

          {/* Backup & Restore */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Database Backup & Restore (JSON)
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportData}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-amber-500 inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Export Station Backup</span>
              </button>

              <label className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-amber-500 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Restore from JSON File</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Demo Reset */}
          <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Reset to 30-Day Indian Oil Demo Data
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                Restores complete operational state: tanks, dispensers, shifts, quality checks, compliance docs, and sales.
              </p>
            </div>
            <button
              onClick={handleResetDemo}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs shrink-0 inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Seed</span>
            </button>
          </div>

          {/* Clear All */}
          <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Clear All Forecourt Records
              </h4>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                Clears all transactions, shifts, and dips for production initial blank state.
              </p>
            </div>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs shrink-0 inline-flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
