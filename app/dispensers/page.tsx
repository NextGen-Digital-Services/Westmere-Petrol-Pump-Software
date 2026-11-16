"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Dispenser, Nozzle, FuelType } from "@/types";
import { HardwareIntegrationModal } from "@/components/dispensers/HardwareIntegrationModal";
import { MeterReadingModal } from "@/components/dispensers/MeterReadingModal";
import { PumpTestModal } from "@/components/dispensers/PumpTestModal";
import { DispenserIllustration } from "@/components/illustrations/DispenserIllustration";
import { NozzleIllustration } from "@/components/illustrations/NozzleIllustration";
import { OdometerMeter } from "@/components/animations/OdometerMeter";
import { LivePulseBadge } from "@/components/animations/LivePulseBadge";
import { PageTransition } from "@/components/animations/PageTransition";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { formatLitres, formatDateTime } from "@/lib/format";
import { hasPermission } from "@/lib/auth";
import { getFuelColor } from "@/lib/theme";
import {
  Plus,
  Gauge,
  Settings,
  Radio,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  Layers,
} from "lucide-react";

export default function DispensersPage() {
  const store = usePetroStore();
  const [selectedDispenser, setSelectedDispenser] = useState<Dispenser | null>(null);
  const [selectedNozzle, setSelectedNozzle] = useState<Nozzle | null>(null);
  const [hardwareModalOpen, setHardwareModalOpen] = useState(false);
  const [meterModalOpen, setMeterModalOpen] = useState(false);
  const [pumpTestModalOpen, setPumpTestModalOpen] = useState(false);
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
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-slate-800">
        <div>
          <span className="text-[10px] tracking-wider uppercase text-amber-600 dark:text-amber-500 font-bold">
            Forecourt Equipment & Fuel Islands
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-slate-100 mt-1">
            Nozzles & Dispenser Units
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Electronic totalizers, rolling odometer meters, 5L measure testing, and Legal Metrology stamping records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPumpTestModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>5L Pump Test</span>
          </button>

          <button
            onClick={() => setAddNozzleOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Nozzle</span>
          </button>

          <button
            onClick={() => setAddDispenserOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Dispenser</span>
          </button>
        </div>
      </div>

      {/* Legal Metrology Stamping Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-100 font-heading">
              Legal Metrology Forecourt Stamping: Active & Verified
            </h4>
            <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
              Govt. Verification Certificate: <strong>DL-WM-STMP-2026-4421</strong> • Next Stamping Due: <strong>14 Jan 2027</strong> (332 days remaining)
            </p>
          </div>
        </div>

        <button
          onClick={() => setPumpTestModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs shrink-0 inline-flex items-center gap-1.5"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Record 5L Pour Test</span>
        </button>
      </div>

      {/* Forecourt Dispensers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {store.dispensers.map((dispenser) => {
          const dispenserNozzles = store.nozzles.filter((n) => n.dispenserId === dispenser.id);

          return (
            <div
              key={dispenser.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <DispenserIllustration size={54} />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        {dispenser.code}
                      </span>
                      <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
                        {dispenser.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {dispenser.make} • {dispenser.model}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <LivePulseBadge
                      label={dispenser.status}
                      variant={dispenser.status === "ONLINE" ? "green" : "danger"}
                      size="sm"
                    />
                    {dispenser.isSimulatedLive && (
                      <span className="block text-[9px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold">
                        Live Controller
                      </span>
                    )}
                  </div>
                </div>

                {/* Attached Nozzles List */}
                <div className="mt-4 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Active Forecourt Nozzles & Odometer Readings
                  </span>

                  {dispenserNozzles.map((nozzle) => {
                    const fuelColor = getFuelColor(nozzle.fuelType);

                    return (
                      <div
                        key={nozzle.id}
                        className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <NozzleIllustration fuelType={nozzle.fuelType} size={36} />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 font-mono">
                                {nozzle.code}
                              </span>
                              <span
                                className="text-[11px] font-bold"
                                style={{ color: fuelColor }}
                              >
                                {nozzle.fuelType}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 truncate block">
                              {nozzle.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700">
                          {/* Rolling Odometer Display */}
                          <OdometerMeter
                            value={nozzle.currentTotalizerLitres}
                            decimals={2}
                          />

                          <button
                            onClick={() => {
                              setSelectedNozzle(nozzle);
                              setMeterModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:border-amber-500 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs transition-colors shrink-0"
                          >
                            Log Meter
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hardware Integration Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Protocol: {dispenser.protocol || "DART"} • Port: 4001 • Loopback Online
                </span>
                <button
                  onClick={() => {
                    setSelectedDispenser(dispenser);
                    setHardwareModalOpen(true);
                  }}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-600 inline-flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Hardware Config</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5-Litre Measure Pump Testing Register */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mt-6">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
              Daily 5-Litre Measure Pump Testing Log
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Legal Metrology verification pours & underground tank test-returns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Date & Time</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Nozzle</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Standard Measure</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Dispensed Volume</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Tolerance Variance</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Test Return</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Result</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Tested By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {store.pumpTests.map((pt) => (
                <tr key={pt.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{formatDateTime(pt.createdAt)}</td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{pt.nozzleId}</td>
                  <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400">5.000 L</td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {pt.dispensedLitres.toFixed(3)} L
                  </td>
                  <td className={`p-3.5 text-right font-mono font-semibold ${pt.passed ? "text-emerald-600" : "text-rose-600"}`}>
                    {pt.accuracyTolerancePercent > 0 ? `+${pt.accuracyTolerancePercent}` : pt.accuracyTolerancePercent}%
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      ✓ Returned to Tank
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pt.passed
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                      }`}
                    >
                      {pt.passed ? "PASS" : "FAIL"}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">{pt.testedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Meter Readings History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mt-6">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
              Shift Totalizer Logs & Dispenser Audit
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {store.meterReadings.length} totalizer readings logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Date & Time</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Nozzle</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Opening Totalizer</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Closing Totalizer</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Volume Sold</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Recorded By</th>
                {canCorrectMeter && (
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {store.meterReadings.map((reading) => {
                const vol = reading.volumeLitres;
                return (
                  <tr key={reading.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{formatDateTime(reading.createdAt)}</td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{reading.nozzleId}</td>
                    <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                      {formatLitres(reading.openingLitres)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatLitres(reading.closingLitres)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-amber-600 dark:text-amber-400">
                      {formatLitres(vol)}
                    </td>
                    <td className="p-3.5 text-slate-500">{reading.approvedBy || reading.shiftId}</td>
                    {canCorrectMeter && (
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setCorrectReadingId(reading.id);
                            setCorrectNewClosing(reading.closingLitres.toString());
                          }}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Correct</span>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <MeterReadingModal
        nozzle={selectedNozzle}
        isOpen={meterModalOpen}
        onClose={() => setMeterModalOpen(false)}
      />

      <PumpTestModal
        isOpen={pumpTestModalOpen}
        onClose={() => setPumpTestModalOpen(false)}
        defaultNozzle={selectedNozzle}
      />

      <HardwareIntegrationModal
        dispenser={selectedDispenser}
        isOpen={hardwareModalOpen}
        onClose={() => setHardwareModalOpen(false)}
      />

      {/* Authorised Reading Correction Modal */}
      <Modal
        isOpen={Boolean(correctReadingId)}
        onClose={() => setCorrectReadingId(null)}
        title="Authorised Meter Correction"
        subtitle="Correct mechanical pulser reading typo (Strict Audit Log Enforced)"
        maxWidth="md"
      >
        <form onSubmit={handleCommitCorrection} className="space-y-4">
          <Input
            label="Corrected Closing Totalizer (Litres)"
            type="number"
            step="0.01"
            value={correctNewClosing}
            onChange={(e) => setCorrectNewClosing(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Mandatory Audit Reason
            </label>
            <textarea
              required
              rows={3}
              value={correctReason}
              onChange={(e) => setCorrectReason(e.target.value)}
              placeholder="e.g. Inadvertent typo by operator on dispenser closing sheet"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCorrectReadingId(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
            >
              Commit Correction
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Dispenser Modal */}
      <Modal
        isOpen={addDispenserOpen}
        onClose={() => setAddDispenserOpen(false)}
        title="Add Dispenser Unit"
        subtitle="Register new MPD (Multi-Product Dispenser) island"
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
            placeholder="e.g. Island 3 (MPD 4-Nozzle)"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Make / Manufacturer"
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
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddDispenserOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
            >
              Register Dispenser
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Nozzle Modal */}
      <Modal
        isOpen={addNozzleOpen}
        onClose={() => setAddNozzleOpen(false)}
        title="Add Nozzle to Dispenser"
        subtitle="Attach forecourt nozzle to underground tank"
        maxWidth="md"
      >
        <form onSubmit={handleCreateNozzle} className="space-y-4">
          <Select
            label="Dispenser"
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
              <option value="Petrol">Petrol (MS)</option>
              <option value="Diesel">High Speed Diesel (HSD)</option>
              <option value="Speed Petrol">Speed Petrol (XP95)</option>
            </Select>
          </div>
          <Select
            label="Connected Tank"
            value={nozzleTankId}
            onChange={(e) => setNozzleTankId(e.target.value)}
          >
            {store.tanks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.fuelType})
              </option>
            ))}
          </Select>
          <Input
            label="Opening Totalizer (Litres)"
            type="number"
            step="0.01"
            value={nozzleTotalizer}
            onChange={(e) => setNozzleTotalizer(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddNozzleOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
            >
              Save Nozzle
            </button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
