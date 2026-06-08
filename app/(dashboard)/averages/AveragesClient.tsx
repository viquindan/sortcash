"use client";

import { useState, useMemo } from "react";
import { KpiCard } from "@/components/KpiCard";
import { CategoryPie } from "@/components/charts/CategoryPie";
import { MonthlyBar } from "@/components/charts/MonthlyBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

export default function AveragesClient({ initialTransactions }: { initialTransactions: any[] }) {
  const monthsList = useMemo(() => {
    const m = new Set<string>();
    initialTransactions.forEach(tx => m.add(tx.month));
    return Array.from(m).sort((a, b) => a.localeCompare(b)); // chronological
  }, [initialTransactions]);

  const [fromMonth, setFromMonth] = useState<string>(monthsList[0] || "");
  const [toMonth, setToMonth] = useState<string>(monthsList[monthsList.length - 1] || "");

  const filteredData = useMemo(() => {
    if (!fromMonth || !toMonth) return [];
    return initialTransactions.filter(tx => tx.month >= fromMonth && tx.month <= toMonth);
  }, [initialTransactions, fromMonth, toMonth]);

  const monthCount = useMemo(() => {
    const m = new Set<string>();
    filteredData.forEach(tx => m.add(tx.month));
    return m.size || 1;
  }, [filteredData]);

  // Average KPIs
  const avgKpis = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredData.forEach(tx => {
      const amount = parseFloat(tx.amount);
      if (amount >= 0) income += amount;
      else expense += Math.abs(amount);
    });
    return { 
      income: income / monthCount, 
      expense: expense / monthCount, 
      net: (income - expense) / monthCount 
    };
  }, [filteredData, monthCount]);

  // Average Category Pie
  const avgCategoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredData.forEach(tx => {
      const amount = parseFloat(tx.amount);
      if (amount < 0) {
        cats[tx.category] = (cats[tx.category] || 0) + Math.abs(amount);
      }
    });
    return Object.entries(cats).map(([name, total]) => ({ 
      name, 
      value: total / monthCount 
    })).sort((a, b) => b.value - a.value);
  }, [filteredData, monthCount]);

  // Monthly trends (same as overview but filtered by range)
  const monthlyData = useMemo(() => {
    const mData: Record<string, { ingresos: number, gastos: number }> = {};
    filteredData.forEach(tx => {
      if (!mData[tx.month]) mData[tx.month] = { ingresos: 0, gastos: 0 };
      const amount = parseFloat(tx.amount);
      if (amount >= 0) mData[tx.month].ingresos += amount;
      else mData[tx.month].gastos += Math.abs(amount);
    });

    return Object.entries(mData).map(([month, data]) => ({
      month,
      label: format(parse(month, "yyyy-MM", new Date()), "MMM yy", { locale: es }),
      ingresos: data.ingresos,
      gastos: data.gastos,
      flujoNeto: data.ingresos - data.gastos
    })).sort((a, b) => a.month.localeCompare(b.month)); // chronological
  }, [filteredData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-accent">Promedios</h2>
        
        <div className="flex items-center gap-4 bg-surface p-2 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted">De:</span>
            <select 
              value={fromMonth} 
              onChange={(e) => setFromMonth(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none"
            >
              {monthsList.map(m => (
                <option key={m} value={m}>{format(parse(m, "yyyy-MM", new Date()), "MMM yyyy", { locale: es })}</option>
              ))}
            </select>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted">Hasta:</span>
            <select 
              value={toMonth} 
              onChange={(e) => setToMonth(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none"
            >
              {monthsList.map(m => (
                <option key={m} value={m}>{format(parse(m, "yyyy-MM", new Date()), "MMM yyyy", { locale: es })}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Promedio Ingresos/mes" amount={avgKpis.income} type="income" />
        <KpiCard title="Promedio Gastos/mes" amount={avgKpis.expense} type="expense" />
        <KpiCard title="Promedio Flujo Neto/mes" amount={avgKpis.net} type="net" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Gasto Promedio por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPie data={avgCategoryData} />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Meses en el Rango</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyBar data={monthlyData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
