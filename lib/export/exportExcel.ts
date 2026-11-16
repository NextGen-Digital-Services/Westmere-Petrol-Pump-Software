import * as XLSX from "xlsx";

/**
 * Exports data table directly to XLSX Excel workbook.
 */
export function generateExcelReport(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}_${Date.now()}.xlsx`);
}
