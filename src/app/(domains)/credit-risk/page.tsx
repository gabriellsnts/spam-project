"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useDomain, PredictionHistoryRecord } from "@/lib/context/domain-context";
import { TrendingUp, AlertTriangle, Coins, Percent, FileCheck, BarChart3, Lock, History, Printer, Loader2, Search, ChevronDown, ChevronUp, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSVUploader, ConfusionMatrixView, DOMAIN_SCHEMAS } from "@/components/shared/csv-uploader";
import { predictCreditRisk } from "@/lib/predictive-engine";
import { FeatureImportanceChart } from "@/components/shared/feature-importance-chart";
import { Input } from "@/components/ui/input";
import { AlertThresholdSettings } from "@/components/shared/alert-threshold-settings";
import { ComparisonView } from "@/components/shared/comparison-view";
import { DataLineageView } from "@/components/shared/data-lineage-view";
import ModelComparison from "@/components/shared/model-comparison";
import { SchedulingCard } from "@/components/shared/scheduling-card";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import { ShareAnalysisDialog } from "@/components/shared/share-analysis-dialog";
import { ModelCertificateDialog } from "@/components/shared/model-certificate-dialog";
import { GlossaryTooltip } from "@/components/shared/glossary-tooltip";
import { CorrelationMatrix } from "@/components/shared/correlation-matrix";
import { OverfittingDetector } from "@/components/shared/overfitting-detector";
import { BatchPrediction } from "@/components/shared/batch-prediction";
import { InteractiveConfusionMatrix } from "@/components/shared/interactive-confusion-matrix";
import { batchProcessCreditRisk } from "@/lib/predictive-engine";
import { ModelRegistry } from "@/components/shared/model-registry";
import { AdvancedModelAnalytics } from "@/components/shared/advanced-model-analytics";
type RiskLevel = "all" | "high" | "medium" | "low";

interface ProposalData {
  id: string;
  applicant: string;
  amount: string;
  score: number;
  probability: number;
  action: string;
  influentialFactors: string;
}

