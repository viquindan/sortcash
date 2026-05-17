import type { ParsedTransaction } from "./index";
import { normalizeDate, normalizeAmount } from "./index";
import { detectBank } from "./bankDetect";
import type { ParseResult } from "./bankDetect";

const TX_DATE_RE = /^(\d{1,2}-(?:ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)-\d{4})\s+/i;
const DOLLAR_RE  = /-?\$[\d,]+\.\d{2}/g;
const IGNORE_RE  = /^(fecha\s+descripci|banco general|estado de cuenta|cuenta de ahorros|^\d{2}-[a-z]{3}-\d{4}\s*•|\d{2}:\d{2}\s*(AM|PM)|banco general, s\.a\.|seg[uú]n lo establece)/i;

// Account number patterns common across Panama and US banks
const ACCOUNT_RE  = /(?:cuenta|account|no\.?|#)\s*[:\-]?\s*([\d\-]+[\d])/i;
// Holder name: "TITULARES:" or "Account Holder:" or "Name:" followed by a name
const HOLDER_RE   = /(?:titular(?:es)?|account holder|name|cliente|customer)\s*[:\-]\s*([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚ\s\.\,]+)/i;

export async function parsePdf(file: File): Promise<ParseResult> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

  const allLines: string[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const items = content.items as Array<{ str: string; transform: number[] }>;

    const byY = new Map<number, string[]>();
    for (const item of items) {
      const y = Math.round(item.transform[5]);
      if (!byY.has(y)) byY.set(y, []);
      byY.get(y)!.push(item.str);
    }

    const sortedYs = Array.from(byY.keys()).sort((a, b) => b - a);
    for (const y of sortedYs) {
      const line = byY.get(y)!.join(" ").trim();
      if (line) allLines.push(line);
    }
  }

  // Detect bank from the first 30 lines (header area)
  const headerText = allLines.slice(0, 30).join(" ");
  const bank = detectBank(headerText);

  // Extract account holder and account number from header
  let accountHolder: string | null = null;
  let accountNumber: string | null = null;

  for (const line of allLines.slice(0, 30)) {
    if (!accountHolder) {
      const m = line.match(HOLDER_RE);
      if (m) accountHolder = m[1].trim().replace(/\s+/g, " ");
    }
    if (!accountNumber) {
      const m = line.match(ACCOUNT_RE);
      if (m) accountNumber = m[1].trim();
    }
    if (accountHolder && accountNumber) break;
  }

  const transactions = groupAndParse(allLines);

  return { transactions, bank, accountHolder, accountNumber };
}

function groupAndParse(lines: string[]): ParsedTransaction[] {
  const blocks: string[] = [];
  let current = "";

  for (const line of lines) {
    if (IGNORE_RE.test(line)) continue;
    if (TX_DATE_RE.test(line)) {
      if (current) blocks.push(current);
      current = line;
    } else if (current) {
      current += " " + line;
    }
  }
  if (current) blocks.push(current);

  return blocks.map(parseBlock).filter((tx): tx is ParsedTransaction => tx !== null);
}

function parseBlock(block: string): ParsedTransaction | null {
  const dateMatch = block.match(TX_DATE_RE);
  if (!dateMatch) return null;

  const date = normalizeDate(dateMatch[1]);
  if (!date) return null;

  const rest = block.slice(dateMatch[0].length).trim();

  DOLLAR_RE.lastIndex = 0;
  const matches: Array<{ raw: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = DOLLAR_RE.exec(rest)) !== null) {
    matches.push({ raw: m[0], index: m.index });
  }

  if (matches.length === 0) return null;

  const description = rest.slice(0, matches[0].index).trim().replace(/\s+/g, " ");
  if (!description) return null;

  const amount = normalizeAmount(matches[0].raw.replace("$", ""));
  if (amount === null) return null;

  const balance = matches.length > 1
    ? normalizeAmount(matches[matches.length - 1].raw.replace("$", "")) ?? undefined
    : undefined;

  return { date, description, amount, balance };
}
