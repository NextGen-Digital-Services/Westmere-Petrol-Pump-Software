"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { FuelType } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatPaise, formatDateTime } from "@/lib/format";
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
} from "lucide-react";

export default function SettingsPage() {
  const store = usePetroStore();
  const [activeTab, setActiveTab] = useState<"PRICING" | "TAX" | "DATA" | "GENERAL">("PRICING");
  const [actionNotice, setActionNotice] = useState("");

  // Fuel Price Form
  const [selectedFuel, setSelectedFuel] = useState<FuelType>("Petrol");
  const [newPriceRupees, setNewPriceRupees] = useState("96.72");
  const [priceReason, setPriceReason] = useState("");

  // Station Info Form
  const [stationName, setStationName] = useState(store.station.name);
  const [dealerName, setDealerName] = useState(store.station.dealerName);
  const [phone, setPhone] = useState(store.station.phone);
  const [email, setEmail] = useState(store.station.email);
  const [roCode, setRoCode] = useState(store.station.roCode);

  // Tax Profile Form
  const [fuelGstApplicable, setFuelGstApplicable] = useState(store.settings.taxProfile.fuelGstApplicable);
  const [stateVatRate, setStateVatRate] = useState(store.settings.taxProfile.stateVatRatePercent.toString());
  const [cessPaise, setCessPaise] = useState((store.settings.taxProfile.stateCessPerLitrePaise / 100).toString());

  const handleUpdatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    const paise = Math.round((parseFloat(newPriceRupees) || 0) * 100);
    store.setFuelPrice(selectedFuel, paise, priceReason);
    setActionNotice(`Successfully revised ${selectedFuel} selling price to ₹${parseFloat(newPriceRupees).toFixed(2)}/L.`);
    setTimeout(() => setActionNotice(""), 4000);
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
      },
    });
    setActionNotice("Station master details successfully updated.");
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
    if (confirm("Reset station storage to original verified demo seed dataset?")) {
      store.resetToDemoData();
      setActionNotice("Reset database to demo seed data.");
    }
  };

  const handleClearAll = () => {
    if (confirm("WARNING: Clear all station data for production empty state? This removes all transactions, tanks, and shifts.")) {
      store.clearAllData();
      setActionNotice("All station records cleared. Application is in production blank mode.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
          Station Configuration & System Maintenance
        </span>
        <h1 className="text-3xl font-serif font-light tracking-editorial text-text mt-1">
          Settings & Data Management
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Effective-dated fuel pricing, Indian statutory tax profiles, station profile, and local data persistence controls.
        </p>
      </div>

      {actionNotice && (
        <div className="p-3 bg-olive/15 border border-olive/30 text-olive text-xs rounded-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6">
        {[
          { key: "PRICING", label: "Fuel Pricing Master" },
          { key: "TAX", label: "Statutory Tax & VAT Profile" },
          { key: "GENERAL", label: "Station Profile" },
          { key: "DATA", label: "Data Lifecycle (Backup / Reset)" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-2.5 text-xs font-serif tracking-editorial uppercase transition-colors ${
              activeTab === tab.key
                ? "text-accent font-semibold border-b-2 border-accent"
                : "text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Fuel Pricing */}
      {activeTab === "PRICING" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 bg-card border border-border rounded-sm p-6 space-y-4">
            <h3 className="text-base font-serif font-medium tracking-editorial text-text pb-3 border-b border-border-subtle">
              Revise Forecourt Fuel Price
            </h3>
            <form onSubmit={handleUpdatePrice} className="space-y-4">
              <Select
                label="Fuel Product"
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value as any)}
              >
                <option value="Petrol">Petrol (Motor Spirit)</option>
                <option value="Diesel">High Speed Diesel (HSD)</option>
                <option value="Speed Petrol">Speed Petrol</option>
              </Select>

              <Input
                label="New Selling Price / Litre (₹)"
                type="number"
                step="0.01"
                value={newPriceRupees}
                onChange={(e) => setNewPriceRupees(e.target.value)}
                required
              />

              <Input
                label="Revision Regulatory Reason"
                value={priceReason}
                onChange={(e) => setPriceReason(e.target.value)}
                placeholder="e.g. Daily midnight state OMC price revision"
                required
              />

              <Button type="submit" variant="primary" size="md" className="w-full">
                Broadcast Price Revision
              </Button>
            </form>
          </div>

          <div className="md:col-span-7 bg-card border border-border rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border-subtle">
              <h3 className="text-base font-serif font-medium tracking-editorial text-text">
                Historical Fuel Price Schedule
              </h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-card-subtle border-b border-border">
                <tr>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Effective From</th>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Product</th>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Price / Litre</th>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Changed By</th>
                  <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {store.fuelPrices.map((p) => (
                  <tr key={p.id} className="hover:bg-card-subtle/40">
                    <td className="p-3 text-text-muted">{formatDateTime(p.effectiveFrom)}</td>
                    <td className="p-3 font-medium text-text">{p.fuelType}</td>
                    <td className="p-3 text-right tabular-nums font-semibold text-accent">{formatPaise(p.salePricePaise)}</td>
                    <td className="p-3 text-text-muted">{p.changedBy}</td>
                    <td className="p-3 text-text-muted">{p.notes || "Standard rate"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Tax Profile */}
      {activeTab === "TAX" && (
        <div className="bg-card border border-border rounded-sm p-6 max-w-2xl space-y-6">
          <div>
            <h3 className="text-base font-serif font-medium tracking-editorial text-text">
              Statutory Tax Schedule & Petroleum GST Treatment
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Statutory regulatory profile compliant with Section 9(2) of the CGST Act
            </p>
          </div>

          {/* Mandatory Compliance Notice */}
          <div className="p-4 bg-brass/10 border border-brass/30 text-xs rounded-sm space-y-1">
            <div className="flex items-center space-x-2 text-brass font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Statutory Tax Notice</span>
            </div>
            <p className="text-text-muted leading-relaxed">
              IMPORTANT: Petrol and diesel are currently outside GST levy under Section 9(2) of the CGST Act. The system defaults to &quot;No GST on fuel&quot;. Tax treatment, state VAT schedules, and environmental cess must be reviewed by a certified chartered accountant.
            </p>
          </div>

          <form onSubmit={handleSaveTaxProfile} className="space-y-4">
            <label className="flex items-center space-x-2.5 text-xs text-text cursor-pointer">
              <input
                type="checkbox"
                checked={fuelGstApplicable}
                onChange={(e) => setFuelGstApplicable(e.target.checked)}
                className="rounded-sm border-border text-accent focus:ring-accent"
              />
              <span className="font-semibold">Apply GST to Motor Spirit & Diesel (Currently Disabled by Law)</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="State Fuel VAT Rate (%)"
                type="number"
                step="0.01"
                value={stateVatRate}
                onChange={(e) => setStateVatRate(e.target.value)}
                helperText="Delhi State VAT schedule on fuel"
              />
              <Input
                label="Specific State Cess / L (₹)"
                type="number"
                step="0.01"
                value={cessPaise}
                onChange={(e) => setCessPaise(e.target.value)}
                helperText="Pollution and road development cess"
              />
            </div>

            <Button type="submit" variant="primary" size="md">
              Save Statutory Tax Profile
            </Button>
          </form>
        </div>
      )}

      {/* Tab 3: Station Profile */}
      {activeTab === "GENERAL" && (
        <div className="bg-card border border-border rounded-sm p-6 max-w-2xl space-y-6">
          <h3 className="text-base font-serif font-medium tracking-editorial text-text pb-3 border-b border-border-subtle">
            Retail Outlet Profile & License Details
          </h3>
          <form onSubmit={handleSaveStationInfo} className="space-y-4">
            <Input
              label="Station Name"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              required
            />
            <Input
              label="Dealer Legal Entity"
              value={dealerName}
              onChange={(e) => setDealerName(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Retail Outlet Code (RO Code)"
                value={roCode}
                onChange={(e) => setRoCode(e.target.value)}
                required
              />
              <Input
                label="Station Contact Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <Input
              label="Management Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" size="md">
              Update Station Master
            </Button>
          </form>
        </div>
      )}

      {/* Tab 4: Data Lifecycle (Backup / Restore / Reset / Clear) */}
      {activeTab === "DATA" && (
        <div className="bg-card border border-border rounded-sm p-6 space-y-6">
          <div>
            <h3 className="text-base font-serif font-medium tracking-editorial text-text">
              Local Data Persistence & Master Database Lifecycle
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Full relational backup, restoration, demonstration seed resets, and production clean-slate operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Export */}
            <div className="p-5 border border-border rounded-sm bg-card-subtle flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-xs text-text flex items-center space-x-2">
                  <Download className="w-4 h-4 text-accent" />
                  <span>Export Station Data (JSON)</span>
                </h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Downloads full station snapshot including transactions, underground tank levels, shifts, employees, and audit logs.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="mt-4 self-start"
              >
                Download JSON Backup
              </Button>
            </div>

            {/* Import */}
            <div className="p-5 border border-border rounded-sm bg-card-subtle flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-xs text-text flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-brass" />
                  <span>Import / Restore Data (JSON)</span>
                </h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Restores complete station state from a previously exported JSON backup file.
                </p>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="mt-4 text-xs text-text file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border file:border-border file:text-xs file:font-medium file:bg-card hover:file:bg-card-subtle"
              />
            </div>

            {/* Reset to Demo */}
            <div className="p-5 border border-border rounded-sm bg-card-subtle flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-xs text-text flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4 text-olive" />
                  <span>Reset to Demo Data</span>
                </h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Restores realistic 14+ day operational dataset with 2 dispensers, 4 nozzles, 3 underground tanks, and verified reconciliations.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetDemo}
                className="mt-4 self-start"
              >
                Reset Demo Data
              </Button>
            </div>

            {/* Clear All Data */}
            <div className="p-5 border border-brick/40 rounded-sm bg-brick/5 flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-xs text-brick flex items-center space-x-2">
                  <Trash2 className="w-4 h-4 text-brick" />
                  <span>Clear All Records (Production Fresh Start)</span>
                </h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Wipes all demo data to provide an empty production-ready canvas with zero records.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={handleClearAll}
                className="mt-4 self-start"
              >
                Clear Database
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
