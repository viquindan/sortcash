const NOISE_PREFIXES = [
  "BANCA MOVIL ", "COMPRA EN ", "PAGO A ", "DEPOSITO ", "DEP ",
  "POS ", "ACH ", "TRF ", "TRANSF ", "TRANSFERENCIA ",
];

export function extractMerchant(description: string): string {
  let s = description.trim().toUpperCase();

  for (const prefix of NOISE_PREFIXES) {
    if (s.startsWith(prefix)) {
      s = s.slice(prefix.length).trim();
      break;
    }
  }

  // Walk tokens: keep connectors (Y, A, DE…) but stop at long numeric IDs
  // Count only substantive words (length >= 2) toward the 3-word limit
  const allTokens = s.split(/\s+/);
  const result: string[] = [];
  let substantiveCount = 0;

  for (const t of allTokens) {
    if (!t) continue;
    const digitRatio = (t.replace(/\D/g, "").length) / t.length;
    if (digitRatio >= 0.6 && t.length >= 4) break;
    result.push(t);
    if (t.length >= 2) substantiveCount++;
    if (substantiveCount >= 3) break;
  }

  return result.join(" ").slice(0, 40);
}
