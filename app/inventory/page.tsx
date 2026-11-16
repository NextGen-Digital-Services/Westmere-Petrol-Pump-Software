"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Tank, FuelType } from "@/types";
import { TankGauges } from "@/components/inventory/TankGauges";
import { DipEntryModal } from "@/components/inventory/DipEntryModal";
import { StockAdjustmentModal } from "@/components/inventory/StockAdjustmentModal";
import { CalibrationModal } from "@/components/inventory/CalibrationModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatLitres, formatDateTime } from "@/lib/format";
import { Plus, Fuel, Droplets } from "lucide-react";

export default function InventoryPage() {
  const store = usePetroStore();
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);
  const [dipModalOpen, setDipModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [calibModalOpen, setCalibModalOpen] = useState(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
            Underground Storage Tanks (UST)
          </span>
          <h1 className="text-3xl font-serif font-light tracking-editorial text-text mt-1">
            Fuel Inventory & Dip Telemetry
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Book stock, physical dip reconciliation, calibration strapping, and evaporation monitoring.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setAddTankOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Tank
        </Button>
      </div>

      {/* Visual Gauges */}
      {store.tanks.length === 0 ? (
        <EmptyState
          title="No Storage Tanks Configured"
          description="Initialize underground tanks to manage fuel storage, dip levels, and deliveries."
          actionLabel="Add First Tank"
          onAction={() => setAddTankOpen(true)}
          icon={<Droplets className="w-8 h-8" />}
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

      {/* Book vs Physical Verification Ledger */}
      <div className="bg-card border border-border rounded-sm overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-base font-serif font-medium tracking-editorial text-text">
            Stock Reconciliation & Dip Verification
          </h3>
          <span className="text-xs text-text-muted">
            Formula: Book = Opening + Purchases − Sales ± Adjustments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle border-b border-border">
              <tr>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Tank</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Product</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Capacity</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Book Stock</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Last Physical Dip</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {store.tanks.map((t) => {
                const isLow = t.currentStockLitres <= t.reorderLevelLitres;
                return (
                  <tr key={t.id} className="hover:bg-card-subtle/40">
                    <td className="p-3 font-medium text-text">{t.name}</td>
                    <td className="p-3 text-text-muted">{t.fuelType}</td>
                    <td className="p-3 text-right tabular-nums text-text-muted">{formatLitres(t.capacityLitres)}</td>
                    <td className="p-3 text-right tabular-nums font-semibold text-text">{formatLitres(t.currentStockLitres)}</td>
                    <td className="p-3 text-right tabular-nums text-text-muted">
                      {t.lastDipCm ? `${t.lastDipCm.toFixed(1)} cm` : "Pending"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] tracking-caps uppercase font-semibold border rounded-sm ${
                          isLow ? "bg-brick/15 text-brick border-brick/30" : "bg-olive/15 text-olive border-olive/30"
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
      <div className="bg-card border border-border rounded-sm overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-base font-serif font-medium tracking-editorial text-text">
            Authorized Stock Movement & Loss Adjustments
          </h3>
          <span className="text-xs text-text-muted">
            {store.stockAdjustments.length} adjustment records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle border-b border-border">
              <tr>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Date & Time</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Tank ID</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Type</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Adjustment</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Reason</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Authorizer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {store.stockAdjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-card-subtle/40">
                  <td className="p-3 text-text-muted">{formatDateTime(adj.createdAt)}</td>
                  <td className="p-3 font-medium text-text">{adj.tankId}</td>
                  <td className="p-3 text-text-muted">{adj.adjustmentType}</td>
                  <td className={`p-3 text-right tabular-nums font-semibold ${adj.litres >= 0 ? "text-olive" : "text-brick"}`}>
                    {adj.litres >= 0 ? `+${formatLitres(adj.litres)}` : formatLitres(adj.litres)}
                  </td>
                  <td className="p-3 text-text">{adj.reason}</td>
                  <td className="p-3 text-text-muted">{adj.approvedBy}</td>
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
          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={() => setAddTankOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Tank
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
