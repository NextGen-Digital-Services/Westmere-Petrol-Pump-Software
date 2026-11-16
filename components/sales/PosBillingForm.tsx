"use client";

import React, { useState, useEffect } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Nozzle, PaymentMethod, SalePayment, Sale } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatPaise, formatLitres } from "@/lib/format";
import { canApproveCreditSale } from "@/lib/calc";
import { Check, AlertCircle, Plus, Trash2 } from "lucide-react";

interface PosBillingFormProps {
  onSaleCreated: (sale: Sale) => void;
}

export const PosBillingForm: React.FC<PosBillingFormProps> = ({ onSaleCreated }) => {
  const store = usePetroStore();
  const {
    nozzles,
    tanks,
    fuelPrices,
    customers,
    activeRole,
    currentUser,
    shifts,
  } = usePetroStore();

  const runningShift = shifts.find((s) => s.status === "OPEN");

  // Operators are restricted to their assigned nozzles
  const operatorNozzles =
    activeRole === "Pump Operator" && currentUser?.assignedNozzleIds?.length
      ? nozzles.filter((n) => currentUser.assignedNozzleIds?.includes(n.id))
      : nozzles;

  const [selectedNozzleId, setSelectedNozzleId] = useState(operatorNozzles[0]?.id || "");
  const [inputMode, setInputMode] = useState<"QUANTITY" | "AMOUNT">("AMOUNT");
  const [litresInput, setLitresInput] = useState("10.00");
  const [amountInput, setAmountInput] = useState("1000");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [odometerReading, setOdometerReading] = useState("");

  // Split payments state
  const [splitTenders, setSplitTenders] = useState<
    { method: PaymentMethod; amountRupees: string; ref: string }[]
  >([{ method: "UPI", amountRupees: "1000", ref: "" }]);

  const [errorMsg, setErrorMsg] = useState("");
  const [isOverrideCredit, setIsOverrideCredit] = useState(false);

  const selectedNozzle = nozzles.find((n) => n.id === selectedNozzleId);
  const currentPriceObj = fuelPrices.find((p) => p.fuelType === selectedNozzle?.fuelType);
  const pricePaise = currentPriceObj?.salePricePaise || 9672;
  const priceRupees = pricePaise / 100;

  // Auto-conversion between amount and quantity
  useEffect(() => {
    if (inputMode === "AMOUNT") {
      const amt = parseFloat(amountInput) || 0;
      const calculatedL = amt > 0 && priceRupees > 0 ? (amt / priceRupees).toFixed(2) : "0.00";
      setLitresInput(calculatedL);
    }
  }, [amountInput, inputMode, priceRupees]);

  useEffect(() => {
    if (inputMode === "QUANTITY") {
      const litres = parseFloat(litresInput) || 0;
      const calculatedAmt = (litres * priceRupees).toFixed(2);
      setAmountInput(calculatedAmt);
    }
  }, [litresInput, inputMode, priceRupees]);

  // Keep primary tender amount in sync with total
  useEffect(() => {
    if (splitTenders.length === 1) {
      setSplitTenders([{ ...splitTenders[0], amountRupees: amountInput }]);
    }
  }, [amountInput, splitTenders.length]);

  const targetTank = tanks.find((t) => t.id === selectedNozzle?.tankId);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Credit check
  const totalAmountPaise = Math.round((parseFloat(amountInput) || 0) * 100);
  const creditTender = splitTenders.find((t) => t.method === "CREDIT");
  const creditAmountPaise = creditTender
    ? Math.round((parseFloat(creditTender.amountRupees) || 0) * 100)
    : 0;

  let creditCheckResult = { isAllowed: true, availableCreditPaise: 0, excessPaise: 0 };
  if (selectedCustomer && creditAmountPaise > 0) {
    creditCheckResult = canApproveCreditSale(
      selectedCustomer.currentBalancePaise,
      selectedCustomer.creditLimitPaise,
      creditAmountPaise
    );
  }

  const handleAddSplitTender = () => {
    setSplitTenders([
      ...splitTenders,
      { method: "CASH", amountRupees: "0", ref: "" },
    ]);
  };

  const handleRemoveSplitTender = (idx: number) => {
    setSplitTenders(splitTenders.filter((_, i) => i !== idx));
  };

  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!runningShift) {
      setErrorMsg("Cannot bill without an active running shift. Open a shift first.");
      return;
    }
    if (!selectedNozzle) {
      setErrorMsg("Please select an active nozzle.");
      return;
    }

    const litres = parseFloat(litresInput) || 0;
    if (litres <= 0) {
      setErrorMsg("Quantity must be greater than 0 litres.");
      return;
    }

    // Verify tank stock
    if (targetTank && targetTank.currentStockLitres < litres) {
      setErrorMsg(`Insufficient fuel in ${targetTank.name} (Available: ${formatLitres(targetTank.currentStockLitres)}).`);
      return;
    }

    // Verify tenders match total
    const totalTendersRupees = splitTenders.reduce(
      (sum, t) => sum + (parseFloat(t.amountRupees) || 0),
      0
    );
    if (Math.abs(totalTendersRupees - parseFloat(amountInput)) > 0.05) {
      setErrorMsg(`Payment tenders total (₹${totalTendersRupees.toFixed(2)}) must equal invoice total (₹${parseFloat(amountInput).toFixed(2)}).`);
      return;
    }

    // Verify credit limit
    if (creditAmountPaise > 0 && !creditCheckResult.isAllowed && !isOverrideCredit) {
      setErrorMsg(`Credit limit exceeded for ${selectedCustomer?.name} by ${formatPaise(creditCheckResult.excessPaise)}. Requires manager override.`);
      return;
    }

    const payments: SalePayment[] = splitTenders.map((t, idx) => ({
      id: `PAY-${Date.now()}-${idx}`,
      saleId: "",
      method: t.method,
      amountPaise: Math.round((parseFloat(t.amountRupees) || 0) * 100),
      referenceNo: t.ref || undefined,
    }));

    const newSale = store.createSale({
      shiftId: runningShift.id,
      nozzleId: selectedNozzle.id,
      fuelType: selectedNozzle.fuelType,
      tankId: selectedNozzle.tankId,
      operatorId: currentUser?.employeeId || "EMP-004",
      quantityLitres: litres,
      pricePerLitrePaise: pricePaise,
      totalAmountPaise,
      netAmountPaise: totalAmountPaise,
      payments,
      customerId: selectedCustomerId || undefined,
      vehicleNumber: vehicleNumber || undefined,
      odometerReading: parseFloat(odometerReading) || undefined,
    });

    onSaleCreated(newSale);
  };

  return (
    <form onSubmit={handleSubmitSale} className="bg-card border border-border rounded-sm p-6 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h2 className="text-base font-serif font-medium tracking-editorial text-text">
            Fast POS Forecourt Billing Terminal
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time dispensing calculation, split tenders, and vehicle quota checks
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] tracking-caps uppercase text-text-faint block">
            Rate / Litre
          </span>
          <span className="text-xl font-light tabular-nums font-sans text-accent block">
            {formatPaise(pricePaise)}
          </span>
        </div>
      </div>

      {/* Nozzle Selector Pills */}
      <div>
        <label className="block text-xs font-medium tracking-wide uppercase text-text-muted mb-2">
          Select Forecourt Nozzle
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {operatorNozzles.map((nozzle) => {
            const isSelected = nozzle.id === selectedNozzleId;
            return (
              <button
                key={nozzle.id}
                type="button"
                onClick={() => setSelectedNozzleId(nozzle.id)}
                className={`p-3 text-left border rounded-sm transition-colors ${
                  isSelected
                    ? "bg-accent/15 border-accent text-accent font-semibold"
                    : "bg-bg border-border text-text hover:bg-card-subtle"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{nozzle.code}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="block text-[11px] text-text-muted mt-0.5">
                  {nozzle.fuelType}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount vs Quantity Keypads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium tracking-wide uppercase text-text-muted">
              Sale Amount (₹)
            </label>
            <button
              type="button"
              onClick={() => setInputMode("AMOUNT")}
              className={`text-[10px] tracking-caps uppercase font-semibold ${
                inputMode === "AMOUNT" ? "text-accent underline" : "text-text-faint"
              }`}
            >
              Exact Rupees
            </button>
          </div>
          <Input
            type="number"
            step="1"
            value={amountInput}
            onFocus={() => setInputMode("AMOUNT")}
            onChange={(e) => {
              setInputMode("AMOUNT");
              setAmountInput(e.target.value);
              setErrorMsg("");
            }}
            required
            className="text-lg font-light tabular-nums h-12"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium tracking-wide uppercase text-text-muted">
              Dispense Volume (L)
            </label>
            <button
              type="button"
              onClick={() => setInputMode("QUANTITY")}
              className={`text-[10px] tracking-caps uppercase font-semibold ${
                inputMode === "QUANTITY" ? "text-accent underline" : "text-text-faint"
              }`}
            >
              Exact Litres
            </button>
          </div>
          <Input
            type="number"
            step="0.01"
            value={litresInput}
            onFocus={() => setInputMode("QUANTITY")}
            onChange={(e) => {
              setInputMode("QUANTITY");
              setLitresInput(e.target.value);
              setErrorMsg("");
            }}
            required
            className="text-lg font-light tabular-nums h-12"
          />
        </div>
      </div>

      {/* Customer & Fleet Assignment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border-subtle">
        <Select
          label="Customer / Fleet Account (Optional)"
          value={selectedCustomerId}
          onChange={(e) => {
            setSelectedCustomerId(e.target.value);
            const cust = customers.find((c) => c.id === e.target.value);
            if (cust && cust.vehicles.length > 0) {
              setVehicleNumber(cust.vehicles[0].vehicleNumber);
            }
          }}
        >
          <option value="">Walk-in Retail Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type === "FLEET_COMPANY" ? "Fleet" : "Account"})
            </option>
          ))}
        </Select>

        <Input
          label="Vehicle Reg No."
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
          placeholder="e.g. DL 01 AB 4812"
        />

        <Input
          label="Odometer (km)"
          type="number"
          value={odometerReading}
          onChange={(e) => setOdometerReading(e.target.value)}
          placeholder="e.g. 48290"
        />
      </div>

      {/* Credit Limit Alert Banner */}
      {selectedCustomer && creditAmountPaise > 0 && !creditCheckResult.isAllowed && (
        <div className="p-3 bg-brick/15 border border-brick/30 text-brick text-xs rounded-sm space-y-1">
          <div className="flex items-center space-x-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Credit Limit Exceeded for {selectedCustomer.name}</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Current Balance: {formatPaise(selectedCustomer.currentBalancePaise)} / Limit: {formatPaise(selectedCustomer.creditLimitPaise)}. Excess: {formatPaise(creditCheckResult.excessPaise)}.
          </p>
          <label className="flex items-center space-x-2 text-text cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isOverrideCredit}
              onChange={(e) => setIsOverrideCredit(e.target.checked)}
              className="rounded-sm border-border text-accent focus:ring-accent"
            />
            <span className="font-semibold text-xs text-brick">Manager Authorized Override (Audited)</span>
          </label>
        </div>
      )}

      {/* Split Payment Tender Section */}
      <div className="space-y-3 pt-2 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium tracking-wide uppercase text-text-muted">
            Payment Tenders (Split Settlement Supported)
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddSplitTender}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs text-text-muted hover:text-text"
          >
            Add Split Mode
          </Button>
        </div>

        {splitTenders.map((tender, idx) => (
          <div key={idx} className="flex items-center space-x-3">
            <div className="w-1/3">
              <Select
                value={tender.method}
                onChange={(e) => {
                  const updated = [...splitTenders];
                  updated[idx].method = e.target.value as PaymentMethod;
                  setSplitTenders(updated);
                }}
              >
                <option value="UPI">UPI QR / Net Banking</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card POS Swipe</option>
                <option value="CREDIT">Fleet Credit Account</option>
              </Select>
            </div>

            <div className="w-1/3">
              <Input
                type="number"
                step="0.01"
                value={tender.amountRupees}
                onChange={(e) => {
                  const updated = [...splitTenders];
                  updated[idx].amountRupees = e.target.value;
                  setSplitTenders(updated);
                }}
                placeholder="Amount (₹)"
              />
            </div>

            <div className="w-1/3 flex items-center space-x-2">
              <Input
                value={tender.ref}
                onChange={(e) => {
                  const updated = [...splitTenders];
                  updated[idx].ref = e.target.value;
                  setSplitTenders(updated);
                }}
                placeholder="Txn / Slip Ref"
              />
              {splitTenders.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSplitTender(idx)}
                  className="p-2 text-brick hover:opacity-80"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {errorMsg && <p className="text-xs text-brick">{errorMsg}</p>}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full bg-accent text-bg font-bold tracking-wide hover:opacity-90"
      >
        Complete Sale & Print Receipt ({formatLitres(parseFloat(litresInput) || 0)} • {formatPaise(totalAmountPaise)})
      </Button>
    </form>
  );
};
