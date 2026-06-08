"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MonthlyData {
  month: string;
  label: string;
  flujoNeto: number;
}

export function NetflowArea({ data }: { data: MonthlyData[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!data || data.length === 0) {
    return <div className="h-72 flex items-center justify-center text-muted text-sm">No hay datos suficientes</div>;
  }

  if (!mounted) return <div className="h-52 sm:h-64 md:h-72" />;

  return (
    <div className="h-52 sm:h-64 md:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorFlujo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B3F8B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1B3F8B" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            contentStyle={{ borderRadius: "8px", border: "1px solid #E1E7EF" }}
          />
          <Area
            type="monotone"
            dataKey="flujoNeto"
            name="Flujo Neto"
            stroke="#1B3F8B"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorFlujo)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
