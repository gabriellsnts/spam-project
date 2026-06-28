"use client";

import React, { useState, useRef, DragEvent } from "react";
import { useDomain, DOMAINS, TrainedModel } from "@/lib/context/domain-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet, Trash2, Info, Download, AlertTriangle, Shield } from "lucide-react";
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

interface ResidualPoint {
  id: number;
  predicted: number;
  residual: number;
  real: number;
}

export interface DomainTheme {
  accent: string;
  border: string;
  borderActive: string;
  bg: string;
  progress: string;
  glow: string;
  button: string;
}

export const getDomainTheme = (domain: string): DomainTheme => {
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

export function ResidualsPlotView({ model, theme: customTheme }: { model: TrainedModel; theme?: DomainTheme }) {
  const { theme: currentThemeMode } = useDomain();
  const [selectedPoint, setSelectedPoint] = useState<ResidualPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<ResidualPoint | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Determinar se está em modo escuro
  const isDarkMode = React.useMemo(() => {
    if (currentThemeMode === "dark") return true;
    if (currentThemeMode === "light") return false;
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const currentHour = new Date().getHours();
      return prefersDark || (currentHour >= 18 || currentHour < 6);
    }
    return true;
  }, [currentThemeMode]);

  const points = (model.residuals || []) as ResidualPoint[];
  if (points.length === 0) return null;

  const domainTheme = customTheme || getDomainTheme(model.domain);

  const bgColor = isDarkMode ? "#09090b" : "#ffffff";
  const gridColor = isDarkMode ? "#27272a" : "#e4e4e7";
  const textColor = isDarkMode ? "#a1a1aa" : "#27272a";
  const textMutedColor = isDarkMode ? "#71717a" : "#71717a";

  // CA05 - Auto scale axes
  const predictedVals = points.map((p) => p.predicted);
  const residualVals = points.map((p) => p.residual);

  const xMinVal = Math.min(...predictedVals);
  const xMaxVal = Math.max(...predictedVals);
  const yMinVal = Math.min(...residualVals);
  const yMaxVal = Math.max(...residualVals);

  // Add 10% padding
  const xRange = xMaxVal - xMinVal || 1;
  const xMin = xMinVal - xRange * 0.1;
  const xMax = xMaxVal + xRange * 0.1;

  // Centralize Y = 0
  const yMaxAbs = Math.max(Math.abs(yMinVal), Math.abs(yMaxVal)) || 1;
  const yLimit = yMaxAbs * 1.15; // 15% padding to avoid points hitting the edge

  // SVG Setup
  const width = 500;
  const height = 300;
  const padding = { top: 25, right: 30, bottom: 45, left: 55 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Coordinate mappers
  const getX = (val: number) => padding.left + ((val - xMin) / (xMax - xMin)) * plotWidth;
  const getY = (val: number) => padding.top + plotHeight - ((val - (-yLimit)) / (2 * yLimit)) * plotHeight;

  // Grid Ticks
  const xTicks = 5;
  const yTicks = 5;

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    try {
      const svgContent = svgRef.current.outerHTML;
      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `grafico-residuos-${model.modelId.toLowerCase()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erro ao exportar SVG:", err);
    }
  };

  const handleDownloadPNG = () => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();
      
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width * 2; // High-res scale factor
        canvas.height = height * 2;
        const context = canvas.getContext("2d");
        if (context) {
          context.fillStyle = bgColor; // background for premium export based on theme
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.scale(2, 2); // scale context to draw at high res
          context.drawImage(image, 0, 0);
          
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `grafico-residuos-${model.modelId.toLowerCase()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      image.src = blobURL;
    } catch (err) {
      console.error("Erro ao converter para PNG:", err);
    }
  };

  const handleDownloadJPEG = () => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();
      
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width * 2;
        canvas.height = height * 2;
        const context = canvas.getContext("2d");
        if (context) {
          context.fillStyle = bgColor;
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.scale(2, 2);
          context.drawImage(image, 0, 0);
          
          const jpegUrl = canvas.toDataURL("image/jpeg", 0.95);
          const downloadLink = document.createElement("a");
          downloadLink.href = jpegUrl;
          downloadLink.download = `grafico-residuos-${model.modelId.toLowerCase()}.jpg`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      image.src = blobURL;
    } catch (err) {
      console.error("Erro ao converter para JPEG:", err);
    }
  };

  const showPoint = hoveredPoint || selectedPoint;

  return (
    <div className="space-y-4 border border-border/60 bg-muted/20 p-4.5 rounded-xl animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h5 className="text-xs font-bold text-foreground">Gráfico de Resíduos da Previsão</h5>
          <p className="text-[10px] text-muted-foreground">
            Inspeção de erros de predição numérica (Erro = Real - Predito). Eixos autoajustados.
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button
            onClick={handleDownloadSVG}
            variant="outline"
            className="text-[9px] font-bold h-6.5 px-2 border-border hover:bg-muted font-sans text-muted-foreground hover:text-foreground"
            title="Baixar em formato vetorial SVG"
          >
            SVG
          </Button>
          <Button
            onClick={handleDownloadPNG}
            variant="outline"
            className="text-[9px] font-bold h-6.5 px-2 border-border hover:bg-muted font-sans text-muted-foreground hover:text-foreground"
            title="Baixar em alta resolução PNG"
          >
            PNG
          </Button>
          <Button
            onClick={handleDownloadJPEG}
            variant="outline"
            className="text-[9px] font-bold h-6.5 px-2 border-border hover:bg-muted font-sans text-muted-foreground hover:text-foreground"
            title="Baixar em alta resolução JPEG"
          >
            JPEG
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 items-start">
        {/* SVG Graph */}
        <div className="md:col-span-2 flex justify-center bg-background border border-border/40 rounded-lg p-2 relative overflow-hidden select-none">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height="100%"
            className="text-foreground overflow-visible"
            style={{ backgroundColor: bgColor }}
          >
            {/* Grid Lines Y */}
            {Array.from({ length: yTicks }).map((_, i) => {
              const tickVal = -yLimit + (i / (yTicks - 1)) * (2 * yLimit);
              const y = getY(tickVal);
              return (
                <g key={`y-grid-${i}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke={gridColor}
                    strokeWidth={0.5}
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill={textMutedColor}
                    fontSize="9px"
                    fontFamily="monospace"
                  >
                    {tickVal.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Grid Lines X */}
            {Array.from({ length: xTicks }).map((_, i) => {
              const tickVal = xMin + (i / (xTicks - 1)) * (xMax - xMin);
              const x = getX(tickVal);
              return (
                <g key={`x-grid-${i}`}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke={gridColor}
                    strokeWidth={0.5}
                  />
                  <text
                    x={x}
                    y={height - padding.bottom + 14}
                    textAnchor="middle"
                    fill={textMutedColor}
                    fontSize="9px"
                    fontFamily="monospace"
                  >
                    {Math.round(tickVal)}
                  </text>
                </g>
              );
            })}

            {/* CA02 - Line of reference at Y = 0 */}
            <line
              x1={padding.left}
              y1={getY(0)}
              x2={width - padding.right}
              y2={getY(0)}
              stroke="#ef4444"
              strokeWidth={1.5}
              strokeDasharray="4,3"
            />
            <text
              x={width - padding.right - 5}
              y={getY(0) - 4}
              textAnchor="end"
              fill="#ef4444"
              fontSize="8px"
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              Erro Zero
            </text>

            {/* CA03 - Axes Titles */}
            <text
              x={padding.left + plotWidth / 2}
              y={height - 10}
              textAnchor="middle"
              fill={textColor}
              fontSize="10px"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              Valor Predito pelo Modelo
            </text>

            <text
              transform={`rotate(-90) translate(${-padding.top - plotHeight / 2}, 14)`}
              textAnchor="middle"
              fill={textColor}
              fontSize="10px"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              Resíduo (Erro de Previsão)
            </text>

            {/* Scatter Dots */}
            {points.map((pt) => {
              const isSelected = selectedPoint?.id === pt.id;
              const isHovered = hoveredPoint?.id === pt.id;
              const isPositive = pt.residual >= 0;
              const dotColor = isPositive ? "#38bdf8" : "#f59e0b"; // sky for over, amber for under
              
              return (
                <circle
                  key={`dot-${pt.id}`}
                  cx={getX(pt.predicted)}
                  cy={getY(pt.residual)}
                  r={isSelected || isHovered ? 7 : 4.5}
                  fill={dotColor}
                  stroke={isSelected || isHovered ? "#ffffff" : "transparent"}
                  strokeWidth={1.5}
                  opacity={isSelected || isHovered ? 1 : 0.8}
                  className="residual-dot cursor-pointer transition-all duration-150 hover:opacity-100"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => setSelectedPoint(pt)}
                />
              );
            })}
          </svg>

          {/* CA04 - Tooltip flutuante interativo posicionado em porcentagem */}
          {showPoint && (
            <div 
              className="absolute bg-popover/95 border border-border text-foreground p-2 rounded-lg shadow-xl text-[10px] font-mono pointer-events-none z-50 transition-all duration-75 select-none"
              style={{
                left: `${(getX(showPoint.predicted) / width) * 100}%`,
                top: `${(getY(showPoint.residual) / height) * 100}%`,
                transform: 'translate(-50%, -125%)',
              }}
            >
              <div className="font-bold text-center border-b border-border pb-0.5 mb-1 text-[9px] text-muted-foreground">Ponto #{showPoint.id}</div>
              <div>Real: <span className="font-bold text-foreground">{showPoint.real.toFixed(2)}</span></div>
              <div>Predito: <span className="font-bold text-foreground">{showPoint.predicted.toFixed(2)}</span></div>
              <div className="mt-0.5 pt-0.5 border-t border-border/50">
                Erro: <span className={`font-bold ${showPoint.residual >= 0 ? "text-sky-600 dark:text-sky-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {showPoint.residual >= 0 ? "+" : ""}{showPoint.residual.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Point Details */}
        <div className="bg-muted/40 border border-border/40 rounded-lg p-3.5 space-y-3 h-[280px] flex flex-col justify-between">
          <div className="space-y-2.5">
            <h6 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full bg-current", domainTheme.accent)} />
              Inspeção do Resíduo
            </h6>
            
            {selectedPoint ? (
              <div className="space-y-2 animate-in fade-in duration-200">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground font-semibold">Registro ID</span>
                  <span className="text-foreground font-mono font-bold"># {selectedPoint.id}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground font-semibold">Valor Real</span>
                  <span className="text-foreground font-mono font-bold">{selectedPoint.real.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground font-semibold">Valor Predito</span>
                  <span className="text-foreground font-mono font-bold">{selectedPoint.predicted.toFixed(2)}</span>
                </div>
                <div className="border-t border-border/60 my-1 pt-1.5 flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground font-semibold">Erro Absoluto</span>
                  <span className={cn(
                    "font-mono font-bold text-xs px-1.5 py-0.5 rounded",
                    selectedPoint.residual >= 0 
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20" 
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  )}>
                    {selectedPoint.residual >= 0 ? "+" : ""}{selectedPoint.residual.toFixed(2)}
                  </span>
                </div>
                <p className="text-[9px] text-muted-foreground leading-relaxed italic pt-1 border-t border-border/40 font-sans">
                  {selectedPoint.residual === 0 
                    ? "Previsão perfeita." 
                    : selectedPoint.residual > 0 
                      ? "O modelo subestimou o valor real (erro positivo)." 
                      : "O modelo superestimou o valor real (erro negativo)."}
                </p>
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground italic text-[10px] leading-relaxed">
                Clique em qualquer ponto de dispersão no gráfico para exibir e inspecionar os valores exatos de erro.
              </div>
            )}
          </div>

          <div className="p-2.5 rounded bg-muted/20 border border-border/40 text-[9px] text-muted-foreground leading-relaxed font-sans">
            <span className="font-bold text-foreground/80 block mb-0.5">Legenda:</span>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#38bdf8] shrink-0" />
              <span>Erro Positivo (Subestimado)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#f59e0b] shrink-0" />
              <span>Erro Negativo (Superestimado)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConfusionMatrixView({ model }: { model: TrainedModel }) {
  const { theme: currentThemeMode } = useDomain();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredCell, setHoveredCell] = useState<"tp" | "tn" | "fp" | "fn" | null>(null);
  const [selectedCell, setSelectedCell] = useState<"tp" | "tn" | "fp" | "fn" | null>(null);
  
  // Determinar se está em modo escuro
  const isDarkMode = React.useMemo(() => {
    if (currentThemeMode === "dark") return true;
    if (currentThemeMode === "light") return false;
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const currentHour = new Date().getHours();
      return prefersDark || (currentHour >= 18 || currentHour < 6);
    }
    return true;
  }, [currentThemeMode]);

  const matrix = model.confusionMatrix;
  if (!matrix) return null;
  
  const total = matrix.tp + matrix.tn + matrix.fp + matrix.fn;
  if (total === 0) return null;

  const pct = (val: number) => ((val / total) * 100).toFixed(1);

  const bgColor = isDarkMode ? "#09090b" : "#ffffff";
  const textColor = isDarkMode ? "#a1a1aa" : "#27272a";
  const textMutedColor = isDarkMode ? "#a1a1aa" : "#71717a";
  const strokeColor = isDarkMode ? "#27272a" : "#e4e4e7";

  const greenTextMain = isDarkMode ? "#ffffff" : "#065f46";
  const greenTextSub = isDarkMode ? "#a7f3d0" : "#047857";
  const greenTextLabel = isDarkMode ? "#34d399" : "#065f46";

  const roseTextMain = isDarkMode ? "#ffffff" : "#9f1239";
  const roseTextSub = isDarkMode ? "#fca5a5" : "#be123c";
  const roseTextLabel = isDarkMode ? "#f87171" : "#9f1239";

  // SVG Setup
  const width = 400;
  const height = 300;

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    try {
      const svgContent = svgRef.current.outerHTML;
      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `matriz-confusao-${model.modelId.toLowerCase()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erro ao exportar SVG:", err);
    }
  };

  const handleDownloadPNG = () => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();
      
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width * 2;
        canvas.height = height * 2;
        const context = canvas.getContext("2d");
        if (context) {
          context.fillStyle = bgColor;
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.scale(2, 2);
          context.drawImage(image, 0, 0);
          
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `matriz-confusao-${model.modelId.toLowerCase()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      image.src = blobURL;
    } catch (err) {
      console.error("Erro ao converter para PNG:", err);
    }
  };

  const handleDownloadJPEG = () => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();
      
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width * 2;
        canvas.height = height * 2;
        const context = canvas.getContext("2d");
        if (context) {
          context.fillStyle = bgColor;
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.scale(2, 2);
          context.drawImage(image, 0, 0);
          
          const jpegUrl = canvas.toDataURL("image/jpeg", 0.95);
          const downloadLink = document.createElement("a");
          downloadLink.href = jpegUrl;
          downloadLink.download = `matriz-confusao-${model.modelId.toLowerCase()}.jpg`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      image.src = blobURL;
    } catch (err) {
      console.error("Erro ao converter para JPEG:", err);
    }
  };

  const activeCell = hoveredCell || selectedCell;

  const getCellDetails = (cell: "tp" | "tn" | "fp" | "fn") => {
    const isChurn = model.domain === "churn";
    
    // Values and percentages
    let value = 0;
    switch (cell) {
      case "tp": value = matrix.tp; break;
      case "tn": value = matrix.tn; break;
      case "fp": value = matrix.fp; break;
      case "fn": value = matrix.fn; break;
    }
    const percentStr = pct(value);

    if (isChurn) {
      switch (cell) {
        case "tn":
          return {
            title: "Verdadeiro Negativo (TN)",
            badge: "Sucesso de Retenção",
            badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            value,
            percent: percentStr,
            desc: "Clientes saudáveis e ativos identificados corretamente pelo modelo. Nenhuma ação de retenção é necessária para estes casos.",
          };
        case "tp":
          return {
            title: "Verdadeiro Positivo (TP)",
            badge: "Alerta de Churn Correto",
            badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            value,
            percent: percentStr,
            desc: "Clientes com alto risco de cancelamento identificados corretamente. Permite agir proativamente com campanhas de engajamento antes do cancelamento efetivo.",
          };
        case "fp":
          return {
            title: "Falso Positivo (FP)",
            badge: "Alerta Falso (Erro Tipo I)",
            badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
            value,
            percent: percentStr,
            desc: "Clientes estáveis que o modelo previu incorretamente como risco de churn. Pode gerar custos operacionais ou descontos desnecessários com ofertas de retenção.",
          };
        case "fn":
          return {
            title: "Falso Negativo (FN)",
            badge: "Perda Silenciosa (Erro Tipo II)",
            badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
            value,
            percent: percentStr,
            desc: "Clientes em risco crítico que o modelo classificou incorretamente como saudáveis. É a falha mais grave, pois impede qualquer ação preventiva de retenção.",
          };
      }
    } else {
      // credit-risk
      switch (cell) {
        case "tn":
          return {
            title: "Verdadeiro Negativo (TN)",
            badge: "Bom Pagador Confirmado",
            badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            value,
            percent: percentStr,
            desc: "Clientes de baixo risco (adimplentes) classificados corretamente. Permite a liberação automática de crédito com segurança e agilidade.",
          };
        case "tp":
          return {
            title: "Verdadeiro Positivo (TP)",
            badge: "Risco Mitigado",
            badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            value,
            percent: percentStr,
            desc: "Clientes inadimplentes ou de alto risco detectados com sucesso pelo modelo. Evita a concessão indevida de crédito e protege o caixa da empresa.",
          };
        case "fp":
          return {
            title: "Falso Positivo (FP)",
            badge: "Crédito Negado Injustamente",
            badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
            value,
            percent: percentStr,
            desc: "Bons pagadores classificados incorretamente como risco de inadimplência. Representa perda de receita e de oportunidades comerciais viáveis.",
          };
        case "fn":
          return {
            title: "Falso Negativo (FN)",
            badge: "Prejuízo Direto (Erro Tipo II)",
            badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
            value,
            percent: percentStr,
            desc: "Clientes inadimplentes classificados incorretamente como seguros. É o erro de maior impacto financeiro direto, resultando em calote e inadimplência ativa.",
          };
      }
    }
  };

  const details = activeCell ? getCellDetails(activeCell) : null;

  return (
    <div className="space-y-4 border border-border/60 bg-muted/20 p-4.5 rounded-xl animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h5 className="text-xs font-bold text-foreground">Matriz de Confusão do Modelo</h5>
          <p className="text-[10px] text-muted-foreground">
            Visualização da distribuição de acertos e erros de classificação baseada no tamanho do teste ({total} instâncias).
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button
            onClick={handleDownloadSVG}
            variant="outline"
            className="text-[9px] font-bold h-6.5 px-2 border-border hover:bg-muted font-sans text-muted-foreground hover:text-foreground"
            title="Baixar em formato vetorial SVG"
          >
            SVG
          </Button>
          <Button
            onClick={handleDownloadPNG}
            variant="outline"
            className="text-[9px] font-bold h-6.5 px-2 border-border hover:bg-muted font-sans text-muted-foreground hover:text-foreground"
            title="Baixar em alta resolução PNG"
          >
            PNG
          </Button>
          <Button
            onClick={handleDownloadJPEG}
            variant="outline"
            className="text-[9px] font-bold h-6.5 px-2 border-border hover:bg-muted font-sans text-muted-foreground hover:text-foreground"
            title="Baixar em alta resolução JPEG"
          >
            JPEG
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 items-start">
        {/* SVG Matrix */}
        <div className="md:col-span-2 flex justify-center bg-background border border-border/40 rounded-lg p-4 relative overflow-hidden select-none">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height="100%"
            className="text-foreground overflow-visible"
            style={{ backgroundColor: bgColor }}
          >
            {/* Outer title */}
            <text
              x={200}
              y={25}
              textAnchor="middle"
              fill={textColor}
              fontSize="11px"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              Classe Predita
            </text>

            {/* Actual Class title vertical */}
            <text
              transform="rotate(-90) translate(-140, 20)"
              textAnchor="middle"
              fill={textColor}
              fontSize="11px"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              Classe Real
            </text>

            {/* Columns Header (Predicted) */}
            <text x={172.5} y={50} textAnchor="middle" fill={textMutedColor} fontSize="9px" fontWeight="bold" fontFamily="monospace">NEGATIVO (0)</text>
            <text x={282.5} y={50} textAnchor="middle" fill={textMutedColor} fontSize="9px" fontWeight="bold" fontFamily="monospace">POSITIVO (1)</text>

            {/* Rows Header (Actual) */}
            <text x={110} y={115} textAnchor="end" fill={textMutedColor} fontSize="9px" fontWeight="bold" fontFamily="monospace">NEGATIVO (0)</text>
            <text x={110} y={225} textAnchor="end" fill={textMutedColor} fontSize="9px" fontWeight="bold" fontFamily="monospace">POSITIVO (1)</text>

            {/* TN: Real 0, Pred 0 */}
            <g 
              className="cursor-pointer"
              onMouseEnter={() => setHoveredCell("tn")}
              onMouseLeave={() => setHoveredCell(null)}
              onClick={() => setSelectedCell("tn")}
            >
              <rect
                x={120}
                y={65}
                width={105}
                height={105}
                fill="#10b981"
                fillOpacity={0.15 + (matrix.tn / total) * 0.6}
                stroke={activeCell === "tn" ? (isDarkMode ? "#ffffff" : "#09090b") : strokeColor}
                strokeWidth={activeCell === "tn" ? 2 : 1}
                className="transition-all duration-150"
              />
              <text x={172.5} y={110} textAnchor="middle" fill={greenTextMain} fontSize="16px" fontWeight="extrabold" fontFamily="monospace">{matrix.tn}</text>
              <text x={172.5} y={130} textAnchor="middle" fill={greenTextSub} fontSize="9px" fontWeight="bold" fontFamily="monospace">{pct(matrix.tn)}%</text>
              <text x={172.5} y={150} textAnchor="middle" fill={greenTextLabel} fontSize="8px" fontWeight="bold" fontFamily="sans-serif">Verdadeiro Negativo</text>
            </g>

            {/* FP: Real 0, Pred 1 */}
            <g 
              className="cursor-pointer"
              onMouseEnter={() => setHoveredCell("fp")}
              onMouseLeave={() => setHoveredCell(null)}
              onClick={() => setSelectedCell("fp")}
            >
              <rect
                x={230}
                y={65}
                width={105}
                height={105}
                fill="#f43f5e"
                fillOpacity={0.1 + (matrix.fp / total) * 0.75}
                stroke={activeCell === "fp" ? (isDarkMode ? "#ffffff" : "#09090b") : strokeColor}
                strokeWidth={activeCell === "fp" ? 2 : 1}
                className="transition-all duration-150"
              />
              <text x={282.5} y={110} textAnchor="middle" fill={roseTextMain} fontSize="16px" fontWeight="extrabold" fontFamily="monospace">{matrix.fp}</text>
              <text x={282.5} y={130} textAnchor="middle" fill={roseTextSub} fontSize="9px" fontWeight="bold" fontFamily="monospace">{pct(matrix.fp)}%</text>
              <text x={282.5} y={150} textAnchor="middle" fill={roseTextLabel} fontSize="8px" fontWeight="bold" fontFamily="sans-serif">Falso Positivo</text>
            </g>

            {/* FN: Real 1, Pred 0 */}
            <g 
              className="cursor-pointer"
              onMouseEnter={() => setHoveredCell("fn")}
              onMouseLeave={() => setHoveredCell(null)}
              onClick={() => setSelectedCell("fn")}
            >
              <rect
                x={120}
                y={175}
                width={105}
                height={105}
                fill="#f43f5e"
                fillOpacity={0.1 + (matrix.fn / total) * 0.75}
                stroke={activeCell === "fn" ? (isDarkMode ? "#ffffff" : "#09090b") : strokeColor}
                strokeWidth={activeCell === "fn" ? 2 : 1}
                className="transition-all duration-150"
              />
              <text x={172.5} y={220} textAnchor="middle" fill={roseTextMain} fontSize="16px" fontWeight="extrabold" fontFamily="monospace">{matrix.fn}</text>
              <text x={172.5} y={240} textAnchor="middle" fill={roseTextSub} fontSize="9px" fontWeight="bold" fontFamily="monospace">{pct(matrix.fn)}%</text>
              <text x={172.5} y={260} textAnchor="middle" fill={roseTextLabel} fontSize="8px" fontWeight="bold" fontFamily="sans-serif">Falso Negativo</text>
            </g>

            {/* TP: Real 1, Pred 1 */}
            <g 
              className="cursor-pointer"
              onMouseEnter={() => setHoveredCell("tp")}
              onMouseLeave={() => setHoveredCell(null)}
              onClick={() => setSelectedCell("tp")}
            >
              <rect
                x={230}
                y={175}
                width={105}
                height={105}
                fill="#10b981"
                fillOpacity={0.15 + (matrix.tp / total) * 0.6}
                stroke={activeCell === "tp" ? (isDarkMode ? "#ffffff" : "#09090b") : strokeColor}
                strokeWidth={activeCell === "tp" ? 2 : 1}
                className="transition-all duration-150"
              />
              <text x={282.5} y={220} textAnchor="middle" fill={greenTextMain} fontSize="16px" fontWeight="extrabold" fontFamily="monospace">{matrix.tp}</text>
              <text x={282.5} y={240} textAnchor="middle" fill={greenTextSub} fontSize="9px" fontWeight="bold" fontFamily="monospace">{pct(matrix.tp)}%</text>
              <text x={282.5} y={260} textAnchor="middle" fill={greenTextLabel} fontSize="8px" fontWeight="bold" fontFamily="sans-serif">Verdadeiro Positivo</text>
            </g>
          </svg>
        </div>

        {/* Interactive Explanation Card */}
        <div className="bg-muted/40 border border-border/40 rounded-lg p-3.5 space-y-3 h-[300px] flex flex-col justify-between">
          {details ? (
            <div className="space-y-2 animate-in fade-in duration-200">
              <h6 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Análise do Quadrante
              </h6>
              
              <div className="space-y-1">
                <div className="text-xs font-bold text-foreground">{details.title}</div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${details.badgeColor}`}>
                    {details.badge}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-y border-border/40 py-2 my-1">
                <div>
                  <span className="text-muted-foreground block text-[8px] uppercase font-sans">Quantidade</span>
                  <span className="text-foreground font-bold">{details.value} casos</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[8px] uppercase font-sans">Proporção</span>
                  <span className="text-foreground font-bold">{details.percent}%</span>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground leading-relaxed pt-1 font-sans">
                {details.desc}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <h6 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
                Métricas do Classificador
              </h6>
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Acurácia Geral:</span>
                  <span className="text-foreground font-bold">{((model.metrics.accuracy || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precisão:</span>
                  <span className="text-foreground font-bold">{((model.metrics.precision || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sensibilidade:</span>
                  <span className="text-foreground font-bold">{((model.metrics.recall || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">F1-Score:</span>
                  <span className="text-foreground font-bold">{(model.metrics.f1Score || 0).toFixed(3)}</span>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed italic border-t border-border/40 pt-2 mt-2 font-sans">
                Passe o mouse ou clique em qualquer quadrante da matriz para inspecionar os detalhes operacionais e o impacto comercial de cada erro/acerto.
              </p>
            </div>
          )}

          <div className="p-2 rounded bg-muted/20 border border-border/40 text-[9px] text-muted-foreground leading-relaxed font-sans">
            <span className="font-bold text-foreground/80 block mb-0.5">Legenda:</span>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Verdadeiros (Acertos)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
              <span>Falsos (Erros)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    addLogWithProfile,
    privacyNoticeText,
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
    hyperparameterHistory,
    selectedAlgorithms,
    setSelectedAlgorithm,
    trainedModelsByAlgorithm,
    clearHyperparameterHistory,
    currentUser,
    userProfile,
    t,
  } = useDomain();

  const canEdit = !currentUser || currentUser.accessProfile === "Super Admin";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeModel = activeDomain ? trainedModels[activeDomain] : null;
  const previousModel = activeDomain ? previousTrainedModels[activeDomain] : null;
  const history = activeDomain ? hyperparameterHistory[activeDomain] : [];

  const isClassification = activeDomain === "credit-risk" || activeDomain === "churn";
  const isModelObsolete = activeModel ? (Date.now() - activeModel.timestamp > 30 * 24 * 60 * 60 * 1000) : false;
  const formattedTimestamp = activeModel ? new Date(activeModel.timestamp).toLocaleString("pt-BR") : "";

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isLgpdModalOpen, setIsLgpdModalOpen] = useState(false);
  const [isMockPending, setIsMockPending] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

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
    const today = new Date(activeModel.timestamp);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    const fileName = `modelo-${activeModel.domain}-${formattedDate}.json`;

    const downloadPayload = {
      ...activeModel,
      totalRecords: activeModel.trainSize + activeModel.testSize
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(downloadPayload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addLogWithProfile(
      userProfile,
      `Arquivo de modelo exportado com sucesso no domínio ${DOMAINS[activeModel.domain].name} utilizando o algoritmo ${activeModel.algorithm}`
    );
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
  const [confirmRetrainOpen, setConfirmRetrainOpen] = useState(false);

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
      setPendingFile(e.target.files[0]);
      setIsMockPending(false);
      setIsLgpdModalOpen(true);
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
      setPendingFile(e.dataTransfer.files[0]);
      setIsMockPending(false);
      setIsLgpdModalOpen(true);
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
        {/* Seleção de Algoritmo por Domínio (CA01, CA02, CA05) */}
        {(() => {
          const isClassification = activeDomain === "credit-risk" || activeDomain === "churn";
          const algs = isClassification
            ? [
                {
                  name: "Random Forest",
                  desc: "Algoritmo ensemble baseado em múltiplas árvores de decisão. Excelente para capturar relações não-lineares complexas."
                },
                {
                  name: "Regressão Logística",
                  desc: "Modelo estatístico clássico que calcula a probabilidade de uma classe. Altamente interpretável e eficiente."
                }
              ]
            : [
                {
                  name: "Random Forest",
                  desc: "Algoritmo ensemble baseado em múltiplas árvores de decisão. Excelente para prever valores numéricos contínuos sem supor linearidade."
                },
                {
                  name: "Regressão Linear",
                  desc: "Modelo estatístico linear que estabelece a relação entre variáveis. Simples, rápido e de fácil interpretação."
                }
              ];
          const selectedAlg = selectedAlgorithms[activeDomain] || "Random Forest";

          return (
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full bg-current", theme.accent)} />
                  Algoritmo de Aprendizado de Máquina (RF30)
                </h4>
                <span className="text-[9px] text-muted-foreground font-mono bg-muted/65 border border-border/40 px-1.5 py-0.5 rounded font-semibold uppercase">
                  {isClassification ? "Classificação" : "Regressão"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {algs.map((alg) => {
                  const isSelected = selectedAlg === alg.name;
                  return (
                    <div
                      key={alg.name}
                      onClick={() => setSelectedAlgorithm(activeDomain, alg.name)}
                      className={cn(
                        "border rounded-xl p-3.5 cursor-pointer transition-all duration-300 flex flex-col justify-between gap-1.5 select-none relative overflow-hidden group",
                        isSelected 
                          ? cn("border-current shadow-[0_0_15px_rgba(255,255,255,0.02)]", theme.accent) 
                          : "border-border/60 hover:border-border hover:bg-muted/15"
                      )}
                    >
                      {isSelected && (
                        <div className={cn("absolute inset-0 opacity-[0.02] bg-current", theme.accent)} />
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-bold text-foreground transition-colors group-hover:text-foreground", isSelected && theme.accent)}>
                          {alg.name}
                        </span>
                        <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center shrink-0", 
                          isSelected ? "border-current" : "border-muted-foreground/30"
                        )}>
                          {isSelected && <span className={cn("h-2.5 w-2.5 rounded-full bg-current", theme.accent)} />}
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {alg.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* CA01, CA02, CA05, CA06: Resumo do Modelo Ativo ou Mensagem de Ausência */}
        {activeModel ? (
          <div className={cn(
            "p-4 rounded-xl border mb-6 space-y-3 relative overflow-hidden animate-in fade-in duration-300",
            isModelObsolete 
              ? "bg-amber-500/[0.02] border-amber-500/20" 
              : "bg-emerald-500/[0.02] border-emerald-500/20"
          )}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1",
                  isModelObsolete 
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/25" 
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/25 animate-pulse"
                )}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Modelo Pronto para Uso
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ID: {activeModel.modelId}
                </span>
              </div>
              {isModelObsolete && (
                <span className="text-[9px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold uppercase">
                  ⚠️ Obsoleto ({">"} 30 dias)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-[11px]">
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Domínio</span>
                <span className="text-foreground font-semibold font-sans">{domainInfo.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Algoritmo</span>
                <span className="text-foreground font-semibold font-sans">{activeModel.algorithm}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Calibrado em</span>
                <span className="text-foreground font-semibold font-mono">
                  {formattedTimestamp}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider mb-1.5">Métricas de Desempenho</span>
              <div className="flex flex-wrap gap-2">
                {activeModel.type === "Classification" ? (
                  <>
                    <div className="bg-zinc-900/60 border border-border/60 px-2 py-1 rounded text-[10px] font-mono">
                      <span className="text-muted-foreground text-[8px] uppercase block">AUC-ROC</span>
                      <span className="text-emerald-500 font-bold">{((activeModel.metrics.aucRoc || 0) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="bg-zinc-900/60 border border-border/60 px-2 py-1 rounded text-[10px] font-mono">
                      <span className="text-muted-foreground text-[8px] uppercase block">Acurácia</span>
                      <span className="text-foreground font-bold">{((activeModel.metrics.accuracy || 0) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="bg-zinc-900/60 border border-border/60 px-2 py-1 rounded text-[10px] font-mono">
                      <span className="text-muted-foreground text-[8px] uppercase block">Precisão</span>
                      <span className="text-foreground font-bold">{((activeModel.metrics.precision || 0) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="bg-zinc-900/60 border border-border/60 px-2 py-1 rounded text-[10px] font-mono">
                      <span className="text-muted-foreground text-[8px] uppercase block">Recall</span>
                      <span className="text-foreground font-bold">{((activeModel.metrics.recall || 0) * 100).toFixed(2)}%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-zinc-900/60 border border-border/60 px-2 py-1 rounded text-[10px] font-mono">
                      <span className="text-muted-foreground text-[8px] uppercase block">R² (Score)</span>
                      <span className="text-emerald-500 font-bold">{(activeModel.metrics.r2 || 0).toFixed(4)}</span>
                    </div>
                    <div className="bg-zinc-900/60 border border-border/60 px-2 py-1 rounded text-[10px] font-mono">
                      <span className="text-muted-foreground text-[8px] uppercase block">RMSE</span>
                      <span className="text-foreground font-bold">{(activeModel.metrics.rmse || 0).toFixed(3)}</span>
                    </div>
                    <div className="bg-zinc-900/60 border border-border/60 px-2 py-1 rounded text-[10px] font-mono">
                      <span className="text-muted-foreground text-[8px] uppercase block">MAE</span>
                      <span className="text-foreground font-bold">{(activeModel.metrics.mae || 0).toFixed(3)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {isModelObsolete && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-[10px] text-amber-500 flex items-start gap-2 mt-2 animate-in fade-in duration-300">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div>
                  <strong>Aviso de Obsolescência:</strong> Este modelo foi treinado há mais de 30 dias. Sugerimos realizar um novo treinamento com dados recentes para melhor acurácia preditiva.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-border bg-zinc-950/20 mb-6 flex flex-col items-center justify-center text-center py-6 animate-in fade-in duration-300 font-sans">
            <AlertCircle className="h-8 w-8 text-amber-500/80 mb-2" />
            <h5 className="text-xs font-bold text-foreground mb-1">{t("no_model_detected")}</h5>
            <p className="text-[10px] text-muted-foreground max-w-md leading-relaxed">
              Você ainda não realizou o treinamento do modelo para o domínio de <strong>{domainInfo.name}</strong> nesta sessão. Faça o upload do arquivo CSV correspondente na área abaixo e inicie o treinamento para habilitar as previsões.
            </p>
          </div>
        )}

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
                  {t("drag_drop_csv")}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t("click_browse_file")}
                </p>
              </div>

              {/* Tag informativa de formato aceito */}
              <div className="px-2 py-0.5 rounded bg-background border border-border text-[9px] font-bold text-muted-foreground uppercase font-mono tracking-wider">
                {t("exclusive_csv")}
              </div>
            </div>

            {/* Botão de Mock de Upload para Testes */}
            <div className="flex justify-center mt-2">
              <Button 
                onClick={() => {
                  setIsMockPending(true);
                  setPendingFile(null);
                  setIsLgpdModalOpen(true);
                }}
                variant="outline" 
                className="text-[10px] font-bold h-7 border-dashed border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {t("auto_fill_demo")}
              </Button>
            </div>

            {/* Guia de Colunas Esperadas */}
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 text-[11px] space-y-2">
              <div className="font-bold text-foreground/80 flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 rounded-full bg-current", theme.accent)} />
                {t("expected_cols_structure")}
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
              <h4 className="text-xs font-bold text-foreground">{t("syncing_historical_data")}</h4>
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
                {t("imported_data_preview")}
              </h4>
              <p className="text-[10px] text-muted-foreground">
                {t("preview_data_desc")}
              </p>
            </div>

            {/* Cabeçalho de Contexto do Arquivo (CA06) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-muted/40 border border-border/60 rounded-xl text-[10px] font-mono gap-2">
              <div className="space-y-0.5">
                <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">{t("file_label")}</span>
                <span className="text-foreground font-bold truncate max-w-[250px] block" title={fileDetails.name}>
                  {fileDetails.name}
                </span>
              </div>
              <div className="space-y-0.5 sm:text-right">
                <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">{t("size_label")}</span>
                <span className="text-foreground font-semibold">{fileDetails.size}</span>
              </div>
            </div>

            {/* Alerta de Validação com Opções de Baixar Modelo e Ver Relatório (CA02, CA06) */}
            {validationReport && !validationReport.isValid && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl text-[11px] text-rose-500 space-y-2.5 animate-in fade-in duration-300">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  {t("validation_inconsistencies")}
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
                    {t("view_compliance_report")}
                  </Button>
                  <Button
                    onClick={handleDownloadTemplate}
                    variant="outline"
                    className="text-[9px] font-bold h-7 px-2.5 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500"
                  >
                    <Download className="h-3.5 w-3.5 mr-1 shrink-0" />
                    {t("download_example_template")}
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
                        {t("no_records_available")}
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
                   {t("discard_import")}
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
                   {t("confirm_advance")}
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
                <h4 className="text-xs font-bold text-foreground">{t("import_success_title")}</h4>
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
                    onClick={() => {
                      if (activeModel) {
                        setConfirmRetrainOpen(true);
                      } else {
                        startTraining(fileDetails.sizeBytes, fileDetails.rows, allRows);
                      }
                    }}
                    disabled={!canEdit}
                    className={cn("text-[10px] font-bold h-8 px-3.5", theme.button, !canEdit && "opacity-50 cursor-not-allowed")}
                    title={canEdit ? "" : "Somente Administradores podem iniciar o treinamento."}
                  >
                    {t("start_model_training")}
                  </Button>
                </div>
              </div>
              {!canEdit && (
                <div className="text-[10px] text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/20 p-2 rounded flex items-center gap-1.5 mt-2">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Somente Administradores têm permissão para disparar treinamentos de modelo.
                </div>
              )}
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
                   {t("try_again_btn")}
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
                    <span className="text-rose-500">{t("training_in_progress")}</span>
                  ) : trainingProgress === 100 ? (
                    <span className="text-emerald-500">{t("training_success_title")}</span>
                  ) : (
                    <span>{t("training_in_progress")}</span>
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
              <div className="space-y-4">
                {previousModel ? (
                  // Layout Lado a Lado (Comparação Side-by-Side - CA05)
                  <div className="space-y-4 animate-in fade-in duration-500">
                    {/* Resumo executivo de melhoria / variação de performance */}
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px]">
                      <div className="space-y-0.5 font-sans">
                        <p className="font-bold text-xs text-emerald-550 dark:text-emerald-400 flex items-center gap-1">
                          ✨ Recalibração de Modelo Concluída!
                        </p>
                        <p className="text-muted-foreground">
                          O modelo anterior foi atualizado. Variação na métrica de validação primária <strong>{comparison?.metricName}</strong>:
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold text-sm">
                        {comparison?.isImprovement ? (
                          <span className="text-emerald-500 flex items-center gap-0.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                            ▲ +{comparison?.diffPct.toFixed(2)}% de Melhoria
                          </span>
                        ) : (
                          <span className="text-rose-500 flex items-center gap-0.5 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
                            ▼ {comparison?.diffPct.toFixed(2)}% de Regressão
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Comparativo de Taxas de Erro */}
                    <div className="p-4 bg-muted/20 border border-border/80 rounded-xl space-y-3">
                      <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5 font-sans">
                        📊 Comparativo de Taxas de Erro e Desempenho
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {activeModel.type === "Classification" && activeModel.confusionMatrix && previousModel.confusionMatrix ? (() => {
                          const activeFP = activeModel.confusionMatrix.fp;
                          const prevFP = previousModel.confusionMatrix.fp;
                          const fpDiff = activeFP - prevFP;

                          const activeFN = activeModel.confusionMatrix.fn;
                          const prevFN = previousModel.confusionMatrix.fn;
                          const fnDiff = activeFN - prevFN;

                          const activeErr = ((activeFP + activeFN) / activeModel.testSize) * 100;
                          const prevErr = ((prevFP + prevFN) / previousModel.testSize) * 100;
                          const errDiff = activeErr - prevErr;

                          return (
                            <>
                              <div className="p-3 bg-card rounded-lg border border-border/60 text-xs">
                                <span className="text-muted-foreground text-[9px] uppercase font-semibold block">Falsos Positivos (Erro Tipo I)</span>
                                <div className="text-lg font-black font-mono mt-1 text-foreground flex items-baseline gap-2">
                                  {prevFP} ➜ {activeFP}
                                  <span className={`text-[10px] font-bold ${fpDiff <= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                    {fpDiff <= 0 ? `${fpDiff} (Melhor)` : `+${fpDiff} (Pior)`}
                                  </span>
                                </div>
                              </div>
                              <div className="p-3 bg-card rounded-lg border border-border/60 text-xs">
                                <span className="text-muted-foreground text-[9px] uppercase font-semibold block">Falsos Negativos (Erro Tipo II)</span>
                                <div className="text-lg font-black font-mono mt-1 text-foreground flex items-baseline gap-2">
                                  {prevFN} ➜ {activeFN}
                                  <span className={`text-[10px] font-bold ${fnDiff <= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                    {fnDiff <= 0 ? `${fnDiff} (Melhor)` : `+${fnDiff} (Pior)`}
                                  </span>
                                </div>
                              </div>
                              <div className="p-3 bg-card rounded-lg border border-border/60 text-xs">
                                <span className="text-muted-foreground text-[9px] uppercase font-semibold block">Taxa de Erro Geral</span>
                                <div className="text-lg font-black font-mono mt-1 text-foreground flex items-baseline gap-2">
                                  {prevErr.toFixed(2)}% ➜ {activeErr.toFixed(2)}%
                                  <span className={`text-[10px] font-bold ${errDiff <= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                    {errDiff <= 0 ? `${errDiff.toFixed(2)}% (Melhor)` : `+${errDiff.toFixed(2)}% (Pior)`}
                                  </span>
                                </div>
                              </div>
                            </>
                          );
                        })() : activeModel.metrics.rmse && previousModel.metrics.rmse ? (() => {
                          const activeRMSE = activeModel.metrics.rmse || 0;
                          const prevRMSE = previousModel.metrics.rmse || 0;
                          const rmseDiff = activeRMSE - prevRMSE;
                          const rmseDiffPct = prevRMSE > 0 ? (rmseDiff / prevRMSE) * 100 : 0;

                          const activeMAE = activeModel.metrics.mae || 0;
                          const prevMAE = previousModel.metrics.mae || 0;
                          const maeDiff = activeMAE - prevMAE;
                          const maeDiffPct = prevMAE > 0 ? (maeDiff / prevMAE) * 100 : 0;

                          const activeR2 = activeModel.metrics.r2 || 0;
                          const prevR2 = previousModel.metrics.r2 || 0;
                          const r2Diff = activeR2 - prevR2;
                          const r2DiffPct = prevR2 > 0 ? (r2Diff / prevR2) * 100 : 0;

                          return (
                            <>
                              <div className="p-3 bg-card rounded-lg border border-border/60 text-xs">
                                <span className="text-muted-foreground text-[9px] uppercase font-semibold block">RMSE (Erro Quadrático)</span>
                                <div className="text-lg font-black font-mono mt-1 text-foreground flex items-baseline gap-2">
                                  {prevRMSE.toFixed(3)} ➜ {activeRMSE.toFixed(3)}
                                  <span className={`text-[10px] font-bold ${rmseDiff <= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                    {rmseDiff <= 0 ? `${rmseDiffPct.toFixed(2)}%` : `+${rmseDiffPct.toFixed(2)}%`}
                                  </span>
                                </div>
                              </div>
                              <div className="p-3 bg-card rounded-lg border border-border/60 text-xs">
                                <span className="text-muted-foreground text-[9px] uppercase font-semibold block">MAE (Erro Absoluto)</span>
                                <div className="text-lg font-black font-mono mt-1 text-foreground flex items-baseline gap-2">
                                  {prevMAE.toFixed(3)} ➜ {activeMAE.toFixed(3)}
                                  <span className={`text-[10px] font-bold ${maeDiff <= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                    {maeDiff <= 0 ? `${maeDiffPct.toFixed(2)}%` : `+${maeDiffPct.toFixed(2)}%`}
                                  </span>
                                </div>
                              </div>
                              <div className="p-3 bg-card rounded-lg border border-border/60 text-xs">
                                <span className="text-muted-foreground text-[9px] uppercase font-semibold block">R² (Coeficiente Variância)</span>
                                <div className="text-lg font-black font-mono mt-1 text-foreground flex items-baseline gap-2">
                                  {prevR2.toFixed(4)} ➜ {activeR2.toFixed(4)}
                                  <span className={`text-[10px] font-bold ${r2Diff >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                    {r2Diff >= 0 ? `+${r2DiffPct.toFixed(2)}%` : `${r2DiffPct.toFixed(2)}%`}
                                  </span>
                                </div>
                              </div>
                            </>
                          );
                        })() : null}
                      </div>
                    </div>

                    {/* Exibição Lado a Lado dos Modelos */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                      {/* Painel do Modelo Anterior */}
                      <div className="p-4 bg-zinc-950/20 border border-border/80 rounded-xl space-y-3 relative opacity-85 hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-2.5 right-3 text-[8px] bg-muted/60 text-muted-foreground border border-border/40 px-1.5 py-0.5 rounded font-mono uppercase">
                          Modelo Anterior
                        </div>
                        
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-foreground">Metadados do Modelo</h5>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-muted/20 p-2 border border-border/40 rounded-lg">
                            <div>
                              <span className="text-muted-foreground block text-[8px] uppercase font-sans">ID do Modelo</span>
                              <span className="text-foreground font-semibold truncate block max-w-[130px]" title={previousModel.modelId}>{previousModel.modelId}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[8px] uppercase font-sans">Algoritmo</span>
                              <span className="text-foreground font-semibold">{previousModel.algorithm}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[8px] uppercase font-sans">Divisão (Treino/Teste)</span>
                              <span className="text-foreground font-semibold">{previousModel.trainSize} / {previousModel.testSize}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[8px] uppercase font-sans">Métrica Primária</span>
                              <span className="text-foreground font-bold font-mono">
                                {previousModel.type === "Classification" 
                                  ? `AUC-ROC: ${((previousModel.metrics.aucRoc || 0) * 100).toFixed(2)}%`
                                  : `R²: ${(previousModel.metrics.r2 || 0).toFixed(4)}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Métricas Detalhadas */}
                        <div className="space-y-1">
                          <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Métricas Técnicas</span>
                          <div className="flex flex-wrap gap-2 pt-0.5">
                            {previousModel.type === "Classification" ? (
                              <>
                                <div className="bg-zinc-900/60 border border-border/60 px-2 py-0.5 rounded text-[10px] font-mono">
                                  <span className="text-muted-foreground text-[8px] uppercase block">Acurácia</span>
                                  <span className="text-foreground font-bold">{((previousModel.metrics.accuracy || 0) * 100).toFixed(2)}%</span>
                                </div>
                                <div className="bg-zinc-900/60 border border-border/60 px-2 py-0.5 rounded text-[10px] font-mono">
                                  <span className="text-muted-foreground text-[8px] uppercase block">Precisão</span>
                                  <span className="text-foreground font-bold">{((previousModel.metrics.precision || 0) * 100).toFixed(2)}%</span>
                                </div>
                                <div className="bg-zinc-900/60 border border-border/60 px-2 py-0.5 rounded text-[10px] font-mono">
                                  <span className="text-muted-foreground text-[8px] uppercase block">Sensibilidade</span>
                                  <span className="text-foreground font-bold">{((previousModel.metrics.recall || 0) * 100).toFixed(2)}%</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="bg-zinc-900/60 border border-border/60 px-2 py-0.5 rounded text-[10px] font-mono">
                                  <span className="text-muted-foreground text-[8px] uppercase block">RMSE</span>
                                  <span className="text-foreground font-bold">{(previousModel.metrics.rmse || 0).toFixed(3)}</span>
                                </div>
                                <div className="bg-zinc-900/60 border border-border/60 px-2 py-0.5 rounded text-[10px] font-mono">
                                  <span className="text-muted-foreground text-[8px] uppercase block">MAE</span>
                                  <span className="text-foreground font-bold">{(previousModel.metrics.mae || 0).toFixed(3)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Diagnóstico Visual Anterior */}
                        <div className="pt-2 border-t border-border/40">
                          {previousModel.type === "Classification" ? (
                            <ConfusionMatrixView model={previousModel} />
                          ) : (
                            <ResidualsPlotView model={previousModel} theme={theme} />
                          )}
                        </div>
                      </div>

                      {/* Painel do Novo Modelo (Retreinado) */}
                      <div className="p-4 bg-emerald-500/[0.01] border border-emerald-500/25 rounded-xl space-y-3 relative">
                        <div className="absolute top-2.5 right-3 text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                          Modelo Retreinado
                        </div>
                        
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-foreground">Metadados do Modelo</h5>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-muted/20 p-2 border border-border/40 rounded-lg">
                            <div>
                              <span className="text-muted-foreground block text-[8px] uppercase font-sans">ID do Modelo</span>
                              <span className="text-foreground font-semibold truncate block max-w-[130px]" title={activeModel.modelId}>{activeModel.modelId}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[8px] uppercase font-sans">Algoritmo</span>
                              <span className="text-foreground font-semibold">{activeModel.algorithm}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[8px] uppercase font-sans">Divisão (Treino/Teste)</span>
                              <span className="text-foreground font-semibold">{activeModel.trainSize} / {activeModel.testSize}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[8px] uppercase font-sans">Métrica Primária</span>
                              <span className="text-emerald-500 font-bold font-mono">
                                {activeModel.type === "Classification" 
                                  ? `AUC-ROC: ${((activeModel.metrics.aucRoc || 0) * 100).toFixed(2)}%`
                                  : `R²: ${(activeModel.metrics.r2 || 0).toFixed(4)}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Métricas Detalhadas */}
                        <div className="space-y-1">
                          <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Métricas Técnicas</span>
                          <div className="flex flex-wrap gap-2 pt-0.5">
                            {activeModel.type === "Classification" ? (
                              <>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono">
                                  <span className="text-muted-foreground text-[8px] uppercase block">Acurácia</span>
                                  <span className="text-foreground font-bold">{((activeModel.metrics.accuracy || 0) * 100).toFixed(2)}%</span>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono">
                                  <span className="text-muted-foreground text-[8px] uppercase block">Precisão</span>
                                  <span className="text-foreground font-bold">{((activeModel.metrics.precision || 0) * 100).toFixed(2)}%</span>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono">
                                  <span className="text-muted-foreground text-[8px] uppercase block">Sensibilidade</span>
                                  <span className="text-foreground font-bold">{((activeModel.metrics.recall || 0) * 100).toFixed(2)}%</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono">
                                  <span className="text-muted-foreground text-[8px] uppercase block">RMSE</span>
                                  <span className="text-foreground font-bold">{(activeModel.metrics.rmse || 0).toFixed(3)}</span>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono">
                                  <span className="text-muted-foreground text-[8px] uppercase block">MAE</span>
                                  <span className="text-foreground font-bold">{(activeModel.metrics.mae || 0).toFixed(3)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Diagnóstico Visual Novo */}
                        <div className="pt-2 border-t border-border/40">
                          {activeModel.type === "Classification" ? (
                            <ConfusionMatrixView model={activeModel} />
                          ) : (
                            <ResidualsPlotView model={activeModel} theme={theme} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Layout Original para Quando Não Há Modelo Anterior
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

                    <div className="space-y-1 pt-1.5 border-t border-emerald-500/15">
                      <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold">Hiperparâmetros Calibrados</span>
                      <pre className="p-2 bg-zinc-950/90 text-emerald-400/90 border border-emerald-500/10 rounded text-[9px] font-mono leading-relaxed overflow-x-auto max-h-[80px]">
                        {JSON.stringify(activeModel.hyperparameters, null, 2)}
                      </pre>
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground leading-relaxed pl-1 pt-1 font-sans">
                      Os parâmetros do motor analítico do módulo <strong>{DOMAINS[activeDomain].name}</strong> foram sincronizados localmente e estão ativos para previsões em tempo real nesta sessão.
                    </p>

                    {/* RF13 - Diagnosis Visualizations */}
                    <div className="pt-3 border-t border-emerald-500/15">
                      {activeModel.type === "Classification" ? (
                        <ConfusionMatrixView model={activeModel} />
                      ) : (
                        <ResidualsPlotView model={activeModel} theme={theme} />
                      )}
                    </div>
                  </div>
                )}

                {/* Histórico de Calibrações / Ciclos de Retreio (CA06) */}
                {history && history.length > 0 && (
                  <div className="pt-3 border-t border-border/40 space-y-2 mt-4 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground block text-[9px] uppercase font-sans font-bold flex items-center gap-1">
                        📜 Histórico de Calibrações (Ciclos de Retreio)
                      </span>
                      <Button
                        onClick={() => clearHyperparameterHistory(activeDomain)}
                        variant="ghost"
                        className="text-[8px] font-bold h-5 px-1.5 hover:bg-rose-500/10 text-rose-500 font-sans"
                      >
                        Limpar Histórico
                      </Button>
                    </div>

                    <div className="border border-border/60 rounded-lg overflow-hidden bg-zinc-950/40 max-h-[140px] overflow-y-auto scrollbar-thin">
                      <table className="w-full text-[10px] text-left border-collapse">
                        <thead>
                          <tr className="bg-muted/40 border-b border-border text-[8px] uppercase text-muted-foreground font-bold font-sans">
                            <th className="p-2">Modelo</th>
                            <th className="p-2">Data/Hora</th>
                            <th className="p-2">Métricas de Validação</th>
                            <th className="p-2">Hiperparâmetros Calibrados</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-mono">
                          {history.map((cycle, idx) => (
                            <tr key={idx} className="hover:bg-muted/10">
                              <td className="p-2 font-bold text-foreground font-sans truncate max-w-[120px]" title={cycle.modelId}>
                                {cycle.modelId.substring(0, 15)}...
                              </td>
                              <td className="p-2 text-[9px] text-muted-foreground">
                                {new Date(cycle.timestamp).toLocaleString()}
                              </td>
                              <td className="p-2 text-[9px]">
                                {cycle.metrics.accuracy !== undefined ? (
                                  <div className="flex flex-wrap gap-1.5 font-sans">
                                    <span className="text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1 rounded text-[8px]">AUC: {((cycle.metrics.aucRoc || 0) * 100).toFixed(1)}%</span>
                                    <span className="text-muted-foreground text-[8px]">ACC: {((cycle.metrics.accuracy || 0) * 100).toFixed(1)}%</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5 font-sans">
                                    <span className="text-sky-500 font-bold bg-sky-500/10 border border-sky-500/20 px-1 rounded text-[8px]">R²: {(cycle.metrics.r2 || 0).toFixed(3)}</span>
                                    <span className="text-muted-foreground text-[8px]">RMSE: {(cycle.metrics.rmse || 0).toFixed(2)}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-2 text-[8px] text-muted-foreground font-mono whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={JSON.stringify(cycle.hyperparameters)}>
                                {JSON.stringify(cycle.hyperparameters)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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

        {/* Tabela Comparativa Side-by-Side (RF30 - CA04) */}
        {(() => {
          const modelsForDomain = activeDomain ? trainedModelsByAlgorithm[activeDomain] : null;
          if (!modelsForDomain) return null;

          const rfModel = modelsForDomain["Random Forest"];
          const altName = isClassification ? "Regressão Logística" : "Regressão Linear";
          const altModel = modelsForDomain[altName];

          // Só exibe a tabela se pelo menos um dos modelos estiver treinado
          if (!rfModel && !altModel) return null;

          // Helper para determinar o vencedor
          const getWinnerClass = (rfVal: number | undefined, altVal: number | undefined, isLowerBetter = false) => {
            if (rfVal === undefined || altVal === undefined) return { rf: "", alt: "" };
            if (rfVal === altVal) return { rf: "text-foreground font-semibold", alt: "text-foreground font-semibold" };
            const rfWon = isLowerBetter ? rfVal < altVal : rfVal > altVal;
            return {
              rf: rfWon ? "text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20" : "text-muted-foreground",
              alt: !rfWon ? "text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20" : "text-muted-foreground"
            };
          };

          const formatVal = (val: number | undefined, isPct = false, decimals = 4) => {
            if (val === undefined || val === null) return "Não treinado";
            return isPct ? `${(val * 100).toFixed(1)}%` : val.toFixed(decimals);
          };

          const rows: {
            name: string;
            key: string;
            rf: number | undefined;
            alt: number | undefined;
            isPct: boolean;
            isLowerBetter: boolean;
            decimals?: number;
          }[] = isClassification
            ? [
                { name: "Acurácia (Accuracy)", key: "accuracy", rf: rfModel?.metrics.accuracy, alt: altModel?.metrics.accuracy, isPct: true, isLowerBetter: false, decimals: undefined },
                { name: "Precisão (Precision)", key: "precision", rf: rfModel?.metrics.precision, alt: altModel?.metrics.precision, isPct: true, isLowerBetter: false, decimals: undefined },
                { name: "Sensibilidade (Recall)", key: "recall", rf: rfModel?.metrics.recall, alt: altModel?.metrics.recall, isPct: true, isLowerBetter: false, decimals: undefined },
                { name: "F1-Score", key: "f1Score", rf: rfModel?.metrics.f1Score, alt: altModel?.metrics.f1Score, isPct: true, isLowerBetter: false, decimals: undefined },
                { name: "AUC-ROC", key: "aucRoc", rf: rfModel?.metrics.aucRoc, alt: altModel?.metrics.aucRoc, isPct: true, isLowerBetter: false, decimals: undefined },
              ]
            : [
                { name: "R² (Coef. Determinação)", key: "r2", rf: rfModel?.metrics.r2, alt: altModel?.metrics.r2, isPct: false, decimals: 4, isLowerBetter: false },
                { name: "RMSE (Erro Quadrático)", key: "rmse", rf: rfModel?.metrics.rmse, alt: altModel?.metrics.rmse, isPct: false, decimals: 3, isLowerBetter: true },
                { name: "MAE (Erro Absoluto)", key: "mae", rf: rfModel?.metrics.mae, alt: altModel?.metrics.mae, isPct: false, decimals: 3, isLowerBetter: true },
              ];

          const selectedAlg = selectedAlgorithms[activeDomain] || "Random Forest";

          return (
            <div className="mt-8 pt-6 border-t border-border/80 space-y-4.5 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5 font-sans">
                    📊 Comparação Side-by-Side de Desempenho (RF30 - CA04)
                  </h5>
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-sans">
                    Métricas de validação comparadas lado a lado. O melhor algoritmo em cada métrica é destacado em verde.
                  </p>
                </div>
                {rfModel && altModel && (
                  <span className="text-[9px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                    Ambos Treinados
                  </span>
                )}
              </div>

              <div className="overflow-hidden border border-border/60 rounded-xl bg-zinc-950/20">
                <table className="w-full text-left border-collapse text-[11px] font-sans">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border/60 text-[9px] uppercase tracking-wider text-muted-foreground font-bold font-sans">
                      <th className="p-3">Métrica de Validação</th>
                      <th className="p-3 text-center min-w-[130px]">Random Forest</th>
                      <th className="p-3 text-center min-w-[130px]">{altName}</th>
                      <th className="p-3 text-center min-w-[110px]">Variação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-mono">
                    {rows.map((row) => {
                      const classes = getWinnerClass(row.rf, row.alt, row.isLowerBetter);
                      
                      // Calculate variation if both are trained
                      let variationStr = "—";
                      let varColor = "text-muted-foreground";
                      if (row.rf !== undefined && row.alt !== undefined) {
                        const diff = row.rf - row.alt;
                        if (diff !== 0) {
                          const percentageDiff = row.alt > 0 ? (diff / row.alt) * 100 : 0;
                          const rfBetter = row.isLowerBetter ? diff < 0 : diff > 0;
                          const sign = diff > 0 ? "+" : "";
                          
                          if (row.isPct) {
                            variationStr = `${sign}${(diff * 100).toFixed(1)}% abs`;
                          } else {
                            variationStr = `${sign}${percentageDiff.toFixed(1)}% var`;
                          }
                          varColor = rfBetter ? "text-emerald-400 font-bold" : "text-rose-400 font-bold";
                        } else {
                          variationStr = "Empate";
                          varColor = "text-muted-foreground";
                        }
                      }

                      return (
                        <tr key={row.key} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 font-sans font-semibold text-foreground text-xs">{row.name}</td>
                          <td className="p-3 text-center">
                            <span className={cn("inline-block", classes.rf)}>
                              {formatVal(row.rf, row.isPct, row.decimals)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={cn("inline-block", classes.alt)}>
                              {formatVal(row.alt, row.isPct, row.decimals)}
                            </span>
                          </td>
                          <td className={cn("p-3 text-center text-xs", varColor)}>
                            {variationStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Botões rápidos para alternar ou treinar o algoritmo restante */}
              <div className="flex flex-wrap gap-2 text-[10px] justify-between items-center bg-muted/20 border border-border/40 p-3 rounded-xl font-sans">
                <span className="text-muted-foreground">
                  Algoritmo ativo atualmente: <strong className={cn("font-bold text-foreground", theme.accent)}>{selectedAlg}</strong>
                </span>
                <div className="flex gap-2">
                  {!rfModel && (
                    <Button
                      onClick={() => setSelectedAlgorithm(activeDomain, "Random Forest")}
                      variant="outline"
                      className="text-[9px] font-bold h-7 px-2.5 hover:bg-muted border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground"
                    >
                      Selecionar Random Forest
                    </Button>
                  )}
                  {!altModel && (
                    <Button
                      onClick={() => setSelectedAlgorithm(activeDomain, altName)}
                      variant="outline"
                      className="text-[9px] font-bold h-7 px-2.5 hover:bg-muted border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground"
                    >
                      Selecionar {altName}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
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

      {/* Modal de Confirmação para Retreinamento (RF14 - CA04) */}
      <Dialog open={confirmRetrainOpen} onOpenChange={setConfirmRetrainOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-xl p-5 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/80">
            <div className="flex items-center gap-2.5 text-rose-500 mb-1">
              <AlertTriangle className="h-5.5 w-5.5" />
              <DialogTitle className="text-sm font-bold text-foreground font-sans">
                Sobrescrever modelo anterior?
              </DialogTitle>
            </div>
            <DialogDescription className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Um modelo preditivo já está treinado e operacional para o módulo <strong>{domainInfo.name}</strong> nesta sessão.
              <br />
              <br />
              Se você prosseguir com o retreinamento, o modelo anterior (<strong>{activeModel?.modelId}</strong>) e suas calibrações de hiperparâmetros serão <span className="text-rose-500 font-semibold font-bold">permanentemente substituídos</span> no motor analítico por esta nova versão.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 text-[10px] text-muted-foreground bg-muted/40 border border-border/80 rounded-lg p-3 flex gap-2">
            <Info className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Aviso Técnico:</span> O novo modelo será treinado com base no arquivo <strong>{fileDetails?.name}</strong> contendo {fileDetails?.rows} registros. A alteração das taxas de erro e a nova matriz de classificação/resíduos poderão ser comparadas imediatamente após a conclusão.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/80 mt-1">
            <Button
              onClick={() => setConfirmRetrainOpen(false)}
              variant="outline"
              className="text-[10px] font-bold h-8 px-3.5 border-border hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setConfirmRetrainOpen(false);
                if (fileDetails) {
                  startTraining(fileDetails.sizeBytes, fileDetails.rows, allRows);
                }
              }}
              disabled={!canEdit}
              className={cn("text-[10px] font-bold h-8 px-3.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold transition", !canEdit && "opacity-50 cursor-not-allowed")}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Aviso de Privacidade e Consentimento LGPD (RF39 - CA01, CA02, CA04, CA05) */}
      <Dialog open={isLgpdModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsLgpdModalOpen(false);
          setPendingFile(null);
          setIsMockPending(false);
          setHasConsented(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }}>
        <DialogContent className="sm:max-w-[550px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-sm">
              <Shield className="h-5 w-5 text-green-500 shrink-0" />
              Aviso de Privacidade & Consentimento (LGPD)
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Por favor, leia atentamente as diretrizes de privacidade antes de prosseguir com a importação de dados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="p-4 rounded-xl bg-muted/80 border border-border text-[11px] text-foreground leading-relaxed font-sans max-h-[180px] overflow-y-auto whitespace-pre-wrap select-text">
              {privacyNoticeText}
            </div>

            <div className="flex flex-col gap-2 p-3.5 bg-muted/40 border border-border/60 rounded-xl text-[10px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                <span>Uso de dados exclusivo para modelagem analítica e predição neste sistema.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                <span>Confidencialidade estrita, sem compartilhamento ou transferência de informações com terceiros.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                <span className="flex-1">
                  Direito dos titulares assegurados. Para mais informações, consulte a nossa{" "}
                  <a 
                    href="#privacy-policy" 
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Política de Privacidade do Sistema SPAM (Demonstração de Homologação)");
                    }} 
                    className="text-green-500 hover:text-green-600 underline font-bold"
                  >
                    Política de Privacidade
                  </a>.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                <span>Contato do Encarregado pelo tratamento de dados pessoais (DPO): dpo@empresa.com</span>
              </div>
            </div>

            {/* Checkbox para aceite explícito */}
            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="lgpd-consent-checkbox"
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border bg-background text-green-500 focus:ring-green-500 cursor-pointer accent-green-600"
              />
              <label htmlFor="lgpd-consent-checkbox" className="text-[11px] text-muted-foreground leading-snug cursor-pointer select-none">
                Estou ciente e concordo com o processamento dos dados importados em conformidade com a LGPD e as finalidades descritas.
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border/80">
            <Button
              variant="outline"
              onClick={() => {
                setIsLgpdModalOpen(false);
                setPendingFile(null);
                setIsMockPending(false);
                setHasConsented(false);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="text-[10px] font-bold h-8 px-3.5 border-border hover:bg-muted text-muted-foreground"
            >
              Recusar e Cancelar
            </Button>
            <Button
              disabled={!hasConsented}
              onClick={() => {
                setIsLgpdModalOpen(false);
                setHasConsented(false);

                // Executar a ação pendente
                const domainName = activeDomain ? DOMAINS[activeDomain].name : "teste";
                if (isMockPending) {
                  setFileDetails({
                    name: `dados_historicos_${activeDomain || 'teste'}.csv`,
                    size: "45 KB",
                    sizeBytes: 45000,
                    rows: 150,
                    encoding: "UTF-8",
                    delimiter: ",",
                    headers: expectedCols
                  });
                  setUploadStatus("success");
                  setIsMockPending(false);
                  
                  // Disparar o Log de Auditoria (CA03)
                  addLogWithProfile(userProfile, `Consentimento LGPD confirmado para importação de dados no domínio ${domainName}`);
                } else if (pendingFile) {
                  processFile(pendingFile);
                  setPendingFile(null);
                  
                  // Disparar o Log de Auditoria (CA03)
                  addLogWithProfile(userProfile, `Consentimento LGPD confirmado para importação de dados no domínio ${domainName}`);
                }
              }}
              className="text-[10px] font-bold h-8 px-3.5 bg-green-500 hover:bg-green-600 text-zinc-950 disabled:opacity-50 transition"
            >
              Confirmar e Consentir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
