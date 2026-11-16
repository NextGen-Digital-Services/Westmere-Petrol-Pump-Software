import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Sale, Station } from "@/types";
import { formatPaise, formatLitres, formatDateTime } from "@/lib/format";

/**
 * Generates an Italian editorial style PDF business report.
 */
export function generatePdfReport(
  title: string,
  subtitle: string,
  headers: string[],
  rows: (string | number)[][],
  stationName: string = "PETROFLOW EXPRESS"
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(23, 25, 22); // Deep charcoal
  doc.text(stationName.toUpperCase(), 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(115, 123, 84); // Olive accent
  doc.text(title.toUpperCase(), 14, 25);

  doc.setFontSize(8);
  doc.setTextColor(103, 107, 97);
  doc.text(`Generated on: ${formatDateTime(new Date())} | ${subtitle}`, 14, 30);

  // Line separator
  doc.setDrawColor(216, 210, 194);
  doc.setLineWidth(0.4);
  doc.line(14, 33, 196, 33);

  // AutoTable
  autoTable(doc, {
    startY: 37,
    head: [headers],
    body: rows,
    theme: "plain",
    headStyles: {
      fillColor: [243, 240, 232],
      textColor: [23, 25, 22],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 32, 28],
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [250, 248, 244],
    },
    margin: { left: 14, right: 14 },
  });

  // Save PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.pdf`);
}

/**
 * Generates a formal fuel receipt PDF with station details.
 */
export function generatePdfReceipt(sale: Sale, station: Station) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 160], // Thermal / mini slip format
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(23, 25, 22);
  doc.text(station.name, 40, 12, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text(station.address, 40, 17, { align: "center", maxWidth: 70 });
  doc.text(`Tel: ${station.phone} | GSTIN: ${station.gstin || "N/A"}`, 40, 24, { align: "center" });

  doc.setDrawColor(200, 200, 200);
  doc.line(5, 27, 75, 27);

  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice: ${sale.receiptNumber}`, 6, 33);
  doc.text(`Date: ${formatDateTime(sale.createdAt)}`, 6, 38);
  doc.text(`Product: ${sale.fuelType}`, 6, 43);
  doc.text(`Rate / L: ${formatPaise(sale.pricePerLitrePaise)}`, 6, 48);
  doc.text(`Volume: ${formatLitres(sale.quantityLitres)}`, 6, 53);
  if (sale.vehicleNumber) {
    doc.text(`Vehicle: ${sale.vehicleNumber}`, 6, 58);
  }

  doc.line(5, 62, 75, 62);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL AMOUNT", 6, 68);
  doc.text(formatPaise(sale.netAmountPaise), 74, 68, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(`Payment: ${sale.payments.map((p) => `${p.method}: ${formatPaise(p.amountPaise)}`).join(", ")}`, 6, 74);

  doc.line(5, 78, 75, 78);
  doc.text("Fuel outside GST levy under Section 9(2) CGST.", 40, 83, { align: "center" });
  doc.text("Thank you for your patronage. Drive safely!", 40, 88, { align: "center" });

  doc.save(`Receipt_${sale.receiptNumber}.pdf`);
}
