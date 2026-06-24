import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib/cjs";

import {
  type MonthlyReportData,
  formatCurrency,
  formatNumber,
  formatTransactionDate,
} from "@/utils/reporting";

const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const MARGIN_X = 40;
const TOP_MARGIN = 40;
const BOTTOM_MARGIN = 34;
const TABLE_ROW_HEIGHT = 24;
const HEADER_BG = rgb(0.95, 0.55, 0.18);
const BORDER = rgb(0.84, 0.85, 0.88);
const TEXT = rgb(0.13, 0.16, 0.2);
const MUTED = rgb(0.44, 0.48, 0.55);
const LIGHT_BG = rgb(0.98, 0.98, 0.99);

function truncateText(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) {
    return text;
  }

  let output = text;
  while (output.length > 0 && font.widthOfTextAtSize(`${output}...`, size) > maxWidth) {
    output = output.slice(0, -1);
  }

  return output ? `${output}...` : "";
}

function drawSummaryCard(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  regular: PDFFont,
  bold: PDFFont
) {
  page.drawRectangle({
    x,
    y: y - 56,
    width,
    height: 56,
    color: LIGHT_BG,
    borderColor: BORDER,
    borderWidth: 1,
  });

  page.drawText(label, {
    x: x + 12,
    y: y - 18,
    size: 9,
    font: regular,
    color: MUTED,
  });

  page.drawText(truncateText(value, bold, 16, width - 24), {
    x: x + 12,
    y: y - 40,
    size: 16,
    font: bold,
    color: TEXT,
  });
}

function drawTableHeader(page: PDFPage, y: number, bold: PDFFont) {
  const columns = [
    { key: "date", label: "Tanggal", width: 118 },
    { key: "name", label: "Nama", width: 180 },
    { key: "package", label: "Paket", width: 150 },
    { key: "phone", label: "No. HP", width: 110 },
    { key: "amount", label: "Total", width: 160 },
  ];

  let currentX = MARGIN_X;
  columns.forEach((column) => {
    page.drawRectangle({
      x: currentX,
      y: y - TABLE_ROW_HEIGHT,
      width: column.width,
      height: TABLE_ROW_HEIGHT,
      color: HEADER_BG,
      borderColor: HEADER_BG,
      borderWidth: 1,
    });

    page.drawText(column.label, {
      x: currentX + 6,
      y: y - 16,
      size: 9,
      font: bold,
      color: rgb(1, 1, 1),
    });

    currentX += column.width;
  });
}

function drawTableRow(
  page: PDFPage,
  row: MonthlyReportData["transactions"][number],
  y: number,
  index: number,
  regular: PDFFont,
  bold: PDFFont
) {
  const cells = [
    { text: formatTransactionDate(row.created_at), width: 118, align: "left" as const },
    { text: row.name, width: 180, align: "left" as const },
    { text: row.package, width: 150, align: "left" as const },
    { text: row.phone, width: 110, align: "left" as const },
    { text: formatCurrency(row.total_spending), width: 160, align: "right" as const },
  ];

  let currentX = MARGIN_X;

  cells.forEach((cell) => {
    page.drawRectangle({
      x: currentX,
      y: y - TABLE_ROW_HEIGHT,
      width: cell.width,
      height: TABLE_ROW_HEIGHT,
      color: index % 2 === 0 ? rgb(1, 1, 1) : LIGHT_BG,
      borderColor: BORDER,
      borderWidth: 1,
    });

    const safeText = truncateText(
      cell.text,
      cell.align === "right" ? bold : regular,
      9,
      cell.width - 8
    );
    const textWidth = (cell.align === "right" ? bold : regular).widthOfTextAtSize(safeText, 9);
    const textX =
      cell.align === "right" ? currentX + cell.width - textWidth - 6 : currentX + 4;

    page.drawText(safeText, {
      x: textX,
      y: y - 16,
      size: 9,
      font: cell.align === "right" ? bold : regular,
      color: TEXT,
    });

    currentX += cell.width;
  });
}

function addPage(doc: PDFDocument): PDFPage {
  return doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
}

function drawReportHeader(page: PDFPage, report: MonthlyReportData, regular: PDFFont, bold: PDFFont) {
  page.drawText("Laporan Transaksi Bulanan", {
    x: MARGIN_X,
    y: PAGE_HEIGHT - TOP_MARGIN,
    size: 24,
    font: bold,
    color: TEXT,
  });

  page.drawText(`Periode: ${report.monthLabel}`, {
    x: MARGIN_X,
    y: PAGE_HEIGHT - TOP_MARGIN - 26,
    size: 11,
    font: regular,
    color: MUTED,
  });

  page.drawText(`Dibuat: ${report.generatedAtLabel}`, {
    x: MARGIN_X,
    y: PAGE_HEIGHT - TOP_MARGIN - 42,
    size: 10,
    font: regular,
    color: MUTED,
  });
}

