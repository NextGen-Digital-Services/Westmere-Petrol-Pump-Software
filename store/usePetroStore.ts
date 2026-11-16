import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Station,
  User,
  UserRole,
  Employee,
  AttendanceRecord,
  SalaryPayment,
  Tank,
  TankDip,
  TankCalibration,
  Dispenser,
  Nozzle,
  MeterReading,
  FuelPrice,
  Shift,
  Sale,
  Supplier,
  PurchaseOrder,
  FuelDelivery,
  SupplierPayment,
  Customer,
  CreditPayment,
  Expense,
  CashbookEntry,
  StockAdjustment,
  AuditLog,
  Notification,
  StationSettings,
} from "@/types";
import {
  initialStation,
  demoUsers,
  demoEmployees,
  demoFuelPrices,
  demoTanks,
  demoTankCalibrations,
  demoDispensers,
  demoNozzles,
  demoSuppliers,
  demoCustomers,
  demoShifts,
  demoMeterReadings,
  demoDeliveries,
  demoSales,
  demoExpenses,
  demoCashbookEntries,
  demoStockAdjustments,
  demoNotifications,
  demoAuditLogs,
  initialSettings,
} from "@/seed/demoData";
import { generateEntityId } from "@/lib/format";

export interface PetroState {
  // Auth & Session
  currentUser: User | null;
  activeRole: UserRole;
  isLoggedIn: boolean;
  lastActiveTimestamp: number;
  failedLoginAttempts: number;
  isLockedOut: boolean;
  lockoutUntil: number | null;
  theme: "light" | "dark";

