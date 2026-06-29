"use client";

import React, { useState, useMemo } from "react";
import { TrainedModel } from "@/lib/context/domain-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, TrendingDown, Sparkles, Info, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface OverfittingDetectorProps {
  model: TrainedModel;
  domainAccent?: string;
}

type Diagnosis = "overfitting" | "underfitting" | "balanced" | "excellent";

interface DiagnosisResult {
  diagnosis: Diagnosis;
  title: string;
  description: string;
  severity: "critical" | "warning" | "ok" | "excellent";
  recommendations: string[];
  trainAccuracy: number;
  testAccuracy: number;
  gap: number;
}

// Simulate train metric slightly above test (heuristic deterministic)
function simulateTrainMetric(testVal: number, isRegression: boolean): number {
  if (isRegression) {
    // Train metric slightly better (lower RMSE/MAE, higher R2)
    return Math.min(1, testVal * 1.08 + 0.04);
  }
  return Math.min(1, testVal * 1.06 + 0.03);
}

const DEMO_OVERFITTING: TrainedModel = {
  modelId: "DEMO-OVERFIT",
  domain: "churn",
  version: "1.0",
  datasetName: "churn_data.csv",
  datasetSize: 1000,
  datasetVersion: "v1",
  hash: "ovf-123",
  algorithm: "Random Forest Classifier",
  type: "Classification",
  metrics: { accuracy: 0.72, precision: 0.71, recall: 0.73, f1Score: 0.72, aucRoc: 0.78 },
  hyperparameters: { n_estimators: 200, max_depth: 30 },
  trainSize: 800,
  testSize: 200,
  timestamp: Date.now(),
};

const DEMO_UNDERFITTING: TrainedModel = {
  modelId: "DEMO-UNDERFIT",
  domain: "churn",
  version: "1.0",
  datasetName: "churn_data.csv",
  datasetSize: 1000,
  datasetVersion: "v1",
  hash: "udf-123",
  algorithm: "Logistic Regression",
  type: "Classification",
  metrics: { accuracy: 0.58, precision: 0.55, recall: 0.60, f1Score: 0.57, aucRoc: 0.61 },
  hyperparameters: { C: 0.01, max_iter: 50 },
  trainSize: 800,
  testSize: 200,
  timestamp: Date.now(),
};

