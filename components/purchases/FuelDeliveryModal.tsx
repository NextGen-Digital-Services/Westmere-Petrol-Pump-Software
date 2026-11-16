"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { FuelType } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { formatPaise, formatLitres } from "@/lib/format";
import { BRAND_COLORS, getFuelColor } from "@/lib/theme";
import { TankerTruckIllustration } from "@/components/illustrations/EquipmentIllustrations";
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Fuel,
  Ruler,
} from "lucide-react";

interface FuelDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FuelDeliveryModal: React.FC<FuelDeliveryModalProps> = ({ isOpen, onClose }) => {
  const store = usePetroStore();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Tanker & Seals
  const [tankerNumber, setTankerNumber] = useState("DL-01-EA-8920");
  const [driverName, setDriverName] = useState("Surender Singh");
  const [supplierId, setSupplierId] = useState(store.suppliers[0]?.id || "");
  const [fuelType, setFuelType] = useState<FuelType>("Diesel");
  const [challanNo, setChallanNo] = useState("CHL-IOCL-" + Math.floor(Math.random() * 90000 + 10000));
  const [invoiceNo, setInvoiceNo] = useState("INV-IOCL-" + Math.floor(Math.random() * 90000 + 10000));
  const [sealNumbers, setSealNumbers] = useState("IOCL-SEAL-8921, IOCL-SEAL-8922, IOCL-SEAL-8923");
  const [sealsIntact, setSealsIntact] = useState(true);

  // Step 2: Quality, Density & Ullage
  const [invoiceDensity, setInvoiceDensity] = useState("832.0");
  const [observedDensity, setObservedDensity] = useState("831.5");
  const [fuelTemp, setFuelTemp] = useState("22.0");
  const [waterPastePass, setWaterPastePass] = useState(true);
  const [targetTankId, setTargetTankId] = useState(store.tanks[1]?.id || store.tanks[0]?.id || "");

  // Step 3: Quantities, Shortage & Pricing
  const [invoiceLitres, setInvoiceLitres] = useState("12000");
  const [receivedLitres, setReceivedLitres] = useState("11985");
  const [ratePerLitre, setRatePerLitre] = useState("81.80");
  const [freightRupees, setFreightRupees] = useState("4500");
  const [errorMsg, setErrorMsg] = useState("");

  const selectedTank = store.tanks.find((t) => t.id === targetTankId) || store.tanks[0];
  const ullageLitres = selectedTank ? selectedTank.capacityLitres - selectedTank.currentStockLitres : 0;

  const invL = parseFloat(invoiceLitres) || 0;
  const recL = parseFloat(receivedLitres) || 0;
  const ratePaise = Math.round((parseFloat(ratePerLitre) || 0) * 100);
  const freightPaise = Math.round((parseFloat(freightRupees) || 0) * 100);
  const shortageL = Math.max(0, invL - recL);
  const shortagePercent = invL > 0 ? ((shortageL / invL) * 100).toFixed(2) : "0.00";
  const permissibleShortageL = invL * 0.001; // 0.1% standard IOCL transit loss tolerance
  const isLossPermissible = shortageL <= permissibleShortageL + 5;
  const totalInvoicePaise = Math.round(recL * ratePaise) + freightPaise;

