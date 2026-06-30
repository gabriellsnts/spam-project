"use client";

import React, { useState, useMemo } from "react";
import { TrainedModel } from "@/lib/context/domain-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Download, Sliders, RotateCcw, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveConfusionMatrixProps {
  model: TrainedModel;
  domainAccent?: string; // e.g. "violet" | "emerald"
}

interface CellInfo {
  key: "tn" | "fp" | "fn" | "tp";
  label: string;
  abbr: string;
  description: string;
  interpretation: string;
  colorClass: string;
  isCorrect: boolean;
}

const CELLS: CellInfo[] = [
  {
    key: "tn",
    label: "Verdadeiro Negativo",
    abbr: "TN",
    description: "Casos negativos classificados corretamente como negativos.",
    interpretation: "O modelo não detectou risco onde de fato não havia. Ótimo resultado — evita alarmes falsos.",
    colorClass: "emerald",
    isCorrect: true,
  },
  {
    key: "fp",
    label: "Falso Positivo",
    abbr: "FP",
    description: "Casos negativos classificados erroneamente como positivos (Erro Tipo I).",
    interpretation: "O modelo apontou risco onde não havia. Gera intervenções desnecessárias, aumentando custo operacional.",
    colorClass: "rose",
    isCorrect: false,
  },
  {
    key: "fn",
    label: "Falso Negativo",
    abbr: "FN",
    description: "Casos positivos classificados erroneamente como negativos (Erro Tipo II).",
    interpretation: "O modelo não detectou risco real existente. É o erro mais crítico — casos de risco passam despercebidos.",
    colorClass: "amber",
    isCorrect: false,
  },
  {
    key: "tp",
    label: "Verdadeiro Positivo",
    abbr: "TP",
    description: "Casos positivos classificados corretamente como positivos.",
    interpretation: "O modelo detectou corretamente o risco real. Alta sensibilidade operacional — núcleo da utilidade preditiva.",
    colorClass: "emerald",
    isCorrect: true,
  },
];

const DEMO_MATRIX = { tp: 142, tn: 198, fp: 18, fn: 12 };