  // Data Entities
  station: Station;
  users: User[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  salaries: SalaryPayment[];
  tanks: Tank[];
  tankDips: TankDip[];
  calibrations: TankCalibration[];
  dispensers: Dispenser[];
  nozzles: Nozzle[];
  meterReadings: MeterReading[];
  fuelPrices: FuelPrice[];
  shifts: Shift[];
  sales: Sale[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  deliveries: FuelDelivery[];
  supplierPayments: SupplierPayment[];
  customers: Customer[];
  creditPayments: CreditPayment[];
  expenses: Expense[];
  cashbook: CashbookEntry[];
  stockAdjustments: StockAdjustment[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  settings: StationSettings;

  // Actions
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  recordFailedLogin: () => void;
  resetFailedLogins: () => void;
  updateLastActive: () => void;
  viewAsRole: (role: UserRole) => void;

  // Shifts
  openShift: (shiftName: "Morning" | "Evening" | "Night", openingCashPaise: number, notes?: string) => Shift;
  closeShift: (shiftId: string, closingCashPaise: number, expectedCashPaise: number, varianceReason?: string) => void;
  approveShiftVariance: (shiftId: string, notes?: string) => void;
  recordMeterReading: (reading: Omit<MeterReading, "id" | "createdAt">) => MeterReading;
  correctMeterReading: (id: string, newClosing: number, reason: string) => void;

  // Sales & POS
  createSale: (saleData: Omit<Sale, "id" | "receiptNumber" | "status" | "createdAt">) => Sale;
  reverseSale: (saleId: string, reason: string) => void;

  // Inventory & Tanks
  recordTankDip: (dip: Omit<TankDip, "id" | "createdAt">) => TankDip;
  addTank: (tank: Omit<Tank, "id" | "currentStockLitres">) => Tank;
  updateTank: (id: string, updates: Partial<Tank>) => void;
  addStockAdjustment: (adj: Omit<StockAdjustment, "id" | "createdAt">) => StockAdjustment;

  // Dispensers & Nozzles
  addDispenser: (dispenser: Omit<Dispenser, "id">) => Dispenser;
  updateDispenser: (id: string, updates: Partial<Dispenser>) => void;
  addNozzle: (nozzle: Omit<Nozzle, "id">) => Nozzle;
  updateNozzleTotalizer: (nozzleId: string, totalizerLitres: number) => void;
  toggleDispenserSimulatedFeed: (dispenserId: string) => void;

  // Purchases & Suppliers
  createFuelDelivery: (delivery: Omit<FuelDelivery, "id">) => FuelDelivery;
  createSupplierPayment: (payment: Omit<SupplierPayment, "id" | "createdAt">) => SupplierPayment;
  addSupplier: (supplier: Omit<Supplier, "id">) => Supplier;

  // Customers & Fleet
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  recordCreditPayment: (payment: Omit<CreditPayment, "id">) => CreditPayment;

  // Expenses & Cashbook
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => Expense;
  approveExpense: (id: string) => void;
  addCashbookEntry: (entry: Omit<CashbookEntry, "id" | "createdAt">) => CashbookEntry;

  // Fuel Price
  setFuelPrice: (fuelType: FuelPrice["fuelType"], salePricePaise: number, notes?: string) => void;

  // Employees & Attendance
  addEmployee: (emp: Omit<Employee, "id">) => Employee;
  recordAttendance: (record: Omit<AttendanceRecord, "id">) => void;
  recordSalaryPayment: (payment: Omit<SalaryPayment, "id">) => void;

  // Notifications & Audit
  addNotification: (notif: Omit<Notification, "id" | "createdAt" | "isRead">) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addAuditLog: (entry: Omit<AuditLog, "id" | "createdAt">) => void;

  // System & Data Lifecycle
  updateSettings: (newSettings: Partial<StationSettings>) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  importDataJSON: (jsonString: string) => boolean;
  exportDataJSON: () => string;
}

export const usePetroStore = create<PetroState>()(
  persist(
    (set, get) => ({
      currentUser: demoUsers[0], // Vikramaditya Singhania (Owner)
      activeRole: "Owner",
      isLoggedIn: true,
      lastActiveTimestamp: Date.now(),
      failedLoginAttempts: 0,
      isLockedOut: false,
      lockoutUntil: null,
      theme: "dark",

      station: initialStation,
      users: demoUsers,
      employees: demoEmployees,
      attendance: [],
      salaries: [],
      tanks: demoTanks,
      tankDips: [],
      calibrations: demoTankCalibrations,
      dispensers: demoDispensers,
      nozzles: demoNozzles,
      meterReadings: demoMeterReadings,
      fuelPrices: demoFuelPrices,
      shifts: demoShifts,
      sales: demoSales,
      suppliers: demoSuppliers,
      purchaseOrders: [],
      deliveries: demoDeliveries,
      supplierPayments: [],
      customers: demoCustomers,
      creditPayments: [],
      expenses: demoExpenses,
      cashbook: demoCashbookEntries,
      stockAdjustments: demoStockAdjustments,
      notifications: demoNotifications,
      auditLogs: demoAuditLogs,
      settings: initialSettings,

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),

      login: (email: string, role?: UserRole) => {
        const foundUser = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (foundUser || role) {
          const user = foundUser || {
            id: generateEntityId("USR"),
            name: `${role} User`,
            email,
            role: role || "Owner",
            phone: "+91 98110 00000",
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          set({
            currentUser: user,
            activeRole: user.role,
            isLoggedIn: true,
            lastActiveTimestamp: Date.now(),
            failedLoginAttempts: 0,
            isLockedOut: false,
            lockoutUntil: null,
          });
          get().addAuditLog({
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            action: "AUTH_LOGIN",
            entity: "Session",
            entityId: user.id,
            description: `User logged in with role ${user.role}`,
          });
          return true;
        }
        get().recordFailedLogin();
        return false;
      },

      logout: () => {
        const user = get().currentUser;
        if (user) {
          get().addAuditLog({
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            action: "AUTH_LOGOUT",
            entity: "Session",
            entityId: user.id,
            description: "User logged out of session",
          });
        }
        set({ isLoggedIn: false, currentUser: null });
      },

      recordFailedLogin: () => {
        const attempts = get().failedLoginAttempts + 1;
        const willLock = attempts >= 5;
        set({
          failedLoginAttempts: attempts,
          isLockedOut: willLock,
          lockoutUntil: willLock ? Date.now() + 5 * 60 * 1000 : null,
        });
        get().addAuditLog({
          userId: "ANONYMOUS",
          userName: "Unknown",
          userRole: "Cashier",
          action: "AUTH_FAILED_ATTEMPT",
          entity: "Session",
          entityId: "AUTH",
          description: `Failed login attempt #${attempts}. Lockout: ${willLock}`,
        });
      },

      resetFailedLogins: () => set({ failedLoginAttempts: 0, isLockedOut: false, lockoutUntil: null }),
      updateLastActive: () => set({ lastActiveTimestamp: Date.now() }),

      viewAsRole: (role: UserRole) => {
        set({ activeRole: role });
        get().addNotification({
          title: "Role Preview Switched",
          message: `Now viewing interface with ${role} permissions.`,
          severity: "INFO",
        });
      },

      openShift: (shiftName, openingCashPaise, notes) => {
        const shiftId = generateEntityId("SH");
        const today = new Date().toISOString().split("T")[0];
        const newShift: Shift = {
          id: shiftId,
          code: shiftId,
          name: shiftName,
          date: today,
          openedAt: new Date().toISOString(),
          status: "OPEN",
          openedBy: get().currentUser?.name || "Shift Manager",
          openingCashPaise,
          notes,
        };

        set((state) => ({
          shifts: [newShift, ...state.shifts],
        }));

        get().addCashbookEntry({
          date: today,
          entryType: "INFLOW",
          source: "SHIFT_COLLECTION",
          referenceId: shiftId,
          description: `Opening Cash Float for ${shiftName} Shift (${shiftId})`,
          amountPaise: openingCashPaise,
          balanceAfterPaise:
            (get().cashbook[0]?.balanceAfterPaise || 0) + openingCashPaise,
        });

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "System",
          userRole: get().activeRole,
          action: "SHIFT_OPEN",
          entity: "Shift",
          entityId: shiftId,
          afterState: newShift as unknown as Record<string, any>,
          description: `Opened ${shiftName} Shift with ${openingCashPaise / 100} INR opening float`,
        });

        return newShift;
      },

      closeShift: (shiftId, closingCashPaise, expectedCashPaise, varianceReason) => {
        const cashVariancePaise = closingCashPaise - expectedCashPaise;
        const isDiscrepancy = Math.abs(cashVariancePaise) > (get().settings.maxManagerVarianceApprovalPaise || 50000);

        set((state) => ({
          shifts: state.shifts.map((s) =>
            s.id === shiftId
              ? {
                  ...s,
                  status: isDiscrepancy ? "CLOSED" : "LOCKED",
                  closedAt: new Date().toISOString(),
                  closedBy: get().currentUser?.name || "Shift Manager",
                  closingCashPaise,
                  expectedCashPaise,
                  cashVariancePaise,
                  varianceReason,
                  approvedBy: isDiscrepancy ? undefined : (get().currentUser?.name || "Shift Manager"),
                }
              : s
          ),
        }));

        if (isDiscrepancy) {
          get().addNotification({
            title: "Shift Variance Requires Owner Approval",
            message: `Shift ${shiftId} has cash variance of ₹${(cashVariancePaise / 100).toFixed(2)}. Approval required.`,
            severity: "CRITICAL",
            entityType: "SHIFT",
            linkUrl: "/shifts",
          });
        }

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "System",
          userRole: get().activeRole,
          action: "SHIFT_CLOSE",
          entity: "Shift",
          entityId: shiftId,
          description: `Closed shift ${shiftId}. Variance: ₹${(cashVariancePaise / 100).toFixed(2)}`,
        });
      },

      approveShiftVariance: (shiftId, notes) => {
        set((state) => ({
          shifts: state.shifts.map((s) =>
            s.id === shiftId
              ? {
                  ...s,
                  status: "LOCKED",
                  approvedBy: get().currentUser?.name || "Owner",
                  notes: notes ? `${s.notes || ""}; ${notes}` : s.notes,
                }
              : s
          ),
        }));

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "Owner",
          userRole: get().activeRole,
          action: "SHIFT_VARIANCE_APPROVE",
          entity: "Shift",
          entityId: shiftId,
          description: `Approved shift ${shiftId} closing variance`,
        });
      },

