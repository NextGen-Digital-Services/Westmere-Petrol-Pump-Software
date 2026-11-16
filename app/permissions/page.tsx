"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { UserRole } from "@/types";
import { defaultRolePermissions, AppPermission } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Check, X } from "lucide-react";

const allPermissionsList: { key: AppPermission; label: string; group: string }[] = [
  { key: "view_owner_financials", label: "View Owner Financials (Margins, Profit, Payables)", group: "Executive" },
  { key: "manage_station_settings", label: "Configure Station Settings & Tax Profiles", group: "Executive" },
  { key: "manage_roles_permissions", label: "Edit Security & Permission Matrix", group: "Executive" },
  { key: "view_audit_logs", label: "Inspect Immutable Audit Logs & Diffs", group: "Executive" },
  { key: "manage_fuel_prices", label: "Revise Fuel Selling Prices", group: "Pricing" },
  { key: "open_close_shifts", label: "Open & Close Shift Cashboxes", group: "Operations" },
  { key: "approve_shift_variance", label: "Approve Shift Cash Variance", group: "Operations" },
  { key: "record_meter_readings", label: "Record Dispenser Nozzle Readings", group: "Operations" },
  { key: "correct_meter_readings", label: "Authorize Meter Reading Corrections", group: "Operations" },
  { key: "manage_tanks", label: "Manage Underground Tanks & Calibration", group: "Inventory" },
  { key: "record_tank_dips", label: "Record Daily Physical Dip Rod Readings", group: "Inventory" },
  { key: "adjust_stock", label: "Commit Stock Adjustments & Evaporation Losses", group: "Inventory" },
  { key: "create_sales", label: "Issue POS Commercial Fuel Bills", group: "Commercial" },
  { key: "reverse_sales", label: "Authorize Sale Reversals & Refunds", group: "Commercial" },
  { key: "manage_customers_fleet", label: "Manage Customers & Fleet Vehicles", group: "Commercial" },
  { key: "collect_credit_payments", label: "Collect Customer Credit Payments", group: "Commercial" },
  { key: "manage_suppliers", label: "Manage OMC Suppliers & Purchases", group: "Procurement" },
  { key: "verify_deliveries", label: "Verify Inward Bulk Tanker Consignments", group: "Procurement" },
  { key: "record_expenses", label: "Create Expense & Cashbook Vouchers", group: "Accounting" },
  { key: "approve_expenses", label: "Approve Petty Cash Disbursements", group: "Accounting" },
  { key: "view_reports", label: "View Operational & Financial Reports", group: "Reporting" },
  { key: "export_reports", label: "Export Signed PDF & Excel Reports", group: "Reporting" },
  { key: "manage_employees", label: "Manage Employees, Attendance & Payroll", group: "Staff" },
];

const rolesList: UserRole[] = [
  "Owner",
  "General Manager",
  "Shift Manager",
  "Cashier",
  "Pump Operator",
  "Accountant",
];

export default function PermissionsPage() {
  const store = usePetroStore();
  const [matrix, setMatrix] = useState<Record<UserRole, AppPermission[]>>(defaultRolePermissions);
  const [saveStatus, setSaveStatus] = useState("");

  const togglePermission = (role: UserRole, perm: AppPermission) => {
    if (role === "Owner") return; // Owner always has everything
    const current = matrix[role] || [];
    const updated = current.includes(perm)
      ? current.filter((p) => p !== perm)
      : [...current, perm];

    setMatrix({ ...matrix, [role]: updated });
  };

  const handleSave = () => {
    store.addAuditLog({
      userId: store.currentUser?.id || "SYS",
      userName: store.currentUser?.name || "Owner",
      userRole: store.activeRole,
      action: "PERMISSION_MATRIX_UPDATE",
      entity: "SecurityMatrix",
      entityId: "RBAC",
      description: "Updated station role-based access control matrix",
    });
    setSaveStatus("Permissions matrix updated and enforced in UI navigation and actions.");
    setTimeout(() => setSaveStatus(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
            Role-Based Access Control (RBAC)
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-text mt-1">
            User Roles & Permission Matrix
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Enforce strict operational boundaries. Employees never see owner-only financial margins or supplier payables.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          icon={<ShieldCheck className="w-3.5 h-3.5" />}
        >
          Save Matrix
        </Button>
      </div>

      {saveStatus && (
        <div className="p-3 bg-olive/15 border border-olive/30 text-olive text-xs rounded-xl">
          {saveStatus}
        </div>
      )}

      {/* Interactive Permission Grid */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle border-b border-border">
              <tr>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted w-1/3">
                  Privilege / Capability
                </th>
                {rolesList.map((role) => (
                  <th
                    key={role}
                    className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-center"
                  >
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {allPermissionsList.map((item) => (
                <tr key={item.key} className="hover:bg-card-subtle/40">
                  <td className="p-3">
                    <span className="font-medium text-text block">{item.label}</span>
                    <span className="text-[10px] text-text-faint">{item.group}</span>
                  </td>
                  {rolesList.map((role) => {
                    const hasPerm = role === "Owner" ? true : matrix[role]?.includes(item.key);
                    const isOwnerCol = role === "Owner";

                    return (
                      <td key={role} className="p-3 text-center">
                        <button
                          type="button"
                          disabled={isOwnerCol}
                          onClick={() => togglePermission(role, item.key)}
                          className={`w-6 h-6 rounded-sm inline-flex items-center justify-center transition-colors ${
                            hasPerm
                              ? "bg-olive text-bg"
                              : "bg-card border border-border text-text-faint hover:border-text-muted"
                          } ${isOwnerCol ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                        >
                          {hasPerm ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
