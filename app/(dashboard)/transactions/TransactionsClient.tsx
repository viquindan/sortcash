"use client";

import { useState, useMemo } from "react";
import { MonthTabs } from "@/components/MonthTabs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { X, Tag } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: string;
  month: string;
  bank: string;
  source: string;
}

export default function TransactionsClient({
  initialTransactions,
  expenseCategories: initialExpenseCategories,
  incomeCategories: initialIncomeCategories,
  banks,
  persons,
}: {
  initialTransactions: Transaction[];
  expenseCategories: string[];
  incomeCategories: string[];
  banks: string[];
  persons: string[];
}) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(initialExpenseCategories);
  const [incomeCategories, setIncomeCategories] = useState<string[]>(initialIncomeCategories);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [descFilter, setDescFilter] = useState("");
  const [bankFilter, setBankFilter] = useState("");
  const [personFilter, setPersonFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState(initialExpenseCategories[0] ?? "");
  const [bulkCreateRule, setBulkCreateRule] = useState(false);
  const [applying, setApplying] = useState(false);
  const LIMIT = 50;

  const showBankCol   = banks.length > 1;
  const showPersonCol = persons.length > 1;

  const allCategories = useMemo(() =>
    Array.from(new Set([...expenseCategories, ...incomeCategories])).sort((a, b) => a.localeCompare(b, "es")),
    [expenseCategories, incomeCategories]
  );

  const handleCategoryAdded = (newCategory: string) => {
    const sorter = (a: string, b: string) => a.localeCompare(b, "es");
    setExpenseCategories(prev => [...prev, newCategory].sort(sorter));
    setIncomeCategories(prev => [...prev, newCategory].sort(sorter));
  };

  const months = useMemo(() => {
    const m = new Set<string>();
    initialTransactions.forEach(tx => m.add(tx.month));
    return Array.from(m).sort((a, b) => b.localeCompare(a));
  }, [initialTransactions]);

  const hasActiveFilters = !!(descFilter || bankFilter || personFilter || categoryFilter);

  const resetFilters = () => {
    setDescFilter("");
    setBankFilter("");
    setPersonFilter("");
    setCategoryFilter("");
    setPage(1);
  };

  // Computed directly — no useMemo — guarantees fresh result every render
  const filteredData = transactions.filter(tx => {
    if (selectedMonth !== "all" && tx.month !== selectedMonth) return false;
    if (descFilter && !(tx.description ?? "").toLowerCase().includes(descFilter.toLowerCase())) return false;
    if (bankFilter && !(tx.bank ?? "").toLowerCase().includes(bankFilter.toLowerCase())) return false;
    if (personFilter && !(tx.source ?? "").toLowerCase().includes(personFilter.toLowerCase())) return false;
    if (categoryFilter && !(tx.category ?? "").toLowerCase().includes(categoryFilter.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / LIMIT);
  const start = (page - 1) * LIMIT;
  const paginatedData = filteredData.slice(start, start + LIMIT);

  const pageIds = paginatedData.map(tx => tx.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const somePageSelected = pageIds.some(id => selected.has(id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelected(prev => { const n = new Set(prev); pageIds.forEach(id => n.delete(id)); return n; });
    } else {
      setSelected(prev => new Set([...Array.from(prev), ...pageIds]));
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const handleCategoryChange = async (id: string, newCategory: string) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, category: newCategory } : tx));
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory, createRule: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.affectedIds && data.affectedIds.length > 1) {
          const affected = new Set<string>(data.affectedIds);
          setTransactions(prev =>
            prev.map(tx => affected.has(tx.id) ? { ...tx, category: data.category } : tx)
          );
        }
      }
    } catch (e) { console.error(e); }
  };

  const handleBulkApply = async () => {
    if (!bulkCategory || selected.size === 0) return;
    const ids = Array.from(selected);
    setApplying(true);
    setTransactions(prev => prev.map(tx => selected.has(tx.id) ? { ...tx, category: bulkCategory } : tx));
    try {
      await fetch("/api/transactions/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, category: bulkCategory, createRule: bulkCreateRule }),
      });
      clearSelection();
    } catch (e) { console.error(e); }
    finally { setApplying(false); }
  };

  const colSpan = 4 + (showBankCol ? 1 : 0) + (showPersonCol ? 1 : 0);
  const filterCls = "w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-muted font-normal";

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-serif font-bold text-accent">Movimientos</h2>

      <MonthTabs months={months} selectedMonth={selectedMonth} onSelect={m => { setSelectedMonth(m); setPage(1); }} />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={el => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                    onChange={toggleSelectAll}
                    className="rounded border-border accent-accent cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap text-muted text-xs uppercase tracking-wide">
                  Fecha
                </th>
                <th className="px-3 py-2">
                  <input
                    type="text"
                    value={descFilter}
                    onChange={e => { setDescFilter(e.target.value); setPage(1); }}
                    placeholder="Descripción"
                    className={filterCls}
                  />
                </th>
                {showBankCol && (
                  <th className="px-3 py-2">
                    <input
                      type="text"
                      value={bankFilter}
                      onChange={e => { setBankFilter(e.target.value); setPage(1); }}
                      placeholder="Banco"
                      className={filterCls}
                    />
                  </th>
                )}
                {showPersonCol && (
                  <th className="px-3 py-2">
                    <input
                      type="text"
                      value={personFilter}
                      onChange={e => { setPersonFilter(e.target.value); setPage(1); }}
                      placeholder="Persona"
                      className={filterCls}
                    />
                  </th>
                )}
                <th className="px-3 py-2">
                  <input
                    type="text"
                    value={categoryFilter}
                    onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                    placeholder="Categoría"
                    className={filterCls}
                  />
                </th>
                <th className="px-4 py-3 text-right whitespace-nowrap">
                  <span className="font-medium text-muted text-xs uppercase tracking-wide">Monto</span>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-muted hover:text-text flex items-center gap-1 ml-auto mt-1"
                    >
                      <X size={12} /> Limpiar
                    </button>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.map(tx => {
                const amount = parseFloat(tx.amount);
                const isSelected = selected.has(tx.id);
                return (
                  <tr
                    key={tx.id}
                    className={`transition-colors cursor-pointer ${isSelected ? "bg-accentPale/40" : "hover:bg-accentPale/20"}`}
                    onClick={() => toggleSelect(tx.id)}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(tx.id)}
                        className="rounded border-border accent-accent cursor-pointer w-4 h-4" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted text-xs">
                      {format(new Date(tx.date + "T12:00:00"), "dd MMM yyyy", { locale: es })}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="block truncate" title={tx.description}>{tx.description}</span>
                    </td>
                    {showBankCol && (
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{tx.bank}</td>
                    )}
                    {showPersonCol && (
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{tx.source}</td>
                    )}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <CategorySelect
                        value={tx.category}
                        categories={amount >= 0 ? incomeCategories : expenseCategories}
                        onChange={val => handleCategoryChange(tx.id, val)}
                        onCategoryAdded={handleCategoryAdded}
                        className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer hover:bg-surface rounded px-2 py-1 outline-none"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      <span className={amount >= 0 ? "text-green" : "text-text"}>
                        {new Intl.NumberFormat("es-PA", { style: "currency", currency: "USD" }).format(Math.abs(amount))}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={colSpan} className="px-6 py-8 text-center text-muted">
                    No hay movimientos para este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface">
            <span className="text-sm text-muted">Página {page} de {totalPages} · {filteredData.length} movimientos</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Siguiente</Button>
            </div>
          </div>
        )}
      </Card>

      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border border-border bg-background/95 backdrop-blur-sm">
          <Tag size={16} className="text-accent shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">
            {selected.size} {selected.size === 1 ? "seleccionada" : "seleccionadas"}
          </span>
          <div className="w-px h-5 bg-border" />
          <CategorySelect
            value={bulkCategory}
            categories={allCategories}
            onChange={setBulkCategory}
            onCategoryAdded={cat => { handleCategoryAdded(cat); setBulkCategory(cat); }}
            className="bg-surface border border-border rounded-lg text-sm px-3 py-1.5 outline-none focus:border-accent cursor-pointer"
          />
          <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer whitespace-nowrap">
            <input type="checkbox" checked={bulkCreateRule} onChange={e => setBulkCreateRule(e.target.checked)}
              className="rounded border-border accent-accent w-3.5 h-3.5" />
            Crear regla
          </label>
          <Button size="sm" onClick={handleBulkApply} disabled={applying}>
            {applying ? "Aplicando…" : "Aplicar"}
          </Button>
          <button onClick={clearSelection} className="text-muted hover:text-text transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
