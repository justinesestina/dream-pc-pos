import { jsPDF } from "jspdf";
import { company } from "./ops-data";
import { dateTime, num } from "./format";
import type { Customer, Quote } from "./types";

const php = (n: number) => `Php ${num(Math.round(n))}`;

let cached: Promise<string | undefined> | null = null;

/** Loads the company logo (PNG) as a base64 data-URI for embedding in PDFs. */
export function logoDataUrl(): Promise<string | undefined> {
  if (!cached) {
    cached = fetch("/dpc-logo.png")
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("logo fetch failed"))))
      .then(
        (b) =>
          new Promise<string>((res, rej) => {
            const fr = new FileReader();
            fr.onload = () => res(String(fr.result));
            fr.onerror = () => rej(new Error("logo read failed"));
            fr.readAsDataURL(b);
          }),
      )
      .catch(() => undefined);
  }
  return cached;
}

/**
 * Builds a real, printable PDF of the whole quotation — company logo + header,
 * customer block, cover message (if any), item lines, totals and notes — and
 * returns the jsPDF document plus a blob URL for preview/download.
 */
export async function createQuotePdf(quote: Quote, customer?: Customer) {
  const logo = await logoDataUrl();
  return buildQuotePdf(quote, customer, logo);
}

function buildQuotePdf(quote: Quote, customer?: Customer, logo?: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 44;

  /* ------------------------------- header ------------------------------- */
  let x = m;
  if (logo) {
    const props = doc.getImageProperties(logo);
    const h = 52;
    const w = Math.min(120, Math.round((props.width / props.height) * h));
    doc.addImage(logo, "PNG", m, m - 8, w, h);
    x = m + w + 18;
  }

  let y = m;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  const nameLines = doc.splitTextToSize(company.name, pw - x - 170);
  doc.text(nameLines, x, y);
  y += nameLines.length * 16 + 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 88, 102);
  const addrLines = doc.splitTextToSize(company.address, pw - x - 170);
  doc.text(addrLines, x, y);
  y += addrLines.length * 12 + 2;
  doc.text(`${company.phone} · ${company.email}`, x, y);
  y += 12;
  doc.setFontSize(7.5);
  doc.setTextColor(140, 148, 160);
  doc.text(`TIN ${company.tin}`, x, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(25, 90, 155);
  doc.text("QUOTATION", pw - m, m, { align: "right" });
  doc.setFont("courier", "bold");
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text(quote.id, pw - m, m + 17, { align: "right" });
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 88, 102);
  doc.text(dateTime(quote.createdAt), pw - m, m + 30, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(25, 90, 155);
  doc.text(quote.status.toUpperCase(), pw - m, m + 43, { align: "right" });

  y = Math.max(y, m + 54) + 8;
  divider(doc, m, y, pw - m, [222, 222, 228]);
  y += 18;

  /* ------------------------------ quoted to ------------------------------ */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(140, 148, 160);
  doc.text("QUOTED TO", m, y);
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text(quote.customerName, m, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 88, 102);
  for (const line of [customer?.address, customer?.phone, customer?.email]) {
    if (!line) continue;
    doc.text(line, m, y);
    y += 11;
  }
  y += 10;

  /* ------------------------------- message ------------------------------- */
  if (quote.subject || quote.message) {
    y = space(doc, ph, m, y, 90);
    if (quote.subject) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(17, 24, 39);
      doc.text(quote.subject, m, y);
      y += 14;
    }
    if (quote.message) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 68, 80);
      const msgLines = doc.splitTextToSize(quote.message, pw - m * 2);
      for (const l of msgLines) {
        y = space(doc, ph, m, y, 12);
        doc.text(l, m, y);
        y += 12;
      }
    }
    y += 6;
    divider(doc, m, y, pw - m, [232, 232, 238]);
    y += 16;
  }

  /* ------------------------------- items -------------------------------- */
  const drawTableHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(140, 148, 160);
    doc.text("DESCRIPTION", m, y);
    doc.text("QTY", 322, y, { align: "right" });
    doc.text("UNIT", 428, y, { align: "right" });
    doc.text("AMOUNT", pw - m, y, { align: "right" });
    divider(doc, m, y + 5, pw - m, [222, 222, 228]);
    y += 18;
  };

  drawTableHeader();
  for (const line of quote.items) {
    const descLines = doc.splitTextToSize(line.name, 262);
    const rowH = Math.max(descLines.length * 12 + (line.sku ? 12 : 0) + 8, 22);
    if (y + rowH > ph - m - 80) {
      doc.addPage();
      y = m;
      drawTableHeader();
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 68, 80);
    doc.text(descLines, m, y + 9);
    if (line.sku) {
      doc.setFont("courier", "normal");
      doc.setFontSize(7);
      doc.setTextColor(140, 148, 160);
      doc.text(line.sku, m, y + 9 + descLines.length * 12 + 2);
    }
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 68, 80);
    doc.text(String(line.qty), 322, y + 9, { align: "right" });
    doc.text(php(line.unitPrice), 428, y + 9, { align: "right" });
    doc.text(php(line.qty * line.unitPrice), pw - m, y + 9, { align: "right" });
    divider(doc, m, y + rowH - 3, pw - m, [238, 238, 242]);
    y += rowH;
  }
  y += 12;

  /* ------------------------------- totals -------------------------------- */
  const totRight = pw - m;
  const totLeft = totRight - 190;
  for (const t of [
    { label: "Subtotal", value: quote.subtotal },
    { label: "Discount", value: -quote.discount },
    { label: "Service total", value: quote.serviceTotal },
    { label: "VAT (12%)", value: quote.tax },
    { label: "Total", value: quote.total, strong: true },
  ]) {
    if (t.strong) {
      divider(doc, totLeft, y, totRight, [200, 200, 208]);
      y += 10;
    }
    const [r, g, b] = t.strong ? [17, 24, 39] : [80, 88, 102];
    const [s, w] = t.strong ? [10.5, "bold"] : [9, "normal"];
    doc.setFont("helvetica", w);
    doc.setFontSize(s);
    doc.setTextColor(r, g, b);
    doc.text(t.label.toUpperCase(), totLeft, y);
    doc.text(php(t.value), totRight, y, { align: "right" });
    y += t.strong ? 16 : 14;
  }
  y += 10;

  /* ------------------------------- notes -------------------------------- */
  if (quote.notes) {
    y = space(doc, ph, m, y, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(80, 88, 102);
    doc.text("NOTES", m, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 68, 80);
    const noteLines = doc.splitTextToSize(quote.notes, pw - m * 2);
    for (const l of noteLines) {
      y = space(doc, ph, m, y, 12);
      doc.text(l, m, y);
      y += 12;
    }
    y += 6;
  }

  /* ------------------------------- footer -------------------------------- */
  y = space(doc, ph, m, y, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 88, 102);
  const validUntil = new Date(quote.expiresAt).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const validLine = `Prepared by ${quote.preparedBy}  ·  Valid until ${validUntil}  ·  ${company.phone}`;
  doc.text(doc.splitTextToSize(validLine, pw - m * 2), m, y);

  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(140, 148, 160);

  return { doc, url: doc.output("bloburl") };
}

/** Adds a new page (with top margin) when the remaining space runs out. */
function space(doc: jsPDF, ph: number, m: number, y: number, needed: number) {
  if (y + needed > ph - m - 60) doc.addPage();
  return y + needed > ph - m - 60 ? m : y;
}

function divider(doc: jsPDF, x1: number, y: number, x2: number, color: [number, number, number]) {
  const [r, g, b] = color;
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.75);
  doc.line(x1, y, x2, y);
}
