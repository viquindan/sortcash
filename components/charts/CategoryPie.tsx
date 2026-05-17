"use client";

import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell } from "recharts";

interface CategoryData {
  name: string;
  value: number;
}

const EXPENSE_COLORS = [
  "#DC2626", "#B91C1C", "#E53E3E", "#F87171", "#C53030",
  "#EF4444", "#991B1B", "#FCA5A5", "#D32F2F", "#E57373",
  "#F44336", "#B71C1C",
];

const INCOME_COLORS = [
  "#059669", "#047857", "#10B981", "#34D399", "#065F46",
  "#6EE7B7", "#064E3B", "#A7F3D0", "#0D9488", "#14B8A6",
  "#2DD4BF", "#0F766E",
];

const fmt = (v: number) =>
  new Intl.NumberFormat("es-PA", { style: "currency", currency: "USD" }).format(v);

const fmtShort = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`;

const SIZE = 164;
const INNER = 52;
const OUTER = 76;

export function CategoryPie({ data, variant = "expense" }: { data: CategoryData[]; variant?: "expense" | "income" }) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveIndex(null);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [activeIndex]);

  if (!data || data.length === 0) {
    return (
      <div className="h-36 flex items-center justify-center text-muted text-sm">
        No hay datos suficientes
      </div>
    );
  }

  const COLORS = variant === "income" ? INCOME_COLORS : EXPENSE_COLORS;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const handleSliceClick = (_: any, index: number) => {
    setActiveIndex(prev => prev === index ? null : index);
  };

  return (
    <div className="space-y-5" ref={containerRef}>
      {/* Donut */}
      <div className="flex justify-center">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          {mounted && (
            <PieChart width={SIZE} height={SIZE}>
              <Pie
                data={data}
                cx={SIZE / 2}
                cy={SIZE / 2}
                innerRadius={INNER}
                outerRadius={OUTER}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                onClick={handleSliceClick}
                style={{ cursor: "pointer" }}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                  />
                ))}
              </Pie>
            </PieChart>
          )}
          {/* Total en el centro */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-muted uppercase tracking-wide">Total</span>
            <span className="text-sm font-bold text-text">{fmtShort(total)}</span>
          </div>
        </div>
      </div>

      {/* Leyenda en 2 columnas */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {data.map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          const color = COLORS[i % COLORS.length];
          const isActive = activeIndex === i;
          const isDimmed = activeIndex !== null && !isActive;

          return (
            <button
              key={i}
              onClick={() => setActiveIndex(prev => prev === i ? null : i)}
              className={`text-left rounded-lg px-2 py-1.5 transition-all w-full ${
                isActive ? "ring-1 ring-border bg-surface shadow-sm" : "hover:bg-surface/60"
              } ${isDimmed ? "opacity-40" : ""}`}
            >
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className={`text-text truncate ${isActive ? "font-semibold" : ""}`}>
                    {d.name}
                  </span>
                </div>
                <span className="font-semibold shrink-0 ml-1 tabular-nums" style={{ color }}>
                  {pct.toFixed(0)}%
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>

              {/* Monto — solo visible cuando está activo */}
              {isActive && (
                <p className="mt-1.5 text-xs font-medium tabular-nums" style={{ color }}>
                  {fmt(d.value)}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
