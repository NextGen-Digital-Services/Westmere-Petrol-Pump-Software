"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Dispenser, Nozzle, FuelType } from "@/types";
import { HardwareIntegrationModal } from "@/components/dispensers/HardwareIntegrationModal";
import { MeterReadingModal } from "@/components/dispensers/MeterReadingModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatLitres, formatDateTime } from "@/lib/format";
import { hasPermission } from "@/lib/auth";
import { Plus, Gauge, Settings, Radio, Edit3 } from "lucide-react";

export default function DispensersPage() {
  const store = usePetroStore();
  const [selectedDispenser, setSelectedDispenser] = useState<Dispenser | null>(null);
  const [selectedNozzle, setSelectedNozzle] = useState<Nozzle | null>(null);
  const [hardwareModalOpen, setHardwareModalOpen] = useState(false);
  const [meterModalOpen, setMeterModalOpen] = useState(false);
  const [addDispenserOpen, setAddDispenserOpen] = useState(false);
  const [addNozzleOpen, setAddNozzleOpen] = useState(false);

  // Authorised correction modal
  const [correctReadingId, setCorrectReadingId] = useState<string | null>(null);
  const [correctNewClosing, setCorrectNewClosing] = useState("");
  const [correctReason, setCorrectReason] = useState("");

  // New Dispenser Form
  const [dspName, setDspName] = useState("");
  const [dspCode, setDspCode] = useState("DSP-0" + (store.dispensers.length + 1));
  const [dspMake, setDspMake] = useState("Gilbarco Veeder-Root");
  const [dspModel, setDspModel] = useState("Encore 500S");

  // New Nozzle Form
  const [nozzleDispenserId, setNozzleDispenserId] = useState(store.dispensers[0]?.id || "");
  const [nozzleCode, setNozzleCode] = useState("N-0" + (store.nozzles.length + 1));
  const [nozzleName, setNozzleName] = useState("");
  const [nozzleFuel, setNozzleFuel] = useState<FuelType>("Petrol");
  const [nozzleTankId, setNozzleTankId] = useState(store.tanks[0]?.id || "");
  const [nozzleTotalizer, setNozzleTotalizer] = useState("10000.00");

  const canCorrectMeter = hasPermission(store.activeRole, "correct_meter_readings");

  const handleCreateDispenser = (e: React.FormEvent) => {
    e.preventDefault();
    store.addDispenser({
      code: dspCode,
      name: dspName,
      make: dspMake,
      model: dspModel,
      serialNumber: "SN-" + Math.floor(Math.random() * 900000 + 100000),
      status: "ONLINE",
      isSimulatedLive: true,
      protocol: "DART",
    });
    setAddDispenserOpen(false);
    setDspName("");
  };

  const handleCreateNozzle = (e: React.FormEvent) => {
    e.preventDefault();
    store.addNozzle({
      dispenserId: nozzleDispenserId,
      code: nozzleCode,
      name: nozzleName || `${nozzleCode} (${nozzleFuel})`,
      fuelType: nozzleFuel,
      tankId: nozzleTankId,
      currentTotalizerLitres: parseFloat(nozzleTotalizer) || 0,
      status: "ACTIVE",
    });
    setAddNozzleOpen(false);
    setNozzleName("");
  };

  const handleCommitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctReadingId || !correctReason.trim()) return;
    store.correctMeterReading(correctReadingId, parseFloat(correctNewClosing) || 0, correctReason);
    setCorrectReadingId(null);
    setCorrectNewClosing("");
    setCorrectReason("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
            Forecourt Equipment & Fuel Islands
          </span>
          <h1 className="text-3xl font-serif font-light tracking-editorial text-text mt-1">
            Nozzles & Dispenser Units
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Electronic totalizers, opening/closing meters, rollover verification, and hardware controller feeds.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddNozzleOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Nozzle
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddDispenserOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Dispenser
          </Button>
        </div>
      </div>

      {/* Forecourt Dispensers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {store.dispensers.map((dispenser) => {
          const dispenserNozzles = store.nozzles.filter((n) => n.dispenserId === dispenser.id);

          return (
            <div
              key={dispenser.id}
              className="bg-card border border-border rounded-sm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
                  <div>
                    <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold">
                      {dispenser.code}
                    </span>
                    <h3 className="text-base font-serif font-medium text-text mt-0.5">
                      {dispenser.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {dispenser.make} • {dispenser.model}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 border border-border rounded-sm text-[10px] tracking-caps uppercase font-semibold text-text-muted bg-card">
                      <span className="w-1.5 h-1.5 rounded-full bg-olive animate-pulse" />
                      <span>{dispenser.status}</span>
                    </span>
                    {dispenser.isSimulatedLive && (
                      <span className="block text-[9px] tracking-caps uppercase text-brass mt-1 font-semibold">
                        Simulated Feed
                      </span>
                    )}
                  </div>
                </div>

                {/* Attached Nozzles List */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold block mb-1">
                    Attached Nozzles & Totalizers
                  </span>
                  {dispenserNozzles.map((nozzle) => (
                    <div
                      key={nozzle.id}
                      className="p-3 bg-card-subtle border border-border-subtle rounded-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-text">{nozzle.code}</span>
                          <span className="text-[11px] text-accent font-medium">
                            {nozzle.fuelType}
                          </span>
                        </div>
                        <span className="text-[11px] text-text-faint">
                          {nozzle.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="text-[10px] tracking-caps uppercase text-text-faint block">
                            Totalizer
                          </span>
                          <span className="text-xs font-semibold tabular-nums text-text">
                            {formatLitres(nozzle.currentTotalizerLitres)}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedNozzle(nozzle);
                            setMeterModalOpen(true);
                          }}
                          className="h-7 text-xs px-2.5"
                        >
                          Log Meter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hardware Integration Button */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-text-faint">
                  Protocol: {dispenser.protocol || "DART"} • IP: {dispenser.ipAddress || "192.168.1.101"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDispenser(dispenser);
                    setHardwareModalOpen(true);
                  }}
                  icon={<Settings className="w-3.5 h-3.5" />}
                  className="text-xs text-text-muted hover:text-text"
                >
                  Integration
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical Meter Reading Log */}
      <div className="bg-card border border-border rounded-sm overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif font-medium tracking-editorial text-text">
              Historical Nozzle Meter Reading Log
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Verified totalizer transitions (Example: Petrol 01: 25,000 → 25,450 = 450 L)
            </p>
          </div>
          <span className="text-xs text-text-muted">{store.meterReadings.length} reading entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle border-b border-border">
              <tr>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Timestamp</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Shift</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Nozzle</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Opening Meter</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Closing Meter</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Testing (L)</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Sale Volume</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Notes / Reason</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {store.meterReadings.map((reading) => {
                const nozzle = store.nozzles.find((n) => n.id === reading.nozzleId);
                return (
                  <tr key={reading.id} className="hover:bg-card-subtle/40">
                    <td className="p-3 text-text-muted">{formatDateTime(reading.createdAt)}</td>
                    <td className="p-3 font-medium text-text">{reading.shiftId}</td>
                    <td className="p-3 font-semibold text-text">{nozzle?.code || reading.nozzleId}</td>
                    <td className="p-3 text-right tabular-nums text-text-muted">{formatLitres(reading.openingLitres)}</td>
                    <td className="p-3 text-right tabular-nums text-text-muted">{formatLitres(reading.closingLitres)}</td>
                    <td className="p-3 text-right tabular-nums text-text-faint">{formatLitres(reading.testingLitres)}</td>
                    <td className="p-3 text-right tabular-nums font-semibold text-olive">{formatLitres(reading.saleLitres)}</td>
                    <td className="p-3 text-text-muted">{reading.reason || "Normal shift reading"}</td>
                    <td className="p-3 text-center">
                      {canCorrectMeter ? (
                        <button
                          onClick={() => {
                            setCorrectReadingId(reading.id);
                            setCorrectNewClosing(reading.closingLitres.toString());
                          }}
                          className="p-1 text-text-muted hover:text-accent rounded-sm transition-colors"
                          title="Authorised Meter Correction"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-text-faint">Locked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hardware Modal */}
      <HardwareIntegrationModal
        dispenser={selectedDispenser}
        isOpen={hardwareModalOpen}
        onClose={() => setHardwareModalOpen(false)}
      />

      {/* Meter Reading Modal */}
      <MeterReadingModal
        nozzle={selectedNozzle}
        isOpen={meterModalOpen}
        onClose={() => setMeterModalOpen(false)}
      />

      {/* Authorised Correction Modal */}
      <Modal
        isOpen={!!correctReadingId}
        onClose={() => setCorrectReadingId(null)}
        title="Authorised Totalizer Correction"
        subtitle="Modifying previous meter reading requires managerial permission and reason"
        maxWidth="md"
      >
        <form onSubmit={handleCommitCorrection} className="space-y-4">
          <Input
            label="Corrected Closing Meter (L)"
            type="number"
            step="0.01"
            value={correctNewClosing}
            onChange={(e) => setCorrectNewClosing(e.target.value)}
            required
          />
          <Input
            label="Mandatory Authorization Reason"
            value={correctReason}
            onChange={(e) => setCorrectReason(e.target.value)}
            required
            placeholder="e.g. Mechanical dial reading transcription error detected on shift sheet"
          />
          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={() => setCorrectReadingId(null)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit">
              Commit Authorised Correction
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Dispenser Modal */}
      <Modal
        isOpen={addDispenserOpen}
        onClose={() => setAddDispenserOpen(false)}
        title="Add Forecourt Dispenser Unit"
        subtitle="Register new multi-product dispenser unit"
        maxWidth="md"
      >
        <form onSubmit={handleCreateDispenser} className="space-y-4">
          <Input
            label="Dispenser Code"
            value={dspCode}
            onChange={(e) => setDspCode(e.target.value)}
            required
          />
          <Input
            label="Dispenser Name / Island"
            value={dspName}
            onChange={(e) => setDspName(e.target.value)}
            placeholder="e.g. Dispenser 03 (Island C South)"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Make"
              value={dspMake}
              onChange={(e) => setDspMake(e.target.value)}
              required
            />
            <Input
              label="Model"
              value={dspModel}
              onChange={(e) => setDspModel(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={() => setAddDispenserOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Dispenser
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Nozzle Modal */}
      <Modal
        isOpen={addNozzleOpen}
        onClose={() => setAddNozzleOpen(false)}
        title="Add Dispenser Nozzle"
        subtitle="Map nozzle to product and underground storage tank"
        maxWidth="md"
      >
        <form onSubmit={handleCreateNozzle} className="space-y-4">
          <Select
            label="Dispenser Unit"
            value={nozzleDispenserId}
            onChange={(e) => setNozzleDispenserId(e.target.value)}
          >
            {store.dispensers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nozzle Code"
              value={nozzleCode}
              onChange={(e) => setNozzleCode(e.target.value)}
              required
            />
            <Select
              label="Fuel Product"
              value={nozzleFuel}
              onChange={(e) => setNozzleFuel(e.target.value as any)}
            >
              <option value="Petrol">Petrol (Motor Spirit)</option>
              <option value="Diesel">High Speed Diesel (HSD)</option>
              <option value="Speed Petrol">Speed Petrol</option>
            </Select>
          </div>
          <Select
            label="Source Storage Tank"
            value={nozzleTankId}
            onChange={(e) => setNozzleTankId(e.target.value)}
          >
            {store.tanks
              .filter((t) => t.fuelType === nozzleFuel)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </Select>
          <Input
            label="Current Totalizer Meter Reading (L)"
            type="number"
            step="0.01"
            value={nozzleTotalizer}
            onChange={(e) => setNozzleTotalizer(e.target.value)}
            required
          />
          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={() => setAddNozzleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Nozzle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
