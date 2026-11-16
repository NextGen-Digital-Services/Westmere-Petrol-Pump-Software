export type UserRole =
  | "Owner"
  | "General Manager"
  | "Shift Manager"
  | "Cashier"
  | "Pump Operator"
  | "Accountant";

export type FuelType = "Petrol" | "Diesel" | "Speed Petrol" | "CNG";

export type PaymentMethod = "CASH" | "UPI" | "CARD" | "CREDIT";

export interface Station {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  dealerName: string;
  oilCompany: string; // e.g. "Indian Oil", "Bharat Petroleum", "HPCL"
  roCode: string; // Retail Outlet Code
  gstin?: string;
  vatTin?: string;
  currency: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  employeeId?: string;
  isActive: boolean;
  assignedNozzleIds?: string[];
  createdAt: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  monthlySalaryPaise: number;
  currentAdvancePaise: number;
  assignedDispenserIds?: string[];
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
  joinedDate: string;
  shiftPreference?: "Morning" | "Evening" | "Night" | "Flexible";
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";
  shiftId?: string;
  inTime?: string;
  outTime?: string;
  notes?: string;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  monthYear: string; // YYYY-MM
  grossSalaryPaise: number;
  advanceDeductionPaise: number;
  netPaidPaise: number;
  paymentMethod: "BANK_TRANSFER" | "CASH" | "CHEQUE";
  paidAt: string;
  notes?: string;
}

export interface Tank {
  id: string;
  code: string;
  name: string;
  fuelType: FuelType;
  capacityLitres: number;
  reorderLevelLitres: number;
  currentStockLitres: number;
  deadStockLitres: number;
  diameterMm: number;
  lengthMm: number;
  lastDipCm?: number;
  lastDipTimestamp?: string;
}

export interface TankCalibrationPoint {
  dipCm: number;
  litres: number;
}

export interface TankCalibration {
  id: string;
  tankId: string;
  chartName: string;
  points: TankCalibrationPoint[];
  calibratedAt: string;
}

export interface TankDip {
  id: string;
  tankId: string;
  shiftId?: string;
  dipCm: number;
  calculatedLitres: number;
  waterDipCm: number;
  temperatureC?: number;
  densityKgM3?: number;
  recordedBy: string;
  createdAt: string;
  notes?: string;
}

export interface Dispenser {
  id: string;
  code: string; // e.g. "DSP-01"
  name: string; // e.g. "Dispenser 1 - Island North"
  make: string; // Gilbarco / Wayne / Tokheim / Midco
  model: string;
  serialNumber: string;
  ipAddress?: string;
  port?: number;
  protocol?: "DART" | "IFSF" | "CURRENT_LOOP" | "SIMULATED";
  status: "ONLINE" | "OFFLINE" | "MAINTENANCE";
  isSimulatedLive: boolean;
}

export interface Nozzle {
  id: string;
  dispenserId: string;
  code: string; // e.g. "N-01"
  name: string; // e.g. "Dispenser 1 - Nozzle 1 (Petrol)"
  fuelType: FuelType;
  tankId: string;
  currentTotalizerLitres: number;
  status: "ACTIVE" | "IDLE" | "MAINTENANCE";
}

