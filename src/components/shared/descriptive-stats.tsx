"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ClipboardCopy, Check, Download, BarChart3, Database } from "lucide-react";
import { DOMAIN_SCHEMAS } from "./csv-uploader";
import { cn } from "@/lib/utils";
import { useDomain } from "@/lib/context/domain-context";

interface FileDetails {
  name: string;
  size: string;
  encoding: string;
  delimiter: string;
  rows: number;
  headers: string[];
}

interface NumericStats {
  name: string;
  isNumeric: true;
  missingCount: number;
  missingPct: number;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  hasOutliers: boolean;
}

interface TextStats {
  name: string;
  isNumeric: false;
  missingCount: number;
  missingPct: number;
}

type ColumnStats = NumericStats | TextStats;

interface DescriptiveStatsProps {
  fileDetails: FileDetails;
  allRows: string[][];
  activeDomain: string;
}

export function DescriptiveStats({ fileDetails, allRows, activeDomain }: DescriptiveStatsProps) {
  const { t } = useDomain();
  const [copied, setCopied] = useState(false);

  // Função para verificar se a célula está em falta (nula/ausente)
  const isCellMissing = (val: string | undefined | null) => {
    if (val === undefined || val === null) return true;
    const clean = val.trim().toLowerCase();
    return clean === "" || clean === "null" || clean === "undefined" || clean === "nan";
  };

  // Processa estatísticas descritivas das colunas do CSV
  const statsList = useMemo<ColumnStats[]>(() => {
    const totalRows = fileDetails.rows;
    const schema = DOMAIN_SCHEMAS[activeDomain] || [];

    return fileDetails.headers.map((colName, colIdx) => {
      const fieldSchema = schema.find(s => s.name.toLowerCase() === colName.toLowerCase());
      const isNumeric = fieldSchema?.type === "numeric";

      // 1. Contagem inicial de nulos/ausentes ANTES do pré-processamento (CA03)
      const missingCount = allRows.filter(row => isCellMissing(row[colIdx])).length;
      const missingPct = totalRows > 0 ? (missingCount / totalRows) * 100 : 0;

      if (!isNumeric) {
        return {
          name: colName,
          isNumeric: false,
          missingCount,
          missingPct,
        };
      }

      // Filtrar e converter valores numéricos
      const numericValues = allRows
        .map(row => row[colIdx])
        .filter(val => !isCellMissing(val))
        .map(val => {
          const sanitized = val.replace(",", ".");
          return Number(sanitized);
        })
        .filter(val => !isNaN(val));

      let mean = 0;
      let stdDev = 0;
      let min = 0;
      let max = 0;
      let hasOutliers = false;

      if (numericValues.length > 0) {
        // Média aritmética
        mean = numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;

        // Desvio padrão amostral
        if (numericValues.length > 1) {
          const variance = numericValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / numericValues.length;
          // Desvio padrão amostral corrigido de Bessel (n-1)
          stdDev = Math.sqrt(variance * numericValues.length / (numericValues.length - 1));
        }

        min = Math.min(...numericValues);
        max = Math.max(...numericValues);

        // Detecção de Outliers utilizando o Método IQR (Intervalo Interquartil) (CA04)
        const sorted = [...numericValues].sort((a, b) => a - b);
        
        const getPercentile = (arr: number[], p: number) => {
          if (arr.length === 0) return 0;
          if (p <= 0) return arr[0];
          if (p >= 1) return arr[arr.length - 1];
          const idx = (arr.length - 1) * p;
          const low = Math.floor(idx);
          const high = Math.ceil(idx);
          const weight = idx - low;
          return arr[low] * (1 - weight) + arr[high] * weight;
        };

        const q1 = getPercentile(sorted, 0.25);
        const q3 = getPercentile(sorted, 0.75);
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        // Verifica se qualquer valor está além dos limites inferior ou superior de outlier
        hasOutliers = numericValues.some(v => v < lowerBound || v > upperBound);
      }

      return {
        name: colName,
        isNumeric: true,
        missingCount,
        missingPct,
        mean,
        stdDev,
        min,
        max,
        hasOutliers,
      };
    });
  }, [fileDetails, allRows, activeDomain]);

  // Texto formatado para exportação (CA05)
  const summaryText = useMemo(() => {
    let text = `==================================================\n`;
    text += `${t("stats_title") || "RESUMO ESTATÍSTICO DE DADOS IMPORTADOS (RF09)"}\n`;
    text += `==================================================\n`;
    text += `${t("file") || "Arquivo"}: ${fileDetails.name}\n`;
    text += `${t("file_structure") || "Estrutura do Arquivo"}: ${fileDetails.size}\n`;
    text += `${t("encoding") || "Codificação"}: ${fileDetails.encoding}\n`;
    text += `${t("delimiter") || "Delimitador Técnico"}: '${fileDetails.delimiter}'\n`;
    text += `${t("rows_processed") || "Total de Linhas"}: ${fileDetails.rows}\n`;
    text += `${t("cols_processed") || "Total de Colunas"}: ${fileDetails.headers.length}\n`;
    text += `${t("date") || "Data"}: ${new Date().toLocaleString()}\n`;
    text += `==================================================\n\n`;

    statsList.forEach(col => {
      text += `${t("column") || "Coluna"}: ${col.name} (${col.isNumeric ? (t("variable_numeric") || "Numérica") : (t("variable_text") || "Texto")})\n`;
      text += `- ${t("missing_label") || "Valores Ausentes"}: ${col.missingCount} (${col.missingPct.toFixed(2)}%)\n`;
      if (col.isNumeric) {
        text += `- ${t("mean_label") || "Média"}: ${col.mean.toFixed(4)}\n`;
        text += `- ${t("stddev_label") || "Desvio Padrão"}: ${col.stdDev.toFixed(4)}\n`;
        text += `- ${t("min_label") || "Mínimo"}: ${col.min.toFixed(4)}\n`;
        text += `- ${t("max_label") || "Máximo"}: ${col.max.toFixed(4)}\n`;
        text += `- Outliers: ${col.hasOutliers ? "Sim" : "Não"}\n`;
      }
      text += `--------------------------------------------------\n`;
    });

    return text;
  }, [fileDetails, statsList, t]);

  // Copiar para a área de transferência (Clipboard) (CA05)
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar resumo técnico:", err);
    }
  };

  // Baixar resumo como TXT simples (CA05)
  const handleDownloadTxt = () => {
    const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resumo-estatistico-${fileDetails.name.replace(/\.[^/.]+$/, "")}.txt`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Painel Consolidado de Dimensão dos Dados (CA01) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border hover:border-amber-500/30 transition-all duration-300 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {t("file_structure")}
            </CardDescription>
            <CardTitle className="text-lg font-black text-foreground truncate" title={fileDetails.name}>
              {fileDetails.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-mono">
              <Database className="h-3.5 w-3.5 text-amber-500" />
              <span>{fileDetails.encoding} | Delimitador: &apos;{fileDetails.delimiter}&apos;</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-amber-500/30 transition-all duration-300 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {t("rows_processed")}
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground font-mono">
              {fileDetails.rows.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">
              {t("rows_processed_desc")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-amber-500/30 transition-all duration-300 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {t("cols_processed")}
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground font-mono">
              {fileDetails.headers.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">
              {t("cols_processed_desc")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Título do Painel Estatístico com Ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <BarChart3 className="h-4.5 w-4.5 text-amber-500" />
            {t("stats_title")}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {t("stats_desc")}
          </p>
        </div>

        {/* Botão de Exportação do Resumo (CA05) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleCopyToClipboard}
            variant="outline"
            className="text-[10px] font-bold h-8 px-3 text-muted-foreground hover:text-foreground flex-1 sm:flex-initial"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                {t("copied_btn")}
              </>
            ) : (
              <>
                <ClipboardCopy className="h-3.5 w-3.5 mr-1" />
                {t("copy_summary_btn")}
              </>
            )}
          </Button>

          <Button
            onClick={handleDownloadTxt}
            variant="outline"
            className="text-[10px] font-bold h-8 px-3 text-muted-foreground hover:text-foreground flex-1 sm:flex-initial"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            {t("download_summary_txt")}
          </Button>
        </div>
      </div>

      {/* Grid de Cards de Estatísticas por Coluna (CA06) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsList.map((col) => (
          <Card
            key={col.name}
            className={cn(
              "bg-card border-border hover:border-amber-500/40 hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between",
              col.isNumeric && col.hasOutliers ? "border-amber-500/20" : ""
            )}
          >
            {/* Decoração superior estilizada */}
            <div className={cn(
              "h-1 w-full absolute top-0 left-0",
              col.isNumeric ? (col.hasOutliers ? "bg-amber-500" : "bg-muted") : "bg-muted-foreground/30"
            )} />

            <CardHeader className="pb-3 pt-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <CardTitle className="text-xs font-bold text-foreground font-mono truncate max-w-[150px]" title={col.name}>
                    {col.name}
                  </CardTitle>
                  <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">
                    {col.isNumeric ? t("variable_numeric") : t("variable_text")}
                  </CardDescription>
                </div>

                {/* Qualidade Inicial: Valores Ausentes (CA03) */}
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-bold font-mono border",
                  col.missingCount > 0 
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                )}>
                  {t("missing_label")} {col.missingCount} ({col.missingPct.toFixed(1)}%)
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1 flex-1 flex flex-col justify-between">
              {col.isNumeric ? (
                <div className="space-y-4 w-full">
                  {/* Grid de Tendência Central (CA02) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block mb-0.5">
                        {t("mean_label")}
                      </span>
                      <span className="text-lg font-black text-foreground font-mono block truncate">
                        {col.mean.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block mb-0.5">
                        {t("stddev_label")}
                      </span>
                      <span className="text-lg font-black text-foreground font-mono block truncate">
                        {col.stdDev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </span>
                    </div>
                  </div>

                  {/* Valores Limite (Mínimo e Máximo com Alerta de Outlier) (CA02, CA04) */}
                  <div className="flex justify-between items-center text-[11px] border-t border-border/80 pt-2.5 font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-muted-foreground font-sans uppercase font-bold">{t("min_label")}</span>
                      <div className="font-bold text-foreground">
                        {col.min.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </div>
                    </div>

                    <div className="space-y-0.5 text-right">
                      <span className="text-[9px] text-muted-foreground font-sans uppercase font-bold block">{t("max_label")}</span>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Indicador visual de Outlier ao lado da métrica de 'Valor Máximo' (CA04) */}
                        {col.hasOutliers && (
                          <span 
                            className="text-amber-500 animate-pulse shrink-0 cursor-help"
                            title="Outliers (valores atípicos) detectados nesta variável."
                          >
                            <AlertTriangle className="h-4 w-4 fill-amber-500/10" />
                          </span>
                        )}
                        <span className={cn("font-bold font-mono", col.hasOutliers ? "text-amber-500 font-extrabold" : "text-foreground")}>
                          {col.max.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 bg-muted/10 border border-dashed border-border rounded-xl">
                  <p className="text-[10px] text-muted-foreground italic text-center px-4">
                    {t("categorical_not_applicable")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
