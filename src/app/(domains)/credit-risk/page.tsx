"use client";

import React, { useState, useEffect } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { TrendingUp, AlertTriangle, Coins, Percent, FileCheck, BarChart3, Lock, ShieldCheck, History, Printer, Loader2, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSVUploader, ConfusionMatrixView, DOMAIN_SCHEMAS } from "@/components/shared/csv-uploader";
import { predictCreditRisk } from "@/lib/predictive-engine";

export default function CreditRiskPage() {
  const { addLog, isTraining, trainedModels } = useDomain();
  const activeModel = trainedModels["credit-risk"];
  const [stressActive, setStressActive] = useState(false);

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

  const validateField = (name: string, value: string, type: "numeric" | "text") => {
    if (!value || value.trim() === "") {
      return "Este campo é obrigatório.";
    }
    if (type === "numeric") {
      const cleaned = value.replace(",", ".");
      if (isNaN(Number(cleaned)) || !/^\d+(\.\d+)?$/.test(cleaned)) {
        return "Insira um número válido (ex: 125000). Letras não são permitidas.";
      }
      if (Number(cleaned) <= 0) {
        return "O valor deve ser maior que zero.";
      }
      if (name === "score") {
        const val = Number(cleaned);
        if (val < 300 || val > 1000) {
          return "O score deve estar entre 300 e 1000.";
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
      case "proposta_id": return "ID da Proposta";
      case "cliente": return "Nome do Cliente / Proponente";
      case "valor": return "Valor Solicitado (R$)";
      case "score": return "Score de Crédito (300-1000)";
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

  const [proposals, setProposals] = useState([
    { id: "PROP-902", applicant: "Distribuidora de Bebidas União", amount: "R$ 250.000", score: 810, probability: 96, action: "Aprovar" },
    { id: "PROP-905", applicant: "Gabriel Silva Alimentos", amount: "R$ 80.000", score: 620, probability: 74, action: "Análise Manual" },
    { id: "PROP-909", applicant: "Construções e Incorporações Fortes", amount: "R$ 600.000", score: 580, probability: 61, action: "Revisar Garantia" },
    { id: "PROP-912", applicant: "Comércio Eletrodomésticos Luz", amount: "R$ 120.000", score: 450, probability: 38, action: "Rejeitar" },
  ]);

  const [ratings, setRatings] = useState([
    { label: "AAA", count: 48, percentage: 35, color: "bg-emerald-500" },
    { label: "AA", count: 32, percentage: 23, color: "bg-emerald-500/80" },
    { label: "A", count: 27, percentage: 20, color: "bg-emerald-500/60" },
    { label: "B", count: 18, percentage: 13, color: "bg-amber-500" },
    { label: "C", count: 10, percentage: 7, color: "bg-amber-500/80" },
    { label: "D", count: 3, percentage: 2, color: "bg-rose-500" },
  ]);

  const triggerStressSimulation = () => {
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
          return { ...p, score: 510, probability: 48, action: "Rejeitar" };
        }
        if (p.id === "PROP-909") {
          return { ...p, score: 480, probability: 32, action: "Rejeitar" };
        }
        return { ...p, score: Math.max(p.score - 80, 300), probability: Math.max(p.probability - 15, 5) };
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
    addLog("Simulação de estresse de mercado ativada (Recessão / Alta de Inadimplência). Scores reclassificados.");
  };

  const resetSimulation = () => {
    setStressActive(false);
    setMetrics({
      defaultRate: "1.80%",
      avgScore: "720",
      proposalsPending: "15",
      totalExposure: "R$ 1.2M",
    });
    setProposals([
      { id: "PROP-902", applicant: "Distribuidora de Bebidas União", amount: "R$ 250.000", score: 810, probability: 96, action: "Aprovar" },
      { id: "PROP-905", applicant: "Gabriel Silva Alimentos", amount: "R$ 80.000", score: 620, probability: 74, action: "Análise Manual" },
      { id: "PROP-909", applicant: "Construções e Incorporações Fortes", amount: "R$ 600.000", score: 580, probability: 61, action: "Revisar Garantia" },
      { id: "PROP-912", applicant: "Comércio Eletrodomésticos Luz", amount: "R$ 120.000", score: 450, probability: 38, action: "Rejeitar" },
    ]);
    setRatings([
      { label: "AAA", count: 48, percentage: 35, color: "bg-emerald-500" },
      { label: "AA", count: 32, percentage: 23, color: "bg-emerald-500/80" },
      { label: "A", count: 27, percentage: 20, color: "bg-emerald-500/60" },
      { label: "B", count: 18, percentage: 13, color: "bg-amber-500" },
      { label: "C", count: 10, percentage: 7, color: "bg-amber-500/80" },
      { label: "D", count: 3, percentage: 2, color: "bg-rose-500" },
    ]);
    addLog("Simulação de estresse desativada. Coeficientes de liquidez e default restaurados.");
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
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-md relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 blur-3xl rounded-full" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest">
            <Coins className="h-4 w-4" />
            Módulo de Risco de Crédito (Ativo)
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Análise e Escoragem Preditiva de Crédito
          </h2>
          <p className="text-muted-foreground text-xs">
            Avaliação de riscos de default e concessão de limites de crédito empresarial com redes profundas.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {stressActive ? (
            <Button
              onClick={resetSimulation}
              disabled={isTraining}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              Resetar Análise
            </Button>
          ) : (
            <Button
              onClick={triggerStressSimulation}
              disabled={isTraining}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5"
            >
              <TrendingUp className="h-4 w-4" />
              Simular Teste de Estresse
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Taxa de Default Projetada (PD)
            </CardDescription>
            <CardTitle className={`text-2xl font-black ${stressActive ? "text-rose-500 animate-pulse" : "text-foreground"}`}>
              {metrics.defaultRate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Probabilidade de inadimplência média</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Score Médio de Crédito
            </CardDescription>
            <CardTitle className={`text-2xl font-black ${stressActive ? "text-amber-500" : "text-emerald-500"}`}>
              {metrics.avgScore} pt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Classificação: Saudável</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Propostas Pendentes
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">{metrics.proposalsPending}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Aguardando decisão do modelo</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Exposição de Carteira (VaR)
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">{metrics.totalExposure}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Valor em Risco estimado a 95%</div>
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
              Predição Individual (Entrada Manual)
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Insira os dados manualmente para obter uma classificação instantânea de risco e probabilidade de retorno de crédito.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!activeModel ? (
              // CA03 - Block message when model is not active
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-border rounded-xl bg-zinc-950/20">
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full mb-3">
                  <Lock className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold text-foreground mb-1">Módulo de Predição Individual Bloqueado</h4>
                <p className="text-[10px] text-muted-foreground max-w-md leading-relaxed">
                  Não há nenhum modelo treinado e ativo para o domínio de Risco de Crédito. Faça o upload de uma base de dados histórica no painel abaixo e inicie o treinamento para liberar este formulário.
                </p>
              </div>
            ) : (
              // CA01 - Dynamic Form based on model variables
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
                        // CA04 - Real-time error highlight & message
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
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2"
                  >
                    Calcular Score de Risco
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Lateral History Panel Placeholder */}
        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <History className="h-4 w-4 text-muted-foreground/60" />
              Histórico Lateral
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Últimas predições individuais realizadas neste dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground text-center py-6 italic">
              Nenhuma predição realizada neste ciclo.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit Proposals List */}
        <Card className="lg:col-span-2 bg-card border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-muted-foreground/60" />
              Propostas de Crédito em Análise ({activeModel ? activeModel.algorithm : "Deep Neural Network"})
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              {activeModel ? (
                <>Modelo ativo: <strong>{activeModel.modelId}</strong> com Acurácia de <strong>{((activeModel.metrics.accuracy || 0) * 100).toFixed(1)}%</strong>.</>
              ) : (
                "Score preditivo de adimplência e probabilidade estatística de retorno do valor financiado."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border border-t border-border">
              {proposals.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">{p.applicant}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                      <span className="font-mono">{p.id}</span>
                      <span>•</span>
                      <span>Valor: <strong className="text-muted-foreground/90">{p.amount}</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-right sm:max-w-[150px]">
                    <div>
                      <div className="text-[9px] text-muted-foreground font-semibold uppercase">Score</div>
                      <div className={`text-xs font-bold font-mono ${
                        p.score > 700 ? "text-emerald-500" : p.score > 550 ? "text-amber-500" : "text-rose-500"
                      }`}>{p.score}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground font-semibold uppercase">Confiança</div>
                      <div className="text-xs font-bold font-mono text-foreground/80">{p.probability}%</div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      p.action === "Aprovar"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                        : p.action === "Análise Manual" || p.action === "Revisar Garantia"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/25"
                        : "bg-rose-500/10 text-rose-500 border-rose-500/25"
                    }`}>
                      {p.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution Card */}
        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Percent className="h-4 w-4 text-muted-foreground/60" />
              Distribuição de Ratings
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Distribuição de clientes ativos nas classes de risco financeiro.
            </CardDescription>
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
                  <strong>Aviso de Risco Sistemático:</strong> Teste de estresse indica rebaixamento em massa de 40% da carteira de ratings AAA e AA para classes B e C. Risco de provisionamento de capital aumentado.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ingestão de Dados Históricos */}
      <div className="space-y-6">
        {activeModel && (
          <Card className="bg-card border-border transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                Diagnóstico Visual do Modelo (RF13)
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Matriz de confusão interativa mapeando acertos e erros de classificação do modelo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConfusionMatrixView model={activeModel} />
            </CardContent>
          </Card>
        )}

        <CSVUploader />
      </div>
    </div>
  );
}
