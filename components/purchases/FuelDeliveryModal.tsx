"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { FuelType } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatPaise, formatLitres } from "@/lib/format";
import { Upload, AlertTriangle } from "lucide-react";

interface FuelDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FuelDeliveryModal: React.FC<FuelDeliveryModalProps> = ({ isOpen, onClose }) => {
  const store = usePetroStore();
  const [supplierId, setSupplierId] = useState(store.suppliers[0]?.id || "");
  const [fuelType, setFuelType] = useState<FuelType>("Diesel");
  const [challanNo, setChallanNo] = useState("CHL-IOCL-" + Math.floor(Math.random() * 90000 + 10000));
  const [invoiceNo, setInvoiceNo] = useState("INV-IOCL-" + Math.floor(Math.random() * 90000 + 10000));
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [density, setDensity] = useState("831.0");
  const [invoiceLitres, setInvoiceLitres] = useState("12000");
  const [receivedLitres, setReceivedLitres] = useState("11980");
  const [shortageReason, setShortageReason] = useState("Normal transport thermal contraction");
  const [ratePerLitre, setRatePerLitre] = useState("81.80");
  const [freightRupees, setFreightRupees] = useState("5000");
  const [targetTankId, setTargetTankId] = useState(store.tanks[1]?.id || store.tanks[0]?.id || "");
  const [invoiceAttachment, setInvoiceAttachment] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

  const invL = parseFloat(invoiceLitres) || 0;
  const recL = parseFloat(receivedLitres) || 0;
  const ratePaise = Math.round((parseFloat(ratePerLitre) || 0) * 100);
  const freightPaise = Math.round((parseFloat(freightRupees) || 0) * 100);
  const shortageL = Math.max(0, invL - recL);
  const totalInvoicePaise = Math.round(recL * ratePaise) + freightPaise;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Attachment size exceeds 2MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setInvoiceAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recL <= 0) {
      setErrorMsg("Received volume must be greater than 0 litres.");
      return;
    }

    const selectedTank = store.tanks.find((t) => t.id === targetTankId);
    if (selectedTank && selectedTank.currentStockLitres + recL > selectedTank.capacityLitres * 1.05) {
      setErrorMsg(`Delivery of ${formatLitres(recL)} exceeds safe filling capacity of ${selectedTank.name}.`);
      return;
    }

    store.createFuelDelivery({
      challanNumber: challanNo,
      invoiceNumber: invoiceNo,
      invoiceDate,
      supplierId,
      fuelType,
      densityReported: parseFloat(density) || undefined,
      invoiceLitres: invL,
      receivedLitres: recL,
      shortageLitres: shortageL,
      shortageReason: shortageL > 0 ? shortageReason : undefined,
      ratePerLitrePaise: ratePaise,
      freightPaise,
      vatPaise: 0,
      totalInvoicePaise,
      tankAllocations: [{ tankId: targetTankId, litres: recL }],
      verifiedBy: store.currentUser?.name || "Shift Manager",
      verifiedAt: new Date().toISOString(),
      notes: "Decanted after quality density check and water dip test.",
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Bulk Fuel Delivery Challan"
      subtitle="Decant road tanker into storage tank and update supplier accounts"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Oil Marketing Company"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
          >
            {store.suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </Select>

          <Select
            label="Fuel Product"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value as any)}
          >
            <option value="Petrol">Petrol (Motor Spirit)</option>
            <option value="Diesel">High Speed Diesel (HSD)</option>
            <option value="Speed Petrol">Speed Petrol</option>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Challan Number"
            value={challanNo}
            onChange={(e) => setChallanNo(e.target.value)}
            required
          />
          <Input
            label="Invoice Number"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            required
          />
          <Input
            label="Invoice Date"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Invoice Volume (L)"
            type="number"
            value={invoiceLitres}
            onChange={(e) => setInvoiceLitres(e.target.value)}
            required
          />
          <Input
            label="Actual Received (L)"
            type="number"
            value={receivedLitres}
            onChange={(e) => setReceivedLitres(e.target.value)}
            required
          />
          <Input
            label="Density @ 15°C (kg/m³)"
            type="number"
            step="0.1"
            value={density}
            onChange={(e) => setDensity(e.target.value)}
            required
          />
        </div>

        {/* Shortage Calculation Box */}
        {shortageL > 0 && (
          <div className="p-3 bg-brick/10 border border-brick/30 text-brick text-xs rounded-sm space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Transit Shortage Detected:</span>
              <span className="tabular-nums font-bold">{formatLitres(shortageL)}</span>
            </div>
            <Input
              label="Mandatory Shortage Explanation"
              value={shortageReason}
              onChange={(e) => setShortageReason(e.target.value)}
              required
              placeholder="e.g. Temperature differential shrinkage recorded on challan"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Depot Purchase Rate / L (₹)"
            type="number"
            step="0.01"
            value={ratePerLitre}
            onChange={(e) => setRatePerLitre(e.target.value)}
            required
          />
          <Input
            label="Freight Charges (₹)"
            type="number"
            value={freightRupees}
            onChange={(e) => setFreightRupees(e.target.value)}
          />
        </div>

        {/* Destination Tank Allocation */}
        <Select
          label="Allocate Received Volume to Tank"
          value={targetTankId}
          onChange={(e) => setTargetTankId(e.target.value)}
        >
          {store.tanks
            .filter((t) => t.fuelType === fuelType)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (Current: {formatLitres(t.currentStockLitres)} / Cap: {formatLitres(t.capacityLitres)})
              </option>
            ))}
        </Select>

        {/* Invoice File Attachment */}
        <div>
          <label className="block text-xs font-medium tracking-wide uppercase text-text-muted mb-1.5">
            Attach Challan / Invoice Scan (Max 2MB)
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="text-xs text-text file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border file:border-border file:text-xs file:font-medium file:bg-card hover:file:bg-card-subtle"
          />
        </div>

        {errorMsg && <p className="text-xs text-brick">{errorMsg}</p>}

        {/* Summary Footer */}
        <div className="p-3 bg-card-subtle border border-border-subtle rounded-sm flex items-center justify-between text-xs">
          <span className="text-text-muted">Total Supplier Payable:</span>
          <span className="text-base font-semibold tabular-nums text-text">{formatPaise(totalInvoicePaise)}</span>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Verify & Update Inventory
          </Button>
        </div>
      </form>
    </Modal>
  );
};
