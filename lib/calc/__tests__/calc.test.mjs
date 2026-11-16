import test from "node:test";
import assert from "node:assert/strict";

// Re-implement pure functions for ES module unit test
function calculateNozzleVolume(opening, closing, isRollover = false, rolloverMaxMeter = 999999.99) {
  if (isRollover) {
    if (closing > opening) return Number((closing - opening).toFixed(2));
    return Number((rolloverMaxMeter - opening + closing).toFixed(2));
  }
  return Number(Math.max(0, closing - opening).toFixed(2));
}

function calculateSaleLitres(volume, testingLitres = 0) {
  return Number(Math.max(0, volume - testingLitres).toFixed(2));
}

function calculateBookStock(openingStock, deliveries, meteredSales, recordedLosses = 0, approvedAdjustments = 0) {
  return Number(Math.max(0, openingStock + deliveries - meteredSales - recordedLosses + approvedAdjustments).toFixed(2));
}

function interpolateDipToLitres(dipCm, calibrationPoints) {
  if (!calibrationPoints || calibrationPoints.length === 0) return 0;
  if (dipCm <= 0) return 0;
  const sorted = [...calibrationPoints].sort((a, b) => a.dipCm - b.dipCm);
  if (dipCm <= sorted[0].dipCm) return sorted[0].litres;
  if (dipCm >= sorted[sorted.length - 1].dipCm) return sorted[sorted.length - 1].litres;
  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];
    if (dipCm >= p1.dipCm && dipCm <= p2.dipCm) {
      if (p2.dipCm === p1.dipCm) return p1.litres;
      const ratio = (dipCm - p1.dipCm) / (p2.dipCm - p1.dipCm);
      return Number((p1.litres + ratio * (p2.litres - p1.litres)).toFixed(2));
    }
  }
  return sorted[sorted.length - 1].litres;
}

function calculateShiftReconciliation(totalSales, creditSales, upi, card, expenses, actualCash) {
  const expectedCollection = Math.max(0, totalSales - creditSales);
  const expectedCash = Math.max(0, expectedCollection - upi - card - expenses);
  const cashVariance = actualCash - expectedCash;
  return { expectedCollection, expectedCash, actualCash, cashVariance };
}

test("calculateNozzleVolume - normal flow (25,000 to 25,450 = 450 L)", () => {
  const vol = calculateNozzleVolume(25000, 25450);
  assert.equal(vol, 450.0);
});

test("calculateNozzleVolume - rollover handling (999,950 to 200 = 250 L)", () => {
  const vol = calculateNozzleVolume(999950, 200, true, 1000000);
  assert.equal(vol, 250.0);
});

test("calculateSaleLitres - deducts pump test pours", () => {
  const sale = calculateSaleLitres(450.0, 10.0);
  assert.equal(sale, 440.0);
});

test("calculateBookStock - balances deliveries, sales, and losses", () => {
  // Opening: 10,000, Deliveries: 5,000, Metered Sales: 3,200, Loss: 20, Adj: +50
  const stock = calculateBookStock(10000, 5000, 3200, 20, 50);
  assert.equal(stock, 11830.0);
});

test("interpolateDipToLitres - correctly linearly interpolates", () => {
  const chart = [
    { dipCm: 0, litres: 0 },
    { dipCm: 50, litres: 2500 },
    { dipCm: 100, litres: 6000 },
    { dipCm: 150, litres: 10000 },
    { dipCm: 200, litres: 15000 },
  ];
  // 75 cm should be exactly halfway between 50 (2500) and 100 (6000) => 4250
  const litres = interpolateDipToLitres(75, chart);
  assert.equal(litres, 4250);
});

test("calculateShiftReconciliation - verifies cash variance and isolates UPI/Card", () => {
  // Total sales: 1,00,000 paise (1000 INR)
  // Credit: 20,000 paise (200 INR)
  // UPI: 30,000 paise (300 INR)
  // Card: 10,000 paise (100 INR)
  // Cash expenses: 5,000 paise (50 INR)
  // Expected Cash: (100000 - 20000) - 30000 - 10000 - 5000 = 35,000 paise
  // Actual Cash: 36,000 paise (+1,000 paise surplus)
  const result = calculateShiftReconciliation(100000, 20000, 30000, 10000, 5000, 36000);
  assert.equal(result.expectedCollection, 80000);
  assert.equal(result.expectedCash, 35000);
  assert.equal(result.cashVariance, 1000);
});