async function createMonthlyReportPdf(report: MonthlyReportData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = addPage(doc);
  drawReportHeader(page, report, regular, bold);

  const cardY = PAGE_HEIGHT - 110;
  const cardGap = 12;
  const cardWidth = (PAGE_WIDTH - MARGIN_X * 2 - cardGap * 3) / 4;
  drawSummaryCard(page, "Total Revenue", formatCurrency(report.summary.revenue), MARGIN_X, cardY, cardWidth, regular, bold);
  drawSummaryCard(page, "Jumlah Transaksi", formatNumber(report.summary.count), MARGIN_X + cardWidth + cardGap, cardY, cardWidth, regular, bold);
  drawSummaryCard(page, "Rata-rata", formatCurrency(report.summary.avgTransaction), MARGIN_X + (cardWidth + cardGap) * 2, cardY, cardWidth, regular, bold);
  drawSummaryCard(
    page,
    "Top Package",
    report.summary.topPackages[0]?.name || "-",
    MARGIN_X + (cardWidth + cardGap) * 3,
    cardY,
    cardWidth,
    regular,
    bold
  );

  const compareY = PAGE_HEIGHT - 190;
  page.drawRectangle({
    x: MARGIN_X,
    y: compareY - 42,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: 42,
    color: LIGHT_BG,
    borderColor: BORDER,
    borderWidth: 1,
  });
  page.drawText(
    `Perbandingan bulan lalu: ${formatCurrency(report.previousMonth.revenue)} dari ${formatNumber(
      report.previousMonth.count
    )} transaksi`,
    {
      x: MARGIN_X + 12,
      y: compareY - 18,
      size: 10,
      font: regular,
      color: TEXT,
    }
  );
  page.drawText(
    `Growth omzet: ${report.monthlyGrowth > 0 ? "+" : ""}${report.monthlyGrowth.toFixed(1)}%`,
    {
      x: MARGIN_X + 12,
      y: compareY - 31,
      size: 10,
      font: bold,
      color: TEXT,
    }
  );

  let currentY = PAGE_HEIGHT - 260;
  page.drawText("Daftar Transaksi", {
    x: MARGIN_X,
    y: currentY,
    size: 16,
    font: bold,
    color: TEXT,
  });
  currentY -= 18;

  drawTableHeader(page, currentY, bold);
  currentY -= TABLE_ROW_HEIGHT;

  report.transactions.forEach((transaction, index) => {
    if (currentY <= BOTTOM_MARGIN + TABLE_ROW_HEIGHT) {
      page = addPage(doc);
      page.drawText(`Daftar Transaksi (${report.monthLabel})`, {
        x: MARGIN_X,
        y: PAGE_HEIGHT - TOP_MARGIN,
        size: 16,
        font: bold,
        color: TEXT,
      });
      currentY = PAGE_HEIGHT - TOP_MARGIN - 26;
      drawTableHeader(page, currentY, bold);
      currentY -= TABLE_ROW_HEIGHT;
    }

    drawTableRow(page, transaction, currentY, index, regular, bold);
    currentY -= TABLE_ROW_HEIGHT;
  });

  if (report.transactions.length === 0) {
    page.drawRectangle({
      x: MARGIN_X,
      y: currentY - 48,
      width: PAGE_WIDTH - MARGIN_X * 2,
      height: 48,
      color: LIGHT_BG,
      borderColor: BORDER,
      borderWidth: 1,
    });
    page.drawText("Tidak ada transaksi pada periode ini.", {
      x: MARGIN_X + 12,
      y: currentY - 28,
      size: 11,
      font: regular,
      color: MUTED,
    });
  }

  return doc.save();
}

async function downloadPdfOnWeb(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

async function sharePdfOnNative(base64: string, filename: string) {
  if (!FileSystem.cacheDirectory) {
    throw new Error("Cache directory tidak tersedia");
  }

  const fileUri = `${FileSystem.cacheDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Fitur berbagi file tidak tersedia di perangkat ini");
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "application/pdf",
    dialogTitle: "Bagikan report transaksi",
    UTI: "com.adobe.pdf",
  });
}

export async function exportMonthlyReportPdf(report: MonthlyReportData): Promise<void> {
  const bytes = await createMonthlyReportPdf(report);

  if (Platform.OS === "web") {
    await downloadPdfOnWeb(bytes, report.fileLabel);
    return;
  }

  const base64 = await PDFDocument.load(bytes).then((doc) => doc.saveAsBase64({ dataUri: false }));
  await sharePdfOnNative(base64, report.fileLabel);
}
