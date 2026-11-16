import { UserRole } from "@/types";

export type AppPermission =
  | "view_owner_financials" // gross margin, profit, supplier rates, payables
  | "manage_station_settings"
  | "manage_roles_permissions"
  | "view_audit_logs"
  | "manage_fuel_prices"
  | "open_close_shifts"
  | "approve_shift_variance"
  | "record_meter_readings"
  | "correct_meter_readings"
  | "manage_tanks"
  | "record_tank_dips"
  | "adjust_stock"
  | "create_sales"
  | "reverse_sales"
  | "manage_suppliers"
  | "verify_deliveries"
  | "manage_customers_fleet"
  | "collect_credit_payments"
  | "record_expenses"
  | "approve_expenses"
  | "view_reports"
  | "export_reports"
  | "manage_employees";

export const defaultRolePermissions: Record<UserRole, AppPermission[]> = {
  Owner: [
    "view_owner_financials",
    "manage_station_settings",
    "manage_roles_permissions",
    "view_audit_logs",
    "manage_fuel_prices",
    "open_close_shifts",
    "approve_shift_variance",
    "record_meter_readings",
    "correct_meter_readings",
    "manage_tanks",
    "record_tank_dips",
    "adjust_stock",
    "create_sales",
    "reverse_sales",
    "manage_suppliers",
    "verify_deliveries",
    "manage_customers_fleet",
    "collect_credit_payments",
    "record_expenses",
    "approve_expenses",
    "view_reports",
    "export_reports",
    "manage_employees",
  ],
  "General Manager": [
    "open_close_shifts",
    "approve_shift_variance",
    "record_meter_readings",
    "manage_tanks",
    "record_tank_dips",
    "adjust_stock",
    "create_sales",
    "manage_suppliers",
    "verify_deliveries",
    "manage_customers_fleet",
    "collect_credit_payments",
    "record_expenses",
    "approve_expenses",
    "view_reports",
    "export_reports",
    "manage_employees",
    "view_audit_logs",
  ],
  "Shift Manager": [
    "open_close_shifts",
    "record_meter_readings",
    "record_tank_dips",
    "create_sales",
    "record_expenses",
    "approve_expenses",
    "manage_employees",
    "view_reports",
  ],
  Cashier: [
    "create_sales",
    "collect_credit_payments",
    "record_expenses",
  ],
  "Pump Operator": [
    "create_sales",
    "record_meter_readings",
  ],
  Accountant: [
    "view_reports",
    "export_reports",
    "record_expenses",
    "approve_expenses",
    "collect_credit_payments",
    "manage_suppliers",
    "manage_customers_fleet",
    "view_audit_logs",
  ],
};

export function hasPermission(
  role: UserRole,
  permission: AppPermission,
  customMatrix?: Partial<Record<UserRole, AppPermission[]>>
): boolean {
  if (role === "Owner") return true; // Owner always bypasses
  const matrix = customMatrix || defaultRolePermissions;
  const permissions = matrix[role] || defaultRolePermissions[role] || [];
  return permissions.includes(permission);
}
