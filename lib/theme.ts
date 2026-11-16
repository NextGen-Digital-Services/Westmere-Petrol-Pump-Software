/**
 * PETROFLOW Brand Palette & Fuel Colour Tokens
 * Inspired by Indian Oil Corporation Limited (IOCL)
 */

export const BRAND_COLORS = {
  // Primary IndianOil Brand Tones
  ioclSaffron: "#F37021",
  ioclSaffronDark: "#D65A10",
  ioclSaffronLight: "#FFF4ED",
  ioclBlue: "#1D3F8F",
  ioclBlueDark: "#142D69",
  ioclBlueLight: "#EEF2FB",

  // Fuel Product Colour Coding (Strictly consistent across all components)
  petrol: "#F37021",        // Petrol (Motor Spirit - MS) = Saffron Orange
  diesel: "#1D3F8F",        // Diesel (High Speed Diesel - HSD) = Deep Blue
  premiumPetrol: "#C8102E", // XP95 / XP100 = Crimson Red
  premiumDiesel: "#0E9AA7", // XTRAGREEN = Deep Teal
  lubricants: "#E0A100",    // Servo Oils & Lubes = Rich Amber

  // Tender / Payment Method Coding
  cash: "#1E9E5A",          // Physical Cash = Emerald Green
  upi: "#6B4EFF",           // UPI QR = Violet
  card: "#2B8CE6",          // Card POS = Sky Blue
  credit: "#D6456B",        // Credit / Fleet Ledger = Rose Pink

  // Status & Feedback
  success: "#1E9E5A",
  warning: "#E0A100",
  danger: "#DC2626",
  info: "#1D3F8F",

  // Neutrals (Slate based, never pure black)
  slate900: "#0F172A",
  slate800: "#1E293B",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate300: "#CBD5E1",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  slate50: "#F8FAFC",
  white: "#FFFFFF",
  surfaceLight: "#F6F7FB",
} as const;

export function getFuelColor(fuelType: string): string {
  switch (fuelType) {
    case "Petrol":
    case "Motor Spirit":
      return BRAND_COLORS.petrol;
    case "Diesel":
    case "High Speed Diesel":
      return BRAND_COLORS.diesel;
    case "Speed Petrol":
    case "XP95":
    case "XP100":
      return BRAND_COLORS.premiumPetrol;
    case "Premium Diesel":
    case "XTRAGREEN":
      return BRAND_COLORS.premiumDiesel;
    case "Lubricants":
    case "Engine Oil":
      return BRAND_COLORS.lubricants;
    default:
      return BRAND_COLORS.ioclSaffron;
  }
}

export function getPaymentMethodColor(method: string): string {
  switch (method) {
    case "CASH":
      return BRAND_COLORS.cash;
    case "UPI":
      return BRAND_COLORS.upi;
    case "CARD":
      return BRAND_COLORS.card;
    case "CREDIT":
      return BRAND_COLORS.credit;
    default:
      return BRAND_COLORS.slate600;
  }
}
