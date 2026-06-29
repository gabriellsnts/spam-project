"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, UploadCloud, Loader2, Sparkles, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, BarChart3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BatchRow {
  id: string;
  inputs: Record<string, string>;
  result: string;
  resultClass: "success" | "warning" | "danger" | "info";
  confidence?: number;
  extra?: Record<string, string | number>;
}

interface BatchPredictionProps {
  domain: string;
  domainAccent?: string;
  columnNames: string[];           // input column names for CSV header hint
  processRow: (row: Record<string, string>) => BatchRow; // prediction fn per row
  demoRows?: Record<string, string>[]; // demo input rows
  title?: string;
  description?: string;
}

const PAGE_SIZE = 10;

const RESULT_COLORS: Record<string, string> = {
  success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  warning: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  danger: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  info: "text-sky-400 bg-sky-500/10 border-sky-500/30",
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const delimiters = [";", ",", "\t"];
  let delimiter = ",";
  for (const d of delimiters) {
    if (lines[0].includes(d)) { delimiter = d; break; }
  }
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ""));
  return lines.slice(1).map((line) => {
    const cells = line.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ""; });
    return row;
  }).filter((r) => Object.values(r).some((v) => v !== ""));
}

export function BatchPrediction({
  domain,
  domainAccent = "emerald",
  columnNames,
  processRow,
  demoRows,
  title = "Predição em Lote",
  description = "Carregue um CSV para processar múltiplas entradas simultaneamente.",
}: BatchPredictionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<BatchRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterClass, setFilterClass] = useState<string>("all");

  const accentClasses: Record<string, { button: string; progress: string; badge: string }> = {
    emerald: { button: "bg-emerald-600 hover:bg-emerald-500 text-white", progress: "bg-emerald-500", badge: "text-emerald-400 border-emerald-500/30" },
    violet: { button: "bg-violet-600 hover:bg-violet-500 text-white", progress: "bg-violet-500", badge: "text-violet-400 border-violet-500/30" },
    amber: { button: "bg-amber-600 hover:bg-amber-500 text-white", progress: "bg-amber-500", badge: "text-amber-400 border-amber-500/30" },
    sky: { button: "bg-sky-600 hover:bg-sky-500 text-white", progress: "bg-sky-500", badge: "text-sky-400 border-sky-500/30" },
  };
  const ac = accentClasses[domainAccent] ?? accentClasses.emerald;

  const processRows = useCallback(async (rows: Record<string, string>[]) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResults([]);
    setPage(1);

    const batchResults: BatchRow[] = [];
    const chunkSize = Math.max(1, Math.ceil(rows.length / 20));

    for (let i = 0; i < rows.length; i++) {
      try {
        const result = processRow(rows[i]);
        batchResults.push(result);
      } catch {
        batchResults.push({
          id: String(i + 1),
          inputs: rows[i],
          result: "Erro de processamento",
          resultClass: "danger",
        });
      }

      if (i % chunkSize === 0 || i === rows.length - 1) {
        setProgress(Math.round(((i + 1) / rows.length) * 100));
        await new Promise((r) => setTimeout(r, 30));
      }
    }

    setResults(batchResults);
    setIsProcessing(false);
  }, [processRow]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setError("Apenas arquivos .csv são aceitos.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) {
        setError("O arquivo CSV está vazio ou com formato inválido.");
        return;
      }
      processRows(rows);
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  const handleDemo = () => {
    if (!demoRows || demoRows.length === 0) return;
    setFileName("dados-demo.csv");
    processRows(demoRows);
  };

  const handleReset = () => {
    setResults([]);
    setFileName(null);
    setError(null);
    setProgress(0);
    setPage(1);
    setFilterClass("all");
  };

  const filteredResults = useMemo(() => {
    if (filterClass === "all") return results;
    return results.filter((r) => r.resultClass === filterClass);
  }, [results, filterClass]);

  const totalPages = Math.ceil(filteredResults.length / PAGE_SIZE);
  const pageResults = filteredResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(() => {
    const counts: Record<string, number> = { success: 0, warning: 0, danger: 0, info: 0 };
    results.forEach((r) => { counts[r.resultClass] = (counts[r.resultClass] || 0) + 1; });
    return counts;
  }, [results]);

  const handleExportCSV = () => {
    if (!results.length) return;
    const headers = ["#", "Resultado", "Classe", ...columnNames];
    const rows = results.map((r, i) => [
      i + 1,
      r.result,
      r.resultClass,
      ...columnNames.map((col) => r.inputs[col] ?? ""),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-${domain}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryItems = [
    { key: "success", label: "Aprovados / OK", color: "emerald" },
    { key: "warning", label: "Atenção / Revisão", color: "amber" },
    { key: "danger", label: "Rejeitados / Críticos", color: "rose" },
    { key: "info", label: "Análise Manual", color: "sky" },
  ];

  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground/60" />
              {title}
            </CardTitle>
            <CardDescription className="text-[11px] mt-0.5">{description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {results.length > 0 && (
              <>
                <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={handleExportCSV}>
                  <Download className="h-3 w-3 mr-1" />
                  Exportar CSV
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 text-muted-foreground" onClick={handleReset}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              </>
            )}
            {demoRows && demoRows.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] px-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                onClick={handleDemo}
                disabled={isProcessing}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Modo Demo
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Upload area */}
        {!results.length && !isProcessing && (
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/50 hover:border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all group hover:bg-muted/5"
            >
              <UploadCloud className="h-8 w-8 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Clique para carregar CSV de lote</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Colunas esperadas: <span className="font-mono text-[10px]">{columnNames.join(", ")}</span>
                </p>
              </div>
              <Button size="sm" className={cn("text-[11px] h-8 px-4", ac.button)}>
                Selecionar Arquivo
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            {error && (
              <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Processing progress */}
        {isProcessing && (
          <div className="space-y-3 py-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Processando {fileName}...</span>
            </div>
            <div className="max-w-sm mx-auto space-y-1.5">
              <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-200", ac.progress)}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground">{progress}% concluído</p>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && !isProcessing && (
          <div className="space-y-4">
            {/* File tag */}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-foreground">{fileName}</span>
              <span className="text-xs text-muted-foreground">— {results.length} registros processados</span>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {summaryItems.filter((s) => summary[s.key] > 0).map((s) => (
                <button
                  key={s.key}
                  onClick={() => { setFilterClass(filterClass === s.key ? "all" : s.key); setPage(1); }}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    filterClass === s.key
                      ? `bg-${s.color}-500/15 border-${s.color}-500/40`
                      : "bg-muted/10 border-border/30 hover:bg-muted/20"
                  )}
                >
                  <p className={`text-lg font-black font-mono text-${s.color}-400`}>{summary[s.key]}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </button>
              ))}
            </div>

            {/* Filter indicator */}
            {filterClass !== "all" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Filtrando por: <strong className="text-foreground capitalize">{filterClass}</strong></span>
                <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1" onClick={() => setFilterClass("all")}>
                  Limpar filtro
                </Button>
              </div>
            )}

            {/* Results table */}
            <div className="rounded-xl border border-border/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/10">
                      <th className="text-left px-3 py-2 font-bold text-muted-foreground w-8">#</th>
                      {columnNames.slice(0, 3).map((col) => (
                        <th key={col} className="text-left px-3 py-2 font-bold text-muted-foreground capitalize">{col.replace(/_/g, " ")}</th>
                      ))}
                      <th className="text-left px-3 py-2 font-bold text-muted-foreground">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {pageResults.map((row, i) => (
                      <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-3 py-2 text-muted-foreground font-mono">{(page - 1) * PAGE_SIZE + i + 1}</td>
                        {columnNames.slice(0, 3).map((col) => (
                          <td key={col} className="px-3 py-2 text-foreground/80 max-w-[120px] truncate" title={row.inputs[col]}>
                            {row.inputs[col] ?? "—"}
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          <span className={cn("px-2 py-0.5 rounded-full border text-[10px] font-bold", RESULT_COLORS[row.resultClass])}>
                            {row.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  Pág {page} de {totalPages} ({filteredResults.length} registros)
                </p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
