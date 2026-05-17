"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UploadCloud, FileType, CheckCircle, AlertTriangle, Building2, User } from "lucide-react";
import { parseFile } from "@/lib/parsers";
import type { ParseResult } from "@/lib/parsers/bankDetect";

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".pdf"];

function isAcceptedFile(file: File): boolean {
  return ACCEPTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
}

type Step = "idle" | "parsed" | "mismatch" | "importing" | "done" | "error";

interface MismatchInfo {
  knownHolder: string;
  knownLabel: string;
  detectedHolder: string;
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [mismatch, setMismatch] = useState<MismatchInfo | null>(null);
  const [personLabel, setPersonLabel] = useState("Yo");
  const [result, setResult] = useState<{ count: number; skipped: number; bank: string; personLabel: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const allFiles = [...acceptedFiles, ...rejectedFiles.map((r: any) => r.file)];
    const valid = allFiles.find(isAcceptedFile);
    if (valid) {
      setFile(valid);
      setParsed(null);
      setStep("idle");
      setError(null);
      setResult(null);
      setMismatch(null);
      setPersonLabel("Yo");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  const handleParse = async () => {
    if (!file) return;
    setStep("importing");
    setError(null);
    try {
      const result = await parseFile(file);
      if (result.transactions.length === 0) {
        setError("No se encontraron transacciones. Verifica que el archivo tenga el formato correcto.");
        setStep("error");
        return;
      }
      setParsed(result);
      setStep("parsed");
    } catch (err: any) {
      setError(err.message || "Error al leer el archivo.");
      setStep("error");
    }
  };

  const handleImport = async (confirmedPersonLabel?: string) => {
    if (!parsed || !file) return;
    setStep("importing");

    const label = confirmedPersonLabel ?? personLabel;

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          transactions: parsed.transactions,
          bank: parsed.bank,
          accountHolder: parsed.accountHolder,
          accountNumber: parsed.accountNumber,
          personLabel: label,
          confirmed: !!confirmedPersonLabel,
        }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setMismatch(data);
        setPersonLabel(data.detectedHolder ?? "Nueva persona");
        setStep("mismatch");
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error del servidor: ${text}`);
      }

      const data = await res.json();
      setResult(data);
      setStep("done");
      setFile(null);
      setParsed(null);
    } catch (err: any) {
      setError(err.message || "Error inesperado.");
      setStep("error");
    }
  };

  const reset = () => {
    setFile(null);
    setParsed(null);
    setStep("idle");
    setError(null);
    setResult(null);
    setMismatch(null);
    setPersonLabel("Yo");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-serif font-bold text-accent">Importar Movimientos</h2>

      {/* Drop zone — only show when idle/error */}
      {(step === "idle" || step === "error") && (
        <Card>
          <CardHeader><CardTitle>Sube tu estado de cuenta</CardTitle></CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragActive ? "border-accent bg-accentPale" : "border-border hover:border-accent"
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud size={48} className="text-muted mb-4" />
              {isDragActive ? (
                <p className="text-text font-medium">Suelta el archivo aquí...</p>
              ) : (
                <div className="text-center">
                  <p className="text-text font-medium mb-1">Arrastra y suelta, o haz clic para seleccionar</p>
                  <p className="text-sm text-muted">CSV · XLSX · XLS · PDF</p>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-4 flex items-center justify-between p-4 border border-border rounded-lg bg-surface">
                <div className="flex items-center gap-3">
                  <FileType className="text-accent" />
                  <span className="font-medium text-text truncate max-w-xs">{file.name}</span>
                </div>
                <Button onClick={handleParse}>Analizar archivo</Button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red/10 text-red rounded-lg text-sm">{error}</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Parsed preview */}
      {step === "parsed" && parsed && (
        <Card>
          <CardHeader><CardTitle>Resumen del archivo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border">
                <Building2 size={18} className="text-accent shrink-0" />
                <div>
                  <p className="text-xs text-muted">Banco detectado</p>
                  <p className="text-sm font-medium text-text">{parsed.bank}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border">
                <User size={18} className="text-accent shrink-0" />
                <div>
                  <p className="text-xs text-muted">Titular</p>
                  <p className="text-sm font-medium text-text">
                    {parsed.accountHolder ?? parsed.accountNumber ?? "No detectado"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-accentPale/40 rounded-lg border border-border text-sm text-text">
              <span className="font-semibold">{parsed.transactions.length}</span> transacciones detectadas
              {parsed.accountNumber && (
                <span className="text-muted ml-2">· Cuenta: {parsed.accountNumber}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                ¿De quién es esta cuenta?
              </label>
              <input
                value={personLabel}
                onChange={e => setPersonLabel(e.target.value)}
                placeholder="Ej: Yo, Esposa, Empresa..."
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="text-xs text-muted mt-1">Este nombre aparece como filtro en tus movimientos.</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => handleImport()} className="flex-1">
                Importar {parsed.transactions.length} transacciones
              </Button>
              <Button variant="outline" onClick={reset}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account mismatch warning */}
      {step === "mismatch" && mismatch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle size={20} />
              Cuenta de otra persona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-text">
              Este archivo parece pertenecer a <strong>{mismatch.detectedHolder}</strong>, pero el sistema
              conoce esta cuenta de <strong>{mismatch.knownHolder}</strong> ({mismatch.knownLabel}).
            </p>
            <p className="text-sm text-muted">
              Si deseas agregarlo de todas formas (ej. consolidar ingresos familiares),
              confirma el nombre de esta persona:
            </p>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Nombre / etiqueta</label>
              <input
                value={personLabel}
                onChange={e => setPersonLabel(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleImport(personLabel)} className="flex-1">
                Sí, agregar como &ldquo;{personLabel}&rdquo;
              </Button>
              <Button variant="outline" onClick={reset}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Importing spinner */}
      {step === "importing" && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted">Procesando transacciones...</p>
          </CardContent>
        </Card>
      )}

      {/* Success */}
      {step === "done" && result && (
        <Card>
          <CardContent className="py-8 space-y-4">
            <div className="flex items-center gap-3 text-green">
              <CheckCircle size={24} />
              <span className="font-semibold">Importación completada</span>
            </div>
            <div className="space-y-1 text-sm text-text">
              <p><span className="font-medium">{result.count}</span> transacciones nuevas importadas</p>
              {result.skipped > 0 && (
                <p className="text-muted"><span className="font-medium">{result.skipped}</span> duplicadas ignoradas</p>
              )}
              <p className="text-muted">Banco: {result.bank} · Persona: {result.personLabel}</p>
            </div>
            <Button variant="outline" onClick={reset}>Importar otro archivo</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
