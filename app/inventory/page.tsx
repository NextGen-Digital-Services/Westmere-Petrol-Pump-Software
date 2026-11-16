"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Tank, FuelType } from "@/types";
import { TankGauges } from "@/components/inventory/TankGauges";
import { DipEntryModal } from "@/components/inventory/DipEntryModal";
import { StockAdjustmentModal } from "@/components/inventory/StockAdjustmentModal";
import { CalibrationModal } from "@/components/inventory/CalibrationModal";
import { QualityCheckModal } from "@/components/inventory/QualityCheckModal";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { EmptyStateIllustration } from "@/components/illustrations/EmptyStateIllustration";
import { PageTransition } from "@/components/animations/PageTransition";
import { formatLitres, formatDateTime } from "@/lib/format";
import { BRAND_COLORS } from "@/lib/theme";
import {
  Plus,
  Fuel,
  Droplets,
  Ruler,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Layers,
} from "lucide-react";

export default function InventoryPage() {
  const store = usePetroStore();
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);
  const [dipModalOpen, setDipModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [calibModalOpen, setCalibModalOpen] = useState(false);
  const [qualityModalOpen, setQualityModalOpen] = useState(false);
  const [addTankOpen, setAddTankOpen] = useState(false);

  // New Tank Form State
  const [tankName, setTankName] = useState("");
  const [tankCode, setTankCode] = useState("TNK-0" + (store.tanks.length + 1));
  const [tankFuel, setTankFuel] = useState<FuelType>("Petrol");
  const [tankCap, setTankCap] = useState("20000");
  const [tankReorder, setTankReorder] = useState("4000");

  const handleCreateTank = (e: React.FormEvent) => {
    e.preventDefault();
    store.addTank({
      code: tankCode,
      name: tankName,
      fuelType: tankFuel,
      capacityLitres: parseFloat(tankCap) || 20000,
      reorderLevelLitres: parseFloat(tankReorder) || 4000,
      deadStockLitres: 500,
      diameterMm: 2400,
      lengthMm: 4500,
    });
    setAddTankOpen(false);
    setTankName("");
  };

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-slate-800">
        <div>
          <span className="text-[10px] tracking-wider uppercase text-amber-600 dark:text-amber-500 font-bold">
            Underground Storage Tanks (UST)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-slate-100 mt-1">
            Fuel Inventory & Dip Telemetry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Book stock, physical dip reconciliation, linear calibration strapping, and daily quality density checks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQualityModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 shadow-xs transition-all"
          >
            <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
            <span>Daily Quality Log</span>
          </button>

          <button
            onClick={() => setAddTankOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tank</span>
          </button>
        </div>
      </div>

      {/* Visual Gauges */}
      {store.tanks.length === 0 ? (
        <EmptyStateIllustration
          title="No Storage Tanks Configured"
          subtitle="Initialize underground tanks to manage fuel storage, dip levels, and deliveries."
        />
      ) : (
        <TankGauges
          tanks={store.tanks}
          onOpenDipModal={(tank) => {
            setSelectedTank(tank);
            setDipModalOpen(true);
          }}
          onOpenAdjustModal={(tank) => {
            setSelectedTank(tank);
            setAdjustModalOpen(true);
          }}
          onOpenCalibrationModal={(tank) => {
            setSelectedTank(tank);
            setCalibModalOpen(true);
          }}
        />
      )}

      {/* Daily Quality Checks Register (IOCL Mandatory) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mt-6">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
              Daily Fuel Quality, Density & Water Checks
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            ASTM 53B Standard: Density at 15°C (±3.0 kg/m³ variation limit)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Date & Time</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Product</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Density @ 15°C</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Temp (°C)</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Water Paste</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Filter Paper</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Appearance</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Verified By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {store.qualityChecks.map((qc) => (
                <tr key={qc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{formatDateTime(qc.date)}</td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{qc.fuelType}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {qc.densityReported.toFixed(1)} kg/m³
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                    {qc.temperatureC.toFixed(1)} °C
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        qc.waterPasteResult === "PASS"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                      }`}
                    >
                      {qc.waterPasteResult === "PASS" ? "PASS (0mm)" : "FAIL"}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        qc.filterPaperResult === "PASS"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                      }`}
                    >
                      {qc.filterPaperResult === "PASS" ? "PASS (Clean)" : "FAIL"}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {qc.appearance}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">{qc.verifiedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book vs Physical Verification Ledger */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mt-6">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
              Stock Reconciliation & Dip Verification
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Book Stock = Opening + Purchases − Sales ± Authorized Adjustments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Tank</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Product</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Capacity</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Book Stock</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Last Physical Dip</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {store.tanks.map((t) => {
                const isLow = t.currentStockLitres <= t.reorderLevelLitres;
                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{t.name}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{t.fuelType}</td>
                    <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400">{formatLitres(t.capacityLitres)}</td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-slate-900 dark:text-slate-100">{formatLitres(t.currentStockLitres)}</td>
                    <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                      {t.lastDipCm ? `${t.lastDipCm.toFixed(1)} cm` : "Pending"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          isLow
                            ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
                        }`}
                      >
                        {isLow ? "Low Buffer" : "Normal"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustments History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mt-6">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
              Authorized Stock Movement & Loss Adjustments
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {store.stockAdjustments.length} adjustment records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Date & Time</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Tank ID</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Type</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Adjustment</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Reason</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Authorizer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {store.stockAdjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{formatDateTime(adj.createdAt)}</td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{adj.tankId}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{adj.adjustmentType}</td>
                  <td className={`p-3.5 text-right font-mono font-bold ${adj.litres >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {adj.litres >= 0 ? `+${formatLitres(adj.litres)}` : formatLitres(adj.litres)}
                  </td>
                  <td className="p-3.5 text-slate-800 dark:text-slate-200">{adj.reason}</td>
                  <td className="p-3.5 text-slate-500">{adj.approvedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <DipEntryModal
        tank={selectedTank}
        isOpen={dipModalOpen}
        onClose={() => setDipModalOpen(false)}
      />

      <StockAdjustmentModal
        tank={selectedTank}
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
      />

      <CalibrationModal
        tank={selectedTank}
        isOpen={calibModalOpen}
        onClose={() => setCalibModalOpen(false)}
      />

      <QualityCheckModal
        isOpen={qualityModalOpen}
        onClose={() => setQualityModalOpen(false)}
      />

      {/* Add Tank Modal */}
      <Modal
        isOpen={addTankOpen}
        onClose={() => setAddTankOpen(false)}
        title="Add Underground Storage Tank"
        subtitle="Register new calibrated fuel storage tank"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTank} className="space-y-4">
          <Input
            label="Tank Code"
            value={tankCode}
            onChange={(e) => setTankCode(e.target.value)}
            required
          />
          <Input
            label="Tank Name / Label"
            value={tankName}
            onChange={(e) => setTankName(e.target.value)}
            placeholder="e.g. Tank 4 (High Speed Diesel Reserve)"
            required
          />
          <Select
            label="Fuel Product"
            value={tankFuel}
            onChange={(e) => setTankFuel(e.target.value as any)}
          >
            <option value="Petrol">Petrol (Motor Spirit)</option>
            <option value="Diesel">High Speed Diesel (HSD)</option>
            <option value="Speed Petrol">Speed Petrol</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Gross Capacity (Litres)"
              type="number"
              value={tankCap}
              onChange={(e) => setTankCap(e.target.value)}
              required
            />
            <Input
              label="Reorder Level (Litres)"
              type="number"
              value={tankReorder}
              onChange={(e) => setTankReorder(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddTankOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
            >
              Register Tank
            </button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
