import Papa from "papaparse";
import type { ParsedTransaction } from "./index";
import { detectColumns, normalizeDate, normalizeAmount } from "./index";
import { detectBank } from "./bankDetect";
import type { ParseResult } from "./bankDetect";

export async function parseCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as Record<string, string>[];
          const bank = rows.length > 0
            ? detectBank(Object.keys(rows[0]).join(" ") + " " + Object.values(rows[0]).join(" "))
            : "Desconocido";
          resolve({
            transactions: mapRows(rows),
            bank,
            accountHolder: null,
            accountNumber: null,
          });
        } catch (e) {
          reject(e);
        }
      },
      error: reject,
    });
  });
}

function mapRows(rows: Record<string, string>[]): ParsedTransaction[] {
  if (rows.length === 0) return [];

  const cols = detectColumns(Object.keys(rows[0]));
  const txs: ParsedTransaction[] = [];

  for (const row of rows) {
    if (!cols.dateCol || !cols.descCol) continue;

    const date = normalizeDate(row[cols.dateCol]);
    if (!date) continue;

    const description = row[cols.descCol]?.trim();
    if (!description) continue;

    let amount: number | null = null;

    if (cols.amountCol) {
      amount = normalizeAmount(row[cols.amountCol]);
    }

    if (amount === null && cols.creditCol) {
      const credit = normalizeAmount(row[cols.creditCol]);
      const debit  = cols.amountCol ? normalizeAmount(row[cols.amountCol]) : null;
      if (credit != null && credit !== 0) amount = credit;
      else if (debit != null && debit !== 0) amount = -Math.abs(debit);
    }

    if (amount === null) continue;

    const balance = cols.balanceCol ? normalizeAmount(row[cols.balanceCol]) ?? undefined : undefined;
    txs.push({ date, description, amount, balance });
  }

  return txs;
}
