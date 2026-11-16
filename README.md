# PETROFLOW — Station Management

An enterprise petrol pump (fuel retail outlet) management web application engineered with Italian editorial minimalism aesthetics, strict relational data integrity in a client-side persistent Zustand layer, and full operational capability covering opening shifts, nozzle meter tracking, POS billing, tank inventory & calibration, supplier deliveries, fleet management, expenses/cashbook, GST & accounting exports, and business insights.

Built as a **frontend-only, zero-backend** application using `localStorage` persistence, pure unit-tested financial formulas, and full role-based access control (RBAC).

---

## 1. Quick Setup & Run Instructions

```bash
# Install dependencies
npm install

# Run unit tests verifying calculation formulas
npm test

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to access the station terminal.

---

## 2. Demo User Credentials & Role Matrix

A collapsible quick-login panel is provided on the login page (`/login`) allowing 1-click access to all 6 operational roles:

| Role | Name | Email | Clearance / Permissions |
| :--- | :--- | :--- | :--- |
| **Owner** | Vikramaditya Singhania | `owner@petroflow.in` | **Everything**: Full financials, gross margins, supplier payables, settings, audit logs, role preview. |
| **General Manager** | Rajesh Nair | `gm@petroflow.in` | Operations, deliveries verification, stock adjustments, shift variance approvals, reports. |
| **Shift Manager** | Amit Verma | `shiftmanager@petroflow.in` | Shift opening/closing, meter logging, daily dips, staff attendance, shift cash reconciliation. |
| **Cashier** | Priya Sharma | `cashier@petroflow.in` | POS billing, split tender settlement, credit collection receipts. |
| **Pump Operator** | Ramesh Kumar | `operator@petroflow.in` | Forecourt billing on assigned nozzles (DSP-01 Island A). |
| **Accountant** | Sunita Joshi | `accountant@petroflow.in` | Accounts payable, customer credit ledger, cashbook entries, statutory tax & VAT reports. |

> **Role Switcher**: When logged in as **Owner**, an interactive "Role Preview" switcher in the top bar allows previewing the interface exactly as seen by any other role.

---

## 3. Data Model Summary (Normalized Relational Schema)

The state layer (`store/usePetroStore.ts`) models relational entities with unique sequential business identifiers (`TXN-2026-000123`, `SH-2026-0042`, etc.), timestamps, and user references:

- **Station**: Name, RO Code, Oil Company, Address, GSTIN, VAT TIN.
- **Tanks & USTs**: Capacity (L), Reorder Level, Current Stock, Dead Stock, Strapping Dimensions.
- **Tank Calibrations**: Stepwise Dip-to-Litre strapping points (`dipCm` to `litres`) with linear interpolation.
- **Dispensers & Nozzles**: Forecourt island mapping, make/model, communication protocol, current electronic totalizer.
- **Meter Readings**: Opening, Closing, Testing pours deduction, Net sale volume, Rollover flag.
- **Shifts & Assignments**: Opening cash float, Closing cash, Expected cash, Variance, Manager/Owner approval lock.
- **Sales & Payments**: Nozzle reference, fuel product, quantity, price/L, split tenders (Cash, UPI, Card, Credit).
- **Suppliers & Deliveries**: OMC depots (IOCL/BPCL), challans, invoices, reported density, inward tank allocation, shortage tracking.
- **Customers & Fleet**: Fleet transport companies, enrolled vehicles with quotas and drivers, credit limit and ledger balance.
- **Expenses & Cashbook**: 9 statutory categories, receipt attachments, daily cashbook inflows/outflows, bank deposits.
- **Audit Logs**: Tamper-proof event logs with before/after state diff inspection.

---

## 4. Operational & Financial Calculation Formulas (`/lib/calc`)

All financial figures are computed dynamically from underlying store records using integer paise to eliminate floating-point rounding drift:

1. **Nozzle Volume & Rollover**:
   $$\text{Volume} = (\text{isRollover}) \ ? \ (\text{RolloverMax} - \text{Opening} + \text{Closing}) : (\text{Closing} - \text{Opening})$$
   $$\text{Commercial Sale Litres} = \max(0, \text{Volume} - \text{TestingLitres})$$

2. **Tank Book Stock**:
   $$\text{Book Stock} = \text{Opening} + \text{Deliveries} - \text{Metered Sales} - \text{Losses} \pm \text{Approved Adjustments}$$

3. **Calibration Linear Interpolation**:
   $$\text{Litres} = L_1 + \frac{\text{Dip} - D_1}{D_2 - D_1} \times (L_2 - L_1)$$

4. **Shift Cashbox Reconciliation**:
   $$\text{Expected Collection} = \text{Total Sales} - \text{Credit Sales}$$
   $$\text{Expected Till Cash} = \text{Expected Collection} - \text{UPI} - \text{Card} - \text{Cash Expenses}$$
   $$\text{Cash Variance} = \text{Actual Cash Counted} - \text{Expected Till Cash}$$

5. **Gross Trading Margin**:
   $$\text{Gross Margin} = \text{Litres Sold} \times (\text{Sale Price} - \text{Depot Purchase Cost})$$

---

## 5. Architectural & Design Decisions

1. **Italian Editorial Minimalism**:
   - Palette: Deep Charcoal (`#171916`), Warm Ivory (`#F3F0E8`), Muted Italian Olive (`#737B54`), Brushed Brass (`#B69A63`), Brick (`#9E473D`).
   - Strict rules: Zero gradients, zero neon, zero glassmorphism, zero emoji, hairline 1px borders, Cormorant Garamond editorial titles, Manrope tabular numbers.
2. **Fuel Taxation (Statutory Indian Schedule)**:
   - Motor Spirit (Petrol) and High-Speed Diesel are currently outside GST levy under Section 9(2) of the CGST Act. The system defaults to "No GST on fuel", supporting state-level VAT and environmental cess while displaying a compliance notice.
3. **Hardware Integration Advisory**:
   - The Dispenser Integration panel provides configuration for Gilbarco DART, Wayne Current Loop, and IFSF-LON controllers with a clearly labeled simulated live feed and CSV/JSON upload. Real forecourt hardware requires physical loop converters and protocol adapters.
4. **Deterministic Natural Language Insights**:
   - The "Insights" module parses queries (e.g. *"Which shift generated the highest sales?"*, *"How much diesel stock is remaining?"*) deterministically over local store arrays without third-party AI APIs or synthetic latency.

---

## 6. How to Clear Demo Data & Start Fresh

To clear the demo dataset and start with a blank production station:
1. Navigate to **Settings** (`/settings`) from the sidebar.
2. Click on the **Data Lifecycle** tab.
3. Click **Clear All Records (Production Fresh Start)**.
4. The station will wipe all seed data and present designed empty states guiding the user to register their first tank, dispenser, and shift.
5. You can restore the 14+ day demo dataset at any time by clicking **Reset to Demo Data**.
