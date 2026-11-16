import { PetroState } from "@/store/usePetroStore";
import { formatPaise, formatLitres } from "@/lib/format";

export interface InsightQueryResult {
  found: boolean;
  question: string;
  answerSummary: string;
  metricValue?: string;
  metricLabel?: string;
  sourceRecords?: {
    id: string;
    title: string;
    detail: string;
    badge?: string;
  }[];
  suggestedQuestions?: string[];
}

export function executeInsightQuery(queryText: string, state: PetroState): InsightQueryResult {
  const normalized = queryText.toLowerCase().trim();

  // 1. Diesel Stock Query
  if (
    normalized.includes("diesel") &&
    (normalized.includes("stock") || normalized.includes("remaining") || normalized.includes("volume") || normalized.includes("level"))
  ) {
    const dieselTanks = state.tanks.filter((t) => t.fuelType === "Diesel");
    const totalDiesel = dieselTanks.reduce((sum, t) => sum + t.currentStockLitres, 0);
    const capacity = dieselTanks.reduce((sum, t) => sum + t.capacityLitres, 0);
    const percentage = capacity > 0 ? ((totalDiesel / capacity) * 100).toFixed(1) : "0";

    return {
      found: true,
      question: queryText,
      metricLabel: "Total Diesel Remaining",
      metricValue: formatLitres(totalDiesel),
      answerSummary: `Currently, ${formatLitres(totalDiesel)} of High-Speed Diesel is available across ${dieselTanks.length} tank(s), representing ${percentage}% of total storage capacity.`,
      sourceRecords: dieselTanks.map((t) => ({
        id: t.id,
        title: t.name,
        detail: `${formatLitres(t.currentStockLitres)} / ${formatLitres(t.capacityLitres)} (Reorder at ${formatLitres(t.reorderLevelLitres)})`,
        badge: t.currentStockLitres <= t.reorderLevelLitres ? "Low Stock" : "Normal",
      })),
    };
  }

  // 2. Petrol Stock Query
  if (
    (normalized.includes("petrol") || normalized.includes("ms")) &&
    (normalized.includes("stock") || normalized.includes("remaining") || normalized.includes("level"))
  ) {
    const petrolTanks = state.tanks.filter((t) => t.fuelType === "Petrol" || t.fuelType === "Speed Petrol");
    const totalPetrol = petrolTanks.reduce((sum, t) => sum + t.currentStockLitres, 0);

    return {
      found: true,
      question: queryText,
      metricLabel: "Total Petrol (MS + Speed) Remaining",
      metricValue: formatLitres(totalPetrol),
      answerSummary: `Total petrol inventory across all underground tanks stands at ${formatLitres(totalPetrol)}.`,
      sourceRecords: petrolTanks.map((t) => ({
        id: t.id,
        title: `${t.name} (${t.fuelType})`,
        detail: `${formatLitres(t.currentStockLitres)} available (Cap: ${formatLitres(t.capacityLitres)})`,
        badge: t.fuelType,
      })),
    };
  }

  // 3. Highest Sales Shift Query
  if (
    (normalized.includes("shift") && (normalized.includes("highest") || normalized.includes("best") || normalized.includes("top"))) ||
    normalized.includes("which shift generated the highest sales")
  ) {
    // Aggregate completed sales per shift
    const shiftSalesMap = new Map<string, { totalPaise: number; count: number; litres: number }>();
    for (const sale of state.sales) {
      if (sale.status === "COMPLETED") {
        const curr = shiftSalesMap.get(sale.shiftId) || { totalPaise: 0, count: 0, litres: 0 };
        curr.totalPaise += sale.netAmountPaise;
        curr.count += 1;
        curr.litres += sale.quantityLitres;
        shiftSalesMap.set(sale.shiftId, curr);
      }
    }

    let bestShiftId = "";
    let maxSalesPaise = -1;
    shiftSalesMap.forEach((val, id) => {
      if (val.totalPaise > maxSalesPaise) {
        maxSalesPaise = val.totalPaise;
        bestShiftId = id;
      }
    });

    const shiftObj = state.shifts.find((s) => s.id === bestShiftId);
    const stats = shiftSalesMap.get(bestShiftId);

    if (shiftObj && stats) {
      return {
        found: true,
        question: queryText,
        metricLabel: `Top Shift: ${shiftObj.name} (${shiftObj.code})`,
        metricValue: formatPaise(stats.totalPaise),
        answerSummary: `Shift ${shiftObj.code} (${shiftObj.name} shift on ${shiftObj.date}) recorded the highest sales volume of ${formatPaise(stats.totalPaise)} across ${stats.count} transactions (${formatLitres(stats.litres)} dispensed).`,
        sourceRecords: [
          {
            id: shiftObj.id,
            title: `${shiftObj.code} — ${shiftObj.name} Shift (${shiftObj.date})`,
            detail: `Opened by ${shiftObj.openedBy} • Total Sales: ${formatPaise(stats.totalPaise)}`,
            badge: shiftObj.status,
          },
        ],
      };
    }
  }

  // 4. Today's Revenue or Total Sales
  if (
    normalized.includes("today") &&
    (normalized.includes("sale") || normalized.includes("revenue") || normalized.includes("collection") || normalized.includes("turnover"))
  ) {
    const todayStr = new Date().toISOString().split("T")[0];
    const todaySales = state.sales.filter((s) => s.createdAt.startsWith(todayStr) && s.status === "COMPLETED");
    const totalRevenuePaise = todaySales.reduce((acc, s) => acc + s.netAmountPaise, 0);
    const totalLitres = todaySales.reduce((acc, s) => acc + s.quantityLitres, 0);

    return {
      found: true,
      question: queryText,
      metricLabel: "Today's Gross Sales Revenue",
      metricValue: formatPaise(totalRevenuePaise),
      answerSummary: `Today's operations have generated ${formatPaise(totalRevenuePaise)} across ${todaySales.length} billed transactions (${formatLitres(totalLitres)} fuel delivered).`,
      sourceRecords: todaySales.map((s) => ({
        id: s.receiptNumber,
        title: `${s.receiptNumber} — ${s.fuelType} (${formatLitres(s.quantityLitres)})`,
        detail: `Amount: ${formatPaise(s.netAmountPaise)} • Method: ${s.payments.map((p) => p.method).join(", ")}`,
        badge: s.vehicleNumber || "Retail",
      })),
    };
  }

  // 5. Customer Credit / Debtors
  if (
    normalized.includes("credit") ||
    normalized.includes("debtor") ||
    normalized.includes("owe") ||
    normalized.includes("outstanding") ||
    normalized.includes("balance")
  ) {
    const topDebtors = [...state.customers].sort((a, b) => b.currentBalancePaise - a.currentBalancePaise);
    const highest = topDebtors[0];
    const totalReceivables = state.customers.reduce((sum, c) => sum + c.currentBalancePaise, 0);

    return {
      found: true,
      question: queryText,
      metricLabel: "Highest Outstanding Balance",
      metricValue: highest ? formatPaise(highest.currentBalancePaise) : "₹0.00",
      answerSummary: highest
        ? `${highest.name} holds the largest outstanding balance of ${formatPaise(highest.currentBalancePaise)} against their credit limit of ${formatPaise(highest.creditLimitPaise)}. Total station receivables stand at ${formatPaise(totalReceivables)}.`
        : "No outstanding customer credit balances found.",
      sourceRecords: topDebtors.slice(0, 5).map((c) => ({
        id: c.code,
        title: c.name,
        detail: `Balance: ${formatPaise(c.currentBalancePaise)} / Limit: ${formatPaise(c.creditLimitPaise)} (${c.vehicles?.length || 0} registered fleet vehicles)`,
        badge: c.type === "FLEET_COMPANY" ? "Fleet" : "Retail",
      })),
    };
  }

  // 6. Expenses / Electricity
  if (
    normalized.includes("expense") ||
    normalized.includes("electricity") ||
    normalized.includes("generator") ||
    normalized.includes("spending")
  ) {
    const electricityExpenses = state.expenses.filter((e) => e.category.toLowerCase().includes("electricity"));
    const totalElectricity = electricityExpenses.reduce((sum, e) => sum + e.amountPaise, 0);
    const totalAllExpenses = state.expenses.reduce((sum, e) => sum + e.amountPaise, 0);

    if (normalized.includes("electricity")) {
      return {
        found: true,
        question: queryText,
        metricLabel: "Total Electricity Spend",
        metricValue: formatPaise(totalElectricity),
        answerSummary: `Recorded electricity expenditure stands at ${formatPaise(totalElectricity)} across ${electricityExpenses.length} voucher(s).`,
        sourceRecords: electricityExpenses.map((e) => ({
          id: e.voucherNumber,
          title: `${e.category}: ${e.description}`,
          detail: `Amount: ${formatPaise(e.amountPaise)} • Paid to: ${e.paidTo}`,
          badge: e.status,
        })),
      };
    }

    return {
      found: true,
      question: queryText,
      metricLabel: "Total Station Expenses",
      metricValue: formatPaise(totalAllExpenses),
      answerSummary: `Total operational expenditure recorded across all categories is ${formatPaise(totalAllExpenses)}.`,
      sourceRecords: state.expenses.slice(0, 5).map((e) => ({
        id: e.voucherNumber,
        title: `${e.category} — ${e.description}`,
        detail: `Amount: ${formatPaise(e.amountPaise)} • Method: ${e.paymentMethod}`,
        badge: e.status,
      })),
    };
  }

  // Fallback: Not understood
  return {
    found: false,
    question: queryText,
    answerSummary:
      "I couldn't locate records matching this query. Insights operates deterministically on station records without external APIs. Try asking one of the verified station queries below.",
    suggestedQuestions: [
      "How much diesel stock is remaining?",
      "Which shift generated the highest sales this week?",
      "What is today's total revenue?",
      "Who owes the highest credit balance?",
      "How much was spent on electricity?",
    ],
  };
}
