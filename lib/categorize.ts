export const EXPENSE_CATEGORIES = [
  "Transporte",
  "Restaurantes",
  "Supermercado",
  "Entretenimiento",
  "Salud",
  "Vivienda",
  "Transferencias",
  "Efectivo",
  "Compras",
  "Otros",
];

export const INCOME_CATEGORIES = [
  "Salario",
  "Renta de inmuebles",
  "Rendimientos financieros",
  "Devolución de compras",
  "Otros ingresos",
];

// Keep for backwards compatibility
export const DEFAULT_CATEGORIES = EXPENSE_CATEGORIES;

const EXPENSE_RULES: Record<string, string[]> = {
  Transporte:      ["uber", "cabify", "didi", "metro", "gasolinera", "delta", "terpel", "pago panapass"],
  Restaurantes:    ["mcdonalds", "kfc", "burger king", "subway", "starbucks", "pizzeria", "restaurante", "pedidosya", "uber eats"],
  Supermercado:    ["super 99", "riba smith", "el machetazo", "rey", "precio", "supermercado"],
  Entretenimiento: ["netflix", "spotify", "cinepolis", "cinemark", "steam", "playstation", "nintendo"],
  Salud:           ["farmacia", "hospital", "clinica", "arrocha", "javillo"],
  Vivienda:        ["ensa", "naturgy", "idaan", "cable onda", "tigo", "cw", "mas movil", "alquiler"],
  Transferencias:  ["yappy", "transferencia", "ach", "trf"],
  Efectivo:        ["atm", "cajero", "retiro"],
  Compras:         ["amazon", "zara", "multiplaza", "albrook"],
};

const INCOME_RULES: Record<string, string[]> = {
  Salario:                  ["salario", "quincena", "nomina", "payroll", "sueldo"],
  "Renta de inmuebles":     ["alquiler recibido", "renta recibida", "arrendamiento"],
  "Rendimientos financieros": ["interes", "dividendo", "rendimiento", "cupón"],
  "Devolución de compras":  ["devolucion", "reembolso", "refund", "credito tienda"],
};

const FUZZY_THRESHOLD = 0.85;

function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0;

  const matchDist = Math.max(Math.floor(Math.max(len1, len2) / 2) - 1, 0);
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDist);
    const end = Math.min(i + matchDist + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;

  let prefix = 0;
  for (let i = 0; i < Math.min(4, len1, len2); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[\s,.\-_/]+/).filter((t) => t.length >= 3);
}

function fuzzyMatchesKeyword(descLower: string, keyword: string): boolean {
  if (descLower.includes(keyword)) return true;
  const descTokens = tokenize(descLower);
  const kwTokens = tokenize(keyword);
  if (kwTokens.length > 1) {
    return jaroWinkler(descLower, keyword) >= FUZZY_THRESHOLD;
  }
  return descTokens.some((token) => jaroWinkler(token, keyword) >= FUZZY_THRESHOLD);
}

export interface CategoryRule {
  merchant: string;
  category: string;
}

export const categorizeTransaction = (
  description: string,
  amount: number,
  customRules: CategoryRule[] = []
): string => {
  const isIncome = amount >= 0;
  const descLower = description.toLowerCase();

  // Custom rules first (apply to both income and expense)
  for (const rule of customRules) {
    if (descLower.includes(rule.merchant.toLowerCase())) {
      return rule.category;
    }
  }

  // Default rules based on sign
  const rules = isIncome ? INCOME_RULES : EXPENSE_RULES;
  for (const [category, keywords] of Object.entries(rules)) {
    if (keywords.some((keyword) => fuzzyMatchesKeyword(descLower, keyword))) {
      return category;
    }
  }

  return isIncome ? "Otros ingresos" : "Otros";
};
