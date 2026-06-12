/**
 * Generate a sample AU tax invoice PDF for OCR upload testing.
 * Usage: node scripts/generate-test-invoice.mjs
 * Output: fixtures/sample-invoice-au.pdf
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const outDir = join(import.meta.dirname, "..", "fixtures");
const outPath = join(outDir, "sample-invoice-au.pdf");

const lines = [
  { text: "TAX INVOICE", size: 20, bold: true },
  { text: "", size: 12 },
  { text: "Pacific Bookkeeping Supplies Pty Ltd", size: 12, bold: true },
  { text: "ABN 12 345 678 901", size: 11 },
  { text: "Level 2, 100 George Street, Sydney NSW 2000", size: 11 },
  { text: "accounts@pacificbooks.example", size: 11 },
  { text: "", size: 12 },
  { text: "Bill to: Demo Client Co", size: 12, bold: true },
  { text: "42 Collins Street, Melbourne VIC 3000", size: 11 },
  { text: "", size: 12 },
  { text: "Invoice number: INV-2026-0042", size: 12 },
  { text: "Invoice date: 15/03/2026", size: 12 },
  { text: "Due date: 29/03/2026", size: 12 },
  { text: "Payment terms: Net 14 days", size: 12 },
  { text: "", size: 12 },
  { text: "Description                          Qty    Unit      Amount", size: 11, bold: true },
  { text: "----------------------------------------------------------------", size: 11 },
  { text: "Monthly bookkeeping subscription       1      $80.00    $80.00", size: 11 },
  { text: "Document scanning setup fee            1      $20.00    $20.00", size: 11 },
  { text: "", size: 12 },
  { text: "Subtotal (ex GST):                                           $100.00", size: 11 },
  { text: "GST (10%):                                                    $10.00", size: 11 },
  { text: "Total AUD:                                                  $110.00", size: 13, bold: true },
  { text: "", size: 12 },
  { text: "BSB 062-000  Account 1234 5678  Ref: INV-2026-0042", size: 10 },
  { text: "Test invoice for OCR upload testing only.", size: 10 },
];

function escapePdfText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildContentStream() {
  let y = 780;
  const parts = ["BT"];

  for (const line of lines) {
    const font = line.bold ? "/F2" : "/F1";
    parts.push(`${font} ${line.size} Tf`);
    parts.push(`50 ${y} Td`);
    parts.push(`(${escapePdfText(line.text)}) Tj`);
    parts.push("0 0 Td");
    y -= line.size + 8;
  }

  parts.push("ET");
  return parts.join("\n");
}

function buildPdf(contentStream) {
  const contentLength = Buffer.byteLength(contentStream, "utf8");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n`,
    `4 0 obj\n<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

  return pdf;
}

mkdirSync(outDir, { recursive: true });
const content = buildContentStream();
writeFileSync(outPath, buildPdf(content), "utf8");

console.log(`Created ${outPath}`);
console.log("Upload this file at /app/documents/new to test invoice OCR.");
