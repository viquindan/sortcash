"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Check, X } from "lucide-react";

interface CategorySelectProps {
  value: string;
  categories: string[];
  onChange: (value: string) => void;
  onCategoryAdded: (newCategory: string) => void;
  className?: string;
}

export function CategorySelect({
  value,
  categories,
  onChange,
  onCategoryAdded,
  className,
}: CategorySelectProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "__new__") {
      setAdding(true);
    } else {
      onChange(e.target.value);
    }
  };

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        onCategoryAdded(trimmed);
        onChange(trimmed);
      }
    } finally {
      setLoading(false);
      setAdding(false);
      setNewName("");
    }
  };

  const handleCancel = () => {
    setAdding(false);
    setNewName("");
  };

  if (adding) {
    return (
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") handleCancel();
          }}
          placeholder="Nueva categoría..."
          className="text-xs border border-accent rounded px-2 py-1 w-32 outline-none bg-background text-text"
          disabled={loading}
        />
        <button
          onClick={handleAdd}
          disabled={loading || !newName.trim()}
          className="text-accent hover:text-accent/70 disabled:opacity-40"
          title="Confirmar"
        >
          <Check size={14} />
        </button>
        <button
          onClick={handleCancel}
          className="text-muted hover:text-text"
          title="Cancelar"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  const sorted = [...categories].sort((a, b) => a.localeCompare(b, "es"));

  return (
    <select
      value={value}
      onChange={handleSelectChange}
      className={className}
    >
      {sorted.map(c => (
        <option key={c} value={c}>{c}</option>
      ))}
      <option value="__new__">+ Nueva categoría</option>
    </select>
  );
}
