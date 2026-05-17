export interface ParsedTransaction {
  date: string;        // ISO "YYYY-MM-DD"
  description: string;
  amount: number;
  balance?: number;
}

export type { ParseResult } from "./bankDetect";

export async function parseFile(file: File): Promise<import("./bankDetect").ParseResult> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") {
    const { parseCsv } = await import("./csv");
    return parseCsv(file);
  }
  if (ext === "xlsx" || ext === "xls") {
    const { parseExcel } = await import("./excel");
    return parseExcel(file);
  }
  if (ext === "pdf") {
    const { parsePdf } = await import("./pdf");
    return parsePdf(file);
  }
  throw new Error(`Formato "${ext}" no soportado. Usa CSV, XLSX, XLS o PDF.`);
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const SPANISH_MONTHS: Record<string, string> = {
  ene: "01", feb: "02", mar: "03", abr: "04", may: "05", jun: "06",
  jul: "07", ago: "08", sep: "09", oct: "10", nov: "11", dic: "12",
  enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05",
  junio: "06", julio: "07", agosto: "08", septiembre: "09",
  octubre: "10", noviembre: "11", diciembre: "12",
};

export function normalizeDate(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const spanish = s.match(/^(\d{1,2})-([\wéáíóú]+)-(\d{4})$/i);
  if (spanish) {
    const month = SPANISH_MONTHS[spanish[2].toLowerCase()];
    if (month) return `${spanish[3]}-${month}-${spanish[1].padStart(2, "0")}`;
  }

  const dmy = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const ymd = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0];

  return null;
}

export function normalizeAmount(raw: string | number): number | null {
  if (typeof raw === "number") return isNaN(raw) ? null : raw;
  if (!raw) return null;

  const s = raw.trim();
  const cleaned = s
    .replace(/[^\d,.\-\+\(\)]/g, "")
    .replace(/\((\d[\d,.]*)\)/, "-$1");

  if (!cleaned || cleaned === "-" || cleaned === "+") return null;

  const lastCommaIdx = cleaned.lastIndexOf(",");
  const lastDotIdx = cleaned.lastIndexOf(".");
  const afterLastComma = lastCommaIdx >= 0 ? cleaned.length - lastCommaIdx - 1 : -1;
  const afterLastDot   = lastDotIdx   >= 0 ? cleaned.length - lastDotIdx   - 1 : -1;

  let normalized: string;

  if (lastCommaIdx > lastDotIdx && afterLastComma === 2) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDotIdx > lastCommaIdx && afterLastDot === 2) {
    normalized = cleaned.replace(/,/g, "");
  } else if (lastCommaIdx >= 0 && lastDotIdx < 0) {
    normalized = afterLastComma === 2
      ? cleaned.replace(",", ".")
      : cleaned.replace(/,/g, "");
  } else {
    normalized = cleaned.replace(/,/g, "");
  }

  const n = parseFloat(normalized);
  return isNaN(n) ? null : n;
}

function normStr(s: string): string {
  return String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function detectColumns(headers: string[]) {
  const h = headers.map(normStr);
  const find = (...candidates: string[]) =>
    headers[h.findIndex(col => candidates.some(c => col.includes(c)))] ?? null;

  return {
    dateCol:    find("fecha", "date", "fec"),
    descCol:    find("descripci", "descripcion", "description", "detalle", "concepto", "comercio", "narr"),
    amountCol:  find("debito", "monto", "amount", "importe", "valor", "cargo"),
    creditCol:  find("credito", "abono", "credit", "deposit", "ingreso"),
    balanceCol: find("saldo", "balance"),
  };
}
