"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { MonthTabs } from "@/components/MonthTabs";
import { KpiCard } from "@/components/KpiCard";

const CategoryPie = dynamic(() => import("@/components/charts/CategoryPie").then(m => m.CategoryPie), {
  ssr: false,
  loading: () => <div className="h-36" />,
});
const MonthlyBar = dynamic(() => import("@/components/charts/MonthlyBar").then(m => m.MonthlyBar), {
  ssr: false,
  loading: () => <div className="h-72" />,
});
const NetflowArea = dynamic(() => import("@/components/charts/NetflowArea").then(m => m.NetflowArea), {
  ssr: false,
  loading: () => <div className="h-72" />,
});
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { UploadCloud } from "lucide-react";

type ViewMode = "total" | "promedio";

export default function OverviewClient({ initialTransactions }: { initialTransactions: any[] }) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("total");

  // Months list for the MonthTabs filter
  const months = useMemo(() => {
    const m = new Set<string>();
    initialTransactions.forEach(tx => m.add(tx.month));
    return Array.from(m).sort((a, b) => b.localeCompare(a));
  }, [initialTransactions]);

  // For promedio mode: range selectors
  const monthsChronological = useMemo(() => [...months].sort((a, b) => a.localeCompare(b)), [months]);
  const [fromMonth, setFromMonth] = useState<string>(() => monthsChronological[0] || "");
  const [toMonth, setToMonth] = useState<string>(() => monthsChronological[monthsChronological.length - 1] || "");

  // Data filtered by selected month (total mode) or by range (promedio mode)
  const filteredData = useMemo(() => {
    if (viewMode === "promedio") {
      if (!fromMonth || !toMonth) return [];
      return initialTransactions.filter(tx => tx.month >= fromMonth && tx.month <= toMonth);
    }
    if (selectedMonth === "all") return initialTransactions;
    return initialTransactions.filter(tx => tx.month === selectedMonth);
  }, [initialTransactions, selectedMonth, viewMode, fromMonth, toMonth]);

  // Number of months in range (for averaging)
  const monthCount = useMemo(() => {
    if (viewMode === "total") return 1;
    const m = new Set<string>();
    filteredData.forEach(tx => m.add(tx.month));
    return m.size || 1;
  }, [filteredData, viewMode]);

  // KPIs
  const kpis = useMemo(() => {
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
      net: (income - expense) / monthCount,
    };
  }, [filteredData, monthCount]);

  // Category Pies
  const expenseCategoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredData.forEach(tx => {
      const amount = parseFloat(tx.amount);
      if (amount < 0) cats[tx.category] = (cats[tx.category] || 0) + Math.abs(amount);
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value: value / monthCount }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData, monthCount]);

  const incomeCategoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredData.forEach(tx => {
      const amount = parseFloat(tx.amount);
      if (amount >= 0) cats[tx.category] = (cats[tx.category] || 0) + amount;
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value: value / monthCount }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData, monthCount]);

  // Monthly bar / area (always uses full dataset, not filtered by range in promedio)
  const monthlyData = useMemo(() => {
    const source = viewMode === "promedio" ? filteredData : initialTransactions;
    const mData: Record<string, { ingresos: number; gastos: number }> = {};
    source.forEach(tx => {
      if (!mData[tx.month]) mData[tx.month] = { ingresos: 0, gastos: 0 };
      const amount = parseFloat(tx.amount);
      if (amount >= 0) mData[tx.month].ingresos += amount;
      else mData[tx.month].gastos += Math.abs(amount);
    });

    const result = Object.entries(mData)
      .map(([month, data]) => ({
        month,
        label: format(parse(month, "yyyy-MM", new Date()), "MMM yy", { locale: es }),
        ingresos: data.ingresos,
        gastos: data.gastos,
        flujoNeto: data.ingresos - data.gastos,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    if (viewMode === "total" && selectedMonth !== "all") {
      return result.filter(r => r.month === selectedMonth);
    }
    return result;
  }, [initialTransactions, filteredData, selectedMonth, viewMode]);

  const kpiSuffix = viewMode === "promedio" ? "/mes" : "";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-accent">Dashboard</h2>
          {/* Total / Promedio tabs */}
          <div className="flex rounded-lg border border-border overflow-hidden text-sm font-medium">
            <button
              onClick={() => setViewMode("total")}
              className={`px-3 sm:px-4 py-1.5 transition-colors ${viewMode === "total" ? "bg-accent text-white" : "bg-surface text-text hover:bg-accentPale"}`}
            >
              Total
            </button>
            <button
              onClick={() => setViewMode("promedio")}
              className={`px-3 sm:px-4 py-1.5 transition-colors ${viewMode === "promedio" ? "bg-accent text-white" : "bg-surface text-text hover:bg-accentPale"}`}
            >
              Promedio
            </button>
          </div>
        </div>
        <Link href="/import">
          <Button variant="outline" className="flex items-center gap-2 text-sm">
            <UploadCloud size={18} />
            <span>Importar</span>
          </Button>
        </Link>
      </div>

      {viewMode === "total" ? (
        <MonthTabs months={months} selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
      ) : (
        <div className="flex items-center gap-4 bg-surface p-2 rounded-lg border border-border self-start w-fit">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted">De:</span>
            <select
              value={fromMonth}
              onChange={e => setFromMonth(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none"
            >
              {monthsChronological.map(m => (
                <option key={m} value={m}>{format(parse(m, "yyyy-MM", new Date()), "MMM yyyy", { locale: es })}</option>
              ))}
            </select>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted">Hasta:</span>
            <select
              value={toMonth}
              onChange={e => setToMonth(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none"
            >
              {monthsChronological.map(m => (
                <option key={m} value={m}>{format(parse(m, "yyyy-MM", new Date()), "MMM yyyy", { locale: es })}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-muted border-l border-border pl-3">
            {monthCount} {monthCount === 1 ? "mes" : "meses"}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title={`Ingresos${kpiSuffix}`} amount={kpis.income} type="income" />
        <KpiCard title={`Gastos${kpiSuffix}`} amount={kpis.expense} type="expense" />
        <KpiCard title={`Flujo Neto${kpiSuffix}`} amount={kpis.net} type="net" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPie data={incomeCategoryData} variant="income" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPie data={expenseCategoryData} variant="expense" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendencia Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyBar data={monthlyData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flujo de Caja</CardTitle>
        </CardHeader>
        <CardContent>
          <NetflowArea data={monthlyData} />
        </CardContent>
      </Card>
    </div>
  );
}
