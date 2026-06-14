"use client";

import React, { useState, useRef, DragEvent } from "react";
import { useDomain, DOMAINS } from "@/lib/context/domain-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet, Trash2, Info, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Colunas recomendadas/esperadas para cada domínio como orientação ao Engenheiro de Dados
const EXPECTED_COLUMNS: Record<string, string[]> = {
  "maintenance": ["timestamp", "sensor_id", "temperatura", "vibracao", "oee"],
  "demand": ["data", "produto_id", "estoque_atual", "demanda_mensal", "lead_time"],
  "churn": ["cliente_id", "nome", "score_risco", "ltv", "fator_risco", "acao_recomendada"],
  "credit-risk": ["proposta_id", "cliente", "valor", "score", "probabilidade_retorno", "acao"]
};

export interface ColumnSchema {
  name: string;
  type: "numeric" | "text";
}

export const DOMAIN_SCHEMAS: Record<string, ColumnSchema[]> = {
  "maintenance": [
    { name: "timestamp", type: "text" },
    { name: "sensor_id", type: "text" },
    { name: "temperatura", type: "numeric" },
    { name: "vibracao", type: "numeric" },
    { name: "oee", type: "numeric" }
  ],
  "demand": [
    { name: "data", type: "text" },
    { name: "produto_id", type: "text" },
    { name: "estoque_atual", type: "numeric" },
    { name: "demanda_mensal", type: "numeric" },
    { name: "lead_time", type: "numeric" }
  ],
  "churn": [
    { name: "cliente_id", type: "text" },
    { name: "nome", type: "text" },
    { name: "score_risco", type: "numeric" },
    { name: "ltv", type: "numeric" },
    { name: "fator_risco", type: "text" },
    { name: "acao_recomendada", type: "text" }
  ],
  "credit-risk": [
    { name: "proposta_id", type: "text" },
    { name: "cliente", type: "text" },
    { name: "valor", type: "numeric" },
    { name: "score", type: "numeric" },
    { name: "probabilidade_retorno", type: "numeric" },
    { name: "acao", type: "text" }
  ]
};

interface CSVUploaderProps {
  onConfirm?: (
    fileDetails: {
      name: string;
      size: string;
      encoding: string;
      delimiter: string;
      rows: number;
      headers: string[];
    },
    allRows: string[][]
  ) => void;
  onReset?: () => void;
}