export function InteractiveConfusionMatrix({ model, domainAccent = "violet" }: InteractiveConfusionMatrixProps) {
  const originalMatrix = model.confusionMatrix;
  const [matrix, setMatrix] = useState(() => originalMatrix ?? DEMO_MATRIX);
  const [isDemo, setIsDemo] = useState(!originalMatrix);
  const [selectedCell, setSelectedCell] = useState<CellInfo | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNormalized, setIsNormalized] = useState(false);

  const total = matrix.tp + matrix.tn + matrix.fp + matrix.fn;
  const pct = (val: number) => total > 0 ? ((val / total) * 100).toFixed(1) : "0.0";

  // Derived metrics (CA03)
  const metrics = useMemo(() => {
    const { tp, tn, fp, fn } = matrix;
    const accuracy = total > 0 ? ((tp + tn) / total) * 100 : 0;
    const precision = (tp + fp) > 0 ? (tp / (tp + fp)) * 100 : 0;
    const recall = (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 0;
    const specificity = (tn + fp) > 0 ? (tn / (tn + fp)) * 100 : 0;
    const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
    const errorRate = total > 0 ? ((fp + fn) / total) * 100 : 0;
    return { accuracy, precision, recall, specificity, f1, errorRate };
  }, [matrix, total]);

  // Normalized values (proportion by actual class row)
  const normalized = useMemo(() => {
    const actualNeg = matrix.tn + matrix.fp;
    const actualPos = matrix.tp + matrix.fn;
    return {
      tn: actualNeg > 0 ? (matrix.tn / actualNeg) * 100 : 0,
      fp: actualNeg > 0 ? (matrix.fp / actualNeg) * 100 : 0,
      fn: actualPos > 0 ? (matrix.fn / actualPos) * 100 : 0,
      tp: actualPos > 0 ? (matrix.tp / actualPos) * 100 : 0,
    };
  }, [matrix]);

  const getDisplayValue = (key: "tn" | "fp" | "fn" | "tp") =>
    isNormalized ? `${normalized[key].toFixed(1)}%` : String(matrix[key]);

  const handleCellEdit = (key: "tn" | "fp" | "fn" | "tp", val: string) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0) {
      setMatrix((prev) => ({ ...prev, [key]: n }));
    }
  };

  const handleReset = () => {
    setMatrix(originalMatrix ?? DEMO_MATRIX);
    setIsDemo(!originalMatrix);
  };

  const handleDemo = () => {
    setMatrix(DEMO_MATRIX);
    setIsDemo(true);
  };

  const handleDownloadCSV = () => {
    const rows = [
      ["", "Previsto Negativo (0)", "Previsto Positivo (1)"],
      ["Real Negativo (0)", matrix.tn, matrix.fp],
      ["Real Positivo (1)", matrix.fn, matrix.tp],
      [],
      ["Métrica", "Valor (%)"],
      ["Acurácia", metrics.accuracy.toFixed(2)],
      ["Precisão", metrics.precision.toFixed(2)],
      ["Recall (Sensibilidade)", metrics.recall.toFixed(2)],
      ["Especificidade", metrics.specificity.toFixed(2)],
      ["F1-Score", metrics.f1.toFixed(2)],
      ["Taxa de Erro", metrics.errorRate.toFixed(2)],
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `matriz-confusao-${model.modelId.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const accentColorMap: Record<string, { border: string; glow: string; badge: string }> = {
    violet: { border: "border-violet-500/30", glow: "shadow-violet-500/10", badge: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
    emerald: { border: "border-emerald-500/30", glow: "shadow-emerald-500/10", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    amber: { border: "border-amber-500/30", glow: "shadow-amber-500/10", badge: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    sky: { border: "border-sky-500/30", glow: "shadow-sky-500/10", badge: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
  };
  const accent = accentColorMap[domainAccent] ?? accentColorMap.violet;

  const cellLayout: { key: "tn" | "fp" | "fn" | "tp" }[][] = [
    [{ key: "tn" }, { key: "fp" }],
    [{ key: "fn" }, { key: "tp" }],
  ];

  const metricItems = [
    { label: "Acurácia", value: metrics.accuracy, help: "Proporção total de predições corretas (TP+TN)/Total" },
    { label: "Precisão", value: metrics.precision, help: "Dos casos positivos previstos, quantos são reais. TP/(TP+FP)" },
    { label: "Recall", value: metrics.recall, help: "Dos casos positivos reais, quantos o modelo detectou. TP/(TP+FN)" },
    { label: "Especificidade", value: metrics.specificity, help: "Dos casos negativos reais, quantos o modelo identificou. TN/(TN+FP)" },
    { label: "F1-Score", value: metrics.f1, help: "Média harmônica entre Precisão e Recall. Equilíbrio entre os dois." },
    { label: "Taxa de Erro", value: metrics.errorRate, help: "Proporção de predições incorretas (FP+FN)/Total", isError: true },
  ];

  return (
    <Card className={cn("border bg-card/50 shadow-lg", accent.border, accent.glow)}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-violet-400" />
              {t("ui_matriz_de_confus_o_277")}{isDemo && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">{t("ui_demo_936")}</span>
              )}
            </CardTitle>
            <CardDescription className="text-[11px] mt-0.5">
              {t("ui_clique_em_uma_c_703")}{total} instâncias de teste
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] px-2"
              onClick={() => setIsNormalized((v) => !v)}
            >
              {isNormalized ? "Contagens" : "Normalizar"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] px-2"
              onClick={() => setIsEditMode((v) => !v)}
            >
              <Sliders className="h-3 w-3 mr-1" />
              {isEditMode ? "Fechar Edição" : "Editar"}
            </Button>
            {isEditMode && (
              <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={handleReset}>
                <RotateCcw className="h-3 w-3 mr-1" />
                {t("ui_reset_838")}</Button>
            )}
            <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={handleDownloadCSV}>
              <Download className="h-3 w-3 mr-1" />
              {t("ui_csv_164")}</Button>
            {!originalMatrix && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] px-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                onClick={handleDemo}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {t("ui_modo_demo_605")}</Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Matrix Grid */}
          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_1fr] gap-1 text-center">
              <div className="w-28" />
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest py-1">{t("ui_previsto_neg_0_826")}</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest py-1">{t("ui_previsto_pos_1_320")}</div>
            </div>

            {cellLayout.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-[auto_1fr_1fr] gap-1 items-stretch">
                <div className="w-28 flex items-center justify-end pr-2">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider text-right leading-tight">
                    {rowIdx === 0 ? "Real Neg. (0)" : "Real Pos. (1)"}
                  </span>
                </div>
                {row.map(({ key }) => {
                  const cellInfo = CELLS.find((c) => c.key === key)!;
                  const isSelected = selectedCell?.key === key;
                  const colorMap: Record<string, string> = {
                    emerald: isSelected
                      ? "bg-emerald-500/20 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      : "bg-emerald-500/8 border-emerald-500/25 hover:border-emerald-400/60 hover:bg-emerald-500/15",
                    rose: isSelected
                      ? "bg-rose-500/20 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                      : "bg-rose-500/8 border-rose-500/25 hover:border-rose-400/60 hover:bg-rose-500/15",
                    amber: isSelected
                      ? "bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                      : "bg-amber-500/8 border-amber-500/25 hover:border-amber-400/60 hover:bg-amber-500/15",
                  };

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCell(isSelected ? null : cellInfo)}
                      className={cn(
                        "relative rounded-xl border p-3 transition-all duration-200 cursor-pointer text-center min-h-[90px] flex flex-col items-center justify-center gap-1",
                        colorMap[cellInfo.colorClass]
                      )}
                    >
                      {isEditMode ? (
                        <input
                          type="number"
                          min={0}
                          value={matrix[key]}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleCellEdit(key, e.target.value)}
                          className="w-16 text-center text-xl font-black bg-transparent border-b border-current text-foreground outline-none font-mono"
                        />
                      ) : (
                        <span className="text-2xl font-black text-foreground font-mono">{getDisplayValue(key)}</span>
                      )}
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider",
                        cellInfo.colorClass === "emerald" ? "text-emerald-400" :
                        cellInfo.colorClass === "rose" ? "text-rose-400" : "text-amber-400"
                      )}>
                        {cellInfo.abbr}
                      </span>
                      <span className="text-[8px] text-muted-foreground font-medium leading-tight text-center">{cellInfo.label}</span>
                      {!isNormalized && total > 0 && (
                        <span className="text-[8px] text-muted-foreground/60">{pct(matrix[key])}%</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Edit mode hint */}
            {isEditMode && (
              <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                <Info className="h-3 w-3" />
                {t("ui_edite_os_valores_para_157")}</p>
            )}
          </div>

          {/* Metrics Panel */}
          <div className="space-y-3">
            {/* Cell detail panel */}
            {selectedCell ? (
              <div className={cn(
                "rounded-xl border p-4 space-y-2 animate-in fade-in slide-in-from-right-4 duration-200",
                selectedCell.colorClass === "emerald" ? "bg-emerald-500/5 border-emerald-500/30" :
                selectedCell.colorClass === "rose" ? "bg-rose-500/5 border-rose-500/30" :
                "bg-amber-500/5 border-amber-500/30"
              )}>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-black px-2 py-0.5 rounded-md border",
                    selectedCell.colorClass === "emerald" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                    selectedCell.colorClass === "rose" ? "bg-rose-500/15 text-rose-400 border-rose-500/30" :
                    "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  )}>
                    {selectedCell.abbr}
                  </span>
                  <span className="text-sm font-bold text-foreground">{selectedCell.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{selectedCell.description}</p>
                <div className="pt-2 border-t border-border/30">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{t("ui_interpreta_o_operacional_775")}</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{selectedCell.interpretation}</p>
                </div>
                <div className="pt-1">
                  <p className="text-lg font-black text-foreground font-mono">{matrix[selectedCell.key]} <span className="text-xs text-muted-foreground font-normal">instâncias ({pct(matrix[selectedCell.key])}%)</span></p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/30 bg-muted/5 p-4 flex flex-col items-center justify-center min-h-[110px] gap-2">
                <Info className="h-5 w-5 text-muted-foreground/40" />
                <p className="text-[11px] text-muted-foreground text-center">{t("ui_clique_em_uma_c_641")}</p>
              </div>
            )}

            {/* Derived metrics */}
            <div className="rounded-xl border border-border/40 bg-card/40 overflow-hidden">
              <div className="px-3 py-2 border-b border-border/30 bg-muted/10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("ui_m_tricas_derivadas_446")}</p>
              </div>
              <div className="divide-y divide-border/20">
                {metricItems.map((m) => (
                  <div key={m.label} className="flex items-center justify-between px-3 py-2 hover:bg-muted/10 transition-colors group">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <span className="hidden group-hover:flex text-[9px] text-muted-foreground/60 italic">{m.help}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", m.isError ? "bg-rose-500" : m.value >= 80 ? "bg-emerald-500" : m.value >= 60 ? "bg-amber-500" : "bg-rose-500")}
                          style={{ width: `${Math.min(m.value, 100)}%` }}
                        />
                      </div>
                      <span className={cn("text-xs font-bold w-12 text-right font-mono",
                        m.isError ? "text-rose-400" :
                        m.value >= 80 ? "text-emerald-400" :
                        m.value >= 60 ? "text-amber-400" : "text-rose-400"
                      )}>
                        {m.value.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
