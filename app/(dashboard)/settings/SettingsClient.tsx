"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Trash2, Plus, Pencil, Check, X, FileUp } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function SettingsClient({
  initialCategories,
  initialRules,
  initialExclusions,
  initialUploads,
  expenseCategories,
  incomeCategories,
}: {
  initialCategories: any[];
  initialRules: any[];
  initialExclusions: any[];
  initialUploads: any[];
  expenseCategories: string[];
  incomeCategories: string[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [rules, setRules] = useState(initialRules);
  const [exclusions, setExclusions] = useState(initialExclusions);
  const [uploads, setUploads] = useState(initialUploads);
  const [newCatName, setNewCatName] = useState("");
  const [newRuleMerchant, setNewRuleMerchant] = useState("");
  const [newRuleCategory, setNewRuleCategory] = useState(expenseCategories[0]);
  const [newExclusion, setNewExclusion] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editMerchant, setEditMerchant] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const customNames = categories.map((c: any) => c.name);
  const allCategoriesList = Array.from(
    new Set([...expenseCategories, ...incomeCategories, ...customNames])
  ).sort((a, b) => a.localeCompare(b, "es"));

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories([newCat, ...categories]);
        setNewCatName("");
      } else {
        alert(await res.text());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleMerchant.trim() || !newRuleCategory) return;
    setLoading(true);
    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant: newRuleMerchant.trim(), category: newRuleCategory }),
      });
      if (res.ok) {
        const newRule = await res.json();
        setRules([newRule, ...rules]);
        setNewRuleMerchant("");
        setNewRuleCategory(expenseCategories[0]);
      } else {
        alert(await res.text());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta regla?")) return;
    try {
      const res = await fetch(`/api/rules/${id}`, { method: "DELETE" });
      if (res.ok) setRules(rules.filter(r => r.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const startEditRule = (rule: any) => {
    setEditingRuleId(rule.id);
    setEditMerchant(rule.merchant);
    setEditCategory(rule.category);
  };

  const cancelEditRule = () => {
    setEditingRuleId(null);
    setEditMerchant("");
    setEditCategory("");
  };

  const handleSaveRule = async (id: string) => {
    if (!editMerchant.trim() || !editCategory) return;
    try {
      const res = await fetch(`/api/rules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant: editMerchant.trim(), category: editCategory }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRules(rules.map(r => r.id === id ? updated : r));
        cancelEditRule();
      } else {
        alert(await res.text());
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-accent">Ajustes de Categorización</h2>

      {/* Default category lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Categorías de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {expenseCategories.map(c => (
                <span key={c} className="text-xs px-3 py-1.5 rounded-full bg-surface border border-border text-text">{c}</span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categorías de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {incomeCategories.map(c => (
                <span key={c} className="text-xs px-3 py-1.5 rounded-full bg-surface border border-border text-green">{c}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Custom Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Categorías</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Nueva categoría..."
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !newCatName.trim()} size="sm">
                <Plus size={16} className="mr-1" /> Agregar
              </Button>
            </form>

            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-sm text-muted">No has creado categorías personalizadas.</p>
              ) : (
                categories.map((cat: any) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                    <span className="text-sm font-medium text-text">{cat.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-muted hover:text-red transition-colors"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Reglas Automáticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddRule} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRuleMerchant}
                  onChange={e => setNewRuleMerchant(e.target.value)}
                  placeholder="Comercio (ej. DON PEPE)"
                  className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  disabled={loading}
                />
                <select
                  value={newRuleCategory}
                  onChange={e => setNewRuleCategory(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  disabled={loading}
                >
                  {allCategoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Button type="submit" disabled={loading || !newRuleMerchant.trim()} size="sm" className="w-full">
                <Plus size={16} className="mr-1" /> Agregar Regla
              </Button>
            </form>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {rules.length === 0 ? (
                <p className="text-sm text-muted">No tienes reglas automáticas.</p>
              ) : (
                rules.map(rule => (
                  <div key={rule.id} className="p-3 rounded-lg bg-surface border border-border">
                    {editingRuleId === rule.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          value={editMerchant}
                          onChange={e => setEditMerchant(e.target.value)}
                          onKeyDown={e => { if (e.key === "Escape") cancelEditRule(); }}
                          className="bg-background border border-accent rounded px-2 py-1 text-sm text-text focus:outline-none w-full"
                          autoFocus
                        />
                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value)}
                          className="bg-background border border-border rounded px-2 py-1 text-sm text-text focus:outline-none"
                        >
                          {allCategoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleSaveRule(rule.id)}
                            className="flex items-center gap-1 text-xs text-accent hover:text-accent/70 font-medium"
                          >
                            <Check size={14} /> Guardar
                          </button>
                          <button
                            onClick={cancelEditRule}
                            className="flex items-center gap-1 text-xs text-muted hover:text-text"
                          >
                            <X size={14} /> Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-text truncate">{rule.merchant}</span>
                          <span className="text-xs text-muted">→ {rule.category}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <button
                            onClick={() => startEditRule(rule)}
                            className="text-muted hover:text-accent transition-colors"
                            title="Editar regla"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-muted hover:text-red transition-colors"
                            title="Eliminar regla"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp size={18} /> Archivos Importados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uploads.length === 0 ? (
            <p className="text-sm text-muted">No has importado ningún archivo.</p>
          ) : (
            <div className="space-y-2">
              {uploads.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-text truncate">{u.filename}</span>
                    <span className="text-xs text-muted">
                      {u.bank ? `${u.bank} · ` : ""}{u.rowCount ?? 0} filas · {u.personLabel ? `${u.personLabel} · ` : ""}{format(new Date(u.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm("¿Eliminar este archivo y todas sus transacciones?")) return;
                      const res = await fetch(`/api/uploads/${u.id}`, { method: "DELETE" });
                      if (res.ok) setUploads(prev => prev.filter((x: any) => x.id !== u.id));
                    }}
                    className="text-muted hover:text-red transition-colors shrink-0 ml-3"
                    title="Eliminar importación"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exclusions */}
      <Card>
        <CardHeader>
          <CardTitle>Conceptos sin regla automática</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted">
            Los conceptos aquí listados nunca generarán una regla masiva. Cada transacción con ese concepto puede tener su propia categoría libremente.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const val = newExclusion.trim();
              if (!val) return;
              setLoading(true);
              try {
                const res = await fetch("/api/exclusions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ merchant: val }),
                });
                if (res.ok) {
                  const row = await res.json();
                  setExclusions(prev => [...prev, row].sort((a, b) => a.merchant.localeCompare(b.merchant)));
                  setNewExclusion("");
                }
              } finally { setLoading(false); }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newExclusion}
              onChange={e => setNewExclusion(e.target.value)}
              placeholder="Ej: TRANSFERENCIA ESPOSA"
              className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent uppercase"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !newExclusion.trim()} size="sm">
              <Plus size={16} className="mr-1" /> Agregar
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {exclusions.length === 0 ? (
              <p className="text-sm text-muted">No hay conceptos excluidos.</p>
            ) : (
              exclusions.map((ex: any) => (
                <div key={ex.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-sm">
                  <span className="text-text font-medium">{ex.merchant}</span>
                  <button
                    onClick={async () => {
                      await fetch(`/api/exclusions/${ex.id}`, { method: "DELETE" });
                      setExclusions(prev => prev.filter((e: any) => e.id !== ex.id));
                    }}
                    className="text-muted hover:text-red transition-colors ml-1"
                    title="Eliminar exclusión"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
