import { TankCalibrationPoint } from "@/types";

/**
 * Calculates nozzle volume given opening and closing meter readings,
 * handling optional meter rollover (e.g. 99,999 -> 0).
 */
export function calculateNozzleVolume(
  opening: number,
  closing: number,
  isRollover: boolean = false,
  rolloverMaxMeter: number = 999999.99
): number {
  if (isRollover) {
    if (closing > opening) {
      // Normal reading mistakenly marked rollover
      return Number((closing - opening).toFixed(2));
    }
    return Number((rolloverMaxMeter - opening + closing).toFixed(2));
  }
  const volume = closing - opening;
  return Number(Math.max(0, volume).toFixed(2));
}

/**
 * Calculates saleable litres by deducting pump testing / calibration pours.
 */
export function calculateSaleLitres(volume: number, testingLitres: number = 0): number {
  return Number(Math.max(0, volume - testingLitres).toFixed(2));
}

/**
 * Calculates Tank Book Stock:
 * Book stock = opening + deliveries - metered sales - recorded losses +/- approved adjustments
 */
export function calculateBookStock(
  openingStock: number,
  deliveries: number,
  meteredSales: number,
  recordedLosses: number = 0,
  approvedAdjustments: number = 0
): number {
  const stock = openingStock + deliveries - meteredSales - recordedLosses + approvedAdjustments;
  return Number(Math.max(0, stock).toFixed(2));
}

/**
 * Linearly interpolates dip reading in centimeters to litres using calibration chart points.
 */
export function interpolateDipToLitres(
  dipCm: number,
  calibrationPoints: TankCalibrationPoint[]
): number {
  if (!calibrationPoints || calibrationPoints.length === 0) return 0;
  if (dipCm <= 0) return 0;

  const sorted = [...calibrationPoints].sort((a, b) => a.dipCm - b.dipCm);

  if (dipCm <= sorted[0].dipCm) {
    return sorted[0].litres;
  }
  if (dipCm >= sorted[sorted.length - 1].dipCm) {
    return sorted[sorted.length - 1].litres;
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];
    if (dipCm >= p1.dipCm && dipCm <= p2.dipCm) {
      if (p2.dipCm === p1.dipCm) return p1.litres;
      const ratio = (dipCm - p1.dipCm) / (p2.dipCm - p1.dipCm);
      const litres = p1.litres + ratio * (p2.litres - p1.litres);
      return Number(litres.toFixed(2));
    }
  }

  return sorted[sorted.length - 1].litres;
}

/**
 * Shift reconciliation calculation:
 * - Expected Collection = Total Sales - Credit Sales
 * - Expected Cash = Expected Collection - UPI Collections - Card Collections - Cash Shift Expenses
 * - Cash Variance = Actual Cash - Expected Cash
 */
export interface ShiftReconciliationResult {
  totalSalesPaise: number;
  creditSalesPaise: number;
  expectedCollectionPaise: number;
  upiCollectionPaise: number;
  cardCollectionPaise: number;
  cashShiftExpensesPaise: number;
  expectedCashPaise: number;
  actualCashPaise: number;
  cashVariancePaise: number; // positive = surplus, negative = shortage
}

export function calculateShiftReconciliation(
  totalSalesPaise: number,
  creditSalesPaise: number,
  upiCollectionPaise: number,
  cardCollectionPaise: number,
  cashShiftExpensesPaise: number,
  actualCashPaise: number
): ShiftReconciliationResult {
  const expectedCollectionPaise = Math.max(0, totalSalesPaise - creditSalesPaise);
  const nonCashCollectionPaise = upiCollectionPaise + cardCollectionPaise;
  const expectedCashPaise = Math.max(
    0,
    expectedCollectionPaise - nonCashCollectionPaise - cashShiftExpensesPaise
  );
  const cashVariancePaise = actualCashPaise - expectedCashPaise;

  return {
    totalSalesPaise,
    creditSalesPaise,
    expectedCollectionPaise,
    upiCollectionPaise,
    cardCollectionPaise,
    cashShiftExpensesPaise,
    expectedCashPaise,
    actualCashPaise,
    cashVariancePaise,
  };
}

/**
 * Calculates gross margin and estimated profit based on purchase cost per litre.
 */
export function calculateGrossMargin(
  litresSold: number,
  salePricePaise: number,
  purchaseCostPaise: number
): { grossMarginPaise: number; marginPercentage: number } {
  if (litresSold <= 0) return { grossMarginPaise: 0, marginPercentage: 0 };
  const revenuePaise = litresSold * salePricePaise;
  const costPaise = litresSold * purchaseCostPaise;
  const grossMarginPaise = Math.round(revenuePaise - costPaise);
  const marginPercentage = revenuePaise > 0 ? (grossMarginPaise / revenuePaise) * 100 : 0;

  return {
    grossMarginPaise,
    marginPercentage: Number(marginPercentage.toFixed(2)),
  };
}

/**
 * Checks customer credit availability.
 */
export function canApproveCreditSale(
  currentBalancePaise: number,
  creditLimitPaise: number,
  saleAmountPaise: number
): { isAllowed: boolean; availableCreditPaise: number; excessPaise: number } {
  const availableCreditPaise = creditLimitPaise - currentBalancePaise;
  if (availableCreditPaise >= saleAmountPaise) {
    return {
      isAllowed: true,
      availableCreditPaise,
      excessPaise: 0,
    };
  }
  return {
    isAllowed: false,
    availableCreditPaise: Math.max(0, availableCreditPaise),
    excessPaise: saleAmountPaise - availableCreditPaise,
  };
}
