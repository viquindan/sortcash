import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

interface MonthTabsProps {
  months: string[]; // ['2026-05', '2026-04', ...]
  selectedMonth: string;
  onSelect: (month: string) => void;
}

export function MonthTabs({ months, selectedMonth, onSelect }: MonthTabsProps) {
  if (months.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
      <button
        onClick={() => onSelect("all")}
        className={cn(
          "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors",
          selectedMonth === "all"
            ? "bg-accent text-white"
            : "bg-surface border border-border text-text hover:bg-accentPale hover:text-accent hover:border-transparent"
        )}
      >
        Todos
      </button>
      {months.map((month) => {
        const date = parse(month, "yyyy-MM", new Date());
        const label = format(date, "MMMM yyyy", { locale: es });
        return (
          <button
            key={month}
            onClick={() => onSelect(month)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize",
              selectedMonth === month
                ? "bg-accent text-white"
                : "bg-surface border border-border text-text hover:bg-accentPale hover:text-accent hover:border-transparent"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