export function CSVUploader({ onConfirm, onReset }: CSVUploaderProps = {}) {
  const { 
    activeDomain, 
    addLog,
    isTraining,
    trainingProgress,
    trainingStep,
    trainingETA,
    trainingError,
    trainingErrorDetails,
    showTrainingDetails,
    simulatedFail,
    setSimulatedFail,
    startTraining,
    resetTraining,
    toggleTrainingDetails,
    trainedModels,
    previousTrainedModels,
  } = useDomain();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeModel = activeDomain ? trainedModels[activeDomain] : null;
  const previousModel = activeDomain ? previousTrainedModels[activeDomain] : null;

  // CA05 Comparison logic
  const getPerformanceComparison = () => {
    if (!activeModel || !previousModel) return null;
    
    let activeVal = 0;
    let prevVal = 0;
    let metricName = "";
    
    if (activeModel.type === "Classification") {
      activeVal = activeModel.metrics.aucRoc || 0;
      prevVal = previousModel.metrics.aucRoc || 0;
      metricName = "AUC-ROC";
    } else {
      activeVal = activeModel.metrics.r2 || 0;
      prevVal = previousModel.metrics.r2 || 0;
      metricName = "R² (Score)";
    }
    
    const diff = activeVal - prevVal;
    const diffPct = prevVal > 0 ? (diff / prevVal) * 100 : 0;
    const isImprovement = diff >= 0;
    
    return {
      metricName,
      diff,
      diffPct,
      isImprovement,
      activeVal,
      prevVal
    };
  };

  const comparison = getPerformanceComparison();

  const handleExportMetricsJSON = () => {
    if (!activeModel) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeModel, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `metricas-${activeModel.modelId.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLog(`[Model Export] Exportadas métricas de performance do modelo ${activeModel.modelId} (JSON).`);
  };

  // Estados principais
  const [isDragging, setIsDragging] = useState(false);
  const [allRows, setAllRows] = useState<string[][]>([]);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "preview" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    size: string;
    sizeBytes: number;
    encoding: string;
    delimiter: string;
    rows: number;
    headers: string[];
  } | null>(null);

  const [validationReport, setValidationReport] = useState<{
    isValid: boolean;
    missingColumns: string[];
    typeErrors: { column: string; expected: string; detected: string }[];
    columnTypes: { column: string; expected: string; detected: string; status: "match" | "mismatch" }[];
  } | null>(null);

  const [isReportOpen, setIsReportOpen] = useState(false);

  if (!activeDomain) return null;

  const expectedCols = EXPECTED_COLUMNS[activeDomain] || [];
  const domainInfo = DOMAINS[activeDomain];

  // Helper para obter tokens estéticos específicos do domínio
  const getDomainTheme = (domain: string) => {
    switch (domain) {
      case "maintenance":
        return {
          accent: "text-amber-500",
          border: "border-amber-500/20 hover:border-amber-500/50",
          borderActive: "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-amber-500/[0.03]",
          bg: "bg-amber-500/5",
          progress: "bg-amber-500",
          glow: "glow-amber",
          button: "bg-amber-600 hover:bg-amber-500 text-white"
        };
      case "demand":
        return {
          accent: "text-sky-500",
          border: "border-sky-500/20 hover:border-sky-500/50",
          borderActive: "border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.2)] bg-sky-500/[0.03]",
          bg: "bg-sky-500/5",
          progress: "bg-sky-500",
          glow: "glow-sky",
          button: "bg-sky-600 hover:bg-sky-500 text-white"
        };
      case "churn":
        return {
          accent: "text-violet-500",
          border: "border-violet-500/20 hover:border-violet-500/50",
          borderActive: "border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.2)] bg-violet-500/[0.03]",
          bg: "bg-violet-500/5",
          progress: "bg-violet-500",
          glow: "glow-violet",
          button: "bg-violet-600 hover:bg-violet-500 text-white"
        };
      case "credit-risk":
        return {
          accent: "text-emerald-500",
          border: "border-emerald-500/20 hover:border-emerald-500/50",
          borderActive: "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-emerald-500/[0.03]",
          bg: "bg-emerald-500/5",
          progress: "bg-emerald-500",
          glow: "glow-emerald",
          button: "bg-emerald-600 hover:bg-emerald-500 text-white"
        };
      default:
        return {
          accent: "text-green-500",
          border: "border-green-500/20 hover:border-green-500/50",
          borderActive: "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)] bg-green-500/[0.03]",
          bg: "bg-green-500/5",
          progress: "bg-green-500",
          glow: "glow-emerald",
          button: "bg-green-600 hover:bg-green-500 text-white"
        };
    }
  };

  const theme = getDomainTheme(activeDomain);

  // Formatar tamanho legível
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Heurística de decodificação para suportar UTF-8 e ISO-8859-1 (CA04)
  const detectAndDecodeFile = (arrayBuffer: ArrayBuffer): { text: string; encoding: string } => {
    const view = new Uint8Array(arrayBuffer);
    let isUTF8 = true;
    let i = 0;
    while (i < view.length) {
      if (view[i] <= 0x7F) {
        i++;
      } else if (view[i] >= 0xC2 && view[i] <= 0xDF) {
        if (i + 1 >= view.length || view[i + 1] < 0x80 || view[i + 1] > 0xBF) {
          isUTF8 = false;
          break;
        }
        i += 2;
      } else if (view[i] >= 0xE0 && view[i] <= 0xEF) {
        if (i + 2 >= view.length || view[i + 1] < 0x80 || view[i + 1] > 0xBF || view[i + 2] < 0x80 || view[i + 2] > 0xBF) {
          isUTF8 = false;
          break;
        }
        i += 3;
      } else {
        isUTF8 = false;
        break;
      }
    }

    const encoding = isUTF8 ? "utf-8" : "iso-8859-1";
    const decoder = new TextDecoder(encoding);
    const text = decoder.decode(view);
    return { text, encoding: encoding.toUpperCase() };
  };

  // Validação interna da estrutura e delimitador do CSV (CA02)
  const validateCSV = (text: string) => {
    if (!text || text.trim() === "") {
      throw new Error("O arquivo fornecido está totalmente vazio.");
    }

    const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) {
      throw new Error("Nenhum registro legível de dados foi encontrado.");
    }

    const firstLine = lines[0];
    let delimiter = "";
    if (firstLine.includes(",")) {
      delimiter = ",";
    } else if (firstLine.includes(";")) {
      delimiter = ";";
    } else if (firstLine.includes("\t")) {
      delimiter = "\t";
    } else {
      throw new Error(
        "Estrutura inválida. Separador de campos não detectado. O arquivo deve utilizar vírgulas (,), ponto e vírgulas (;) ou tabulações como delimitador."
      );
    }

    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ""));
    const rowCount = lines.length - 1;

    if (headers.length < 2) {
      throw new Error("O arquivo deve conter pelo menos duas colunas de dados identificáveis.");
    }

    return { delimiter, headers, rowCount };
  };

  // Processamento do arquivo selecionado/dropado
  const processFile = (file: File) => {
    setUploadStatus("idle");
    setErrorMessage("");
    setFileDetails(null);

    // Validação imediata da extensão (CA01, CA05)
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadStatus("error");
      setErrorMessage("Extensão de arquivo inválida. Apenas documentos com a extensão .csv são suportados para importação.");
      return;
    }

    // Validação técnica de limite de tamanho de 5MB (CA06)
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      setUploadStatus("error");
      setErrorMessage(`O arquivo excede o limite máximo permitido de 5 MB (tamanho do arquivo: ${formatBytes(file.size)}).`);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer) {
          throw new Error("Falha ao ler o buffer do arquivo.");
        }

        // Decodificação segura UTF-8 e ISO-8859-1 (CA04)
        const { text, encoding } = detectAndDecodeFile(buffer);

        // Validação estrutural de delimitadores (CA02)
        const { delimiter, headers, rowCount } = validateCSV(text);

        // Lógica de validação (RF07)
        const schema = DOMAIN_SCHEMAS[activeDomain] || [];
        const missingColumns: string[] = [];
        const typeErrors: { column: string; expected: string; detected: string }[] = [];
        const columnTypes: { column: string; expected: string; detected: string; status: "match" | "mismatch" }[] = [];

        const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
        const rawRows = lines.slice(1);
        const allParsedRows = rawRows.map(line => {
          const cells = line.split(delimiter).map(cell => cell.trim().replace(/^["']|["']$/g, ""));
          while (cells.length < headers.length) {
            cells.push("");
          }
          return cells.slice(0, headers.length);
        });

        // 1. Validar colunas obrigatórias
        schema.forEach(expectedField => {
          const index = headers.findIndex(h => h.toLowerCase() === expectedField.name.toLowerCase());
          if (index === -1) {
            missingColumns.push(expectedField.name);
            columnTypes.push({
              column: expectedField.name,
              expected: expectedField.type === "numeric" ? "Numérico" : "Texto",
              detected: "Ausente",
              status: "mismatch"
            });
          } else {
            // 2. Se presente, validar a tipagem
            let detectedType: "numeric" | "text" = "numeric";
            let hasAnyValidValue = false;

            for (let r = 0; r < allParsedRows.length; r++) {
              const val = allParsedRows[r][index];
              if (val !== undefined && val !== null && val !== "") {
                const lowerVal = val.toLowerCase();
                if (lowerVal !== "null" && lowerVal !== "undefined" && lowerVal !== "nan") {
                  hasAnyValidValue = true;
                  const sanitized = val.replace(",", ".");
                  if (isNaN(Number(sanitized))) {
                    detectedType = "text";
                    break;
                  }
                }
              }
            }

            if (!hasAnyValidValue) {
              detectedType = expectedField.type;
            }

            const isMismatch = expectedField.type === "numeric" && detectedType === "text";

            columnTypes.push({
              column: headers[index],
              expected: expectedField.type === "numeric" ? "Numérico" : "Texto",
              detected: detectedType === "numeric" ? "Numérico" : "Texto",
              status: isMismatch ? "mismatch" : "match"
            });

            if (isMismatch) {
              typeErrors.push({
                column: headers[index],
                expected: "Numérico",
                detected: "Texto"
              });
            }
          }
        });

        const isValid = missingColumns.length === 0 && typeErrors.length === 0;

        // Auditoria técnica de erros se a validação falhar (CA05)
        if (!isValid) {
          addLog(
            `[CSV Validation Alert] Falha na validação do arquivo '${file.name}' em ${new Date().toLocaleString()}. Colunas ausentes: [${missingColumns.join(", ") || "Nenhuma"}]. Incompatibilidades de tipo: [${typeErrors.map(e => `${e.column} (Esperado: ${e.expected}, Obtido: ${e.detected})`).join(", ") || "Nenhuma"}].`
          );
        }

        // Feedback de progresso de processamento simulado (CA03)
        setUploadStatus("loading");
        setProgress(0);
        setLoadingStep("Lendo cabeçalhos e decodificando conteúdo...");

        // Fase 1: Leitura e detecção
        setTimeout(() => {
          setProgress(35);
          setLoadingStep(`Codificação ${encoding} identificada. Validando estrutura com delimitador '${delimiter}'...`);

          // Fase 2: Validação e preparação
          setTimeout(() => {
            setProgress(70);
            setLoadingStep(`Tabela de dados validada. Gerando pré-visualização de registros...`);

            // Fase 3: Conclusão do processamento e preparação da pré-visualização
            setTimeout(() => {
              // Parse das primeiras 5 linhas de dados (excluindo cabeçalho)
              const parsedRows = allParsedRows.slice(0, 5);

              setProgress(100);
              setUploadStatus("preview");
              setFileDetails({
                name: file.name,
                size: formatBytes(file.size),
                sizeBytes: file.size,
                encoding,
                delimiter,
                rows: rowCount,
                headers
              });
              setAllRows(allParsedRows);
              setPreviewRows(parsedRows);
              setValidationReport({
                isValid,
                missingColumns,
                typeErrors,
                columnTypes
              });
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }, 800);
          }, 800);
        }, 700);

      } catch (err) {
        setUploadStatus("error");
        const msg = err instanceof Error ? err.message : "Erro desconhecido ao processar o arquivo CSV.";
        setErrorMessage(msg);
      }
    };

    reader.onerror = () => {
      setUploadStatus("error");
      setErrorMessage("Erro de leitura do sistema operacional ao abrir o documento.");
    };

    reader.readAsArrayBuffer(file);
  };

  // Handlers para clique e navegação de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Handlers para Arrastar e Soltar (CA05)
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setUploadStatus("idle");
    setProgress(0);
    setErrorMessage("");
    setFileDetails(null);
    setPreviewRows([]);
    setValidationReport(null);
    setIsReportOpen(false);
    setAllRows([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onReset) {
      onReset();
    }
  };

  const handleConfirm = () => {
    if (!fileDetails) return;
    setUploadStatus("success");
    addLog(
      `[CSV Ingest] Arquivo '${fileDetails.name}' (${fileDetails.size}) importado no módulo ${domainInfo.name}. Codificação: ${fileDetails.encoding}, Delimitador: '${fileDetails.delimiter}', Registros: ${fileDetails.rows}, Colunas: [${fileDetails.headers.join(", ")}].`
    );
    if (onConfirm) {
      onConfirm(fileDetails, allRows);
    }
  };

  const isCellEmptyOrError = (val: string) => {
    if (val === undefined || val === null) return true;
    const lower = val.trim().toLowerCase();
    return lower === "" || lower === "null" || lower === "undefined" || lower === "nan";
  };

  const handleDownloadTemplate = () => {
    const delimiter = fileDetails?.delimiter || ";";
    const csvContent = expectedCols.join(delimiter);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `modelo-exemplo-${activeDomain}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className={cn("bg-card border-border transition-all duration-300 relative overflow-hidden", theme.glow)}>
      <div className={cn("absolute top-0 right-0 h-32 w-32 opacity-[0.03] rounded-full blur-2xl", theme.bg)} />
      
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <FileSpreadsheet className="h-4.5 w-4.5 text-muted-foreground/60" />
          Ingestão de Dados Históricos (Engenheiro de Dados)
        </CardTitle>
        <CardDescription className="text-[11px] text-muted-foreground">
          Importe bases de dados históricas no formato exclusivo CSV para recalibração local dos algoritmos do módulo.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Input Oculto com accept específico (CA01) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
          id="csv-file-input"
        />

        {/* 1. Interface em estado IDLE (Pronto para Upload) */}
        {uploadStatus === "idle" && !isTraining && trainingProgress === 0 && (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={cn(
                "border border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 gap-3 group relative select-none",
                isDragging ? theme.borderActive : theme.border
              )}
            >
              <div className={cn(
                "p-3 rounded-full bg-muted/40 border border-border/80 text-muted-foreground transition-all duration-300 group-hover:scale-110",
                isDragging ? theme.accent : ""
              )}>
                <UploadCloud className="h-6 w-6" />
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Arrastar e soltar arquivo histórico
                </p>
                <p className="text-[10px] text-muted-foreground">
                  ou clique para navegar no computador (máx. 5MB)
                </p>
              </div>

              {/* Tag informativa de formato aceito */}
              <div className="px-2 py-0.5 rounded bg-background border border-border text-[9px] font-bold text-muted-foreground uppercase font-mono tracking-wider">
                Exclusivo CSV (.csv)
              </div>
            </div>

            {/* Guia de Colunas Esperadas */}
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 text-[11px] space-y-2">
              <div className="font-bold text-foreground/80 flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 rounded-full bg-current", theme.accent)} />
                Estrutura de Colunas Esperada:
              </div>
              <p className="text-muted-foreground text-[10px] leading-relaxed">
                Para o correto alinhamento do motor analítico neste módulo, certifique-se de que o CSV contemple os cabeçalhos abaixo (delimitados por <code className="font-mono text-foreground font-semibold px-0.5 bg-muted">,</code> ou <code className="font-mono text-foreground font-semibold px-0.5 bg-muted">;</code>):
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {expectedCols.map((col) => (
                  <span key={col} className="px-2 py-0.5 rounded bg-background border border-border/60 font-mono text-[9px] text-foreground/80">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Interface em estado LOADING (Processando - CA03) */}
        {uploadStatus === "loading" && !isTraining && (
          <div className="border border-border/80 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-muted/10 animate-in fade-in duration-300">
            <Loader2 className={cn("h-8 w-8 animate-spin", theme.accent)} />
            
            <div className="text-center space-y-2 w-full max-w-xs">
              <h4 className="text-xs font-bold text-foreground">Sincronizando dados históricos...</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed h-8 flex items-center justify-center text-center">
                {loadingStep}
              </p>
              
              {/* Barra de Progresso Progressiva */}
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border mt-2">
                <div
                  className={cn("h-full transition-all duration-300", theme.progress)}
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="text-[10px] font-mono text-muted-foreground font-semibold text-right">
                {progress}%
              </div>
            </div>
          </div>
        )}

        {/* 3. Interface em estado PREVIEW (Visualização dos Dados - RF06) */}
        {uploadStatus === "preview" && !isTraining && trainingProgress === 0 && fileDetails && (
          <div className="border border-border/85 rounded-xl p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-300">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full bg-current animate-pulse", theme.accent)} />
                Pré-visualização dos Dados Importados
              </h4>
              <p className="text-[10px] text-muted-foreground">
                Confira a amostragem das primeiras 5 linhas de dados para atestar o correto mapeamento das colunas e a ausência de problemas de codificação.
              </p>
            </div>

            {/* Cabeçalho de Contexto do Arquivo (CA06) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-muted/40 border border-border/60 rounded-xl text-[10px] font-mono gap-2">
              <div className="space-y-0.5">
                <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Arquivo</span>
                <span className="text-foreground font-bold truncate max-w-[250px] block" title={fileDetails.name}>
                  {fileDetails.name}
                </span>
              </div>
              <div className="space-y-0.5 sm:text-right">
                <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Tamanho Total</span>
                <span className="text-foreground font-semibold">{fileDetails.size}</span>
              </div>
            </div>

            {/* Alerta de Validação com Opções de Baixar Modelo e Ver Relatório (CA02, CA06) */}
            {validationReport && !validationReport.isValid && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl text-[11px] text-rose-500 space-y-2.5 animate-in fade-in duration-300">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  Inconsistências Detectadas na Validação de Esquema
                </div>
                <p className="text-[10px] leading-relaxed text-rose-500/90 font-medium">
                  O validador automático encontrou inconsistências na estrutura do arquivo. O início do treinamento está bloqueado até que as seguintes pendências sejam resolvidas:
                </p>
                <div className="space-y-1.5 pl-1 font-sans text-[10px]">
                  {validationReport.missingColumns.length > 0 && (
                    <div>
                      <strong>• Colunas obrigatórias ausentes:</strong> {validationReport.missingColumns.join(", ")}
                    </div>
                  )}
                  {validationReport.typeErrors.length > 0 && (
                    <div>
                      <strong>• Incompatibilidade de tipos de dados:</strong> {validationReport.typeErrors.map(e => `A coluna '${e.column}' deveria ser do tipo ${e.expected}`).join(", ")}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-1.5 border-t border-rose-500/15">
                  <Button
                    onClick={() => setIsReportOpen(true)}
                    variant="outline"
                    className="text-[9px] font-bold h-7 px-2.5 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500"
                  >
                    <Info className="h-3.5 w-3.5 mr-1 shrink-0" />
                    Ver Relatório de Conformidade
                  </Button>
                  <Button
                    onClick={handleDownloadTemplate}
                    variant="outline"
                    className="text-[9px] font-bold h-7 px-2.5 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500"
                  >
                    <Download className="h-3.5 w-3.5 mr-1 shrink-0" />
                    Baixar Modelo de Exemplo
                  </Button>
                </div>
              </div>
            )}

            {/* Tabela de Visualização com Scroll Horizontal (CA04) */}
            <div className="overflow-x-auto w-full max-w-full border border-border/80 rounded-xl bg-card shadow-inner scrollbar-thin scrollbar-thumb-muted-foreground/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    {fileDetails.headers.map((header) => (
                      <th
                        key={header}
                        className="p-2.5 text-[9px] font-bold text-muted-foreground uppercase font-sans border-r border-border/40 min-w-[120px]"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={fileDetails.headers.length}
                        className="p-4 text-[10px] text-center text-muted-foreground italic border-b border-border/60"
                      >
                        Nenhum registro de dados disponível para visualização.
                      </td>
                    </tr>
                  ) : (
                    previewRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-muted/20 transition-colors duration-150">
                        {row.map((cell, cIdx) => {
                          const isError = isCellEmptyOrError(cell);
                          return (
                            <td
                              key={cIdx}
                              className={cn(
                                "p-2.5 border-r border-b border-border/60 text-[10px] min-w-[120px] max-w-[200px] truncate font-mono",
                                isError ? "bg-rose-500/10 text-rose-500 font-semibold italic border-rose-500/20" : "text-foreground/80"
                              )}
                              title={cell}
                            >
                              {isError ? (
                                <span className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                                  [vazio/erro]
                                </span>
                              ) : (
                                cell
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Controles de Confirmação/Descarte com Bloqueio de Treino (CA03) */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <span className="text-[9px] text-muted-foreground italic font-medium">
                Exibindo as primeiras {previewRows.length} de {fileDetails.rows} linhas detectadas.
              </span>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="text-[10px] font-bold h-8 px-3.5 border-border hover:bg-muted flex-1 sm:flex-initial"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Descartar Importação
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={validationReport ? !validationReport.isValid : false}
                  className={cn(
                    "text-[10px] font-bold h-8 px-3.5 flex-1 sm:flex-initial",
                    (validationReport ? !validationReport.isValid : false)
                      ? "bg-muted text-muted-foreground border-border cursor-not-allowed hover:bg-muted"
                      : theme.button
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Confirmar e Avançar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Interface em estado SUCCESS (Concluído) */}
        {uploadStatus === "success" && !isTraining && trainingProgress === 0 && fileDetails && (
          <div className="border border-emerald-500/20 bg-emerald-500/[0.02] rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4 animate-in zoom-in-95 duration-300">
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div className="space-y-4 flex-1 w-full">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground">Importação concluída com sucesso!</h4>
                <p className="text-[10px] text-muted-foreground">
                  A base histórica foi validada, decodificada e já está pronta para processamento pelo motor analítico.
                </p>
              </div>

              {/* Informações detalhadas do arquivo */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-card border border-border/80 rounded-lg text-[10px] font-mono">
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Arquivo</span>
                  <span className="text-foreground font-semibold truncate block max-w-[150px]" title={fileDetails.name}>
                    {fileDetails.name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Tamanho</span>
                  <span className="text-foreground font-semibold">{fileDetails.size}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Codificação</span>
                  <span className="text-foreground font-semibold">{fileDetails.encoding}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Delimitador</span>
                  <span className="text-foreground font-semibold font-sans">
                    {fileDetails.delimiter === "\t" ? "Tabulação (Tab)" : `'${fileDetails.delimiter}'`}
                  </span>
                </div>
                <div className="col-span-2 border-t border-border/80 pt-2 mt-1">
                  <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Registros Ingeridos</span>
                  <span className="text-emerald-500 font-bold text-xs">{fileDetails.rows} linhas detectadas</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-border/60">
                {/* Simular erro checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={simulatedFail}
                    onChange={(e) => setSimulatedFail(e.target.checked)}
                    className="rounded border-border text-rose-600 bg-background focus:ring-0 h-3.5 w-3.5 transition"
                  />
                  <span className="text-[10px] text-muted-foreground hover:text-foreground font-medium">
                    Simular erro crítico (OOM) aos 45% (fins de teste)
                  </span>
                </label>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="text-[10px] font-bold h-8 px-3.5 border-border hover:bg-muted"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Limpar
                  </Button>
                  <Button
                    onClick={() => startTraining(fileDetails.sizeBytes, fileDetails.rows, allRows)}
                    className={cn("text-[10px] font-bold h-8 px-3.5", theme.button)}
                  >
                    Iniciar Treinamento do Modelo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Interface em estado ERROR (Erro de Validação) */}
        {uploadStatus === "error" && !isTraining && trainingProgress === 0 && (
          <div className="border border-rose-500/20 bg-rose-500/[0.02] rounded-xl p-5 flex items-start gap-3.5 animate-in shake duration-300">
            <div className="p-2 rounded-full bg-rose-500/10 text-rose-500 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>

            <div className="space-y-3.5 flex-1 w-full">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground">Falha na validação do arquivo</h4>
                <p className="text-[10px] text-rose-500 leading-relaxed font-semibold">
                  {errorMessage}
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleReset}
                  className={cn("text-[10px] font-bold h-8 px-3.5", theme.button)}
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Interface em estado de TREINAMENTO (Ativo ou Finalizado - CA01) */}
        {(isTraining || trainingProgress > 0) && fileDetails && (
          <div className={cn(
            "border rounded-xl p-6 flex flex-col gap-5 transition-all duration-300 animate-in zoom-in-95",
            trainingError 
              ? "border-rose-500/20 bg-rose-500/[0.02]" 
              : trainingProgress === 100 
                ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                : "border-border/80 bg-muted/10"
          )}>
            <div className="flex items-start gap-4">
              {/* Central loader icon (CA01) */}
              <div className="shrink-0 mt-0.5">
                {trainingError ? (
                  <div className="p-3 rounded-full bg-rose-500/10 text-rose-500 shrink-0 animate-bounce">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                ) : trainingProgress === 100 ? (
                  <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                ) : (
                  <div className="p-3 rounded-full bg-muted border border-border/80 text-muted-foreground relative">
                    <Loader2 className={cn("h-6 w-6 animate-spin", theme.accent)} />
                  </div>
                )}
              </div>

              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  {trainingError ? (
                    <span className="text-rose-500">Treinamento Interrompido por Falha Crítica</span>
                  ) : trainingProgress === 100 ? (
                    <span className="text-emerald-500">Treinamento Concluído com Sucesso Absoluto!</span>
                  ) : (
                    <span>Treinamento do Modelo em Andamento...</span>
                  )}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {trainingError 
                    ? "O motor analítico encontrou uma exceção não tratada durante o processamento de gradientes."
                    : trainingProgress === 100
                      ? "Os parâmetros do algoritmo foram recalibrados com sucesso e o modelo está pronto para produção."
                      : `Processando base de dados histórica '${fileDetails.name}' com ${fileDetails.rows} registros.`}
                </p>
              </div>
            </div>

            {/* Dynamic Stage Text (CA02) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className={cn(
                  "font-semibold flex items-center gap-1.5",
                  trainingError ? "text-rose-500" : trainingProgress === 100 ? "text-emerald-500" : theme.accent
                )}>
                  {!trainingError && trainingProgress < 100 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                  )}
                  {trainingStep}
                </span>
                
                {/* Countdown Timer (CA04) */}
                {!trainingError && trainingProgress < 100 && trainingETA > 0 && (
                  <span className="text-[10px] text-muted-foreground font-mono bg-muted border border-border/80 px-2 py-0.5 rounded-md font-semibold">
                    Tempo restante estimado: {trainingETA}s
                  </span>
                )}
              </div>

              {/* Progress Bar (CA01) */}
              <div className="w-full bg-muted h-3.5 rounded-full overflow-hidden border border-border/80 p-[2px]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    trainingError 
                      ? "bg-rose-500" 
                      : trainingProgress === 100 
                        ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                        : theme.progress
                  )}
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                <span>Progresso Real</span>
                <span className="font-bold">{trainingProgress}%</span>
              </div>
            </div>

            {/* Technical Error Stacktrace (CA06) */}
            {trainingError && trainingErrorDetails && (
              <div className="space-y-2 animate-in fade-in duration-350">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Mapeamento de Falha</span>
                  <Button
                    onClick={toggleTrainingDetails}
                    variant="outline"
                    className="text-[9px] font-bold h-6 px-2 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-mono"
                  >
                    {showTrainingDetails ? "Ocultar Detalhes" : "Ver Detalhes do Erro"}
                  </Button>
                </div>

                {showTrainingDetails && (
                  <pre className="p-3.5 bg-zinc-950/90 text-rose-400 border border-rose-500/20 rounded-lg text-[9px] leading-relaxed font-mono overflow-x-auto max-h-[160px] scrollbar-thin scrollbar-thumb-rose-500/20">
                    {trainingErrorDetails}
                  </pre>
                )}
              </div>
            )}

            {/* Metrics improvement mock on success */}
            {trainingProgress === 100 && activeModel && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-[11px] text-emerald-600 dark:text-emerald-400 space-y-2.5 animate-in fade-in duration-500">
                <p className="font-bold flex items-center gap-1 text-xs text-emerald-550 dark:text-emerald-400">
                  ✨ Recalibração de Modelo Concluída!
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-mono border-b border-emerald-500/15 pb-2">
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">ID do Modelo</span>
                    <span className="text-foreground font-semibold">{activeModel.modelId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Algoritmo Utilizado</span>
                    <span className="text-foreground font-semibold">{activeModel.algorithm}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Divisão dos Dados (Treino/Teste)</span>
                    <span className="text-foreground font-semibold">{activeModel.trainSize} (80%) / {activeModel.testSize} (20%)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Tipo de Problema</span>
                    <span className="text-foreground font-semibold">{activeModel.type === "Classification" ? "Classificação" : "Regressão"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Métricas de Validação (Conjunto de Teste)</span>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {activeModel.type === "Classification" ? (
                      <>
                        <div 
                          className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded cursor-help"
                          title="Área sob a Curva ROC. Varia de 0.5 (aleatório) a 1.0 (perfeito). Indica o poder discriminatório do modelo. Valores acima de 0.90 são excepcionais."
                        >
                          <span className="text-muted-foreground text-[8px] uppercase block">AUC-ROC</span>
                          <span className="text-foreground font-bold font-mono">{((activeModel.metrics.aucRoc || 0) * 100).toFixed(2)}%</span>
                        </div>
                        <div 
                          className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded cursor-help"
                          title="Acurácia Geral. Proporção de acertos do modelo sobre todas as predições. Eficiente para classes balanceadas. Bom acima de 85%."
                        >
                          <span className="text-muted-foreground text-[8px] uppercase block">Acurácia</span>
                          <span className="text-foreground font-bold font-mono">{((activeModel.metrics.accuracy || 0) * 100).toFixed(2)}%</span>
                        </div>
                        <div 
                          className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded cursor-help"
                          title="Precisão do Modelo. Indica a proporção de verdadeiros positivos dentre todas as classificações positivas. Minimiza falsos alarmes."
                        >
                          <span className="text-muted-foreground text-[8px] uppercase block">Precisão</span>
                          <span className="text-foreground font-bold font-mono">{((activeModel.metrics.precision || 0) * 100).toFixed(2)}%</span>
                        </div>
                        <div 
                          className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded cursor-help"
                          title="Sensibilidade (Recall). Proporção de casos reais positivos capturados pelo modelo. Evita negligenciar falhas ou riscos críticos."
                        >
                          <span className="text-muted-foreground text-[8px] uppercase block">Sensibilidade</span>
                          <span className="text-foreground font-bold font-mono">{((activeModel.metrics.recall || 0) * 100).toFixed(2)}%</span>
                        </div>
                        <div 
                          className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded cursor-help"
                          title="F1-Score. Média harmônica equilibrando Precisão e Sensibilidade em uma única métrica técnica."
                        >
                          <span className="text-muted-foreground text-[8px] uppercase block">F1-Score</span>
                          <span className="text-foreground font-bold font-mono">{(activeModel.metrics.f1Score || 0).toFixed(3)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div 
                          className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded cursor-help"
                          title="Coeficiente de Determinação (R²). Explica qual percentual da variância dos dados foi mapeado pelo modelo. Excelente acima de 90%."
                        >
                          <span className="text-muted-foreground text-[8px] uppercase block">R² (Score)</span>
                          <span className="text-foreground font-bold font-mono">{(activeModel.metrics.r2 || 0).toFixed(4)}</span>
                        </div>
                        <div 
                          className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded cursor-help"
                          title="Erro Quadrático Médio Root (RMSE). Desvio padrão dos resíduos de previsão. Quanto menor o valor em relação à faixa basal, melhor."
                        >
                          <span className="text-muted-foreground text-[8px] uppercase block">RMSE</span>
                          <span className="text-foreground font-bold font-mono">{(activeModel.metrics.rmse || 0).toFixed(3)}</span>
                        </div>
                        <div 
                          className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded cursor-help"
                          title="Erro Absoluto Médio (MAE). Distância absoluta média entre o valor real e a previsão. Não penaliza outliers de forma exponencial."
                        >
                          <span className="text-muted-foreground text-[8px] uppercase block">MAE</span>
                          <span className="text-foreground font-bold font-mono">{(activeModel.metrics.mae || 0).toFixed(3)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Comparação com a Sessão Anterior (CA05) */}
                {comparison && (
                  <div className="p-3.5 bg-card border border-border/80 rounded-xl flex items-center justify-between gap-3 text-[10px] animate-in fade-in duration-300">
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Comparação com Modelo Anterior</span>
                      <p className="text-muted-foreground font-sans">
                        Variação na métrica primária <strong>{comparison.metricName}</strong>:
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold text-xs">
                      {comparison.isImprovement ? (
                        <span className="text-emerald-500 flex items-center gap-0.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                          ▲ +{comparison.diffPct.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-0.5 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded">
                          ▼ {comparison.diffPct.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-1 pt-1.5 border-t border-emerald-500/15">
                  <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Hiperparâmetros Calibrados</span>
                  <pre className="p-2 bg-zinc-950/90 text-emerald-400/90 border border-emerald-500/10 rounded text-[9px] font-mono leading-relaxed overflow-x-auto max-h-[80px]">
                    {JSON.stringify(activeModel.hyperparameters, null, 2)}
                  </pre>
                </div>
                
                <p className="text-[10px] text-muted-foreground leading-relaxed pl-1 pt-1 font-sans">
                  Os parâmetros do motor analítico do módulo <strong>{DOMAINS[activeDomain].name}</strong> foram sincronizados localmente e estão ativos para previsões em tempo real nesta sessão.
                </p>
              </div>
            )}

            {/* Control buttons inside training panel */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border/40 mt-1">
              {trainingError ? (
                <>
                  <Button
                    onClick={resetTraining}
                    variant="outline"
                    className="text-[10px] font-bold h-8 px-3.5 border-border hover:bg-muted"
                  >
                    Descartar e Voltar
                  </Button>
                  <Button
                    onClick={() => {
                      resetTraining();
                      setTimeout(() => {
                        startTraining(fileDetails.sizeBytes, fileDetails.rows, allRows);
                      }, 100);
                    }}
                    className="text-[10px] font-bold h-8 px-3.5 bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    Tentar Novamente
                  </Button>
                </>
              ) : trainingProgress === 100 ? (
                <>
                  <Button
                    onClick={handleExportMetricsJSON}
                    variant="outline"
                    className="text-[10px] font-bold h-8 px-3.5 border-border hover:bg-muted text-foreground"
                  >
                    Exportar JSON
                  </Button>
                  <Button
                    onClick={() => {
                      resetTraining();
                      handleReset();
                    }}
                    className="text-[10px] font-bold h-8 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Concluir e Fechar
                  </Button>
                </>
              ) : (
                <Button
                  onClick={resetTraining}
                  variant="outline"
                  className="text-[10px] font-bold h-8 px-3.5 border-rose-500/25 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500"
                >
                  Cancelar Treinamento
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Pop-up do Relatório de Conformidade (CA04) */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-xl p-5 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/80">
            <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5 font-sans">
              <FileSpreadsheet className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              Relatório de Conformidade de Esquema
            </DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
              Comparação detalhada entre a estrutura detectada no arquivo importado e o esquema esperado pelo domínio.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="overflow-hidden border border-border/80 rounded-lg bg-background">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-muted/40 border-b border-border font-sans font-bold text-muted-foreground uppercase text-[8px]">
                    <th className="p-2 border-r border-border/40">Coluna</th>
                    <th className="p-2 border-r border-border/40">Esperado</th>
                    <th className="p-2 border-r border-border/40">Detectado</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {validationReport?.columnTypes.map((col, idx) => (
                    <tr key={idx} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                      <td className="p-2 border-r border-border/40 text-foreground font-semibold font-sans">{col.column}</td>
                      <td className="p-2 border-r border-border/40 text-muted-foreground">{col.expected}</td>
                      <td className={cn(
                        "p-2 border-r border-border/40",
                        col.detected === "Ausente" ? "text-rose-500 font-bold" : "text-muted-foreground"
                      )}>{col.detected}</td>
                      <td className="p-2">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                          col.status === "match" 
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse"
                        )}>
                          {col.status === "match" ? "Conforme" : "Erro"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {validationReport && !validationReport.isValid && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 text-[9px] text-rose-500/90 leading-relaxed font-sans border border-rose-500/20">
                <strong>Nota Técnica:</strong> A divergência na estrutura impede a aprovação pelo validador. Por favor, ajuste os dados conforme os tipos indicados na coluna <em>Esperado</em>.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/80">
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="text-[10px] font-bold h-8 px-3.5 border-border hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Modelo de Exemplo
            </Button>
            <Button
              onClick={() => setIsReportOpen(false)}
              className={cn("text-[10px] font-bold h-8 px-3.5", theme.button)}
            >
              Fechar Relatório
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
