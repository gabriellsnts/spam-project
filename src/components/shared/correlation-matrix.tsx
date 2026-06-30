"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDomain } from "@/lib/context/domain-context";


interface CorrelationMatrixProps {
  allRows: string[][];
  headers: string[];
  activeDomain: string;
}

// Compute Pearson correlation coefficient between two numeric arrays
function pearson(a: number[], b: number[]): number {
  const n = a.length;
  if (n < 2) return 0;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  return den === 0 ? 0 : num / den;
}

// Interpret correlation value
function interpretCorr(r: number): string {
  const abs = Math.abs(r);
  const dir = r > 0 ? "positiva" : "negativa";
  if (abs >= 0.9) return `Correlação ${dir} muito forte`;
  if (abs >= 0.7) return `Correlação ${dir} forte`;
  if (abs >= 0.5) return `Correlação ${dir} moderada`;
  if (abs >= 0.3) return `Correlação ${dir} fraca`;
  return "Correlação muito fraca ou nula";
}

// Color scale: -1 = rose, 0 = neutral, +1 = emerald
function corrToColor(r: number, isDiag: boolean): string {
  if (isDiag) return "bg-zinc-700/40";
  if (r > 0.7) return "bg-emerald-500/80";
  if (r > 0.4) return "bg-emerald-500/45";
  if (r > 0.1) return "bg-emerald-500/20";
  if (r > -0.1) return "bg-zinc-500/15";
  if (r > -0.4) return "bg-rose-500/20";
  if (r > -0.7) return "bg-rose-500/45";
  return "bg-rose-500/80";
}

function corrToTextColor(r: number, isDiag: boolean): string {
  if (isDiag) return "text-muted-foreground";
  if (Math.abs(r) > 0.5) return "text-foreground font-bold";
  return "text-muted-foreground";
}

const DEMO_LABELS = ["temperatura", "vibração", "oee", "horas_uso"];
const DEMO_DATA: number[][] = [
  [1.00, 0.82, -0.61, 0.44],
  [0.82, 1.00, -0.55, 0.37],
  [-0.61, -0.55, 1.00, -0.28],
  [0.44, 0.37, -0.28, 1.00],
];

