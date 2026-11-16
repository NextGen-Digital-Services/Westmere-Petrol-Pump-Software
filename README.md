# PETROFLOW v2 — Station Management (Indian Oil Retail Outlet)

An enterprise petrol pump (fuel retail outlet) dealership management web application designed for an **Indian Oil Corporation Limited (IOCL)** dealership. Built with the **LogiVenture visual language**: clean light surfaces (`#FFFFFF` / `#F6F7FB`), bold readable sans-serif typography (**Plus Jakarta Sans** headings and **Inter** body), official Indian Oil saffron (`#F37021`) and deep navy blue (`#1D3F8F`), product & tender colour badges, and fluid Framer Motion animations.

Engineered as a **FRONTEND-ONLY build** (no external backend, no external database, no third-party APIs) with strict relational data integrity in a client-side persistent **Zustand** layer (backed by `localStorage`), pure unit-tested financial formulas in integer paise, and full Role-Based Access Control (RBAC).

---

## 1. Quick Setup & Run Instructions

```bash
# Install dependencies
npm install

# Run financial calculation unit tests
npm test

# Run development server
npm run dev

# Build production application (25 static pages)
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to launch the dealership terminal.

---

## 2. Key v2 Features & Capabilities

### 🎥 Cinematic Video Login (`/login`)
- **Split-Screen Design**: Left 55% video panel (`public/media/login-banner.mp4`) with poster fallback (`login-poster.jpg`), rich gradient overlay, and 3 animated trust points (IOCL Daily 06:00 AM Rates, Forecourt Automation, Regulatory Vault).
- **One-Click Role Quick Switcher**: Instant login for all 6 operational roles with pre-filled credentials.

### 🎨 In-Code SVG Forecourt Illustration Library (`components/illustrations/`)
- Bespoke SVG vector components with theme integration:
  - `StationBrand`: Official Indian Oil wordmark and uploadable dealer logo.
  - `DispenserIllustration`: Dual-sided Multi-Product Dispenser (MPD) with digital totalizer.
  - `NozzleIllustration`: Fuel-colored grip (Petrol orange, Diesel blue, XP95 green) with animated droplet flow.
  - `TankIllustration`: Cutaway underground storage tank (UST) with dynamic fuel height level.
  - `EquipmentIllustrations`: Road tanker truck, SERVO lubricant bottle, oil drum, hydrometer, pressure gauge.
  - `PaymentIllustrations`: Indian Rupee cash notes, UPI QR standee, Card POS terminal, Credit fleet ledger, Safe vault.
  - `OperationsIllustrations`: Shift clock, employee badge, shield audit, regulatory doc, 06:00 AM price tag, calculator.
  - `EmptyStateIllustration`: Illustrated forecourt empty state.

### ⚡ Framer Motion Animation Primitives (`components/animations/`)
- `LivePulseBadge`: Pulsating indicator for active shifts, online dispensers, and live forecourt status.
- `AnimatedKpiCard`: LogiVenture KPI cards with top accent stripe, count-up numeric transitions, and delta chips.
- `AnimatedTank`: Cutaway tank rack card with animated liquid wave fill, capacity bars, and reorder warnings.
- `OdometerMeter`: Rolling mechanical digit odometer animation for dispenser totalizers.
- `PageTransition`: Smooth slide-fade transitions across all routes.

### 🧭 Navigation, Help Drawer & Product Tour
- **TopBar**: Dynamic 06:00 AM price ticker (Petrol, Diesel, XP95), active shift status pill, real-time ticking clock, search, help drawer trigger, dark/light theme toggle, and Owner role preview switcher.
- **HelpDrawer (`?` key or button)**: Searchable Indian Oil forecourt glossary (MS, HSD, Decantation, Dip, Ullage, Totalizer, Strapping, Hydrometer), 3 Standard Operating Procedures (SOPs), and keyboard shortcuts.
- **Interactive Product Tour**: 6-step guided walkthrough of the forecourt management system.

### ⛽ Forecourt Operations & IOCL Dealership Modules
1. **06:00 AM Daily Price Revision with Stock Revaluation (`/settings`)**:
   - Official 06:00 AM rate updates with instant inventory revaluation delta:
     $$\Delta = (\text{New Rate} - \text{Old Rate}) \times \text{Current Stock Litres}$$
2. **Road Tanker Decantation Wizard (`/purchases`)**:
   - 3-step structured decantation:
     - *Step 1: Security & Seals* — Tanker TT number, challan, TT compartments, PESO seal numbers.
     - *Step 2: Density & Ullage* — Hydrometer density @ 15°C comparison against invoice density, water-finding paste dip, tank ullage (free volume) check.
     - *Step 3: Discharge & Shortage* — Multi-tank allocation, transit shortage calculation against permissible evaporation allowance.
3. **IOCL Dealer Account Panel (`/purchases`)**:
   - Live CC / Indent balance, "Funds required for tomorrow's loading" interactive calculator, and remittance history.
4. **Daily Quality Checks Register (`/inventory`)**:
   - Density @ 15°C with ASTM 53B conversion table, water dip check (water paste test), filter paper test for Petrol, and visual appearance logging.
5. **5-Litre Conical Measure Pump Testing (`/dispensers`)**:
   - Weights & Measures stamped measure testing, nozzle calibration deduction, and test-return pours to underground tanks.
6. **Forecourt Legal Metrology & Asset Tracking (`/compliance`)**:
   - Nozzle stamping certificates, Weights & Measures inspection due dates, and Forecourt Asset register (DG Set, Air Tower, UPS, STP pumps) with AMC service tickets.
7. **Shift Closing Currency Denomination Sheet (`/shifts`)**:
   - Detailed safe cash breakdown sheet (₹500, ₹200, ₹100, ₹50, ₹20, ₹10, coins) with live variance reconciliation and Owner/GM sign-off workflow.
8. **Credit Ageing Buckets (`/customers`)**:
   - Receivables visual ageing strip: 0–7 Days (Current), 8–15 Days, 16–30 Days, and 30+ Days (Overdue) with vehicle quotas and settlement receipts.
9. **SERVO Packaged Lubricants Master & POS (`/compliance`)**:
   - Indian Oil SERVO engine oils (4T, Super, Pride, Brake Fluid) with stock tracking and fast POS sales modal.

---

## 3. Demo User Credentials & Role Matrix

| Role | Demo Name | Email | Password | Clearance / Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Owner** | Vikramaditya Singhania | `owner@petroflow.in` | `owner123` | **Full Clearance**: Financial statements, gross profit, dealer account, settings, audit trails, and role preview. |
| **General Manager** | Rajesh Nair | `gm@petroflow.in` | `gm123` | Operations oversight, tanker decantation sign-off, shift variance approvals, and regulatory compliance. |
| **Shift Manager** | Amit Verma | `shiftmanager@petroflow.in` | `shift123` | Shift opening/closing, denomination cash count, daily dips, 5L measure testing, and quality register. |
| **Cashier** | Priya Sharma | `cashier@petroflow.in` | `cashier123` | Fast POS billing, split tender settlement, credit collection receipts, and thermal receipt printing. |
| **Pump Operator** | Ramesh Kumar | `operator@petroflow.in` | `operator123` | Forecourt island dispensing on assigned nozzles (DSP-01 Island A). |
| **Accountant** | Sunita Joshi | `accountant@petroflow.in` | `accountant123` | Accounts payable, OMC remittances, fleet credit statements, cashbook ledger, and statutory VAT/GST exports. |

---

## 4. Pure Mathematical Invariants (`lib/calc/index.ts`)

All financial aggregations use **integer paise** (₹1.00 = 100 paise) to eliminate floating-point rounding errors:

1. **Nozzle Dispensing Volume**:
   $$\text{Volume} = \text{isRollover} \ ? \ (\text{MaxMeter} - \text{Opening} + \text{Closing}) : (\text{Closing} - \text{Opening})$$
   $$\text{Sale Litres} = \max(0, \text{Volume} - \text{TestingLitres})$$

2. **Underground Tank Book Stock**:
   $$\text{Book Stock} = \text{Opening} + \text{Decanted Deliveries} - \text{Metered Sales} - \text{Losses} \pm \text{Adjustments}$$

3. **Strapping Table Linear Interpolation**:
   $$\text{Litres} = L_1 + \frac{\text{Dip} - D_1}{D_2 - D_1} \times (L_2 - L_1)$$

4. **Shift Cash & Tender Reconciliation**:
   $$\text{Expected Collection} = \text{Total Sales} - \text{Credit Sales}$$
   $$\text{Expected Till Cash} = \text{Expected Collection} - \text{UPI} - \text{Card} - \text{Cash Expenses}$$
   $$\text{Cash Variance} = \text{Actual Denomination Count} - \text{Expected Till Cash}$$

5. **Stock Revaluation Delta**:
   $$\Delta_{\text{Reval}} = (\text{Price}_{\text{new}} - \text{Price}_{\text{old}}) \times \text{Current Stock Litres}$$

---

## 5. Architectural & Design Decisions

1. **Indian Oil LogiVenture Design System**:
   - Default: High-contrast **Light Theme** with rounded-2xl cards and soft status badges.
   - Saffron (`#F37021`), Navy Blue (`#1D3F8F`), Emerald (`#10B981`), Amber (`#F59E0B`), Rose (`#F43F5E`).
   - Official IOCL dealer logo upload support in `/settings` with live forecourt preview.
2. **Statutory Indian Fuel Taxation**:
   - Motor Spirit (Petrol) and High-Speed Diesel remain outside the GST schedule under Section 9(2) of the CGST Act; state-level VAT and statutory cess are isolated and reported on compliance summaries.
3. **Forecourt Automation Hardware Integration Advisory**:
   - The Dispenser Integration panel provides protocol profiles for Gilbarco DART, Wayne Current Loop, and IFSF-LON controllers with simulated live feeds.
4. **Deterministic Natural Language Insights**:
   - Natural language queries (*"Which shift generated the highest sales?"*, *"Show diesel remaining"*) are computed deterministically over local relational store collections with zero external API calls.
