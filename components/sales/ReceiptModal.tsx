"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Sale, Station } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatPaise, formatLitres, formatDateTime } from "@/lib/format";
import { generatePdfReceipt } from "@/lib/export/exportPdf";
import { Printer, Download, CheckCircle2 } from "lucide-react";

interface ReceiptModalProps {
  sale: Sale | null;
  station: Station;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  station,
  isOpen,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (sale) {
      const qrPayload = JSON.stringify({
        station: station.roCode,
        txn: sale.receiptNumber,
        fuel: sale.fuelType,
        litres: sale.quantityLitres,
        totalPaise: sale.netAmountPaise,
        date: sale.createdAt,
      });

      QRCode.toDataURL(qrPayload, { width: 140, margin: 1 })
        .then(setQrDataUrl)
        .catch(() => {});
    }
  }, [sale, station]);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generatePdfReceipt(sale, station);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fuel Sale Receipt"
      subtitle={`Invoice: ${sale.receiptNumber} • Status: ${sale.status}`}
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Printable Thermal Receipt Box */}
        <div className="printable-receipt border border-border bg-card p-6 rounded-xl shadow-subtle text-xs space-y-4 max-w-[340px] mx-auto font-sans">
          {/* Station Header */}
          <div className="text-center pb-3 border-b border-border-subtle">
            <h2 className="font-heading font-extrabold text-sm tracking-tight text-text uppercase">
              {station.name}
            </h2>
            <p className="text-[10px] text-text-muted mt-1 leading-tight">
              {station.address}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">
              RO Code: {station.roCode} • Tel: {station.phone}
            </p>
            <p className="text-[9px] text-text-faint mt-0.5">
              GSTIN: {station.gstin || "07AAAAA0000A1Z5"}
            </p>
          </div>

          {/* Transaction Metadata */}
          <div className="space-y-1 text-[11px] text-text-muted">
            <div className="flex justify-between">
              <span>Receipt No:</span>
              <strong className="text-text tabular-nums">{sale.receiptNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span className="text-text">{formatDateTime(sale.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Operator / Shift:</span>
              <span className="text-text">{sale.operatorId} / {sale.shiftId}</span>
            </div>
            <div className="flex justify-between">
              <span>Nozzle ID:</span>
              <span className="text-text">{sale.nozzleId}</span>
            </div>
            {sale.vehicleNumber && (
              <div className="flex justify-between font-semibold text-text">
                <span>Vehicle No:</span>
                <span>{sale.vehicleNumber}</span>
              </div>
            )}
            {sale.odometerReading && (
              <div className="flex justify-between">
                <span>Odometer:</span>
                <span className="tabular-nums">{sale.odometerReading} km</span>
              </div>
            )}
          </div>

          {/* Product & Volume Line */}
          <div className="py-2 border-y border-border-subtle space-y-1.5">
            <div className="flex justify-between font-bold text-xs text-text">
              <span>{sale.fuelType}</span>
              <span className="tabular-nums">{formatLitres(sale.quantityLitres)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-text-muted">
              <span>Rate / Litre:</span>
              <span className="tabular-nums">{formatPaise(sale.pricePerLitrePaise)}</span>
            </div>
          </div>

          {/* Total Net Amount */}
          <div className="flex items-baseline justify-between text-base font-bold text-text pt-1">
            <span>TOTAL AMOUNT</span>
            <span className="tabular-nums font-sans">{formatPaise(sale.netAmountPaise)}</span>
          </div>

          {/* Payment Method Split */}
          <div className="pt-2 border-t border-border-subtle text-[11px] text-text-muted space-y-1">
            <span className="block text-[10px] tracking-caps uppercase font-semibold text-text-faint">
              Settlement Mode(s)
            </span>
            {sale.payments.map((p, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{p.method} {p.referenceNo ? `(${p.referenceNo})` : ""}</span>
                <span className="tabular-nums font-medium text-text">{formatPaise(p.amountPaise)}</span>
              </div>
            ))}
          </div>

          {/* QR Code & Statutory Footer */}
          <div className="pt-3 border-t border-border-subtle flex flex-col items-center text-center space-y-2">
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Receipt Verification QR"
                className="w-24 h-24 border border-border p-1 bg-white"
              />
            )}
            <p className="text-[9px] text-text-faint leading-tight max-w-[220px]">
              Motor Spirit & HSD are outside GST levy under Section 9(2) CGST Act.
              Certified weights & measures dispenser.
            </p>
            <p className="text-[10px] font-medium text-text">Thank you! Drive safely.</p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-end space-x-2 pt-2 border-t border-border-subtle no-print">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            PDF Receipt
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Slip
          </Button>
        </div>
      </div>
    </Modal>
  );
};