export function CorrelationMatrix({ allRows, headers, activeDomain }: CorrelationMatrixProps) {
  const { t } = useDomain();
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  // Parse numeric columns
  const { numericLabels, corrMatrix } = useMemo(() => {
    if (demoMode) return { numericLabels: DEMO_LABELS, corrMatrix: DEMO_DATA };

    if (!allRows || allRows.length < 2 || !headers.length) {
      return { numericLabels: [], corrMatrix: [] };
    }

    const colArrays: { name: string; values: number[] }[] = [];
    headers.forEach((h, colIdx) => {
      const vals = allRows.map((row) => parseFloat(row[colIdx]?.replace(",", ".")));
      const validVals = vals.filter((v) => !isNaN(v));
      if (validVals.length >= 2) {
        // Keep only parsed (NaN → 0 for length alignment with full rows)
        const aligned = allRows.map((row) => {
          const v = parseFloat(row[colIdx]?.replace(",", "."));
          return isNaN(v) ? null : v;
        });
        const hasEnough = aligned.filter((v) => v !== null).length >= 2;
        if (hasEnough) {
          colArrays.push({ name: h, values: aligned.map((v) => v ?? 0) });
        }
      }
    });

    if (colArrays.length < 2) return { numericLabels: [], corrMatrix: [] };

    const labels = colArrays.map((c) => c.name);
    const matrix = labels.map((_, i) =>
      labels.map((__, j) => pearson(colArrays[i].values, colArrays[j].values))
    );

    return { numericLabels: labels, corrMatrix: matrix };
  }, [allRows, headers, demoMode]);

  const hasData = numericLabels.length >= 2;

  const handleExportCSV = () => {
    const header = ["", ...numericLabels].join(";");
    const rows = numericLabels.map((label, i) =>
      [label, ...corrMatrix[i].map((v) => v.toFixed(4))].join(";")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `correlacao-${activeDomain}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedCell = hoveredCell && hasData
    ? { r: hoveredCell.r, c: hoveredCell.c, val: corrMatrix[hoveredCell.r][hoveredCell.c] }
    : null;

  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-sky-400" />
              {t("ui_matriz_de_correla_o_512")}</CardTitle>
            <CardDescription className="text-[11px] mt-0.5">
              {t("ui_coeficiente_de_pearson_1_4")}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {hasData && (
              <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={handleExportCSV}>
                <Download className="h-3 w-3 mr-1" />
                {t("ui_csv_126")}</Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className={cn("h-7 text-[10px] px-2", demoMode && "border-amber-500/40 text-amber-400")}
              onClick={() => setDemoMode((v) => !v)}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {demoMode ? "Sair do Demo" : "Modo Demo"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {!hasData && !demoMode ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <BarChart3 className="h-10 w-10 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">{t("ui_importe_um_arquivo_csv_305")}</p>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
              onClick={() => setDemoMode(true)}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {t("ui_ver_com_dados_de_907")}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {demoMode && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-500">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                {t("ui_modo_demo_ativo_dados_254")}</div>
            )}

            {/* Correlation interpretation panel */}
            {selectedCell && selectedCell.r !== selectedCell.c && (
              <div className="animate-in fade-in duration-200 rounded-xl border border-border/40 bg-muted/10 px-4 py-3 flex flex-wrap gap-4 items-center">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t("ui_par_selecionado_877")}</p>
                  <p className="text-sm font-bold text-foreground">
                    {numericLabels[selectedCell.r]} × {numericLabels[selectedCell.c]}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t("ui_r_de_pearson_241")}</p>
                  <p className={cn("text-lg font-black font-mono", selectedCell.val > 0 ? "text-emerald-400" : "text-rose-400")}>
                    {selectedCell.val.toFixed(4)}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t("ui_interpreta_o_493")}</p>
                  <p className="text-xs text-foreground/80">{interpretCorr(selectedCell.val)}</p>
                </div>
              </div>
            )}

            {/* Heatmap grid */}
            <div className="overflow-x-auto">
              <div className="min-w-fit space-y-1">
                {/* Column headers */}
                <div className="flex gap-1 pl-28">
                  {numericLabels.map((label) => (
                    <div
                      key={label}
                      className="w-14 text-center text-[8px] text-muted-foreground font-bold uppercase tracking-wider truncate"
                      title={label}
                    >
                      {label.length > 7 ? label.slice(0, 6) + "…" : label}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {numericLabels.map((rowLabel, ri) => (
                  <div key={rowLabel} className="flex items-center gap-1">
                    <div className="w-28 text-right pr-2 text-[9px] text-muted-foreground font-semibold truncate" title={rowLabel}>
                      {rowLabel.length > 12 ? rowLabel.slice(0, 11) + "…" : rowLabel}
                    </div>
                    {numericLabels.map((_, ci) => {
                      const val = corrMatrix[ri][ci];
                      const isDiag = ri === ci;
                      const isHovered = hoveredCell?.r === ri && hoveredCell?.c === ci;
                      return (
                        <div
                          key={ci}
                          onMouseEnter={() => setHoveredCell({ r: ri, c: ci })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={cn(
                            "w-14 h-10 rounded-md flex items-center justify-center cursor-default transition-all duration-150 border",
                            corrToColor(val, isDiag),
                            isHovered && !isDiag ? "ring-2 ring-sky-400/60 scale-105" : "border-transparent",
                            corrToTextColor(val, isDiag)
                          )}
                          title={`${numericLabels[ri]} × ${numericLabels[ci]}: r = ${val.toFixed(3)}`}
                        >
                          <span className="text-[10px] font-mono">{isDiag ? "1.00" : val.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t("ui_escala_de_correla_o_933")}</p>
              <div className="flex items-center gap-1">
                {[-1, -0.7, -0.4, 0, 0.4, 0.7, 1].map((v) => (
                  <div
                    key={v}
                    className={cn("w-6 h-4 rounded text-center flex items-center justify-center", corrToColor(v, false))}
                  />
                ))}
              </div>
              <div className="flex gap-3 text-[9px] text-muted-foreground">
                <span className="text-rose-400 font-bold">{t("ui_1_0_negativa_314")}</span>
                <span>|</span>
                <span className="text-muted-foreground">{t("ui_0_nula_969")}</span>
                <span>|</span>
                <span className="text-emerald-400 font-bold">{t("ui_1_0_positiva_462")}</span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
              <Info className="h-3 w-3 shrink-0 mt-0.5" />
              <span>{t("ui_passe_o_mouse_sobre_470")}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
