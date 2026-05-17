const BANK_CONFIG: Record<string, { bg: string; text: string; abbr: string }> = {
  "Banco General":  { bg: "#00843D", text: "#fff", abbr: "BG" },
  "Banistmo":       { bg: "#E2001A", text: "#fff", abbr: "BS" },
  "BAC Panama":     { bg: "#C8102E", text: "#fff", abbr: "BAC" },
  "Global Bank":    { bg: "#003087", text: "#fff", abbr: "GB" },
  "Multibank":      { bg: "#004B87", text: "#fff", abbr: "MB" },
  "UNFCU":          { bg: "#005EB8", text: "#fff", abbr: "UN" },
  "JP Morgan Chase":{ bg: "#003087", text: "#fff", abbr: "JPM" },
  "Wells Fargo":    { bg: "#D71E28", text: "#fff", abbr: "WF" },
  "Bank of America":{ bg: "#E31837", text: "#fff", abbr: "BoA" },
};

interface BankLogoProps {
  bank: string;
  size?: number;
}

export function BankLogo({ bank, size = 36 }: BankLogoProps) {
  const config = BANK_CONFIG[bank];

  if (!config) {
    return (
      <div
        style={{ width: size, height: size, fontSize: size * 0.35 }}
        className="rounded-lg flex items-center justify-center font-bold bg-gray-200 text-gray-500 shrink-0"
      >
        ?
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        background: config.bg,
        color: config.text,
        fontSize: size * 0.28,
      }}
      className="rounded-lg flex items-center justify-center font-bold shrink-0 tracking-tight"
    >
      {config.abbr}
    </div>
  );
}
