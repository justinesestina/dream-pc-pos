import { jsPDF } from "jspdf";
import { company } from "./ops-data";
import { dateTime, num } from "./format";
import { customerTypeLabel } from "./billing";
import type { Customer, BillingStatement } from "./types";

const php = (n: number) => `Php ${num(Math.round(n))}`;

let cachedLogo: Promise<string | undefined> | null = null;

/** Loads the company logo (PNG) as a base64 data-URI for embedding in PDFs. */
export function logoDataUrl(): Promise<string | undefined> {
  if (!cachedLogo) {
    cachedLogo = fetch("/dpc-logo.png")
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
  return cachedLogo;
}

/**
 * Builds a real, printable PDF of the whole billing statement — company logo +
 * header, customer block, item lines, additional charges, discount, tax,
 * previous balance, totals and payment history — and returns the jsPDF
 * document plus a blob URL for preview/download.
 */
export async function createBillingPdf(statement: BillingStatement, customer?: Customer) {
  const logo = await logoDataUrl();
  return buildBillingPdf(statement, customer, logo);
}

function buildBillingPdf(statement: BillingStatement, customer?: Customer, logo?: string) {
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
  doc.text("BILLING STATEMENT", pw - m, m, { align: "right" });
  doc.setFont("courier", "bold");
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text(statement.id, pw - m, m + 17, { align: "right" });
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 88, 102);
  doc.text(dateTime(statement.issuedAt), pw - m, m + 30, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(25, 90, 155);
  doc.text(statement.status.toUpperCase(), pw - m, m + 43, { align: "right" });

  y = Math.max(y, m + 54) + 8;
  divider(doc, m, y, pw - m, [222, 222, 228]);
  y += 18;

  /* ------------------------------ billed to ------------------------------ */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(140, 148, 160);
  doc.text("BILLED TO", m, y);
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text(statement.customerName, m, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 88, 102);
  doc.text(`Customer type: ${customerTypeLabel(statement.customerType)}`, m, y);
  y += 11;
  for (const line of [customer?.address, customer?.phone, customer?.email]) {
    if (!line) continue;
    doc.text(line, m, y);
    y += 11;
  }
  y += 10;

  /* --------------------------- statement details ------------------------- */
  const dueLabel = new Date(statement.dueAt).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 88, 102);
  const rightX = pw - m;
  doc.text("Due date:", rightX - 230, m + 54);
  doc.setFont("courier", "normal");
  doc.text(dueLabel, rightX, m + 54, { align: "right" });
  if (statement.referenceNumber) {
    doc.setFont("helvetica", "normal");
    doc.text("Reference:", rightX - 230, m + 68);
    doc.setFont("courier", "normal");
    doc.text(statement.referenceNumber, rightX, m + 68, { align: "right" });
  }
  y = Math.max(y, m + 84);

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
  for (const line of statement.items) {
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

  /* ------------------------------ additional ----------------------------- */
  if (statement.additionalCharges.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(140, 148, 160);
    doc.text("ADDITIONAL CHARGES", m, y);
    y += 16;
    for (const c of statement.additionalCharges) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 68, 80);
      doc.text(c.label, m, y);
      doc.setFont("courier", "normal");
      doc.text(php(c.amount), pw - m, y, { align: "right" });
      divider(doc, m, y + 4, pw - m, [238, 238, 242]);
      y += 16;
    }
    y += 8;
  }

  /* ------------------------------- totals -------------------------------- */
  const totRight = pw - m;
  const totLeft = totRight - 200;
  const taxLabel =
    statement.taxSetting === "vat"
      ? "VAT (12%)"
      : statement.taxSetting === "non-vat"
        ? "Non-VAT"
        : "Tax exempt";
  for (const t of [
    { label: "Subtotal", value: statement.subtotal },
    { label: "Discount", value: -statement.discount },
    {
      label: "Additional charges",
      value: statement.additionalCharges.reduce((s, c) => s + c.amount, 0),
    },
    { label: taxLabel, value: statement.tax },
    { label: "Previous balance", value: statement.previousBalance },
    { label: "Total amount", value: statement.total, strong: true },
    { label: "Amount paid", value: -statement.amountPaid },
    { label: "Balance due", value: statement.balance, strong: true },
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

  /* ---------------------------- payment history --------------------------- */
  if (statement.payments.length > 0) {
    y = space(doc, ph, m, y, 30 + statement.payments.length * 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(80, 88, 102);
    doc.text("PAYMENT HISTORY", m, y);
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(140, 148, 160);
    doc.text("DATE", m, y);
    doc.text("METHOD", 160, y);
    doc.text("REFERENCE", 300, y);
    doc.text("AMOUNT", pw - m, y, { align: "right" });
    divider(doc, m, y + 5, pw - m, [222, 222, 228]);
    y += 18;
    for (const p of statement.payments) {
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.setTextColor(60, 68, 80);
      doc.text(dateTime(p.at), m, y);
      doc.setFont("helvetica", "normal");
      doc.text(p.method.toUpperCase(), 160, y);
      doc.setFont("courier", "normal");
      doc.text(p.reference ?? "—", 300, y);
      doc.text(php(p.amount), pw - m, y, { align: "right" });
      divider(doc, m, y + 4, pw - m, [238, 238, 242]);
      y += 16;
    }
    y += 8;
  }

  /* ------------------------------- notes -------------------------------- */
  if (statement.notes) {
    y = space(doc, ph, m, y, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(80, 88, 102);
    doc.text("NOTES", m, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 68, 80);
    const noteLines = doc.splitTextToSize(statement.notes, pw - m * 2);
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
  const prepLine = statement.salesRep
    ? `Prepared by ${statement.preparedBy}  ·  Sales rep ${statement.salesRep}  ·  ${company.phone}`
    : `Prepared by ${statement.preparedBy}  ·  ${company.phone}`;
  doc.text(doc.splitTextToSize(prepLine, pw - m * 2), m, y);

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