export interface MeterReading {
  id: string;
  shiftId: string;
  nozzleId: string;
  openingLitres: number;
  closingLitres: number;
  volumeLitres: number; // closing - opening
  testingLitres: number; // calibration/pump test pours
  saleLitres: number; // volume - testing
  isRollover: boolean;
  rolloverMaxMeter?: number;
  reason?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface FuelPrice {
  id: string;
  fuelType: FuelType;
  salePricePaise: number;
  effectiveFrom: string; // ISO String
  changedBy: string;
  notes?: string;
}

export interface Shift {
  id: string;
  code: string; // e.g. "SH-2026-0042"
  name: "Morning" | "Evening" | "Night";
  date: string; // YYYY-MM-DD
  openedAt: string;
  closedAt?: string;
  status: "OPEN" | "CLOSED" | "LOCKED";
  openedBy: string;
  closedBy?: string;
  approvedBy?: string;
  openingCashPaise: number;
  closingCashPaise?: number;
  expectedCashPaise?: number;
  cashVariancePaise?: number; // Actual cash - expected cash
  notes?: string;
  varianceReason?: string;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  employeeId: string;
  assignedNozzleIds: string[];
}

export interface SalePayment {
  id: string;
  saleId: string;
  method: PaymentMethod;
  amountPaise: number;
  referenceNo?: string; // UPI txn ref, card auth code, or fleet slip
}

export interface Sale {
  id: string;
  receiptNumber: string; // e.g. "TXN-2026-001234"
  shiftId: string;
  nozzleId: string;
  fuelType: FuelType;
  tankId: string;
  operatorId: string;
  quantityLitres: number;
  pricePerLitrePaise: number;
  totalAmountPaise: number;
  discountPaise?: number;
  netAmountPaise: number;
  payments: SalePayment[];
  customerId?: string; // If credit/fleet sale
  vehicleNumber?: string;
  odometerReading?: number;
  status: "COMPLETED" | "REVERSED";
  reversalReason?: string;
  reversedAt?: string;
  reversedBy?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  address: string;
  fuelSupplied: FuelType[];
  outstandingBalancePaise: number;
  isActive: boolean;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  fuelType: FuelType;
  orderedLitres: number;
  expectedRatePaise: number;
  status: "PENDING" | "DELIVERED" | "CANCELLED";
  orderDate: string;
  expectedDeliveryDate: string;
}

export interface FuelDelivery {
  id: string;
  challanNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  supplierId: string;
  poId?: string;
  fuelType: FuelType;
  densityReported?: number;
  invoiceLitres: number;
  receivedLitres: number;
  shortageLitres: number;
  shortageReason?: string;
  ratePerLitrePaise: number;
  freightPaise: number;
  vatPaise: number;
  totalInvoicePaise: number;
  tankAllocations: {
    tankId: string;
    litres: number;
  }[];
  verifiedBy: string;
  verifiedAt: string;
  notes?: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  amountPaise: number;
  paymentMethod: "BANK_TRANSFER" | "CHEQUE" | "RTGS" | "NEFT";
  referenceNumber: string;
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  companyName?: string;
  type: "INDIVIDUAL" | "FLEET_COMPANY";
  phone: string;
  email?: string;
  gstin?: string;
  creditLimitPaise: number;
  currentBalancePaise: number; // Positive = customer owes station
  billingCycleDays: number;
  vehicles: Vehicle[];
  isActive: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  model?: string;
  driverName?: string;
  driverPhone?: string;
  monthlyQuotaLitres?: number;
  currentMonthLitres?: number;
  fuelType: FuelType;
  isActive: boolean;
}

export interface CreditPayment {
  id: string;
  customerId: string;
  amountPaise: number;
  paymentMethod: "CASH" | "UPI" | "CHEQUE" | "BANK_TRANSFER";
  referenceNumber?: string;
  receivedAt: string;
  receivedBy: string;
  notes?: string;
}

export type ExpenseCategory =
  | "Employee salaries"
  | "Electricity"
  | "Generator fuel"
  | "Maintenance"
  | "Cleaning"
  | "Transportation"
  | "Office expenses"
  | "Equipment repair"
  | "Miscellaneous";

export interface Expense {
  id: string;
  voucherNumber: string;
  shiftId?: string;
  category: ExpenseCategory;
  description: string;
  amountPaise: number;
  paidTo: string;
  paymentMethod: "CASH" | "UPI" | "BANK_TRANSFER";
  isShiftExpense: boolean;
  approvedBy?: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  receiptUrl?: string; // base64 or file note
  date: string;
  createdAt: string;
}

export interface CashbookEntry {
  id: string;
  date: string;
  entryType: "INFLOW" | "OUTFLOW";
  source: "SHIFT_COLLECTION" | "CREDIT_PAYMENT" | "EXPENSE" | "BANK_DEPOSIT" | "BANK_WITHDRAWAL" | "SUPPLIER_PAYMENT" | "OTHER";
  referenceId?: string;
  description: string;
  amountPaise: number;
  balanceAfterPaise: number;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  tankId: string;
  fuelType: FuelType;
  adjustmentType: "SHORTAGE" | "EXCESS" | "EVAPORATION" | "CALIBRATION_CORRECTION";
  litres: number; // positive or negative
  reason: string;
  approvedBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  description: string;
  ipAddress?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  entityType?: "STOCK" | "SHIFT" | "CREDIT" | "SUPPLIER" | "ATTENDANCE" | "PRICE";
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TaxProfile {
  id: string;
  name: string;
  description: string;
  fuelGstApplicable: boolean; // default false
  fuelGstRatePercent: number; // 0
  stateVatRatePercent: number; // e.g. 19.4%
  stateCessPerLitrePaise: number; // e.g. 250 paise
  lubricantsGstRatePercent: number; // 18%
  complianceNote: string;
}

export interface StationSettings {
  station: Station;
  taxProfile: TaxProfile;
  sessionTimeoutMinutes: number;
  lowStockThresholdPercent: number;
  overStockThresholdPercent: number;
  maxManagerVarianceApprovalPaise: number;
  unusualDifferenceLitresThreshold: number;
  simulatedHardwareFeedActive: boolean;
  simulatedNotificationWhatsApp: boolean;
  simulatedNotificationEmail: boolean;
  demoMode: boolean;
}
