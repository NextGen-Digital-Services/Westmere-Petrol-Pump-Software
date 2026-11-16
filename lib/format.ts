import { format as dateFnsFormat } from "date-fns";

/**
 * Formats an amount in integer paise to Indian currency format.
 * e.g. 12345600 -> "₹1,23,456.00"
 */
export function formatPaise(paise: number = 0, showSymbol: boolean = true): string {
  const rupees = (paise || 0) / 100;
  const isNegative = rupees < 0;
  const absRupees = Math.abs(rupees);
  
  const parts = absRupees.toFixed(2).split(".");
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian digit grouping: 3 digits at end, then groups of 2 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formattedInteger =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

  const prefix = isNegative ? "- " : "";
  const symbol = showSymbol ? "₹" : "";
  return `${prefix}${symbol}${formattedInteger}.${decimalPart}`;
}

/**
 * Formats litres with 2 decimal places.
 * e.g. 450 -> "450.00 L"
 */
export function formatLitres(litres: number = 0, showUnit: boolean = true): string {
  const formatted = (litres || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return showUnit ? `${formatted} L` : formatted;
}

/**
 * Formats standard dates into clean editorial formats.
 */
export function formatDate(dateStringOrObj: string | Date, formatStr: string = "dd MMM yyyy"): string {
  if (!dateStringOrObj) return "—";
  try {
    const d = typeof dateStringOrObj === "string" ? new Date(dateStringOrObj) : dateStringOrObj;
    if (isNaN(d.getTime())) return "—";
    return dateFnsFormat(d, formatStr);
  } catch {
    return "—";
  }
}

export function formatDateTime(dateStringOrObj: string | Date): string {
  return formatDate(dateStringOrObj, "dd MMM yyyy, hh:mm a");
}

export function formatTime(dateStringOrObj: string | Date): string {
  return formatDate(dateStringOrObj, "hh:mm a");
}

/**
 * Generates human-readable sequential business IDs:
 * TXN-2026-000123, SH-2026-0042, DEL-2026-0019, etc.
 */
let counter = Math.floor(Math.random() * 500) + 100;
export function generateEntityId(prefix: string): string {
  counter += 1;
  const year = new Date().getFullYear();
  const padded = String(counter).padStart(6, "0");
  return `${prefix}-${year}-${padded}`;
}

/**
 * Formats percentage with 1 or 2 decimals
 */
export function formatPercent(value: number): string {
  return `${(value || 0).toFixed(1)}%`;
}
