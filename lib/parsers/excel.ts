import * as XLSX from "xlsx";
import type { ParsedTransaction } from "./index";
import { normalizeDate, normalizeAmount } from "./index";
import { detectBank } from "./bankDetect";
import type { ParseResult } from "./bankDetect";

function nd(s: string): string {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const DATE_KW   = ["fecha", "date", "fec"];
const DESC_KW   = ["descripci", "descripcion", "description", "detalle", "concepto", "comercio", "narr"];
const DEBIT_KW  = ["debito", "monto", "amount", "importe", "valor", "cargo"];
const CREDIT_KW = ["credito", "abono", "credit", "deposit", "ingreso"];
const BAL_KW    = ["saldo", "balance"];

const ACCOUNT_RE = /(\d{2}-\d{2}-\d{4,}-\d)/;

function findCol(headers: string[], keywords: string[]): number {
  return headers.findIndex(h => keywords.some(k => nd(h).includes(k)));
}

function toNum(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "number") return isNaN(raw) ? null : raw;
  return normalizeAmount(String(raw));
}

export async function parseExcel(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(buffer), {
    type: "array",
    cellDates: true,
  });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
  }) as unknown[][];

  // Scan header rows (before transactions) for bank and account number
  const headerText = raw.slice(0, 10).map(r => r.join(" ")).join(" ");
  const bank = detectBank(headerText);

  let accountNumber: string | null = null;
  for (const row of raw.slice(0, 10)) {
    for (const cell of row) {
      const m = String(cell).match(ACCOUNT_RE);
      if (m) { accountNumber = m[1]; break; }
    }
    if (accountNumber) break;
  }

  // Find the header row (scan up to row 25)
  const headerIdx = raw.findIndex((row, i) => {
    if (i > 25) return false;
    const cells = row.map(c => nd(String(c)));
    const hasDate   = cells.some(c => DATE_KW.some(k => c.includes(k)));
    const hasDesc   = cells.some(c => DESC_KW.some(k => c.includes(k)));
    const hasAmount = cells.some(c => [...DEBIT_KW, ...CREDIT_KW].some(k => c.includes(k)));
    return hasDate && (hasDesc || hasAmount);
  });

  if (headerIdx === -1) return { transactions: [], bank, accountHolder: null, accountNumber };

  const headers = raw[headerIdx].map(c => String(c));
  const dateIdx   = findCol(headers, DATE_KW);
  const descIdx   = findCol(headers, DESC_KW);
  const debitIdx  = findCol(headers, DEBIT_KW);
  const creditIdx = findCol(headers, CREDIT_KW);
  const balIdx    = findCol(headers, BAL_KW);

  if (dateIdx === -1) return { transactions: [], bank, accountHolder: null, accountNumber };

  const txs: ParsedTransaction[] = [];

  for (let i = headerIdx + 1; i < raw.length; i++) {
    const row = raw[i];
    if (!row || row.every(c => !String(c ?? "").trim())) continue;

    const rawDate = row[dateIdx];
    let dateStr: string | null = null;
    if (rawDate instanceof Date) {
      dateStr = rawDate.toISOString().split("T")[0];
    } else {
      dateStr = normalizeDate(String(rawDate ?? "").trim());
    }
    if (!dateStr) continue;

    const description = descIdx >= 0 ? String(row[descIdx] ?? "").trim() : "";
    if (!description) continue;

    let amount: number | null = null;
    const debit  = debitIdx  >= 0 ? toNum(row[debitIdx])  : null;
    const credit = creditIdx >= 0 ? toNum(row[creditIdx]) : null;

    if (credit !== null && credit !== 0) {
      amount = Math.abs(credit);
    } else if (debit !== null && debit !== 0) {
      amount = debit < 0 ? debit : -Math.abs(debit);
    }

    if (amount === null) continue;

    const balance = balIdx >= 0 ? toNum(row[balIdx]) ?? undefined : undefined;
    txs.push({ date: dateStr, description, amount, balance });
  }

  // Excel files for Banco General don't have the account holder name
  return { transactions: txs, bank, accountHolder: null, accountNumber };
}