export default function CreditRiskPage() {
  const { addLog, isTraining, trainedModels, alertThresholds, addAlert, predictionHistory, addPredictionToHistory, currentView, t, language } = useDomain();
  const activeModel = trainedModels["credit-risk"];
  const isModelObsolete = activeModel ? (Date.now() - activeModel.timestamp > 30 * 24 * 60 * 60 * 1000) : false;
  const [stressActive, setStressActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { tutorialState, advanceTutorialStep } = useDomain();

  React.useEffect(() => {
    if (tutorialState?.isActive && tutorialState?.currentStep === 1) {
      advanceTutorialStep(1);
    }
  }, [tutorialState?.isActive, tutorialState?.currentStep, advanceTutorialStep]);

  const threshold = alertThresholds["credit-risk"] !== undefined ? alertThresholds["credit-risk"] : 60;

  // Form schemas and fields for credit-risk manual input (CA01)
  const schema = DOMAIN_SCHEMAS["credit-risk"] || [];
  const inputFields = schema.filter(col => col.name !== "probabilidade_retorno" && col.name !== "acao");

  // Form state
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    inputFields.forEach(field => {
      initial[field.name] = "";
    });
    return initial;
  });
  
  // Real-time validation errors state (CA04)
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prediction execution states (CA02)
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{
    probabilidadeRetorno: number;
    acao: "Aprovar" | "Análise Manual" | "Revisar Garantia" | "Rejeitar";
    dataInput: {
      valor: number;
      score: number;
      cliente: string;
      propostaId: string;
    };
  } | null>(null);

  // History state (CA05)
  const history = predictionHistory.filter(p => p.domain === "credit-risk").slice(0, 5);

  const handleSelectHistoryItem = (item: PredictionHistoryRecord) => {
    const details = (item.details as Record<string, unknown>) || {};
    setPredictionResult({
      probabilidadeRetorno: details.probabilidadeRetorno as number,
      acao: item.predictionResult as "Aprovar" | "Análise Manual" | "Revisar Garantia" | "Rejeitar",
      dataInput: {
        valor: details.valor as number,
        score: details.score as number,
        cliente: String(item.item),
        propostaId: String(item.id).replace(/^PRED-CRD-[a-zA-Z0-9]+-\d+-/, "")
      }
    });
    setFormData({
      proposta_id: String(details.propostaId || item.id),
      cliente: String(item.item),
      valor: details.valor ? String(details.valor) : "",
      score: details.score ? String(details.score) : ""
    });
    setErrors({});
  };

  const validateField = (name: string, value: string, type: "numeric" | "text") => {
    if (!value || value.trim() === "") {
      return t("field_required");
    }
    if (type === "numeric") {
      const cleaned = value.replace(",", ".");
      if (isNaN(Number(cleaned)) || !/^\d+(\.\d+)?$/.test(cleaned)) {
        return t("field_invalid_number");
      }
      if (Number(cleaned) <= 0) {
        return t("field_greater_than_zero");
      }
      if (name === "score") {
        const val = Number(cleaned);
        if (val < 300 || val > 1000) {
          return t("field_score_range");
        }
      }
    }
    return "";
  };

  const handleInputChange = (name: string, value: string, type: "numeric" | "text") => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value, type);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const getFieldLabel = (name: string) => {
    switch (name) {
      case "proposta_id": return t("proposal_id_label");
      case "cliente": return t("applicant_name_label");
      case "valor": return t("amount_requested_label");
      case "score": return t("credit_score_label");
      default: return name;
    }
  };

  const getFieldPlaceholder = (name: string) => {
    switch (name) {
      case "proposta_id": return "Ex: PROP-915";
      case "cliente": return "Ex: Distribuidora Central Ltda";
      case "valor": return "Ex: 250000";
      case "score": return "Ex: 720";
      default: return "";
    }
  };

  const [metrics, setMetrics] = useState({
    defaultRate: "1.80%",
    avgScore: "720",
    proposalsPending: "15",
    totalExposure: "R$ 1.2M",
  });

  const initialProposals: ProposalData[] = [
    { id: "PROP-912", applicant: "Comércio Eletrodomésticos Luz", amount: "R$ 120.000", score: 450, probability: 88, action: "Rejeitar", influentialFactors: "Histórico de atrasos (peso: 40%). Comprometimento de renda > 50% (peso: 35%)." },
    { id: "PROP-909", applicant: "Construções e Incorporações Fortes", amount: "R$ 600.000", score: 580, probability: 61, action: "Revisar Garantia", influentialFactors: "Garantia insuficiente para o valor solicitado (peso: 45%)." },
    { id: "PROP-905", applicant: "Gabriel Silva Alimentos", amount: "R$ 80.000", score: 620, probability: 44, action: "Análise Manual", influentialFactors: "Tempo de constituição da empresa (peso: 30%). Setor de atuação com volatilidade (peso: 25%)." },
    { id: "PROP-902", applicant: "Distribuidora de Bebidas União", amount: "R$ 250.000", score: 810, probability: 12, action: "Aprovar", influentialFactors: "Bom histórico de pagamentos (peso: 50%). Patrimônio líquido elevado (peso: 20%)." },
    { id: "PROP-918", applicant: "Tech Solutions Brasil", amount: "R$ 1.500.000", score: 890, probability: 5, action: "Aprovar", influentialFactors: "Liquidez corrente muito alta (peso: 60%)." },
    { id: "PROP-922", applicant: "Transportes Velocidade Máxima", amount: "R$ 350.000", score: 520, probability: 75, action: "Rejeitar", influentialFactors: "Dívidas ativas em aberto (peso: 70%)." },
  ];

  const [proposals, setProposals] = useState<ProposalData[]>(initialProposals);

  const [ratings, setRatings] = useState([
    { label: "AAA", count: 48, percentage: 35, color: "bg-emerald-500" },
    { label: "AA", count: 32, percentage: 23, color: "bg-emerald-500/80" },
    { label: "A", count: 27, percentage: 20, color: "bg-emerald-500/60" },
    { label: "B", count: 18, percentage: 13, color: "bg-amber-500" },
    { label: "C", count: 10, percentage: 7, color: "bg-amber-500/80" },
    { label: "D", count: 3, percentage: 2, color: "bg-rose-500" },
  ]);

  const getRiskLevel = useCallback((score: number, probability: number) => {
    if (probability >= threshold) return "high";
    if (score < 550) return "high";
    if (score <= 700) return "medium";
    return "low";
  }, [threshold]);

  const activeAlerts = useMemo(() => {
    return proposals
      .filter((p) => p.probability >= threshold)
      .map((p) => ({
        id: p.id,
        name: p.applicant,
        value: p.probability,
        threshold: threshold,
        details: `Score de crédito: ${p.score} pts. Fatores: ${p.influentialFactors}`,
      }));
  }, [proposals, threshold]);

  const calculateCriticalCount = (t: number) => {
    return proposals.filter((p) => p.probability >= t).length;
  };

  const filteredAndSortedProposals = useMemo(() => {
    let result = [...proposals];
    
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.id.toLowerCase().includes(q) || p.applicant.toLowerCase().includes(q));
    }
    
    if (riskFilter !== "all") {
      result = result.filter(p => getRiskLevel(p.score, p.probability) === riskFilter);
    }
    
    result.sort((a, b) => {
      if (sortOrder === "asc") return a.score - b.score; 
      return b.score - a.score;
    });
    
    return result;
  }, [proposals, searchQuery, riskFilter, sortOrder, getRiskLevel]);

  const triggerStressSimulation = () => {
    if (!activeModel) {
      addLog("Erro: É necessário treinar um modelo primeiro para gerar predições de Crédito.");
      return;
    }
    setStressActive(true);
    setMetrics({
      defaultRate: "4.35%",
      avgScore: "640",
      proposalsPending: "8",
      totalExposure: "R$ 850K",
    });
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === "PROP-905") {
          return { ...p, score: 510, probability: 78, action: "Rejeitar" };
        }
        if (p.id === "PROP-909") {
          return { ...p, score: 480, probability: 85, action: "Rejeitar" };
        }
        return { ...p, score: Math.max(p.score - 80, 300), probability: Math.min(p.probability + 15, 99) };
      })
    );
    setRatings([
      { label: "AAA", count: 20, percentage: 14, color: "bg-emerald-500" },
      { label: "AA", count: 15, percentage: 11, color: "bg-emerald-500/80" },
      { label: "A", count: 30, percentage: 22, color: "bg-emerald-500/60" },
      { label: "B", count: 38, percentage: 28, color: "bg-amber-500" },
      { label: "C", count: 25, percentage: 18, color: "bg-amber-500/80" },
      { label: "D", count: 10, percentage: 7, color: "bg-rose-500" },
    ]);
    addLog("Simulação de estresse de mercado ativada. Scores reclassificados.");
  };

  const resetSimulation = () => {
    setStressActive(false);
    setMetrics({
      defaultRate: "1.80%",
      avgScore: "720",
      proposalsPending: "15",
      totalExposure: "R$ 1.2M",
    });
    setProposals(initialProposals);
    setRatings([
      { label: "AAA", count: 48, percentage: 35, color: "bg-emerald-500" },
      { label: "AA", count: 32, percentage: 23, color: "bg-emerald-500/80" },
      { label: "A", count: 27, percentage: 20, color: "bg-emerald-500/60" },
      { label: "B", count: 18, percentage: 13, color: "bg-amber-500" },
      { label: "C", count: 10, percentage: 7, color: "bg-amber-500/80" },
      { label: "D", count: 3, percentage: 2, color: "bg-rose-500" },
    ]);
    addLog("Simulação de estresse desativada. Coeficientes restaurados.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    inputFields.forEach(field => {
      const err = validateField(field.name, formData[field.name] || "", field.type);
      if (err) newErrors[field.name] = err;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsPredicting(true);
    setPredictionResult(null);

    const valorNum = Number(formData.valor.replace(",", "."));
    const scoreNum = Number(formData.score);

    // Simular processamento local em menos de 1 segundo (600ms)
    setTimeout(() => {
      const result = predictCreditRisk(valorNum, scoreNum);
      
      const newPrediction = {
        probabilidadeRetorno: result.probabilidadeRetorno,
        acao: result.acao,
        dataInput: {
          valor: valorNum,
          score: scoreNum,
          cliente: formData.cliente,
          propostaId: formData.proposta_id
        }
      };

      setPredictionResult(newPrediction);
      setIsPredicting(false);
      
      // Emit alert in real time if default probability exceeds the threshold
      const defaultProb = 100 - result.probabilidadeRetorno;
      if (defaultProb >= threshold) {
        addAlert({
          domain: "credit-risk",
          item: `Proposta ${formData.proposta_id} (${formData.cliente})`,
          value: `${defaultProb}%`,
          metric: "Probabilidade de Default",
          criticality: defaultProb >= 80 ? "high" : "medium"
        });
      }

      addLog(`[Individual Prediction] Predição realizada para '${formData.cliente}' (${formData.proposta_id}). Resultado: ${result.acao} (${result.probabilidadeRetorno}% de retorno).`);
      
      addPredictionToHistory({
        domain: "credit-risk",
        item: newPrediction.dataInput.cliente,
        predictionResult: newPrediction.acao,
        details: {
          propostaId: newPrediction.dataInput.propostaId,
          probabilidadeRetorno: newPrediction.probabilidadeRetorno,
          valor: newPrediction.dataInput.valor,
          score: newPrediction.dataInput.score
        }
      });
    }, 600);
  };

  const mockFeatures = [
    { name: "Histórico de Pagamentos", weight: 0.40, description: "Frequência e atrasos em pagamentos de créditos anteriores." },
    { name: "Comprometimento de Renda", weight: 0.25, description: "Porcentagem da receita já comprometida com outras dívidas." },
    { name: "Patrimônio Líquido", weight: 0.15, description: "Garantias reais e bens no nome da empresa/indivíduo." },
    { name: "Tempo de Mercado", weight: 0.12, description: "Tempo de constituição do CNPJ." },
    { name: "Setor de Atuação", weight: 0.08, description: "Risco associado à volatilidade do setor econômico atual." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-md relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 blur-3xl rounded-full" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest">
            <Coins className="h-4 w-4" />
            {t("credit_module_title")}
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight flex flex-wrap items-center gap-2">
            {t("credit_subtitle")}
            {activeModel && (
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border font-sans ${
                isModelObsolete 
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                  : "bg-emerald-500/10 text-emerald-550 dark:text-emerald-400 border-emerald-500/20 animate-pulse"
              }`}>
                <CheckCircle2 className="h-3 w-3" />
                {isModelObsolete ? t("obsolete_model") : t("ready_to_use")}
              </span>
            )}
          </h2>
          <p className="text-muted-foreground text-xs">
            {t("credit_desc_long")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 relative z-10">
          {activeModel && (
            <ModelCertificateDialog 
              modelId={activeModel.modelId}
              algorithm={activeModel.algorithm}
              accuracy={activeModel.metrics.accuracy || 0}
              f1Score={activeModel.metrics.f1Score || 0}
              validationDate={activeModel.timestamp ? new Date(activeModel.timestamp).toISOString() : new Date().toISOString()}
            />
          )}
          <ShareAnalysisDialog />
          <ExportDropdown data={filteredAndSortedProposals} filenamePrefix="risco_credito" />
          {!activeModel ? (
            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs font-semibold font-sans">
              <AlertCircle className="h-4 w-4" />
              {t("no_active_model")}
            </div>
          ) : stressActive ? (
            <Button
              onClick={resetSimulation}
              disabled={isTraining}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              {t("reset")}
            </Button>
          ) : (
            <Button
              onClick={triggerStressSimulation}
              disabled={isTraining}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5"
            >
              <TrendingUp className="h-4 w-4" />
              {t("simulate_financial_stress")}
            </Button>
          )}
        </div>
      </div>

      {currentView === "monitoring" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {!activeModel && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-300 font-sans">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold text-foreground">{t("no_active_model")}</p>
                <p className="text-muted-foreground mt-0.5">
                  {t("credit_no_model_desc")}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t("default_rate")}
                </CardDescription>
                <CardTitle className={`text-2xl font-black ${stressActive ? "text-rose-500 animate-pulse" : "text-foreground"}`}>
                  {metrics.defaultRate}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] text-muted-foreground">{t("default_rate_desc")}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t("avg_score")}
                </CardDescription>
                <CardTitle className={`text-2xl font-black ${stressActive ? "text-amber-500" : "text-emerald-500"}`}>
                  {metrics.avgScore} pt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] text-muted-foreground">Classificação saudável</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t("proposals_pending")}
                </CardDescription>
                <CardTitle className={`text-2xl font-black ${activeAlerts.length > 0 ? "text-rose-500 animate-pulse" : "text-foreground"}`}>
                  {activeAlerts.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] text-muted-foreground">Aguardando decisão do modelo</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t("total_exposure")} (<GlossaryTooltip termId="3">VaR</GlossaryTooltip>)
                </CardDescription>
                <CardTitle className="text-2xl font-black text-foreground">{metrics.totalExposure}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] text-muted-foreground">Valor em risco estimado</div>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Predição Individual Manual (RF15) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Card */}
            <Card className="lg:col-span-2 bg-card border-border transition-colors duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 blur-2xl rounded-full" />
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-emerald-500" />
                  {t("manual_prediction")}
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  {t("manual_prediction_desc")}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {!activeModel ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-border rounded-xl bg-zinc-950/20">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full mb-3">
                      <Lock className="h-6 w-6" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground mb-1">Módulo de predição individual bloqueado</h4>
                    <p className="text-[10px] text-muted-foreground max-w-md leading-relaxed">
                      Não há modelo ativo para rodar predições.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {inputFields.map((field) => (
                          <div key={field.name} className="space-y-1.5">
                            <label className="text-[10px] font-bold text-foreground/80 tracking-wide block uppercase">
                              {getFieldLabel(field.name)}
                            </label>
                            <input
                              type="text"
                              name={field.name}
                              disabled={isPredicting}
                              value={formData[field.name] || ""}
                              placeholder={getFieldPlaceholder(field.name)}
                              onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
                              className={`w-full bg-zinc-950/40 border text-xs rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                                errors[field.name]
                                  ? "border-rose-500 focus:ring-rose-500 focus:border-rose-500"
                                  : "border-border focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500/50"
                              }`}
                            />
                            {errors[field.name] && (
                              <p className="text-rose-500 text-[10px] font-semibold mt-1">
                                {errors[field.name]}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          disabled={isPredicting}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5"
                          data-tutorial-target="generate-prediction"
                        >
                          {isPredicting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          {t("evaluate_proposal")}
                        </Button>
                      </div>
                    </form>

                    {isPredicting && (
                      <div className="flex flex-col items-center justify-center py-8 text-center animate-pulse border border-dashed border-border rounded-xl bg-zinc-950/20">
                        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-2" />
                        <p className="text-[10px] text-muted-foreground">{t("evaluating")}</p>
                      </div>
                    )}

                    {predictionResult && (
                      <div className={`p-5 rounded-xl border border-dashed transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                        predictionResult.acao === "Aprovar"
                          ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400"
                          : predictionResult.acao === "Análise Manual"
                          ? "bg-amber-500/5 border-amber-500/30 text-amber-400"
                          : predictionResult.acao === "Revisar Garantia"
                          ? "bg-orange-500/5 border-orange-500/30 text-orange-400"
                          : "bg-rose-500/5 border-rose-500/30 text-rose-400"
                      }`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                                predictionResult.acao === "Aprovar"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : predictionResult.acao === "Análise Manual"
                                  ? "bg-amber-500/10 text-amber-400"
                                  : predictionResult.acao === "Revisar Garantia"
                                  ? "bg-orange-500/10 text-orange-450"
                                  : "bg-rose-500/10 text-rose-400"
                              }`}>
                                Veredito: {t(predictionResult.acao.toLowerCase().replace(" ", "_")) || predictionResult.acao}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                ID: {predictionResult.dataInput.propostaId}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-foreground">
                                {predictionResult.dataInput.cliente}
                              </h4>
                              <p className="text-[11px] text-muted-foreground max-w-lg leading-relaxed">
                                {predictionResult.acao === "Aprovar"
                                  ? "Crédito recomendado para aprovação automática. O proponente apresenta baixo risco de inadimplência."
                                  : predictionResult.acao === "Análise Manual"
                                  ? "Classificação intermediária. Recomenda-se a revisão detalhada do comitê de crédito antes da concessão."
                                  : predictionResult.acao === "Revisar Garantia"
                                  ? "Exposição de risco elevada. Recomenda-se aprovação condicionada à apresentação de garantias colaterais ou fiança."
                                  : "Reprovado pelo modelo. Perfil com probabilidade de retorno de crédito abaixo do nível de segurança prudencial."}
                              </p>
                            </div>

                            {/* Inputs recap */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border/40 text-[10px]">
                              <div>
                                <span className="text-muted-foreground block font-semibold">{t("amount_requested")}</span>
                                <span className="text-foreground font-mono font-bold">
                                  {predictionResult.dataInput.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block font-semibold">Score Informado</span>
                                <span className="text-foreground font-mono font-bold">
                                  {predictionResult.dataInput.score} pts
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block font-semibold">{t("model").split(" ")[0]}</span>
                                <span className="text-foreground font-mono font-bold">
                                  {activeModel.algorithm}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block font-semibold">ID do Modelo</span>
                                <span className="text-foreground font-mono font-bold truncate block max-w-[120px]" title={activeModel.modelId}>
                                  {activeModel.modelId.substring(12, 19)}...
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center shrink-0 p-3 bg-zinc-950/40 rounded-xl border border-border/60">
                            <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5">{t("return_probability")}</div>
                            <div className="relative flex items-center justify-center h-20 w-20">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  className="text-muted/20"
                                  strokeWidth="2.5"
                                  stroke="currentColor"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className={`transition-all duration-500 ease-out ${
                                    predictionResult.acao === "Aprovar"
                                      ? "text-emerald-500"
                                      : predictionResult.acao === "Análise Manual"
                                      ? "text-amber-500"
                                      : predictionResult.acao === "Revisar Garantia"
                                      ? "text-orange-500"
                                      : "text-rose-500"
                                  }`}
                                  strokeWidth="2.5"
                                  strokeDasharray={`${predictionResult.probabilidadeRetorno}, 100`}
                                  strokeLinecap="round"
                                  stroke="currentColor"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                              <div className="absolute text-center">
                                <span className="text-base font-black text-foreground font-mono">{predictionResult.probabilidadeRetorno}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-border/40 mt-4">
                          <Button
                            onClick={() => window.print()}
                            variant="outline"
                            className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 text-xs font-bold gap-1.5"
                          >
                            <Printer className="h-4 w-4" />
                            Imprimir Recibo</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lateral History Panel (CA05) */}
            <Card className="bg-card border-border transition-colors duration-300 flex flex-col">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <History className="h-4 w-4 text-emerald-500" />
                  Histórico de Predições</CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Últimas 5 predições individuais</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {history.length === 0 ? (
                  <div className="text-[10px] text-muted-foreground text-center py-8 italic border border-dashed border-border rounded-xl">
                    {t("no_recent_predictions")}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {history.map((item, index) => (
                      <button
                        key={`${item.id}-${index}-${item.timestamp}`}
                        onClick={() => handleSelectHistoryItem(item)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/40 transition duration-150 flex items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="text-xs font-bold text-foreground truncate group-hover:text-emerald-500 transition-colors">
                            {item.item}
                          </div>
                          <div className="text-[9px] text-muted-foreground font-mono flex items-center gap-1.5">
                            <span>{item.details?.propostaId || item.id}</span>
                            <span>•</span>
                            <span>{new Date(item.timestamp).toLocaleTimeString(language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            item.predictionResult === "Aprovar"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                              : item.predictionResult === "Análise Manual" || item.predictionResult === "Revisar Garantia"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/25"
                              : "bg-rose-500/10 text-rose-500 border-rose-500/25"
                          }`}>
                            {t(item.predictionResult.toLowerCase().replace(" ", "_")) || item.predictionResult}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-foreground flex gap-3">
            <Sparkles className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <strong className="text-emerald-500 block mb-1">{t("auto_insight")}</strong>
              {stressActive 
                ? t("insight_critical_credit")
                : t("insight_stable_credit")}
            </div>
          </div>

          <AlertThresholdSettings
            domain="credit-risk"
            title={t("limit_lifetime_rul")}
            min={0}
            max={100}
            unit="%"
            totalCount={proposals.length}
            calculateCriticalCount={calculateCriticalCount}
            activeAlerts={activeAlerts}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card border-border transition-colors duration-300 flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <FileCheck className="h-4 w-4 text-muted-foreground/60" />
                      {t("proposals_management")}
                    </CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground mt-1">
                      {activeModel ? (
                        <>Modelo Ativo <strong>{activeModel.modelId}</strong> com acurácia de <strong>{((activeModel.metrics.accuracy || 0) * 100).toFixed(1)}%</strong>.</>
                      ) : (
                        t("proposals_desc")
                      )}
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="text" 
                        placeholder={t("search_placeholder")} 
                        className="h-8 pl-8 text-xs w-[200px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                      className="text-[10px] h-8"
                      title="Ordenar por Risco"
                    >
                      {sortOrder === "asc" ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                      {t("risk_level").replace(":", "")}
                    </Button>
                    
                    <div className="flex bg-muted p-1 rounded-md">
                      {(["all", "high", "medium", "low"] as RiskLevel[]).map(level => (
                        <button
                          key={level}
                          onClick={() => setRiskFilter(level)}
                          className={`px-2 py-1 text-[10px] rounded capitalize ${riskFilter === level ? "bg-background shadow font-bold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          {level === "all" ? (t("all_risks")).split(" ")[0] : level === "high" ? "Alto" : level === "medium" ? "Méd" : "Baixo"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {!activeModel ? (
                   <div className="h-[280px] w-full flex flex-col items-center justify-center text-muted-foreground border-t border-border bg-muted/5">
                     <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                     <p className="text-sm">Predições não habilitadas</p>
                     <p className="text-xs opacity-70">Treine o modelo de crédito para visualizar as propostas</p>
                   </div>
                ) : (
                  <div className="divide-y divide-border border-t border-border">
                    {filteredAndSortedProposals.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground text-xs">{t("no_clients_found")}</div>
                    )}
                    {filteredAndSortedProposals.map((p) => {
                      const risk = getRiskLevel(p.score, p.probability);
                      const isExpanded = expandedRow === p.id;
                      
                      return (
                        <div key={p.id} className="flex flex-col transition-colors hover:bg-muted/20">
                          <div 
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                            onClick={() => setExpandedRow(isExpanded ? null : p.id)}
                          >
                            <div className="space-y-1 min-w-[200px]">
                              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                                {p.applicant}
                                <span className={`w-2 h-2 rounded-full ${risk === 'high' ? 'bg-rose-500' : risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              </div>
                              <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                                <span className="font-mono">{p.id}</span>
                                <span>•</span>
                                <span>Valor: <strong className="text-muted-foreground/90">{p.amount}</strong></span>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 sm:ml-auto">
                              <div className="grid grid-cols-2 gap-8 text-right sm:max-w-[150px]">
                                <div>
                                  <div className="text-[9px] text-muted-foreground font-semibold uppercase">Score</div>
                                  <div className={`text-xs font-bold font-mono ${
                                    risk === 'high' ? "text-rose-500" : risk === 'medium' ? "text-amber-500" : "text-emerald-500"
                                  }`}>{p.score}</div>
                                </div>
                                <div>
                                  <div className="text-[9px] text-muted-foreground font-semibold uppercase">{t("return_probability").split(" ")[0]}</div>
                                  <div className="text-xs font-bold font-mono text-foreground/80">{p.probability}%</div>
                                </div>
                              </div>
                              
                              <div className="w-[100px] text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  risk === 'low'
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                                    : risk === 'medium'
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/25"
                                    : "bg-rose-500/10 text-rose-500 border-rose-500/25"
                                }`}>
                                  {t(p.action.toLowerCase().replace(" ", "_")) || p.action}
                                </span>
                              </div>
                              
                              {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground ml-2" /> : <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />}
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 bg-muted/10 border-t border-border/50 animate-in slide-in-from-top-2">
                              <div>
                                <div className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">{t("influence_factors")}</div>
                                <p className="text-xs text-foreground/90 bg-background p-2.5 rounded border border-border/60">
                                  {p.influentialFactors}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-muted-foreground/60" />
                  {t("ui_ratings_distribution_119")}</CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  {t("ui_distribui_o_de_clientes_404")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {ratings.map((r) => (
                  <div key={r.label} className="space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span className="font-semibold text-foreground/80">{r.label}</span>
                      <span className="font-mono">{r.count} clientes ({r.percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden border border-border">
                      <div
                        className={`h-full transition-all duration-75 ${r.color}`}
                        style={{ width: `${r.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                {stressActive && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-[10px] text-rose-500 animate-pulse flex items-start gap-2 mt-4">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>{t("ui_aviso_de_risco_sistem_498")}</strong> {t("ui_teste_de_estresse_indica_911")}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {currentView === "simulation" && (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
          <Card className="bg-card border-border transition-colors duration-300 shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-emerald-500" />
                {t("simulation_sandbox")}
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                {t("adjust_variables_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-3">
                <div className="text-xs font-bold text-foreground">{t("quick_anomaly_preset")}</div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {t("simulate_batch_desc")}
                </p>
                <div className="flex gap-2">
                  {!activeModel ? (
                    <div className="text-xs text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/25 p-2 rounded-lg w-full text-center">
                      {t("no_active_model_sim_desc")}
                    </div>
                  ) : stressActive ? (
                    <Button
                      onClick={resetSimulation}
                      disabled={isTraining}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 h-9"
                    >
                      {t("reset")}
                    </Button>
                  ) : (
                    <Button
                      onClick={triggerStressSimulation}
                      disabled={isTraining}
                      className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-1.5 h-9"
                    >
                      {t("simulate_financial_stress")}
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-muted/40 border border-border/80 rounded-xl text-xs space-y-2">
                <div className="font-bold text-foreground">{t("ui_impacto_esperado_548")}</div>
                <div className="text-muted-foreground text-[10px]">
                  {t("ui_status_772")}<strong className={stressActive ? "text-rose-500 animate-pulse" : "text-emerald-500"}>{stressActive ? "STRESSED SYSTEMIC RISK WARNING" : "NORMAL"}</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentView === "calibration" && (
        <div className="space-y-6 animate-in fade-in duration-300">
            {activeModel && (
              <>
                <Card className="bg-card border-border transition-colors duration-300">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <BarChart3 className="h-4 w-4 text-emerald-500" />
                      {t("residuals_diagnostic")}
                    </CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground">
                      {t("ui_matriz_de_confus_o_666")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ConfusionMatrixView model={activeModel} />
                  </CardContent>
                </Card>

                <FeatureImportanceChart data={mockFeatures} title={t("active_algorithm_metrics")} />
                <OverfittingDetector model={activeModel} domainAccent="emerald" />
                <InteractiveConfusionMatrix model={activeModel} domainAccent="emerald" />
              </>
            )}

            <CorrelationMatrix allRows={[]} headers={[]} activeDomain="credit-risk" />

            <BatchPrediction
              domain="credit-risk"
              domainAccent="emerald"
              columnNames={["proposta_id", "cliente", "valor", "score"]}
              processRow={(row: Record<string, string>) => {
                const res = batchProcessCreditRisk(row);
                return {
                  id: row.proposta_id ?? String(Math.random()),
                  inputs: row,
                  result: res.result,
                  resultClass: res.resultClass === "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20" ? "success" 
                    : res.resultClass === "text-rose-500 bg-rose-500/10 border border-rose-500/20" ? "danger" 
                    : "warning",
                  confidence: Math.round(res.score),
                };
              }}
              demoRows={[
                { proposta_id: "PROP-001", cliente: "Indústrias Alfa", valor: "120000", score: "820" },
                { proposta_id: "PROP-002", cliente: "Comércio Beta", valor: "45000", score: "610" },
                { proposta_id: "PROP-003", cliente: "Serviços Gamma", valor: "250000", score: "490" },
              ]}
            />

            <CSVUploader />
            <div className="mt-6 mb-6">
              <DataLineageView />
            </div>
            <SchedulingCard domain="credit-risk" />
          </div>
        )}

        {currentView === "comparison" && (
          <ComparisonView domain="credit-risk" />
        )}

        {currentView === "analytics" && (
          <AdvancedModelAnalytics />
        )}

        {currentView === "model-history" && (
          <div className="space-y-6">
            <ModelRegistry />
            <ModelComparison domain="credit-risk" />
          </div>
        )}

        {predictionResult && (
          <div id="print-receipt-container" className="hidden print:block">
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #print-receipt-container, #print-receipt-container * {
                  visibility: visible !important;
                }
                #print-receipt-container {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  padding: 40px !important;
                  background-color: #ffffff !important;
                  color: #000000 !important;
                  font-family: monospace !important;
                  font-size: 12px !important;
                  line-height: 1.5 !important;
                }
                .receipt-header {
                  text-align: center !important;
                  margin-bottom: 20px !important;
                  border-bottom: 2px solid #000000 !important;
                  padding-bottom: 10px !important;
                }
                .receipt-title {
                  font-size: 16px !important;
                  font-weight: bold !important;
                  margin-top: 5px !important;
                }
                .receipt-section {
                  margin-bottom: 15px !important;
                }
                .receipt-row {
                  display: flex !important;
                  justify-content: space-between !important;
                  margin-bottom: 5px !important;
                }
                .receipt-divider {
                  border-top: 1px dashed #000000 !important;
                  margin: 15px 0 !important;
                }
                .receipt-verdict {
                  font-size: 14px !important;
                  font-weight: bold !important;
                  text-align: center !important;
                  border: 2px solid #000000 !important;
                  padding: 10px !important;
                  margin: 15px 0 !important;
                }
                .receipt-footer {
                  text-align: center !important;
                  margin-top: 40px !important;
                  font-size: 10px !important;
                }
                .signature-line {
                  margin-top: 50px !important;
                  border-top: 1px solid #000000 !important;
                  width: 250px !important;
                  margin-left: auto !important;
                  margin-right: auto !important;
                  text-align: center !important;
                }
              }
            ` }} />
            
            <div className="receipt-header">
              <div>{t("ui_spam_sistema_preditivo_de_580")}</div>
              <div className="receipt-title">{t("ui_comprovante_de_veredicto_de_970")}</div>
            </div>

            <div className="receipt-section">
              <div className="receipt-row">
                <strong>{t("ui_data_de_emiss_o_755")}</strong>
                <span>{new Date().toLocaleDateString("pt-BR")} - {new Date().toLocaleTimeString("pt-BR")}</span>
              </div>
              <div className="receipt-row">
                <strong>{t("ui_id_do_modelo_preditivo_631")}</strong>
                <span>{activeModel?.modelId || "N/A"}</span>
              </div>
              <div className="receipt-row">
                <strong>{t("ui_algoritmo_executado_680")}</strong>
                <span>{activeModel?.algorithm || "N/A"} ({activeModel?.type || "N/A"})</span>
              </div>
            </div>

            <div className="receipt-divider" />

            <div className="receipt-section">
              <h3 style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "8px" }}>{t("ui_dados_de_entrada_da_724")}</h3>
              <div className="receipt-row">
                <span>{t("ui_id_da_proposta_220")}</span>
                <strong style={{ fontFamily: "monospace" }}>{predictionResult.dataInput.propostaId}</strong>
              </div>
              <div className="receipt-row">
                <span>{t("ui_cliente_proponente_575")}</span>
                <strong>{predictionResult.dataInput.cliente}</strong>
              </div>
              <div className="receipt-row">
                <span>{t("ui_valor_solicitado_646")}</span>
                <strong>{predictionResult.dataInput.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
              </div>
              <div className="receipt-row">
                <span>{t("ui_score_de_cr_dito_474")}</span>
                <strong>{predictionResult.dataInput.score} pontos</strong>
              </div>
            </div>

            <div className="receipt-divider" />

            <div className="receipt-section">
              <h3 style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "8px", textAlign: "center" }}>{t("ui_resultado_do_motor_anal_336")}</h3>
              <div className="receipt-verdict">
                {t("ui_veredicto_do_modelo_334")}{predictionResult.acao.toUpperCase()}<br />
                {t("ui_probabilidade_de_retorno_do_256")}{predictionResult.probabilidadeRetorno}%
              </div>
              <p style={{ textAlign: "center", fontStyle: "italic", fontSize: "10px", marginTop: "5px" }}>
                {predictionResult.acao === "Aprovar"
                  ? "Crédito recomendado para aprovação automática."
                  : predictionResult.acao === "Análise Manual"
                  ? "Crédito retido para análise e homologação física."
                  : predictionResult.acao === "Revisar Garantia"
                  ? "Aprovação condicionada a apresentação de garantias colaterais."
                  : "Crédito negado de acordo com política de risco prudencial."}
              </p>
            </div>

            <div className="receipt-divider" />

            <div className="signature-line">
              {t("ui_assinatura_do_analista_respons_977")}</div>

            <div className="receipt-footer">
              <div>{t("ui_spam_intelligent_systems_567")}{new Date().getFullYear()}</div>
              <div>{t("ui_chave_de_autenticidade_321")}{predictionResult.dataInput.propostaId}-{predictionResult.dataInput.score}</div>
            </div>
          </div>
        )}
      </div>
  );
}
