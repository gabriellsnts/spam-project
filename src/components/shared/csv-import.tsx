"use client";

import React, { useRef, useState } from "react";
import { useDomain } from "@/lib/context/domain-context";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BarChart3,
  Database,
  RefreshCw,
  FileSpreadsheet,
  FileCheck,
  Sliders,
  Download,
  Info,
  ChevronRight,
  List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProcessedCell {
  raw: string;
  display: string;
  normalized: string;
  isImputed: boolean;
}

interface ColumnMetadata {
  name: string;
  type: "numeric" | "categorical";
  missingCount: number;
  imputedValue: string;
  min?: number;
  max?: number;
  percentageAltered: number;
}

interface ProcessedRow {
  [colName: string]: ProcessedCell;
}

export function CSVImport() {
  const { activeDomain, addLog } = useDomain();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados principais de processamento
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Dados pós-processamento
  const [fileName, setFileName] = useState("");
  const [fileSizeStr, setFileSizeStr] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnsInfo, setColumnsInfo] = useState<ColumnMetadata[]>([]);
  const [processedRows, setProcessedRows] = useState<ProcessedRow[]>([]);
  const [totalImputed, setTotalImputed] = useState(0);
  const [localAuditLogs, setLocalAuditLogs] = useState<string[]>([]);

  // Estados de navegação/visualização interna
  const [activeTab, setActiveTab] = useState<"report" | "preview" | "logs">("report");
  const [previewMode, setPreviewMode] = useState<"original" | "normalized">("original");

  const addLocalLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLocalAuditLogs((prev) => [`[${time}] ${msg}`, ...prev]);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Helper para obter cores baseadas no domínio do projeto
  const getThemeColor = () => {
    if (!activeDomain) return { text: "text-green-500", bg: "bg-green-600 hover:bg-green-500", border: "border-green-500/20" };
    switch (activeDomain) {
      case "maintenance":
        return { text: "text-amber-500", bg: "bg-amber-600 hover:bg-amber-500 text-white", border: "border-amber-500/20" };
      case "demand":
        return { text: "text-sky-500", bg: "bg-sky-600 hover:bg-sky-500 text-white", border: "border-sky-500/20" };
      case "churn":
        return { text: "text-violet-500", bg: "bg-violet-600 hover:bg-violet-500 text-white", border: "border-violet-500/20" };
      case "credit-risk":
        return { text: "text-emerald-500", bg: "bg-emerald-600 hover:bg-emerald-500 text-white", border: "border-emerald-500/20" };
    }
  };

  const theme = getThemeColor();

  // Helper para decodificar arquivo suportando UTF-8 e ISO-8859-1
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

  // Parser de linha CSV lidando com aspas
  const parseCSVLine = (line: string, delimiter: string) => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ""));
    return result;
  };

  // Pré-processador principal de dados na memória (RF08)
  const preprocessCSVData = (
    headersList: string[],
    rawRows: string[][],
    addAuditLog: (msg: string) => void
  ) => {
    const totalRows = rawRows.length;
    const columnsMetadata: ColumnMetadata[] = [];
    const processedList: ProcessedRow[] = [];
    let grandTotalImputed = 0;

    const isCellEmpty = (val: string | undefined | null) => {
      if (val === undefined || val === null) return true;
      const lower = val.trim().toLowerCase();
      return lower === "" || lower === "null" || lower === "undefined" || lower === "nan" || lower === "-";
    };

    const sanitizeText = (text: string) => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentuações
        .replace(/[^\w\s-]/g, "") // Remove caracteres especiais mantendo espaços e hífens
        .trim();
    };

    // 1. Detectar tipo das colunas
    const columnData = headersList.map((header, colIndex) => {
      const rawValues = rawRows.map(row => row[colIndex] || "");
      const emptyIndices = new Set<number>();
      const validValues: string[] = [];

      rawValues.forEach((val, rowIndex) => {
        if (isCellEmpty(val)) {
          emptyIndices.add(rowIndex);
        } else {
          validValues.push(val);
        }
      });

      // Classificação automática: Se todos os valores válidos são números
      let isNumeric = true;
      if (validValues.length === 0) {
        isNumeric = false;
      } else {
        for (const val of validValues) {
          const sanitized = val.replace(",", ".");
          if (isNaN(Number(sanitized))) {
            isNumeric = false;
            break;
          }
        }
      }

      return {
        type: isNumeric ? "numeric" as const : "categorical" as const,
        rawValues,
        validValues,
        emptyIndices,
      };
    });

    // Iniciar linhas vazias no objeto de saída
    for (let r = 0; r < totalRows; r++) {
      processedList.push({});
    }

    // 2. Preencher lacunas e normalizar por coluna
    headersList.forEach((header, colIndex) => {
      const colInfo = columnData[colIndex];
      const missingCount = colInfo.emptyIndices.size;
      grandTotalImputed += missingCount;
      const percentageAltered = totalRows > 0 ? (missingCount / totalRows) * 100 : 0;

      if (colInfo.type === "numeric") {
        const numbers = colInfo.validValues.map(v => Number(v.replace(",", ".")));
        
        // Calcular Mediana
        let median = 0;
        if (numbers.length > 0) {
          const sorted = [...numbers].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          if (sorted.length % 2 !== 0) {
            median = sorted[mid];
          } else {
            median = (sorted[mid - 1] + sorted[mid]) / 2;
          }
        }

        // Calcular Min e Max
        const min = numbers.length > 0 ? Math.min(...numbers) : 0;
        const max = numbers.length > 0 ? Math.max(...numbers) : 0;

        addAuditLog(
          `Coluna numérica '${header}': Mediana calculada = ${median.toFixed(2)} (Faixa original: ${min.toFixed(2)} a ${max.toFixed(2)}). Corrigindo ${missingCount} células nulas.`
        );

        // Preencher e aplicar Min-Max Scaling [0, 1]
        colInfo.rawValues.forEach((val, rowIndex) => {
          const isImputed = colInfo.emptyIndices.has(rowIndex);
          const displayNum = isImputed ? median : Number(val.replace(",", "."));
          
          let normalizedNum = 0;
          if (max !== min) {
            normalizedNum = (displayNum - min) / (max - min);
          } else {
            normalizedNum = 0.5; // caso limite (valores idênticos)
          }

          processedList[rowIndex][header] = {
            raw: val,
            display: displayNum.toString(),
            normalized: normalizedNum.toFixed(4),
            isImputed,
          };
        });

        columnsMetadata.push({
          name: header,
          type: "numeric",
          missingCount,
          imputedValue: median.toFixed(2),
          min,
          max,
          percentageAltered,
        });

      } else {
        // Coluna Categórica: Calcular Moda
        let mode = "n/a";
        if (colInfo.validValues.length > 0) {
          const counts: Record<string, number> = {};
          const originalRepresentations: Record<string, string> = {};
          let maxCount = 0;
          let modeSanitized = "";

          colInfo.validValues.forEach(val => {
            const sanitized = sanitizeText(val);
            counts[sanitized] = (counts[sanitized] || 0) + 1;
            if (!originalRepresentations[sanitized]) {
              originalRepresentations[sanitized] = val;
            }
            if (counts[sanitized] > maxCount) {
              maxCount = counts[sanitized];
              modeSanitized = sanitized;
            }
          });

          mode = originalRepresentations[modeSanitized] || "n/a";
        }

        addAuditLog(
          `Coluna categórica '${header}': Moda calculada = '${mode}' (textos sanitizados em minúsculas). Corrigindo ${missingCount} células nulas.`
        );

        // Preencher e normalizar categóricos
        colInfo.rawValues.forEach((val, rowIndex) => {
          const isImputed = colInfo.emptyIndices.has(rowIndex);
          const displayVal = isImputed ? mode : val;
          const normalizedVal = sanitizeText(displayVal);

          processedList[rowIndex][header] = {
            raw: val,
            display: displayVal,
            normalized: normalizedVal,
            isImputed,
          };
        });

        columnsMetadata.push({
          name: header,
          type: "categorical",
          missingCount,
          imputedValue: mode,
          percentageAltered,
        });
      }
    });

    return { columnsMetadata, processedList, grandTotalImputed };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadStatus("error");
      setErrorMessage("Extensão inválida. Por favor, faça upload apenas de arquivos CSV.");
      addLog(`Falha na importação: O arquivo '${file.name}' não é um CSV válido.`);
      return;
    }

    // Limites de tamanho (máximo 5MB para frontend robusto)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus("error");
      setErrorMessage("O tamanho do arquivo excede o limite máximo permitido de 5MB.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");
    setLocalAuditLogs([]);
    setFileName(file.name);
    
    // Formatar tamanho legível
    const sizeInKB = file.size / 1024;
    setFileSizeStr(sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(2)} MB` : `${sizeInKB.toFixed(1)} KB`);

    addLog(`Upload de base de dados iniciado: '${file.name}'`);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer) throw new Error("Falha na leitura do arquivo.");

        // Decodificação inteligente
        const { text, encoding } = detectAndDecodeFile(buffer);
        addLocalLog(`Arquivo decodificado como ${encoding}`);

        // Parse do CSV
        const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) {
          throw new Error("O arquivo CSV deve conter pelo menos uma linha de cabeçalho e um registro de dados.");
        }

        // Delimitador automático
        const firstLine = lines[0];
        let delimiter = ",";
        if (firstLine.includes(";")) delimiter = ";";
        else if (firstLine.includes("\t")) delimiter = "\t";

        addLocalLog(`Delimitador identificado: '${delimiter === "\t" ? "\\t" : delimiter}'`);

        const parsedHeaders = parseCSVLine(lines[0], delimiter);
        setHeaders(parsedHeaders);

        const rawRows = lines.slice(1).map(line => {
          const cells = parseCSVLine(line, delimiter);
          while (cells.length < parsedHeaders.length) {
            cells.push("");
          }
          return cells.slice(0, parsedHeaders.length);
        });

        // Simulação do progresso do motor de análise
        setProgress(15);
        setLoadingStep("Analisando colunas e identificando padrões...");

        setTimeout(() => {
          setProgress(50);
          setLoadingStep("Calculando mediana para numéricos e moda para categóricos...");

          setTimeout(() => {
            setProgress(85);
            setLoadingStep("Aplicando normalização Min-Max e imputação de nulos...");

            setTimeout(() => {
              // Rodar a lógica de negócios RF08 na memória
              const { columnsMetadata, processedList, grandTotalImputed } = preprocessCSVData(
                parsedHeaders,
                rawRows,
                addLocalLog
              );

              setColumnsInfo(columnsMetadata);
              setProcessedRows(processedList);
              setTotalImputed(grandTotalImputed);

              setProgress(100);
              setIsUploading(false);
              setUploadStatus("success");
              addLocalLog("Pré-processamento estocástico concluído com sucesso.");
              addLog(`Dados pré-processados da base '${file.name}'. Total de células corrigidas: ${grandTotalImputed}.`);
            }, 500);
          }, 600);
        }, 500);

      } catch (err) {
        setIsUploading(false);
        setUploadStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Erro desconhecido ao processar arquivo.");
        addLog(`Erro no processamento do arquivo '${file.name}'.`);
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      setUploadStatus("error");
      setErrorMessage("Erro de leitura do sistema operacional ao carregar o arquivo.");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleReset = () => {
    setUploadStatus("idle");
    setFileName("");
    setFileSizeStr("");
    setHeaders([]);
    setColumnsInfo([]);
    setProcessedRows([]);
    setTotalImputed(0);
    setLocalAuditLogs([]);
    setProgress(0);
    setErrorMessage("");
    setActiveTab("report");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Função para baixar arquivo CSV de teste com valores nulos para testar o RF08
  const handleDownloadTestCSV = () => {
    let csvContent = "";
    const activeDomainSafe = activeDomain || "maintenance";

    if (activeDomainSafe === "maintenance") {
      csvContent = 
        "timestamp;sensor_id;temperatura;vibracao;oee\n" +
        "2026-06-09 08:00:00;sensor_01;62.5;1.4;87\n" +
        "2026-06-09 08:01:00;;65.0;;89\n" +
        "2026-06-09 08:02:00;sensor_01;;1.8;84\n" +
        "2026-06-09 08:03:00;sensor_02;74.2;3.2;\n" +
        "2026-06-09 08:04:00;sensor_01;;2.1;90\n" +
        ";sensor_02;59.4;1.1;93\n" +
        "2026-06-09 08:06:00;sensor_01;68.1;;81\n" +
        "2026-06-09 08:07:00;sensor_02;70.5;2.5;86";
    } else if (activeDomainSafe === "demand") {
      csvContent = 
        "data;produto_id;estoque_atual;demanda_mensal;lead_time\n" +
        "2026-06-01;P01;120;450;14\n" +
        "2026-06-02;;15;;10\n" +
        "2026-06-03;P02;350;300;\n" +
        ";P01;;2500;5\n" +
        "2026-06-05;P02;240;120;12\n" +
        "2026-06-06;;;800;15\n" +
        "2026-06-07;P01;180;600;";
    } else if (activeDomainSafe === "churn") {
      csvContent = 
        "cliente_id;nome;score_risco;ltv;fator_risco;acao_recomendada\n" +
        "C01;Ana Silva;42;1200;baixa;manter\n" +
        ";;85;3400;alta;ligar urgente\n" +
        "C03;Carlos Souza;;1500;;\n" +
        "C04;;60;;media;email informativo\n" +
        ";Marcia Santos;20;500;baixa;\n" +
        "C06;Juliana Costa;92;4500;;ligar urgente\n" +
        "C07;Paulo Alves;35;;baixa;email informativo";
    } else {
      csvContent = 
        "proposta_id;cliente;valor;score;probabilidade_retorno;acao\n" +
        "PR01;Jose Santos;15000;720;0.92;aprovar\n" +
        ";;25000;580;;\n" +
        "PR03;Maria Oliveira;;640;0.85;analisar\n" +
        "PR04;;8000;320;0.40;recusar\n" +
        ";Joao Souza;12000;;0.78;\n" +
        "PR06;Fernanda Lima;45000;810;;aprovar\n" +
        "PR07;Ricardo Dias;;490;0.55;analisar";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `teste-nulos-${activeDomainSafe}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">
      {/* Bloco de Upload / Carregamento */}
      {uploadStatus === "idle" && (
        <Card className="bg-card/60 backdrop-blur-md border-border shadow-sm overflow-hidden transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Database className="h-4.5 w-4.5 text-muted-foreground/60" />
              Pré-processador Inteligente de Dados (RF08)
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Carregue uma base histórica em CSV. O sistema tratará valores nulos automaticamente (mediana/moda) e aplicará normalização Min-Max [0, 1] em tempo real na memória.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />

            <div
              onClick={handleButtonClick}
              className={`border border-dashed ${theme.border} rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 gap-3 group relative select-none hover:bg-muted/15`}
            >
              <div className="p-3 rounded-full bg-muted/40 border border-border/80 text-muted-foreground transition-all duration-300 group-hover:scale-105">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Selecione o arquivo CSV histórico para tratar
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Formatos aceitos: delimitados por vírgula (,), ponto e vírgula (;) ou tabulações
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-2 border-t border-border/50">
              <span className="text-[10px] text-muted-foreground leading-relaxed">
                Quer validar o tratamento com dados de teste nulos? Baixe o modelo ideal para este módulo:
              </span>
              <Button
                onClick={handleDownloadTestCSV}
                variant="outline"
                className="text-[10px] h-7 px-3 gap-1 rounded-lg border-border hover:bg-muted text-foreground flex-shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                Baixar CSV com Nulos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loader de Processamento Progressivo */}
      {isUploading && (
        <Card className="bg-card border-border p-8 flex flex-col items-center justify-center gap-4 bg-muted/10 animate-in fade-in duration-300">
          <Loader2 className={`h-8 w-8 animate-spin ${theme.text}`} />
          <div className="text-center space-y-2 w-full max-w-xs">
            <h4 className="text-xs font-bold text-foreground">Higienizando & Normalizando Dados...</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed h-8 flex items-center justify-center text-center">
              {loadingStep}
            </p>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden border border-border mt-2">
              <div
                className={`h-full transition-all duration-300 ${activeDomain === "maintenance" ? "bg-amber-500" : activeDomain === "demand" ? "bg-sky-500" : activeDomain === "churn" ? "bg-violet-500" : "bg-emerald-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[9px] font-mono text-muted-foreground font-semibold text-right">
              {progress}%
            </div>
          </div>
        </Card>
      )}

      {/* Erro de Upload */}
      {uploadStatus === "error" && (
        <Card className="border-rose-500/20 bg-rose-500/[0.02] rounded-xl p-5 flex items-start gap-3.5 animate-in shake duration-300">
          <div className="p-2 rounded-full bg-rose-500/10 text-rose-500 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-3 flex-1 w-full">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground">Inconsistência no Arquivo</h4>
              <p className="text-[10px] text-rose-500 leading-relaxed font-semibold">
                {errorMessage}
              </p>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              className="text-[9px] h-7 px-3 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-bold"
            >
              Tentar Novamente
            </Button>
          </div>
        </Card>
      )}

      {/* Dashboard Pós-Processamento (RF08) */}
      {uploadStatus === "success" && (
        <Card className="bg-card border-border shadow-md overflow-hidden transition-all duration-300 animate-in zoom-in-95 duration-500">
          <CardHeader className="border-b border-border/80 bg-muted/20 pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  Dados Pré-processados e Prontos (RF08)
                </div>
                <CardTitle className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-muted-foreground/80" />
                  {fileName}
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground font-mono">
                  Tamanho: {fileSizeStr} | Registros: {processedRows.length} linhas | Delimitador e Tipagem auto-detectados
                </CardDescription>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="text-[10px] h-8 px-3.5 border-border hover:bg-muted text-foreground font-bold"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Resetar
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Abas do Dashboard */}
          <div className="flex border-b border-border bg-muted/10 px-4">
            <button
              onClick={() => setActiveTab("report")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "report"
                  ? "border-emerald-500 text-emerald-550 dark:text-emerald-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              Relatório de Imputação
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "preview"
                  ? "border-emerald-500 text-emerald-550 dark:text-emerald-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Visualizador de Dados
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "logs"
                  ? "border-emerald-500 text-emerald-550 dark:text-emerald-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Logs de Auditoria ({localAuditLogs.length})
            </button>
          </div>

          <CardContent className="p-6">
            {/* 1. ABA RELATÓRIO E GRÁFICOS */}
            {activeTab === "report" && (
              <div className="space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wide">Lacunas Preenchidas</span>
                    <div className="text-2xl font-black text-foreground font-mono mt-1">
                      {totalImputed} <span className="text-[11px] text-muted-foreground font-normal font-sans">células</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground/80 block mt-1">Substituído por Mediana (N) ou Moda (C)</span>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wide">Colunas Tratadas</span>
                    <div className="text-2xl font-black text-foreground font-mono mt-1">
                      {columnsInfo.length} <span className="text-[11px] text-muted-foreground font-normal font-sans">campos</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground/80 block mt-1">Classificação auto-detectada</span>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wide">Normalização do Modelo</span>
                    <div className="text-2xl font-black text-sky-500 font-mono mt-1">
                      Min-Max <span className="text-[11px] text-muted-foreground font-normal font-sans">[0, 1]</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground/80 block mt-1">Simulado com dados escalados</span>
                  </div>
                </div>

                {/* Tabela de Colunas */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-muted-foreground/60" />
                    Parâmetros Estatísticos Aplicados por Coluna
                  </h3>

                  <div className="border border-border/80 rounded-xl overflow-hidden bg-card">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="p-3 font-bold text-muted-foreground">Coluna</th>
                            <th className="p-3 font-bold text-muted-foreground">Tipo de Campo</th>
                            <th className="p-3 font-bold text-muted-foreground text-center">Nulos Imputados</th>
                            <th className="p-3 font-bold text-muted-foreground">Valor Substituto (Mediana/Moda)</th>
                            <th className="p-3 font-bold text-muted-foreground">Intervalo (Min/Max)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {columnsInfo.map((col) => (
                            <tr key={col.name} className="hover:bg-muted/10 transition">
                              <td className="p-3 font-bold text-foreground font-mono">{col.name}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                  col.type === "numeric"
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                                }`}>
                                  {col.type === "numeric" ? "🔢 Numérico" : "🔤 Categórico"}
                                </span>
                              </td>
                              <td className="p-3 text-center font-mono font-bold">
                                <span className={col.missingCount > 0 ? "text-amber-500" : "text-emerald-500"}>
                                  {col.missingCount}
                                </span>
                              </td>
                              <td className="p-3 font-mono font-semibold italic text-foreground/80">
                                {col.type === "numeric" ? `Mediana: ${col.imputedValue}` : `Moda: "${col.imputedValue}"`}
                              </td>
                              <td className="p-3 text-muted-foreground font-mono text-[11px]">
                                {col.type === "numeric" ? `[${col.min?.toFixed(1)} ; ${col.max?.toFixed(1)}]` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Gráfico de Barras em Tailwind (RF08.2) */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-muted-foreground/60" />
                    Percentual de Dados Imputados/Corrigidos por Coluna
                  </h3>

                  <div className="p-5 rounded-2xl border border-border bg-muted/15 space-y-4">
                    {columnsInfo.map((col) => (
                      <div key={col.name} className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="font-bold text-foreground/80 flex items-center gap-1">
                            {col.name}
                            <span className="text-[9px] text-muted-foreground">({col.type === "numeric" ? "Num" : "Cat"})</span>
                          </span>
                          <span className="font-bold text-foreground flex items-center gap-1">
                            {col.percentageAltered.toFixed(1)}% <span className="text-[9px] font-sans font-normal text-muted-foreground">corrigido</span>
                          </span>
                        </div>
                        {/* Container da Barra */}
                        <div className="w-full bg-muted dark:bg-zinc-850 h-3.5 rounded-full overflow-hidden border border-border/80 p-[2px]">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              col.percentageAltered === 0
                                ? "bg-emerald-500"
                                : col.percentageAltered > 20
                                ? "bg-amber-600"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.max(col.percentageAltered, 1.5)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. ABA VISUALIZADOR DE DADOS */}
            {activeTab === "preview" && (
              <div className="space-y-5">
                {/* Cabeçalho Visualizador & Toggles */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      Amostra dos Dados Pré-processados
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Células destacadas em <span className="text-amber-500 font-bold">Laranja</span> representam valores que estavam vazios e foram imputados pelo sistema.
                    </p>
                  </div>

                  {/* Toggle Mode */}
                  <div className="flex rounded-xl bg-muted p-1 border border-border select-none">
                    <button
                      onClick={() => setPreviewMode("original")}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition ${
                        previewMode === "original"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Métrica Real (Tratada)
                    </button>
                    <button
                      onClick={() => setPreviewMode("normalized")}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition ${
                        previewMode === "normalized"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Normalizado [0, 1]
                    </button>
                  </div>
                </div>

                {/* Seção Visual de Resumo do Pré-processamento (RF08 / CA03) */}
                <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Sliders className="h-4 w-4 shrink-0" />
                    <span>Resumo de Otimização e Tratamento de Dados</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px] text-foreground/80 font-medium">
                    {columnsInfo.map((col) => (
                      <div key={col.name} className="flex items-center justify-between bg-muted/40 p-2 rounded-lg border border-border/50 font-mono">
                        <span className="truncate mr-2">
                          Coluna <strong className="font-bold text-foreground">{col.name}</strong>
                        </span>
                        <span className="shrink-0 text-right">
                          <strong className={col.missingCount > 0 ? "text-amber-500 font-bold" : "text-emerald-500"}>
                            {col.missingCount}
                          </strong>{" "}
                          valores corrigidos pela {col.type === "numeric" ? "mediana" : "moda"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 pt-1.5 border-t border-emerald-500/15">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    A base de dados está otimizada para o início imediato do treinamento técnico da IA.
                  </div>
                </div>

                {/* Tabela com Amostra */}
                <div className="border border-border/80 rounded-xl overflow-hidden bg-card shadow-inner">
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="p-2.5 font-bold text-muted-foreground w-12 text-center font-mono">Row</th>
                          {headers.map((h) => (
                            <th key={h} className="p-2.5 font-bold text-muted-foreground font-mono min-w-[120px]">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {processedRows.slice(0, 10).map((row, rIndex) => (
                          <tr key={rIndex} className="hover:bg-muted/15 transition-colors">
                            <td className="p-2.5 text-center text-muted-foreground/60 font-mono bg-muted/20 border-r border-border/60">
                              {rIndex + 1}
                            </td>
                            {headers.map((h) => {
                              const cell = row[h];
                              if (!cell) return <td key={h} className="p-2.5">—</td>;

                              const isImputed = cell.isImputed;
                              const valueStr = previewMode === "original" ? cell.display : cell.normalized;

                              return (
                                <td
                                  key={h}
                                  className={`p-2.5 font-mono border-r border-border/40 ${
                                    isImputed
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border-r-amber-500/20"
                                      : previewMode === "normalized" && !isNaN(Number(valueStr))
                                      ? "text-sky-500 font-medium"
                                      : "text-foreground/80"
                                  }`}
                                  title={isImputed ? `Original: [Vazio] | Imputado: ${cell.display}` : `Original: ${cell.raw}`}
                                >
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span>{valueStr}</span>
                                    {isImputed && (
                                      <span className="text-[8px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1 py-0.2 rounded border border-amber-500/30 uppercase tracking-wide font-sans">
                                        Filtro
                                      </span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-muted/10 p-2.5 text-[10px] text-muted-foreground italic border-t border-border flex justify-between items-center">
                    <span>Exibindo as primeiras {Math.min(processedRows.length, 10)} de {processedRows.length} linhas.</span>
                    {previewMode === "normalized" && (
                      <span className="flex items-center gap-1 text-[9px] text-sky-500 font-bold not-italic">
                        <Info className="h-3 w-3" />
                        Campos numéricos normalizados no intervalo [0.0000 - 1.0000]
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. ABA LOGS DE AUDITORIA */}
            {activeTab === "logs" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-foreground">Sessão do Processador Estatístico</h3>
                  <span className="text-[9px] font-mono text-muted-foreground">Auditoria Integrada</span>
                </div>
                <div className="p-4 rounded-xl border border-border bg-zinc-950 font-mono text-[10.5px] text-emerald-400 leading-relaxed space-y-2 h-[280px] overflow-y-auto shadow-inner">
                  {localAuditLogs.map((log, index) => (
                    <div key={index} className="flex gap-2 items-start hover:bg-emerald-500/5 py-0.5 rounded transition">
                      <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-emerald-500/70 shrink-0" />
                      <span>{log}</span>
                    </div>
                  ))}
                  <div className="text-emerald-500/50 pt-2 border-t border-emerald-500/10">
                    &gt; Processamento concluído. Dados persistidos na memória volátil.
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