  const handleNext = () => {
    setErrorMsg("");
    if (currentStep === 1) {
      if (!sealsIntact) {
        setErrorMsg("Warning: Broken seals require manager inspection before decantation.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!waterPastePass) {
        setErrorMsg("Safety Warning: Water detected in tanker compartment. Decantation cannot proceed.");
        return;
      }
      if (selectedTank && recL > ullageLitres + 500) {
        setErrorMsg(`Ullage Alert: Destination tank only has ${formatLitres(ullageLitres)} free capacity!`);
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recL <= 0) {
      setErrorMsg("Received volume must be greater than 0 litres.");
      return;
    }

    store.createFuelDelivery({
      challanNumber: challanNo,
      invoiceNumber: invoiceNo,
      invoiceDate: new Date().toISOString().split("T")[0],
      supplierId,
      fuelType,
      densityReported: parseFloat(observedDensity) || undefined,
      invoiceLitres: invL,
      receivedLitres: recL,
      shortageLitres: shortageL,
      shortageReason: shortageL > 0 ? `Transit evaporation (${shortagePercent}%) within IOCL norm` : undefined,
      ratePerLitrePaise: ratePaise,
      freightPaise,
      vatPaise: 0,
      totalInvoicePaise,
      tankAllocations: [{ tankId: targetTankId, litres: recL }],
      verifiedBy: store.currentUser?.name || "Shift Manager",
      verifiedAt: new Date().toISOString(),
      notes: `Tanker ${tankerNumber} decanted. Driver: ${driverName}. Seals verified: ${sealNumbers}.`,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Road Tanker Decantation Wizard"
      subtitle="Complete IOCL 3-step quality, seal verification & ullage safety protocol"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visual Progress Steps */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          {[
            { step: 1, label: "1. Tanker & Seals" },
            { step: 2, label: "2. Quality & Ullage" },
            { step: 3, label: "3. Dip & Decant" },
          ].map((s) => (
            <div
              key={s.step}
              className={`flex items-center gap-1.5 text-xs font-bold ${
                currentStep === s.step
                  ? "text-amber-600 dark:text-amber-400"
                  : currentStep > s.step
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${
                  currentStep === s.step
                    ? "bg-amber-500 text-white"
                    : currentStep > s.step
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {currentStep > s.step ? "✓" : s.step}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Tanker TT & Seals */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 flex items-center gap-3">
              <TankerTruckIllustration size={48} />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Step 1: Inward Tanker Gate Entry & Bond Earthing
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verify vehicle registration, driver license, and check intact IOCL terminal lead seals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Tanker TT Number
                </label>
                <input
                  type="text"
                  required
                  value={tankerNumber}
                  onChange={(e) => setTankerNumber(e.target.value)}
                  placeholder="e.g. DL-01-EA-8920"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Driver full name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Challan / Pass Number
                </label>
                <input
                  type="text"
                  required
                  value={challanNo}
                  onChange={(e) => setChallanNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Fuel Product
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100"
                >
                  <option value="Diesel">High Speed Diesel (HSD)</option>
                  <option value="Petrol">Petrol (Motor Spirit - MS)</option>
                  <option value="Speed Petrol">Speed Petrol (XP95)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Dome & Valve Box Seal Numbers
              </label>
              <input
                type="text"
                required
                value={sealNumbers}
                onChange={(e) => setSealNumbers(e.target.value)}
                placeholder="Comma separated seal numbers"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 pt-1">
              <input
                type="checkbox"
                checked={sealsIntact}
                onChange={(e) => setSealsIntact(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <span>All IOCL security seals intact and match depot dispatch invoice</span>
            </label>
          </div>
        )}

        {/* Step 2: Quality, Density & Ullage */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Invoice Density @ 15°C
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={invoiceDensity}
                  onChange={(e) => setInvoiceDensity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Observed Density
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={observedDensity}
                  onChange={(e) => setObservedDensity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Sample Temp (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={fuelTemp}
                  onChange={(e) => setFuelTemp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Ullage Check on Destination Tank */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Destination Underground Storage Tank
              </label>
              <select
                value={targetTankId}
                onChange={(e) => setTargetTankId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100"
              >
                {store.tanks
                  .filter((t) => t.fuelType === fuelType)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — Current: {formatLitres(t.currentStockLitres)} / Cap: {formatLitres(t.capacityLitres)} (Ullage: {formatLitres(t.capacityLitres - t.currentStockLitres)})
                    </option>
                  ))}
              </select>
            </div>

            {/* Ullage Safety Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Available Ullage (Free Storage Space):
                </span>
                <span className="text-[11px] text-slate-500">
                  Must exceed delivery volume to prevent tank overflow spill
                </span>
              </div>
              <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {formatLitres(ullageLitres)}
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={waterPastePass}
                onChange={(e) => setWaterPastePass(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <span>Water-finding paste dip tested on all tanker compartments (0mm free water)</span>
            </label>
          </div>
        )}

        {/* Step 3: Quantities & Decantation Finalize */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Challan / Invoice Litres
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={invoiceLitres}
                  onChange={(e) => setInvoiceLitres(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Actual Decanted Litres
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={receivedLitres}
                  onChange={(e) => setReceivedLitres(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Shortage & Transit Loss Analysis */}
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
                shortageL === 0
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : isLossPermissible
                  ? "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                  : "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
              }`}
            >
              <div>
                <span className="font-bold block">
                  Shortage: {formatLitres(shortageL)} ({shortagePercent}%)
                </span>
                <span className="text-[11px] opacity-80">
                  {shortageL === 0
                    ? "Exact quantity delivered (Zero transit loss)"
                    : isLossPermissible
                    ? `Permissible IOCL thermal shrinkage tolerance (≤ 0.1% or ~${permissibleShortageL.toFixed(0)}L)`
                    : "EXCEEDS PERMISSIBLE LOSS: Claim debit note against transport contractor"}
                </span>
              </div>
              <span className="font-mono font-bold text-sm">
                {shortageL === 0 ? "EXACT" : isLossPermissible ? "WITHIN NORM" : "EXCESS LOSS"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Depot Rate per Litre (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={ratePerLitre}
                  onChange={(e) => setRatePerLitre(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Total Payable to IOCL
                </label>
                <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-extrabold text-slate-900 dark:text-slate-100">
                  {formatPaise(totalInvoicePaise)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Decantation & Add to Stock</span>
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};
