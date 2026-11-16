"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Supplier, FuelType } from "@/types";
import { SupplierPaymentModal } from "@/components/purchases/SupplierPaymentModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatPaise, formatDateTime } from "@/lib/format";
import { hasPermission } from "@/lib/auth";
import { Plus, Building2, CreditCard, ExternalLink } from "lucide-react";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export default function SuppliersPage() {
  const store = usePetroStore();
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);

  // New Supplier Form
  const [name, setName] = useState("");
  const [code, setCode] = useState("SUP-" + (store.suppliers.length + 1));
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [gstinError, setGstinError] = useState("");

  const isOwner = hasPermission(store.activeRole, "view_owner_financials");

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (gstin && !GSTIN_REGEX.test(gstin.toUpperCase())) {
      setGstinError("Invalid Indian GSTIN format (e.g. 07AAACI1681G1ZM).");
      return;
    }

    store.addSupplier({
      code,
      name,
      contactPerson,
      phone,
      email,
      gstin: gstin.toUpperCase(),
      address,
      fuelSupplied: ["Petrol", "Diesel"],
      outstandingBalancePaise: 0,
      isActive: true,
    });

    setAddSupplierOpen(false);
    setName("");
    setGstin("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
            Oil Marketing Companies (OMCs) & Vendor Directory
          </span>
          <h1 className="text-3xl font-serif font-light tracking-editorial text-text mt-1">
            Suppliers & Accounts Payable
          </h1>
          <p className="text-xs text-text-muted mt-1">
            OMC supply depots, verified GSTIN credentials, credit ledgers, and banking settlements.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setAddSupplierOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Supplier
        </Button>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {store.suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-card border border-border rounded-sm p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
                <div>
                  <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold">
                    {supplier.code}
                  </span>
                  <h3 className="text-base font-serif font-medium text-text mt-0.5">
                    {supplier.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Contact: {supplier.contactPerson} • {supplier.phone}
                  </p>
                </div>
                <span className="inline-block px-2 py-0.5 text-[10px] tracking-caps uppercase font-semibold border border-olive/30 bg-olive/10 text-olive rounded-sm">
                  Active OMC
                </span>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-text-muted">
                <div className="flex justify-between">
                  <span>GSTIN Number:</span>
                  <span className="font-mono text-text font-medium">{supplier.gstin}</span>
                </div>
                <div className="flex justify-between">
                  <span>Depot Address:</span>
                  <span className="text-text text-right truncate max-w-[220px]">{supplier.address}</span>
                </div>
                <div className="flex justify-between">
                  <span>Products Supplied:</span>
                  <span className="text-accent font-medium">{supplier.fuelSupplied.join(", ")}</span>
                </div>
              </div>

              {/* Outstanding Payable (Owner/Accountant) */}
              <div className="mt-4 p-3 bg-card-subtle border border-border-subtle rounded-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] tracking-caps uppercase text-text-faint block">
                    Outstanding Depot Balance
                  </span>
                  <span className="text-lg font-light tabular-nums font-sans text-brick block mt-0.5">
                    {isOwner ? formatPaise(supplier.outstandingBalancePaise) : "Confidential"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSupplierForPayment(supplier)}
                  icon={<CreditCard className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Pay OMC
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Remittance History Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-base font-serif font-medium tracking-editorial text-text">
            Supplier Remittance & Banking Ledger
          </h3>
          <span className="text-xs text-text-muted">
            {store.supplierPayments.length} recorded payments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle border-b border-border">
              <tr>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Payment Date</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Supplier</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Mode</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Reference / UTR</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Amount Paid</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {store.supplierPayments.map((pay) => {
                const s = store.suppliers.find((sup) => sup.id === pay.supplierId);
                return (
                  <tr key={pay.id} className="hover:bg-card-subtle/40">
                    <td className="p-3 text-text-muted">{pay.paymentDate}</td>
                    <td className="p-3 font-medium text-text">{s?.name || pay.supplierId}</td>
                    <td className="p-3 text-text-muted font-semibold">{pay.paymentMethod}</td>
                    <td className="p-3 font-mono text-[11px] text-text">{pay.referenceNumber}</td>
                    <td className="p-3 text-right tabular-nums font-semibold text-text">{formatPaise(pay.amountPaise)}</td>
                    <td className="p-3 text-text-muted">{pay.notes || "Invoice settlement"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={addSupplierOpen}
        onClose={() => setAddSupplierOpen(false)}
        title="Register Oil Marketing Supplier"
        subtitle="Add fuel depot or supply partner to station master"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-4">
          <Input
            label="Supplier Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hindustan Petroleum Corp Ltd (HPCL)"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Person"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="GSTIN Number"
              value={gstin}
              onChange={(e) => {
                setGstin(e.target.value);
                setGstinError("");
              }}
              placeholder="e.g. 07AAACI1681G1ZM"
              required
              error={gstinError}
            />
          </div>

          <Input
            label="Depot Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={() => setAddSupplierOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Supplier
            </Button>
          </div>
        </form>
      </Modal>

      {/* Supplier Payment Modal */}
      <SupplierPaymentModal
        supplier={selectedSupplierForPayment}
        isOpen={!!selectedSupplierForPayment}
        onClose={() => setSelectedSupplierForPayment(null)}
      />
    </div>
  );
}
