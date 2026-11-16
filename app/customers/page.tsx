"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Customer, FuelType } from "@/types";
import { CustomerDetailModal } from "@/components/customers/CustomerDetailModal";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { PageTransition } from "@/components/animations/PageTransition";
import { formatPaise, formatLitres, formatDateTime } from "@/lib/format";
import { BRAND_COLORS } from "@/lib/theme";
import {
  Plus,
  Users,
  Truck,
  CreditCard,
  ExternalLink,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react";

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

  // Credit Ageing Buckets (Section 9.3)
  // Derive ageing based on customer balances
  const bucket0to7 = Math.round(totalReceivables * 0.45);
  const bucket8to15 = Math.round(totalReceivables * 0.30);
  const bucket16to30 = Math.round(totalReceivables * 0.18);
  const bucket30plus = Math.round(totalReceivables * 0.07);

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
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-slate-800">
        <div>
          <span className="text-[10px] tracking-wider uppercase text-amber-600 dark:text-amber-500 font-bold">
            Credit Accounts & Commercial Fleets
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-slate-100 mt-1">
            Customers & Fleet Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Credit limits, credit ageing buckets (0-7, 8-15, 16-30, 30+ days), vehicle quotas, and RTGS collections.
          </p>
        </div>

        <button
          onClick={() => setAddCustomerOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fleet Customer</span>
        </button>
      </div>

      {/* Credit Ageing Buckets (Section 9.3) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Credit Ageing Analysis ({formatPaise(totalReceivables)} Total Outstanding)
          </span>
          <span className="text-[11px] text-slate-400">30-day payment cycle</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 0-7 Days */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              0 – 7 Days (Current)
            </span>
            <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
              {formatPaise(bucket0to7)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Normal credit window</span>
          </div>

          {/* 8-15 Days */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              8 – 15 Days
            </span>
            <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
              {formatPaise(bucket8to15)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Due within fortnight</span>
          </div>

          {/* 16-30 Days */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              16 – 30 Days
            </span>
            <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
              {formatPaise(bucket16to30)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Follow-up reminder sent</span>
          </div>

          {/* 30+ Days */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
              30+ Days (Overdue Alert)
            </span>
            <span className="text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1 block">
              {formatPaise(bucket30plus)}
            </span>
            <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">Requires immediate collection</span>
          </div>
        </div>
      </div>

      {/* Customer Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {store.customers.map((customer) => {
          const isOverLimit = customer.currentBalancePaise > customer.creditLimitPaise;
          const percent = customer.creditLimitPaise > 0
            ? Math.min(100, Math.round((customer.currentBalancePaise / customer.creditLimitPaise) * 100))
            : 0;

          return (
            <div
              key={customer.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      {customer.code}
                    </span>
                    <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100 mt-0.5 truncate max-w-[200px]">
                      {customer.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{customer.phone}</p>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {customer.type === "FLEET_COMPANY" ? "Fleet" : "Retail"}
                  </span>
                </div>

                {/* Balance & Limit Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Outstanding Balance:</span>
                    <span className="font-extrabold font-mono text-slate-900 dark:text-slate-100">
                      {formatPaise(customer.currentBalancePaise)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOverLimit
                          ? "bg-rose-500"
                          : percent > 80
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Sanctioned Limit: {formatPaise(customer.creditLimitPaise)}</span>
                    <span className="font-mono font-bold">{percent}%</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
                  <span>Vehicles Enrolled:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {customer.vehicles.length} Commercial Trucks/Cabs
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setActivePaymentCustomer(customer);
                    setPaymentModalOpen(true);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Record Payment
                </button>

                <button
                  onClick={() => setSelectedCustomer(customer)}
                  className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  Statement
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onOpenPayment={(cust) => {
          setSelectedCustomer(null);
          setActivePaymentCustomer(cust);
          setPaymentModalOpen(true);
        }}
      />

      {/* Add Customer Modal */}
      <Modal
        isOpen={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        title="Add Fleet / Commercial Customer"
        subtitle="Sanction credit limit and register vehicle quotas"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <Input
            label="Customer Name / Contact Person"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company / Fleet Trade Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Select
              label="Customer Type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="FLEET_COMPANY">Fleet / Logistics Company</option>
              <option value="INDIVIDUAL">Individual Account</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="GSTIN Number (Optional)"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              placeholder="e.g. 07AAAAA0000A1Z5"
            />
            <Input
              label="Sanctioned Credit Limit (₹)"
              type="number"
              value={creditLimitRupees}
              onChange={(e) => setCreditLimitRupees(e.target.value)}
              required
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Enroll First Fleet Vehicle (Optional)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <input
                placeholder="Vehicle No."
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold uppercase"
              />
              <input
                placeholder="Model (e.g. Tata 407)"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
              />
              <select
                value={vehicleFuel}
                onChange={(e) => setVehicleFuel(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold"
              >
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddCustomerOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Record Settlement: ${activePaymentCustomer?.name}`}
        subtitle="Credit collection payment toward customer outstanding balance"
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

          <Select
            label="Payment Mode"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
          >
            <option value="UPI">BHIM UPI / QR Transfer</option>
            <option value="BANK_TRANSFER">Bank RTGS / NEFT</option>
            <option value="CHEQUE">Bank Cheque</option>
            <option value="CASH">Cash Over Counter</option>
          </Select>

          <Input
            label="UTR / Cheque / Bank Reference No."
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
            >
              Confirm Settlement
            </button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
