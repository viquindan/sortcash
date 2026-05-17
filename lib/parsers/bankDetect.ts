const BANK_PATTERNS: { name: string; keywords: string[] }[] = [
  { name: "Banco General",   keywords: ["banco general", "bancogeneral"] },
  { name: "Banistmo",        keywords: ["banistmo"] },
  { name: "BAC Panama",      keywords: ["bac panama", "bac | credomatic", "baccredomatic", "bac credomatic"] },
  { name: "Global Bank",     keywords: ["global bank"] },
  { name: "Multibank",       keywords: ["multibank"] },
  { name: "UNFCU",           keywords: ["unfcu", "un federal credit union", "united nations federal"] },
  { name: "JP Morgan Chase", keywords: ["jpmorgan", "jp morgan", "chase bank", "chase.com"] },
  { name: "Wells Fargo",     keywords: ["wells fargo", "wellsfargo"] },
  { name: "Bank of America", keywords: ["bank of america", "bankofamerica", "bofa"] },
];

export function detectBank(text: string): string {
  const lower = text.toLowerCase();
  for (const bank of BANK_PATTERNS) {
    if (bank.keywords.some(k => lower.includes(k))) return bank.name;
  }
  return "Desconocido";
}

// Two names are considered the same person if they share at least one token
// of 4+ chars (handles "D. Villarreal" vs "Daniel Villarreal").
export function namesSimilar(a: string, b: string): boolean {
  if (!a || !b) return false;
  const tok = (s: string) =>
    s.toUpperCase().replace(/[^A-Z\s]/g, " ").split(/\s+/).filter(t => t.length >= 4);
  const ta = new Set(tok(a));
  const tb = tok(b);
  // Direct match or prefix match (DAN → DANIEL)
  return tb.some(t2 => Array.from(ta).some(t1 => t1.startsWith(t2) || t2.startsWith(t1)));
}

export interface ParseResult {
  transactions: import("./index").ParsedTransaction[];
  bank: string;
  accountHolder: string | null;
  accountNumber: string | null;
}