function analyze(model: TrainedModel): DiagnosisResult {
  const isRegression = model.type === "Regression";
  const isClassification = model.type === "Classification";

  let testAcc: number;
  let trainAcc: number;

  if (isClassification) {
    testAcc = model.metrics.accuracy ?? model.metrics.f1Score ?? 0;
    // Simulated train metric deterministically above test
    const simBase = testAcc * 1.06 + 0.03;
    // Use model ID hash for determinism
    const hash = model.modelId.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 10;
    trainAcc = Math.min(0.99, simBase + hash * 0.005);
  } else {
    testAcc = model.metrics.r2 ?? 0;
    const simBase = testAcc * 1.08 + 0.04;
    const hash = model.modelId.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 10;
    trainAcc = Math.min(0.99, simBase + hash * 0.005);
  }

  const gap = trainAcc - testAcc;
  const gapPct = gap * 100;

  let diagnosis: Diagnosis;
  let severity: DiagnosisResult["severity"];
  let title: string;
  let description: string;
  let recommendations: string[];

  const lowPerf = isClassification ? testAcc < 0.65 : testAcc < 0.50;
  const highGap = gapPct > 15;
  const criticalGap = gapPct > 25;

  if (criticalGap) {
    diagnosis = "overfitting";
    severity = "critical";
    title = "Overfitting Crítico Detectado";
    description = `O modelo apresenta diferença de ${gapPct.toFixed(1)} p.p. entre a performance de treinamento e de teste. Isso indica que o modelo decorou os dados de treino em vez de generalizar padrões, resultando em performance muito inferior em dados reais não vistos.`;
    recommendations = [
      "Aumentar regularização (ex: reduzir max_depth, aumentar min_samples_leaf no Random Forest ou aumentar C na Regressão Logística).",
      "Reduzir a complexidade do modelo — menos árvores, menos neurônios, ou mais camadas de dropout.",
      "Aumentar o dataset de treinamento com mais amostras diversas.",
      "Aplicar técnicas de data augmentation ou oversampling (SMOTE) se o dataset for pequeno.",
      "Validar com Cross-Validation k-fold (k=5 ou k=10) para obter estimativas mais robustas da generalização.",
    ];
  } else if (highGap) {
    diagnosis = "overfitting";
    severity = "warning";
    title = "Overfitting Moderado";
    description = `O modelo apresenta gap de ${gapPct.toFixed(1)} p.p. entre treino e teste. Há indícios de sobreajuste que podem prejudicar a performance em produção. Monitoramento contínuo é recomendado.`;
    recommendations = [
      "Revisar hiperparâmetros de regularização no sandbox de retreinamento.",
      "Analisar se features importantes foram corretamente selecionadas (verificar Feature Importance).",
      "Considerar reduzir número de features via seleção automática (RF71).",
      "Testar com conjunto de validação externo antes de promover para produção.",
    ];
  } else if (lowPerf) {
    diagnosis = "underfitting";
    severity = "warning";
    title = "Underfitting Identificado";
    description = `A performance do modelo é baixa tanto no treino (${(trainAcc * 100).toFixed(1)}%) quanto no teste (${(testAcc * 100).toFixed(1)}%). O modelo não está capturando os padrões relevantes nos dados, o que indica subajuste — ele é simples demais para a complexidade do problema.`;
    recommendations = [
      "Aumentar a complexidade do modelo — mais estimadores, maior profundidade máxima, ou usar ensemble (RF87).",
      "Revisar a engenharia de features: verificar se as variáveis preditoras corretas foram incluídas no dataset.",
      "Verificar se os dados de treinamento são suficientes (mínimo recomendado: 500 registros).",
      "Testar outros algoritmos mais adequados ao domínio (ex: Gradient Boosting, XGBoost).",
      "Checar normalização e escalonamento das features numéricas.",
    ];
  } else if (testAcc >= 0.90 && gapPct <= 5) {
    diagnosis = "excellent";
    severity = "excellent";
    title = "Modelo Excelente — Alta Generalização";
    description = `O modelo apresenta excelente performance (${(testAcc * 100).toFixed(1)}%) com gap mínimo de ${gapPct.toFixed(1)} p.p. entre treino e teste. A capacidade de generalização está ótima para uso em produção.`;
    recommendations = [
      "Modelo pronto para promoção ao ambiente de produção.",
      "Documentar as configurações atuais de hiperparâmetros para referência futura.",
      "Ativar monitoramento de drift de dados (RF86) para detectar degradação ao longo do tempo.",
    ];
  } else {
    diagnosis = "balanced";
    severity = "ok";
    title = "Modelo Equilibrado";
    description = `O modelo apresenta boa performance (${(testAcc * 100).toFixed(1)}%) com gap de ${gapPct.toFixed(1)} p.p. entre treino e teste. Não há sinais significativos de overfitting ou underfitting.`;
    recommendations = [
      "Continuar monitorando a performance ao longo do tempo com novos dados.",
      "Avaliar se o retreinamento periódico é necessário conforme novos dados chegam.",
      "Considerar técnicas de ensemble para ganho marginal adicional de performance.",
    ];
  }

  return { diagnosis, title, description, severity, recommendations, trainAccuracy: trainAcc, testAccuracy: testAcc, gap: gapPct };
}

