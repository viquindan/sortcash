"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MonthlyData {
  month: string;
  label: string;
  ingresos: number;
  gastos: number;
}

export function MonthlyBar({ data }: { data: MonthlyData[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!data || data.length === 0) {
    return <div className="h-72 flex items-center justify-center text-muted text-sm">No hay datos suficientes</div>;
  }

  if (!mounted) return <div className="h-72" />;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E7EF" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748B" }}
            tickFormatter={(v) => `$${v}`}
            width={60}
          />
          <Tooltip
            formatter={(value: any) => `$${Number(value).toFixed(2)}`}
            cursor={{ fill: "#EEF3FF", opacity: 0.4 }}
            contentStyle={{ borderRadius: "8px", border: "1px solid #E1E7EF" }}
          />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="ingresos" name="Ingresos" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="gastos" name="Gastos" fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
