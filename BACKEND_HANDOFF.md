# PETROFLOW v2 — Backend Handoff Specification (Indian Oil RO Dealership)

This document specifies the RESTful endpoints, relational entity schemas, and business logic invariants required to replace the client-side persistent Zustand layer (`store/usePetroStore.ts`) with a production backend (Go / Node.js / Python with PostgreSQL).

---

## 1. RESTful API Endpoints Specification

### Authentication & Roles
- `POST /api/v1/auth/login`: Authenticate staff credentials, return JWT & active role.
- `POST /api/v1/auth/logout`: Invalidate session token.
- `GET  /api/v1/auth/permissions`: Fetch role permission matrix.
- `PUT  /api/v1/auth/permissions`: Update role permission matrix (Owner clearance).

### Shifts, Denominations & Forecourt Reconciliation
- `GET  /api/v1/shifts`: List shift records with date & status filters.
- `POST /api/v1/shifts/open`: Open new shift with starting cash float.
- `POST /api/v1/shifts/:id/close`: Submit shift closing with cash denomination breakdown sheet (`₹500`, `₹200`, `₹100`, `₹50`, `₹20`, `₹10`, coins) and meter totalizers.
- `POST /api/v1/shifts/:id/approve`: Owner/GM variance sign-off and shift lock.
- `POST /api/v1/shifts/:id/readings`: Record opening/closing nozzle meter totalizers.
- `PUT  /api/v1/meter-readings/:id/correct`: Submit authorized meter correction with mandatory reason and audit entry.

### Forecourt Equipment & Testing
- `GET  /api/v1/dispensers`: Fetch dispenser units and mapped nozzles.
- `POST /api/v1/dispensers`: Register new multi-product dispenser unit.
- `PUT  /api/v1/dispensers/:id`: Update hardware controller settings (IP, port, protocol).
- `POST /api/v1/nozzles`: Register nozzle and map to fuel tank.
- `GET  /api/v1/pump-tests`: Fetch 5-Litre conical measure test logs.
- `POST /api/v1/pump-tests`: Record 5-Litre Weights & Measures nozzle calibration test and tank return pour.

### Underground Storage Tanks & Quality Checks
- `GET  /api/v1/tanks`: Fetch UST records with book stock, dead stock, and strapping table.
- `POST /api/v1/tanks/:id/dips`: Record daily physical dip reading in cm (auto-interpolated via strapping table).
- `GET  /api/v1/quality-checks`: Fetch daily fuel quality check records.
- `POST /api/v1/quality-checks`: Record morning quality checks (density @ 15°C, temperature, water paste test, filter paper test, appearance).
- `POST /api/v1/tanks/:id/adjust`: Commit authorized stock adjustment with mandatory audit reason.

### Sales & Commercial POS
- `GET  /api/v1/sales`: Paginated sales register with filters (fuel, payment mode, vehicle, date).
- `POST /api/v1/sales`: Fast POS billing transaction (atomic: deducts UST stock, updates totalizer, posts customer ledger, records cashbook).
- `POST /api/v1/sales/:id/reverse`: Reverse transaction with refund and stock restoration (original marked REVERSED, never deleted).

### OMC Purchases, Tanker Decantation & Dealer Account
- `GET  /api/v1/suppliers`: OMC supplier directory and outstanding ledger.
- `POST /api/v1/deliveries/decant`: 3-step road tanker decantation wizard submission (TT compartments, PESO seals, hydrometer density comparison, ullage check, shortage logging).
- `GET  /api/v1/dealer-account`: Fetch IOCL dealer account balance, indent credit, and pending remittances.
- `PUT  /api/v1/dealer-account`: Update dealer account parameters and indent credit.
- `POST /api/v1/dealer-account/remit`: Submit bank RTGS/NEFT remittance to IOCL supply depot.

### Fleet Customers & Ageing Ledgers
- `GET  /api/v1/customers`: Credit accounts, registered fleet vehicles, and ageing buckets (0–7, 8–15, 16–30, 30+ days).
- `POST /api/v1/customers`: Register credit customer, credit limit, and vehicle quotas.
- `POST /api/v1/customers/:id/payments`: Record debt recovery receipt.
- `GET  /api/v1/customers/:id/statement`: Generate periodic fleet statement data for PDF/Excel.

### Statutory Compliance & Forecourt Assets
- `GET  /api/v1/compliance/documents`: Fetch statutory documents (PESO, Weights & Measures, Fire NOC, DPCC, GST).
- `POST /api/v1/compliance/documents`: Upload / update compliance document renewal dates.
- `GET  /api/v1/compliance/checklists`: Fetch daily inspection checklists.
- `POST /api/v1/compliance/checklists/sign-off`: Shift/General Manager forecourt checklist sign-off.
- `GET  /api/v1/compliance/assets`: Fetch forecourt asset register (DG Set, Air Tower, UPS, STP).
- `POST /api/v1/compliance/assets/:id/tickets`: Raise AMC service / breakdown ticket.

### SERVO Packaged Lubricants
- `GET  /api/v1/lubricants`: Fetch SERVO lubricants inventory master.
- `POST /api/v1/lubricants/sell`: Fast POS lubricant sale (deducts stock, logs cashbook entry).

---

## 2. Critical Database Invariants & Constraints

1. **Integer Money Storage**: All monetary fields (`netAmountPaise`, `currentBalancePaise`, `monthlySalaryPaise`, `totalInvoicePaise`) must be stored as 64-bit integers (`BIGINT` paise). Never use floating-point types (`FLOAT`, `DOUBLE`) for currency.
2. **Denomination Sheet Parity**:
   $$\text{Actual Cash} = (c_{500} \times 500 + c_{200} \times 200 + c_{100} \times 100 + c_{50} \times 50 + c_{20} \times 20 + c_{10} \times 10 + c_{\text{coins}}) \times 100 \text{ paise}$$
3. **Immutable Regulatory History**: Tables `sales`, `meter_readings`, `pump_tests`, `quality_checks`, and `audit_logs` must never permit hard SQL `DELETE` operations. Reversals must be recorded as explicit inverse transactions.
4. **Tank Book Stock Balance**:
   $$\text{BookStock} = \text{Opening} + \sum \text{DecantedDeliveries} - \sum \text{MeteredSales} - \sum \text{TestingPours} \pm \sum \text{Adjustments}$$
5. **Nozzle Dispensing Volume Balance**:
   $$\sum \text{POS Litres for Nozzle } N \approx \text{Closing Totalizer} - \text{Opening Totalizer} - \text{5L Test Pours}$$
6. **Strict Tender Isolation**: Cash, UPI, Card POS, and Fleet Credit must maintain separate ledger reconciliation columns and never be merged into a single indiscriminate cash figure.
