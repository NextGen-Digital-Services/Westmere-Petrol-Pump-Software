"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePetroStore } from "@/store/usePetroStore";
import { formatPaise, formatLitres } from "@/lib/format";
import { Search, X, Receipt, Users, Truck, UserCheck, ArrowRight } from "lucide-react";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { customers, sales, employees, tanks } = usePetroStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Search Results
  const matchingCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(trimmed) ||
      c.code.toLowerCase().includes(trimmed) ||
      c.vehicles.some((v) => v.vehicleNumber.toLowerCase().includes(trimmed))
  );

  const matchingSales = sales.filter(
    (s) =>
      s.receiptNumber.toLowerCase().includes(trimmed) ||
      (s.vehicleNumber && s.vehicleNumber.toLowerCase().includes(trimmed))
  );

  const matchingEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(trimmed) ||
      e.employeeCode.toLowerCase().includes(trimmed) ||
      e.role.toLowerCase().includes(trimmed)
  );

  const handleSelect = (url: string) => {
    router.push(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-charcoal-700/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-sm shadow-raised overflow-hidden z-10 flex flex-col max-h-[75vh]">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-border-subtle bg-card">
          <Search className="w-4 h-4 text-text-muted mr-3 shrink-0" strokeWidth={1.5} />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type customer, vehicle (e.g. DL 01 AB), receipt ID, or employee..."
            className="w-full bg-transparent text-text placeholder:text-text-faint text-sm focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4">
          {query.trim() === "" ? (
            <div className="p-6 text-center text-xs text-text-muted">
              Quick search through customers, fleet vehicles, fuel sales, staff, and tank levels.
            </div>
          ) : (
            <>
              {/* Customers & Fleet */}
              {matchingCustomers.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] tracking-caps uppercase text-text-faint font-semibold">
                    Customers & Fleet Companies
                  </div>
                  {matchingCustomers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect("/customers")}
                      className="w-full text-left p-2.5 hover:bg-card-subtle rounded-sm flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Users className="w-4 h-4 text-accent" strokeWidth={1.5} />
                        <div>
                          <p className="font-medium text-text">{c.name}</p>
                          <p className="text-[11px] text-text-muted">
                            Outstanding: {formatPaise(c.currentBalancePaise)} • {c.vehicles.length} vehicles
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-text-faint" />
                    </button>
                  ))}
                </div>
              )}

              {/* Transactions */}
              {matchingSales.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] tracking-caps uppercase text-text-faint font-semibold">
                    Sales Receipts
                  </div>
                  {matchingSales.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelect("/sales")}
                      className="w-full text-left p-2.5 hover:bg-card-subtle rounded-sm flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Receipt className="w-4 h-4 text-brass" strokeWidth={1.5} />
                        <div>
                          <p className="font-medium text-text">
                            {s.receiptNumber} — {formatPaise(s.netAmountPaise)}
                          </p>
                          <p className="text-[11px] text-text-muted">
                            {s.fuelType} ({formatLitres(s.quantityLitres)}) • {s.vehicleNumber || "Retail"}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-text-faint" />
                    </button>
                  ))}
                </div>
              )}

              {/* Employees */}
              {matchingEmployees.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] tracking-caps uppercase text-text-faint font-semibold">
                    Employees
                  </div>
                  {matchingEmployees.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => handleSelect("/employees")}
                      className="w-full text-left p-2.5 hover:bg-card-subtle rounded-sm flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <UserCheck className="w-4 h-4 text-olive" strokeWidth={1.5} />
                        <div>
                          <p className="font-medium text-text">{e.name}</p>
                          <p className="text-[11px] text-text-muted">
                            {e.role} • {e.employeeCode}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-text-faint" />
                    </button>
                  ))}
                </div>
              )}

              {matchingCustomers.length === 0 &&
                matchingSales.length === 0 &&
                matchingEmployees.length === 0 && (
                  <div className="p-8 text-center text-xs text-text-muted">
                    No matching records found for &quot;{query}&quot;.
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
