# PETROFLOW — Backend Handoff Specification

This document defines the RESTful endpoints, relational entity specifications, and validation rules required to swap the client-side persistent Zustand layer (`store/usePetroStore.ts`) for a production backend (PostgreSQL / Go / Node.js).

---

## 1. Core Endpoints Specification

### Authentication & RBAC
- `POST /api/v1/auth/login`: Authenticate staff credentials, return JWT & Role.
- `POST /api/v1/auth/logout`: Invalidate session token.
- `GET  /api/v1/auth/permissions`: Fetch current role permission matrix.
- `PUT  /api/v1/auth/permissions`: Update role permission matrix (Owner only).

### Shifts & Reconciliation
- `GET  /api/v1/shifts`: List shift records with date & status filters.
- `POST /api/v1/shifts/open`: Open new shift with starting cash float.
- `POST /api/v1/shifts/:id/close`: Submit closing cash, calculate isolated tender reconciliation.
- `POST /api/v1/shifts/:id/approve`: Authorize cash variance and lock shift (Owner/GM).
- `POST /api/v1/shifts/:id/readings`: Record opening/closing nozzle meter totalizers.
- `PUT  /api/v1/meter-readings/:id/correct`: Submit authorized meter reading correction with mandatory reason.

### Forecourt Equipment
- `GET  /api/v1/dispensers`: Fetch dispenser units and mapped nozzles.
- `POST /api/v1/dispensers`: Register new multi-product dispenser.
- `PUT  /api/v1/dispensers/:id`: Update hardware controller settings (IP, port, protocol).
- `POST /api/v1/nozzles`: Register nozzle and map to fuel tank.

### Fuel & Tank Inventory
- `GET  /api/v1/tanks`: Fetch underground storage tanks with book stock & calibration.
- `POST /api/v1/tanks`: Register new calibrated UST.
- `POST /api/v1/tanks/:id/dips`: Record daily physical dip reading in cm (auto-calculates litres via strapping table).
- `POST /api/v1/tanks/:id/adjust`: Commit authorized stock adjustment (evaporation/shortage/excess) with mandatory reason.

### Sales & Commercial POS
- `GET  /api/v1/sales`: Paginated sales register with filters (fuel, tender, vehicle, date).
- `POST /api/v1/sales`: Fast POS billing transaction (atomic: deducts tank stock, updates totalizer, posts customer ledger, records cashbook).
- `POST /api/v1/sales/:id/reverse`: Reverse transaction with refund and stock restoration (original marked REVERSED, never deleted).

### OMC Suppliers & Purchases
- `GET  /api/v1/suppliers`: OMC supplier directory and outstanding balance.
- `POST /api/v1/suppliers`: Register supplier with GSTIN validation.
- `POST /api/v1/deliveries/verify`: Inward tanker verification, multi-tank allocation, and shortage logging.
- `POST /api/v1/suppliers/:id/payments`: Remittance against supplier invoice ledger.

### Customers, Credit & Fleet
- `GET  /api/v1/customers`: Credit accounts and registered fleet vehicles.
- `POST /api/v1/customers`: Register credit customer and credit limit.
- `POST /api/v1/customers/:id/payments`: Record debt recovery receipt.
- `GET  /api/v1/customers/:id/statement`: Generate periodic fleet statement data.

### Expenses & Cashbook
- `GET  /api/v1/expenses`: Filterable voucher ledger across 9 statutory categories.
- `POST /api/v1/expenses`: Create expense voucher (automatically logs cashbook outflow if cash).
- `GET  /api/v1/cashbook`: Daily cashbook ledger (inflows, outflows, running balance).
- `POST /api/v1/cashbook/banking`: Record bank deposit or withdrawal.

### Audit & Security
- `GET  /api/v1/audit-logs`: Immutable event logs with before/after state diffs.

---

## 2. Critical Database Invariants & Constraints

1. **Integer Money Storage**: All monetary fields (`netAmountPaise`, `currentBalancePaise`, `monthlySalaryPaise`) must be stored as 64-bit integers (BIGINT paise) to prevent IEEE-754 floating-point drift.
2. **Immutable Financial History**: `sales`, `meter_readings`, and `cashbook_entries` must never allow hard `DELETE` queries. Cancellations must be recorded as explicit reversal entries.
3. **Strict Tender Separation**: Cash, UPI, Card, and Fleet Credit must always remain distinct ledger accounts in shift reconciliation and never be collapsed into a generic "Total Collection" column.
4. **Tank Stock Invariant**:
   $$\text{BookStock} = \text{Opening} + \sum \text{Deliveries} - \sum \text{SalesLitres} - \sum \text{RecordedLosses} \pm \sum \text{Adjustments}$$
5. **Nozzle Sales Invariant**:
   $$\sum \text{POS Litres for Nozzle } N \approx \text{Closing Totalizer} - \text{Opening Totalizer} - \text{Testing Litres}$$
