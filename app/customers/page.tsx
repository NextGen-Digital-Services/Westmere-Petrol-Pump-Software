"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Customer, FuelType } from "@/types";
import { CustomerDetailModal } from "@/components/customers/CustomerDetailModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatPaise, formatLitres, formatDateTime } from "@/lib/format";
import { Plus, Users, Truck, CreditCard, ExternalLink, AlertTriangle } from "lucide-react";

export default function CustomersPage() {
  const store = usePetroStore();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activePaymentCustomer, setActivePaymentCustomer] = useState<Customer | null>(null);

  // New Customer Form State
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [type, setType] = useState<"INDIVIDUAL" | "FLEET_COMPANY">("FLEET_COMPANY");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [creditLimitRupees, setCreditLimitRupees] = useState("200000");
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleFuel, setVehicleFuel] = useState<FuelType>("Diesel");

  // Payment Form State
  const [paymentAmountRupees, setPaymentAmountRupees] = useState("25000");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CHEQUE" | "BANK_TRANSFER">("UPI");
  const [paymentRef, setPaymentRef] = useState("UPI/REF-" + Math.floor(Math.random() * 900000 + 100000));

  const totalReceivables = store.customers.reduce((acc, c) => acc + c.currentBalancePaise, 0);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const limitPaise = Math.round((parseFloat(creditLimitRupees) || 0) * 100);

    const vehicles = vehicleNo
      ? [
          {
            id: `VEH-${Date.now()}`,
            vehicleNumber: vehicleNo.toUpperCase(),
            model: vehicleModel || "Commercial Vehicle",
            fuelType: vehicleFuel,
            monthlyQuotaLitres: 1000,
            currentMonthLitres: 0,
            isActive: true,
          },
        ]
      : [];

    store.addCustomer({
      code: "CUST-" + Math.floor(Math.random() * 9000 + 1000),
      name,
      companyName: companyName || name,
      type,
      phone,
      email,
      gstin: gstin ? gstin.toUpperCase() : undefined,
      creditLimitPaise: limitPaise,
      currentBalancePaise: 0,
      billingCycleDays: 30,
      vehicles,
      isActive: true,
    });

    setAddCustomerOpen(false);
    setName("");
    setVehicleNo("");
  };

  const handleRecordCustomerPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentCustomer) return;
    const amountPaise = Math.round((parseFloat(paymentAmountRupees) || 0) * 100);

    store.recordCreditPayment({
      customerId: activePaymentCustomer.id,
      amountPaise,
      paymentMethod,
      referenceNumber: paymentRef,
      receivedAt: new Date().toISOString(),
      receivedBy: store.currentUser?.name || "Cashier",
      notes: "Settlement toward outstanding credit balance.",
    });

    setPaymentModalOpen(false);
    setActivePaymentCustomer(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
            Credit Accounts & Commercial Fleets
          </span>
          <h1 className="text-3xl font-serif font-light tracking-editorial text-text mt-1">
            Customers & Fleet Management
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Credit limits, multi-vehicle quotas, automated debt collection alerts, and monthly statements.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setAddCustomerOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Customer
        </Button>
      </div>

      {/* Receivables Banner */}
      <div className="p-4 bg-card border border-border rounded-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold block">
            Total Outstanding Receivables
          </span>
          <span className="text-2xl font-light tabular-nums font-sans text-text block mt-0.5">
            {formatPaise(totalReceivables)}
          </span>
        </div>
        <div className="text-right text-xs text-text-muted">
          <span>{store.customers.length} registered credit accounts</span>
          <span className="block text-olive font-medium mt-0.5">Fleet authorization active</span>
        </div>
      </div>

      {/* Customer Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {store.customers.map((customer) => {
          const isOverLimit = customer.currentBalancePaise > customer.creditLimitPaise;
          const percent = Math.min(100, Math.round((customer.currentBalancePaise / customer.creditLimitPaise) * 100));

          return (
            <div
              key={customer.id}
              className="bg-card border border-border rounded-sm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
                  <div>
                    <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold">
                      {customer.code}
                    </span>
                    <h3 className="text-base font-serif font-medium text-text mt-0.5 truncate max-w-[200px]">
                      {customer.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {customer.phone}
                    </p>
                  </div>
                  <span className="inline-block px-2 py-0.5 text-[10px] tracking-caps uppercase font-semibold border border-border bg-card-subtle text-text-muted rounded-sm">
                    {customer.type === "FLEET_COMPANY" ? "Fleet" : "Retail"}
                  </span>
                </div>

                {/* Balance & Limit Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Outstanding:</span>
                    <span className="tabular-nums font-semibold text-text">
                      {formatPaise(customer.currentBalancePaise)}
                    </span>
                  </div>

                  <div className="w-full bg-border-subtle h-2 rounded-none overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOverLimit ? "bg-brick" : percent > 80 ? "bg-warning" : "bg-olive"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-text-faint">
                    <span>Limit: {formatPaise(customer.creditLimitPaise)}</span>
                    <span className="tabular-nums font-medium">{percent}%</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle text-xs text-text-muted flex justify-between">
                  <span>Vehicles Enrolled:</span>
                  <span className="font-semibold text-text">{customer.vehicles.length} Trucks/Cabs</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActivePaymentCustomer(customer);
                    setPaymentModalOpen(true);
                  }}
                  className="flex-1 text-xs"
                >
                  Collect Cash/UPI
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedCustomer(customer)}
                  className="flex-1 text-xs"
                >
                  Statement
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Detail & Statement Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onOpenPayment={(c) => {
          setActivePaymentCustomer(c);
          setPaymentModalOpen(true);
        }}
      />

      {/* Add Customer Modal */}
      <Modal
        isOpen={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        title="Register Customer / Fleet Company"
        subtitle="Create commercial credit ledger and authorize fleet vehicles"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer / Company Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Continental Cargo Logistics"
              required
            />
            <Select
              label="Account Type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="FLEET_COMPANY">Fleet Transport Company</option>
              <option value="INDIVIDUAL">Individual / Local Corporate</option>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="GSTIN (Optional)"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              placeholder="e.g. 07AABCA3412B1Z8"
            />
          </div>

          <Input
            label="Credit Limit (₹)"
            type="number"
            value={creditLimitRupees}
            onChange={(e) => setCreditLimitRupees(e.target.value)}
            required
            helperText="Maximum allowed outstanding credit before automated sales block"
          />

          {/* First Vehicle Enrollment */}
          <div className="pt-2 border-t border-border-subtle space-y-3">
            <span className="block text-xs font-serif font-medium tracking-editorial uppercase text-text">
              Primary Vehicle Enrollment (Optional)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Vehicle Registration No."
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="e.g. DL 01 AB 9988"
              />
              <Input
                label="Make / Model"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. Tata Prima 4028"
              />
              <Select
                label="Fuel Product"
                value={vehicleFuel}
                onChange={(e) => setVehicleFuel(e.target.value as any)}
              >
                <option value="Diesel">High Speed Diesel</option>
                <option value="Petrol">Petrol</option>
                <option value="Speed Petrol">Speed Petrol</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={() => setAddCustomerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Customer & Fleet
            </Button>
          </div>
        </form>
      </Modal>

      {/* Collect Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Collect Payment: ${activePaymentCustomer?.name}`}
        subtitle={`Outstanding: ${formatPaise(activePaymentCustomer?.currentBalancePaise || 0)}`}
        maxWidth="md"
      >
        <form onSubmit={handleRecordCustomerPayment} className="space-y-4">
          <Input
            label="Payment Amount (₹)"
            type="number"
            value={paymentAmountRupees}
            onChange={(e) => setPaymentAmountRupees(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
            >
              <option value="UPI">UPI / Net Banking</option>
              <option value="CASH">Physical Cash</option>
              <option value="BANK_TRANSFER">RTGS / NEFT</option>
              <option value="CHEQUE">Bank Cheque</option>
            </Select>

            <Input
              label="UTR / Ref Number"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Post Ledger Receipt
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
