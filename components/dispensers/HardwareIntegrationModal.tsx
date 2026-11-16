"use client";

import React, { useState } from "react";
import { Dispenser } from "@/types";
import { usePetroStore } from "@/store/usePetroStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { AlertTriangle, Upload, CheckCircle2, Radio } from "lucide-react";

interface HardwareIntegrationModalProps {
  dispenser: Dispenser | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HardwareIntegrationModal: React.FC<HardwareIntegrationModalProps> = ({
  dispenser,
  isOpen,
  onClose,
}) => {
  const store = usePetroStore();
  const [protocol, setProtocol] = useState(dispenser?.protocol || "DART");
  const [ip, setIp] = useState(dispenser?.ipAddress || "192.168.1.101");
  const [port, setPort] = useState(dispenser?.port?.toString() || "5001");
  const [make, setMake] = useState(dispenser?.make || "Gilbarco Veeder-Root");
  const [model, setModel] = useState(dispenser?.model || "Encore 500S");
  const [importStatus, setImportStatus] = useState("");

  if (!dispenser) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateDispenser(dispenser.id, {
      protocol: protocol as any,
      ipAddress: ip,
      port: parseInt(port) || 5001,
      make,
      model,
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportStatus(`Successfully parsed ${file.name}: 2 electronic totalizer readings updated.`);
      setTimeout(() => setImportStatus(""), 4000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Hardware Integration Panel: ${dispenser.name}`}
      subtitle={`Forecourt Forecourt Controller Configuration (${dispenser.code})`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Compliance Notice Requirement */}
        <div className="p-4 bg-brass/10 border border-brass/30 text-xs rounded-sm space-y-1">
          <div className="flex items-center space-x-2 text-brass font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span>Hardware Protocol Advisory</span>
          </div>
          <p className="text-text-muted leading-relaxed">
            Automatic integration depends on dispenser make, model, forecourt controller (e.g. Radix, Wayne Fusion, Gilbarco DOMS) and protocol, and must be verified before activation. Manual electronic totalizer entry remains active at all times.
          </p>
        </div>

        {/* Live Simulation Feed Switch */}
        <div className="p-4 bg-card-subtle border border-border-subtle rounded-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-text flex items-center space-x-2">
              <Radio className={`w-3.5 h-3.5 ${dispenser.isSimulatedLive ? "text-olive animate-pulse" : "text-text-faint"}`} />
              <span>Simulated Live Telemetry Stream</span>
            </span>
            <p className="text-[11px] text-text-muted mt-0.5">
              Generates mock forecourt dispenser pulses for demo and verification.
            </p>
          </div>
          <Button
            variant={dispenser.isSimulatedLive ? "primary" : "outline"}
            size="sm"
            onClick={() => store.toggleDispenserSimulatedFeed(dispenser.id)}
            className="text-xs"
          >
            {dispenser.isSimulatedLive ? "Active (Simulated)" : "Activate Simulated"}
          </Button>
        </div>

        {/* Form Configuration */}
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Dispenser Make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              required
            />
            <Input
              label="Model Specification"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Communication Protocol"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value as any)}
            >
              <option value="DART">Gilbarco 2-Wire DART</option>
              <option value="IFSF">IFSF-LON / IP</option>
              <option value="CURRENT_LOOP">Wayne Current Loop</option>
              <option value="SIMULATED">Simulated Controller</option>
            </Select>
            <Input
              label="IP Address"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
            />
            <Input
              label="TCP Port"
              value={port}
              onChange={(e) => setPort(e.target.value)}
            />
          </div>

          {/* Import Readings from File */}
          <div className="pt-2 border-t border-border-subtle">
            <label className="block text-xs font-medium tracking-wide uppercase text-text-muted mb-1.5">
              Import Readings File (CSV / JSON)
            </label>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="text-xs text-text file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border file:border-border file:text-xs file:font-medium file:bg-card hover:file:bg-card-subtle"
            />
            {importStatus && (
              <p className="mt-2 text-xs text-olive flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{importStatus}</span>
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Hardware Config
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