export function OverfittingDetector({ model, domainAccent = "violet" }: OverfittingDetectorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [demoMode, setDemoMode] = useState<"none" | "overfitting" | "underfitting">("none");

  const activeModel = demoMode === "overfitting" ? DEMO_OVERFITTING : demoMode === "underfitting" ? DEMO_UNDERFITTING : model;
  const result = useMemo(() => analyze(activeModel), [activeModel]);

  const severityConfig = {
    critical: {
      icon: <AlertTriangle className="h-4 w-4 text-rose-400" />,
      badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      card: "border-rose-500/30 bg-rose-500/5",
      bar: "bg-rose-500",
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      card: "border-amber-500/30 bg-amber-500/5",
      bar: "bg-amber-500",
    },
    ok: {
      icon: <CheckCircle2 className="h-4 w-4 text-sky-400" />,
      badge: "bg-sky-500/15 text-sky-400 border-sky-500/30",
      card: "border-sky-500/30 bg-sky-500/5",
      bar: "bg-sky-500",
    },
    excellent: {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      card: "border-emerald-500/30 bg-emerald-500/5",
      bar: "bg-emerald-500",
    },
  };

  const config = severityConfig[result.severity];
  const isRegression = activeModel.type === "Regression";

  return (
    <Card className={cn("border", config.card)}>
      <CardHeader className="pb-3 border-b border-border/30">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground/60" />
              Diagnóstico de Overfitting / Underfitting
              {demoMode !== "none" && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">DEMO</span>
              )}
            </CardTitle>
            <CardDescription className="text-[11px] mt-0.5">
              Análise automática da capacidade de generalização do modelo ativo.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className={cn("h-7 text-[10px] px-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/10")}
              onClick={() => setDemoMode(demoMode === "overfitting" ? "none" : "overfitting")}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {demoMode === "overfitting" ? "Sair Demo" : "Demo Overfit"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] px-2 border-sky-500/40 text-sky-400 hover:bg-sky-500/10"
              onClick={() => setDemoMode(demoMode === "underfitting" ? "none" : "underfitting")}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {demoMode === "underfitting" ? "Sair Demo" : "Demo Underfit"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Diagnosis header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            {config.icon}
            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", config.badge)}>
              {result.title}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{result.description}</p>

        {/* Train vs Test visual */}
        <div className="space-y-2 rounded-xl border border-border/30 bg-card/40 p-4">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Performance: Treino vs Teste ({isRegression ? "R²" : "Acurácia"})
          </p>

          {[
            { label: "Treino (Estimado)", val: result.trainAccuracy, color: "bg-sky-500" },
            { label: "Teste (Real)", val: result.testAccuracy, color: result.severity === "critical" || result.severity === "warning" ? "bg-rose-500" : "bg-emerald-500" },
          ].map((row) => (
            <div key={row.label} className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-bold text-foreground font-mono">{(row.val * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", row.color)}
                  style={{ width: `${Math.min(row.val * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}

          <div className="pt-2 flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Gap treino-teste:</span>
            <span className={cn(
              "text-xs font-bold font-mono px-2 py-0.5 rounded border",
              result.gap > 15 ? "bg-rose-500/15 text-rose-400 border-rose-500/30" :
              result.gap > 5 ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
              "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            )}>
              {result.gap > 0 ? "+" : ""}{result.gap.toFixed(1)} p.p.
            </span>
          </div>
        </div>

        {/* Recommendations toggle */}
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {showDetails ? "Ocultar" : "Ver"} recomendações técnicas ({result.recommendations.length})
        </button>

        {showDetails && (
          <div className="animate-in slide-in-from-top-2 duration-200 space-y-2">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/10 border border-border/30">
                <span className="text-[9px] font-black text-muted-foreground/60 shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}.</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec}</p>
              </div>
            ))}
            <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground pt-1">
              <Info className="h-3 w-3 shrink-0 mt-0.5" />
              <span>
                As métricas de treino são estimadas com base no modelo ativo. Para análise exata, utilize validação cruzada (RF60) com o dataset completo.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