      recordMeterReading: (readingData) => {
        const id = generateEntityId("MTR");
        const reading: MeterReading = {
          ...readingData,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          meterReadings: [reading, ...state.meterReadings],
          nozzles: state.nozzles.map((n) =>
            n.id === readingData.nozzleId
              ? { ...n, currentTotalizerLitres: readingData.closingLitres }
              : n
          ),
        }));

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "Operator",
          userRole: get().activeRole,
          action: "METER_READING_RECORD",
          entity: "MeterReading",
          entityId: id,
          description: `Recorded reading for nozzle ${readingData.nozzleId}: ${readingData.openingLitres} -> ${readingData.closingLitres} (${readingData.volumeLitres} L)`,
        });

        return reading;
      },

      correctMeterReading: (id, newClosing, reason) => {
        const reading = get().meterReadings.find((r) => r.id === id);
        if (!reading) return;

        const newVolume = Number((newClosing - reading.openingLitres).toFixed(2));
        const newSale = Number(Math.max(0, newVolume - reading.testingLitres).toFixed(2));

        set((state) => ({
          meterReadings: state.meterReadings.map((r) =>
            r.id === id
              ? {
                  ...r,
                  closingLitres: newClosing,
                  volumeLitres: newVolume,
                  saleLitres: newSale,
                  reason: `Correction: ${reason}`,
                  approvedBy: get().currentUser?.name || "Owner",
                }
              : r
          ),
        }));

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "Owner",
          userRole: get().activeRole,
          action: "METER_READING_CORRECTION",
          entity: "MeterReading",
          entityId: id,
          beforeState: { closingLitres: reading.closingLitres, volumeLitres: reading.volumeLitres },
          afterState: { closingLitres: newClosing, volumeLitres: newVolume },
          description: `Authorized meter correction: ${reason}`,
        });
      },

      createSale: (saleData) => {
        const receiptNumber = generateEntityId("TXN");
        const newSale: Sale = {
          ...saleData,
          id: receiptNumber,
          receiptNumber,
          status: "COMPLETED",
          createdAt: new Date().toISOString(),
        };

        // Update tank inventory
        set((state) => ({
          sales: [newSale, ...state.sales],
          tanks: state.tanks.map((t) =>
            t.id === saleData.tankId
              ? {
                  ...t,
                  currentStockLitres: Number(
                    Math.max(0, t.currentStockLitres - saleData.quantityLitres).toFixed(2)
                  ),
                }
              : t
          ),
          nozzles: state.nozzles.map((n) =>
            n.id === saleData.nozzleId
              ? {
                  ...n,
                  currentTotalizerLitres: Number(
                    (n.currentTotalizerLitres + saleData.quantityLitres).toFixed(2)
                  ),
                }
              : n
          ),
        }));

        // Customer credit ledger update if credit sale
        if (saleData.customerId) {
          const creditPayment = saleData.payments.find((p) => p.method === "CREDIT");
          if (creditPayment) {
            set((state) => ({
              customers: state.customers.map((c) =>
                c.id === saleData.customerId
                  ? {
                      ...c,
                      currentBalancePaise: c.currentBalancePaise + creditPayment.amountPaise,
                    }
                  : c
              ),
            }));
          }
        }

        // Cash tender updates cashbook
        const cashPayment = saleData.payments.find((p) => p.method === "CASH");
        if (cashPayment && cashPayment.amountPaise > 0) {
          get().addCashbookEntry({
            date: new Date().toISOString().split("T")[0],
            entryType: "INFLOW",
            source: "SHIFT_COLLECTION",
            referenceId: receiptNumber,
            description: `Sale Cash Tender (${receiptNumber})`,
            amountPaise: cashPayment.amountPaise,
            balanceAfterPaise:
              (get().cashbook[0]?.balanceAfterPaise || 0) + cashPayment.amountPaise,
          });
        }

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "Operator",
          userRole: get().activeRole,
          action: "SALE_CREATE",
          entity: "Sale",
          entityId: receiptNumber,
          description: `Billed ${saleData.quantityLitres} L ${saleData.fuelType} for ₹${(saleData.netAmountPaise / 100).toFixed(2)}`,
        });

        return newSale;
      },

      reverseSale: (saleId, reason) => {
        const sale = get().sales.find((s) => s.id === saleId);
        if (!sale || sale.status === "REVERSED") return;

        // Restore tank stock and customer balance
        set((state) => ({
          sales: state.sales.map((s) =>
            s.id === saleId
              ? {
                  ...s,
                  status: "REVERSED",
                  reversalReason: reason,
                  reversedAt: new Date().toISOString(),
                  reversedBy: get().currentUser?.name || "Owner",
                }
              : s
          ),
          tanks: state.tanks.map((t) =>
            t.id === sale.tankId
              ? {
                  ...t,
                  currentStockLitres: Number(
                    (t.currentStockLitres + sale.quantityLitres).toFixed(2)
                  ),
                }
              : t
          ),
          customers: sale.customerId
            ? state.customers.map((c) =>
                c.id === sale.customerId
                  ? {
                      ...c,
                      currentBalancePaise: Math.max(
                        0,
                        c.currentBalancePaise - sale.netAmountPaise
                      ),
                    }
                  : c
              )
            : state.customers,
        }));

        // Reverse cash if cash was received
        const cashPayment = sale.payments.find((p) => p.method === "CASH");
        if (cashPayment) {
          get().addCashbookEntry({
            date: new Date().toISOString().split("T")[0],
            entryType: "OUTFLOW",
            source: "SHIFT_COLLECTION",
            referenceId: sale.id,
            description: `Reversal Refund for ${sale.receiptNumber}: ${reason}`,
            amountPaise: cashPayment.amountPaise,
            balanceAfterPaise:
              (get().cashbook[0]?.balanceAfterPaise || 0) - cashPayment.amountPaise,
          });
        }

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "Owner",
          userRole: get().activeRole,
          action: "SALE_REVERSE",
          entity: "Sale",
          entityId: saleId,
          description: `Reversed sale ${sale.receiptNumber}. Reason: ${reason}`,
        });
      },

      recordTankDip: (dipData) => {
        const id = generateEntityId("DIP");
        const dip: TankDip = {
          ...dipData,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          tankDips: [dip, ...state.tankDips],
          tanks: state.tanks.map((t) =>
            t.id === dipData.tankId
              ? {
                  ...t,
                  lastDipCm: dipData.dipCm,
                  lastDipTimestamp: dip.createdAt,
                }
              : t
          ),
        }));

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "Operator",
          userRole: get().activeRole,
          action: "TANK_DIP_RECORD",
          entity: "TankDip",
          entityId: id,
          description: `Recorded dip for tank ${dipData.tankId}: ${dipData.dipCm} cm (${dipData.calculatedLitres} L)`,
        });

        return dip;
      },

      addTank: (tankData) => {
        const id = generateEntityId("TNK");
        const newTank: Tank = {
          ...tankData,
          id,
          currentStockLitres: 0,
        };
        set((state) => ({ tanks: [...state.tanks, newTank] }));
        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "Admin",
          userRole: get().activeRole,
          action: "TANK_CREATE",
          entity: "Tank",
          entityId: id,
          description: `Created new tank: ${tankData.name}`,
        });
        return newTank;
      },

      updateTank: (id, updates) => {
        set((state) => ({
          tanks: state.tanks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      addStockAdjustment: (adjData) => {
        const id = generateEntityId("ADJ");
        const adj: StockAdjustment = {
          ...adjData,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          stockAdjustments: [adj, ...state.stockAdjustments],
          tanks: state.tanks.map((t) =>
            t.id === adjData.tankId
              ? {
                  ...t,
                  currentStockLitres: Number(
                    Math.max(0, t.currentStockLitres + adjData.litres).toFixed(2)
                  ),
                }
              : t
          ),
        }));

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "Manager",
          userRole: get().activeRole,
          action: "STOCK_ADJUSTMENT",
          entity: "StockAdjustment",
          entityId: id,
          description: `Adjusted tank ${adjData.tankId} by ${adjData.litres} L. Type: ${adjData.adjustmentType}. Reason: ${adjData.reason}`,
        });

        return adj;
      },

      addDispenser: (dispenserData) => {
        const id = generateEntityId("DSP");
        const newDispenser: Dispenser = { ...dispenserData, id };
        set((state) => ({ dispensers: [...state.dispensers, newDispenser] }));
        return newDispenser;
      },

      updateDispenser: (id, updates) => {
        set((state) => ({
          dispensers: state.dispensers.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        }));
      },

      addNozzle: (nozzleData) => {
        const id = generateEntityId("NOZ");
        const newNozzle: Nozzle = { ...nozzleData, id };
        set((state) => ({ nozzles: [...state.nozzles, newNozzle] }));
        return newNozzle;
      },

      updateNozzleTotalizer: (nozzleId, totalizerLitres) => {
        set((state) => ({
          nozzles: state.nozzles.map((n) =>
            n.id === nozzleId ? { ...n, currentTotalizerLitres: totalizerLitres } : n
          ),
        }));
      },

      toggleDispenserSimulatedFeed: (dispenserId) => {
        set((state) => ({
          dispensers: state.dispensers.map((d) =>
            d.id === dispenserId ? { ...d, isSimulatedLive: !d.isSimulatedLive } : d
          ),
        }));
      },

      createFuelDelivery: (delData) => {
        const id = generateEntityId("DEL");
        const delivery: FuelDelivery = { ...delData, id };

        // Allocate litres into designated tanks
        set((state) => {
          let updatedTanks = [...state.tanks];
          for (const alloc of delData.tankAllocations) {
            updatedTanks = updatedTanks.map((t) =>
              t.id === alloc.tankId
                ? {
                    ...t,
                    currentStockLitres: Number(
                      (t.currentStockLitres + alloc.litres).toFixed(2)
                    ),
                  }
                : t
            );
          }
          return {
            deliveries: [delivery, ...state.deliveries],
            tanks: updatedTanks,
            suppliers: state.suppliers.map((s) =>
              s.id === delData.supplierId
                ? {
                    ...s,
                    outstandingBalancePaise:
                      s.outstandingBalancePaise + delData.totalInvoicePaise,
                  }
                : s
            ),
          };
        });

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "Manager",
          userRole: get().activeRole,
          action: "FUEL_DELIVERY_VERIFY",
          entity: "FuelDelivery",
          entityId: id,
          description: `Received ${delData.receivedLitres} L ${delData.fuelType} from supplier ${delData.supplierId}`,
        });

        return delivery;
      },

      createSupplierPayment: (paymentData) => {
        const id = generateEntityId("SPAY");
        const payment: SupplierPayment = {
          ...paymentData,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          supplierPayments: [payment, ...state.supplierPayments],
          suppliers: state.suppliers.map((s) =>
            s.id === paymentData.supplierId
              ? {
                  ...s,
                  outstandingBalancePaise: Math.max(
                    0,
                    s.outstandingBalancePaise - paymentData.amountPaise
                  ),
                }
              : s
          ),
        }));

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "Accountant",
          userRole: get().activeRole,
          action: "SUPPLIER_PAYMENT",
          entity: "SupplierPayment",
          entityId: id,
          description: `Paid ₹${(paymentData.amountPaise / 100).toFixed(2)} to supplier ${paymentData.supplierId}`,
        });

        return payment;
      },

      addSupplier: (supplierData) => {
        const id = generateEntityId("SUP");
        const newSupplier: Supplier = { ...supplierData, id };
        set((state) => ({ suppliers: [...state.suppliers, newSupplier] }));
        return newSupplier;
      },

      addCustomer: (custData) => {
        const id = generateEntityId("CUST");
        const newCustomer: Customer = {
          ...custData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ customers: [...state.customers, newCustomer] }));
        return newCustomer;
      },

      updateCustomer: (id, updates) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      recordCreditPayment: (paymentData) => {
        const id = generateEntityId("CPAY");
        const payment: CreditPayment = { ...paymentData, id };

        set((state) => ({
          creditPayments: [payment, ...state.creditPayments],
          customers: state.customers.map((c) =>
            c.id === paymentData.customerId
              ? {
                  ...c,
                  currentBalancePaise: Math.max(
                    0,
                    c.currentBalancePaise - paymentData.amountPaise
                  ),
                }
              : c
          ),
        }));

        if (paymentData.paymentMethod === "CASH") {
          get().addCashbookEntry({
            date: new Date().toISOString().split("T")[0],
            entryType: "INFLOW",
            source: "CREDIT_PAYMENT",
            referenceId: id,
            description: `Credit Payment Received (${paymentData.customerId})`,
            amountPaise: paymentData.amountPaise,
            balanceAfterPaise:
              (get().cashbook[0]?.balanceAfterPaise || 0) + paymentData.amountPaise,
          });
        }

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "Cashier",
          userRole: get().activeRole,
          action: "CREDIT_PAYMENT",
          entity: "CreditPayment",
          entityId: id,
          description: `Collected ₹${(paymentData.amountPaise / 100).toFixed(2)} from customer ${paymentData.customerId}`,
        });

        return payment;
      },

      addExpense: (expenseData) => {
        const id = generateEntityId("EXP");
        const expense: Expense = {
          ...expenseData,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          expenses: [expense, ...state.expenses],
        }));

        if (expenseData.paymentMethod === "CASH") {
          get().addCashbookEntry({
            date: expenseData.date,
            entryType: "OUTFLOW",
            source: "EXPENSE",
            referenceId: id,
            description: `Expense: ${expenseData.category} - ${expenseData.description}`,
            amountPaise: expenseData.amountPaise,
            balanceAfterPaise:
              (get().cashbook[0]?.balanceAfterPaise || 0) - expenseData.amountPaise,
          });
        }

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "Staff",
          userRole: get().activeRole,
          action: "EXPENSE_CREATE",
          entity: "Expense",
          entityId: id,
          description: `Added expense ${expenseData.category}: ₹${(expenseData.amountPaise / 100).toFixed(2)}`,
        });

        return expense;
      },

      approveExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, status: "APPROVED", approvedBy: get().currentUser?.name || "Owner" } : e
          ),
        }));
      },

      addCashbookEntry: (entryData) => {
        const id = generateEntityId("CSH");
        const entry: CashbookEntry = {
          ...entryData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ cashbook: [entry, ...state.cashbook] }));
        return entry;
      },

      setFuelPrice: (fuelType, salePricePaise, notes) => {
        const id = generateEntityId("PRC");
        const newPrice: FuelPrice = {
          id,
          fuelType,
          salePricePaise,
          effectiveFrom: new Date().toISOString(),
          changedBy: get().currentUser?.name || "Owner",
          notes,
        };

        set((state) => ({
          fuelPrices: [newPrice, ...state.fuelPrices],
        }));

        get().addNotification({
          title: `Price Revised: ${fuelType}`,
          message: `Price revised to ₹${(salePricePaise / 100).toFixed(2)}/L by ${newPrice.changedBy}. Effective immediately.`,
          severity: "INFO",
          entityType: "PRICE",
          linkUrl: "/settings",
        });

        get().addAuditLog({
          userId: get().currentUser?.id || "SYS",
          userName: get().currentUser?.name || "Owner",
          userRole: get().activeRole,
          action: "PRICE_CHANGE",
          entity: "FuelPrice",
          entityId: id,
          description: `Revised ${fuelType} price to ₹${(salePricePaise / 100).toFixed(2)}/L`,
        });
      },

      addEmployee: (empData) => {
        const id = generateEntityId("EMP");
        const newEmp: Employee = { ...empData, id };
        set((state) => ({ employees: [...state.employees, newEmp] }));
        return newEmp;
      },

      recordAttendance: (recData) => {
        const id = generateEntityId("ATT");
        set((state) => ({
          attendance: [{ ...recData, id }, ...state.attendance],
        }));
      },

      recordSalaryPayment: (payData) => {
        const id = generateEntityId("SAL");
        set((state) => ({
          salaries: [{ ...payData, id }, ...state.salaries],
        }));
      },

      addNotification: (notifData) => {
        const id = generateEntityId("NOTIF");
        const notif: Notification = {
          ...notifData,
          id,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ notifications: [notif, ...state.notifications] }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },

      clearAllNotifications: () => set({ notifications: [] }),

      addAuditLog: (entryData) => {
        const id = generateEntityId("AUD");
        const log: AuditLog = {
          ...entryData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ auditLogs: [log, ...state.auditLogs] }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      resetToDemoData: () => {
        set({
          station: initialStation,
          users: demoUsers,
          employees: demoEmployees,
          attendance: [],
          salaries: [],
          tanks: demoTanks,
          tankDips: [],
          calibrations: demoTankCalibrations,
          dispensers: demoDispensers,
          nozzles: demoNozzles,
          meterReadings: demoMeterReadings,
          fuelPrices: demoFuelPrices,
          shifts: demoShifts,
          sales: demoSales,
          suppliers: demoSuppliers,
          purchaseOrders: [],
          deliveries: demoDeliveries,
          supplierPayments: [],
          customers: demoCustomers,
          creditPayments: [],
          expenses: demoExpenses,
          cashbook: demoCashbookEntries,
          stockAdjustments: demoStockAdjustments,
          notifications: demoNotifications,
          auditLogs: demoAuditLogs,
          settings: initialSettings,
          activeRole: "Owner",
          currentUser: demoUsers[0],
          isLoggedIn: true,
        });
      },

      clearAllData: () => {
        set({
          tanks: [],
          tankDips: [],
          calibrations: [],
          dispensers: [],
          nozzles: [],
          meterReadings: [],
          shifts: [],
          sales: [],
          suppliers: [],
          purchaseOrders: [],
          deliveries: [],
          supplierPayments: [],
          customers: [],
          creditPayments: [],
          expenses: [],
          cashbook: [],
          stockAdjustments: [],
          notifications: [],
          auditLogs: [],
          employees: [],
          attendance: [],
          salaries: [],
          settings: { ...initialSettings, demoMode: false },
        });
      },

      exportDataJSON: () => {
        const state = get();
        const exportObj = {
          version: "1.0.0",
          exportedAt: new Date().toISOString(),
          station: state.station,
          users: state.users,
          employees: state.employees,
          tanks: state.tanks,
          dispensers: state.dispensers,
          nozzles: state.nozzles,
          fuelPrices: state.fuelPrices,
          shifts: state.shifts,
          sales: state.sales,
          suppliers: state.suppliers,
          deliveries: state.deliveries,
          customers: state.customers,
          expenses: state.expenses,
          cashbook: state.cashbook,
          stockAdjustments: state.stockAdjustments,
          auditLogs: state.auditLogs,
          settings: state.settings,
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importDataJSON: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (parsed && typeof parsed === "object") {
            set((state) => ({
              ...state,
              station: parsed.station || state.station,
              users: parsed.users || state.users,
              employees: parsed.employees || state.employees,
              tanks: parsed.tanks || state.tanks,
              dispensers: parsed.dispensers || state.dispensers,
              nozzles: parsed.nozzles || state.nozzles,
              fuelPrices: parsed.fuelPrices || state.fuelPrices,
              shifts: parsed.shifts || state.shifts,
              sales: parsed.sales || state.sales,
              suppliers: parsed.suppliers || state.suppliers,
              deliveries: parsed.deliveries || state.deliveries,
              customers: parsed.customers || state.customers,
              expenses: parsed.expenses || state.expenses,
              cashbook: parsed.cashbook || state.cashbook,
              stockAdjustments: parsed.stockAdjustments || state.stockAdjustments,
              auditLogs: parsed.auditLogs || state.auditLogs,
              settings: parsed.settings || state.settings,
            }));
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "petroflow_station_storage_v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
