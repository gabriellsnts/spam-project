"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { Users, UserMinus, AlertCircle, Sparkles, Star, HeartHandshake, BarChart3, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSVUploader, ConfusionMatrixView } from "@/components/shared/csv-uploader";
import { FeatureImportanceChart } from "@/components/shared/feature-importance-chart";
import { AlertThresholdSettings } from "@/components/shared/alert-threshold-settings";

type RiskLevel = "all" | "high" | "medium" | "low";

interface ClientData {
  id: string;
  name: string;
  score: number;
  ltv: string;
  factor: string;
  action: string;
}

export default function ChurnPage() {
  const { addLog, isTraining, trainedModels, alertThresholds, addAlert, currentView } = useDomain();
  const activeModel = trainedModels["churn"];
  const isModelObsolete = activeModel ? (Date.now() - activeModel.timestamp > 30 * 24 * 60 * 60 * 1000) : false;
  const [churnSimulated, setChurnSimulated] = useState(false);
  const [riskFilter, setRiskFilter] = useState<RiskLevel>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const threshold = alertThresholds["churn"] !== undefined ? alertThresholds["churn"] : 80;
  
  const [metrics, setMetrics] = useState({
    churnRate: "2.1%",
    atRisk: "84",
    actionsPending: "12",
    nps: "78",
  });

  const initialClients: ClientData[] = [
    { id: "C104", name: "Indústrias Metalúrgicas Alfa", score: 87, ltv: "R$ 45.000", factor: "Falta de suporte técnico. Ticket médio caindo continuamente nos últimos 3 meses.", action: "Reunião de Alinhamento" },
    { id: "C302", name: "Supermercados Ideal", score: 72, ltv: "R$ 18.200", factor: "Baixo engajamento na plataforma nos últimos 2 meses.", action: "Disparar Cupom Engajamento" },
    { id: "C098", name: "Logística Expressa S.A.", score: 68, ltv: "R$ 92.500", factor: "Término de contrato (30d). Fator sazonal e falta de renovação automática detectados.", action: "Propor Renovação Promocional" },
    { id: "C551", name: "Tecnologia Avançada Beta", score: 45, ltv: "R$ 15.000", factor: "Uso regular. NPS recente avaliado como 8.", action: "Monitorar Acessos" },
    { id: "C112", name: "Comércio Varejista Omega", score: 92, ltv: "R$ 12.000", factor: "3 chamados de suporte técnico abertos e sem resolução há mais de 10 dias.", action: "Escalonar Suporte N3" },
    { id: "C884", name: "Serviços Digitais Zeta", score: 12, ltv: "R$ 150.000", factor: "Alto engajamento diário e renovação assinada.", action: "Ação de Upsell" },
  ];

  const [clients, setClients] = useState<ClientData[]>(initialClients);

  const getRiskLevel = useCallback((score: number) => {
    if (score >= threshold) return "high";
    if (score >= 60) return "medium";
    return "low";
  }, [threshold]);

  const activeAlerts = useMemo(() => {
    return clients
      .filter((c) => c.score >= threshold)
      .map((c) => ({
        id: c.id,
        name: c.name,
        value: c.score,
        threshold: threshold,
        details: c.factor,
      }));
  }, [clients, threshold]);

  const dynamicAtRisk = useMemo(() => {
    const criticalCount = clients.filter((c) => c.score >= threshold).length;
    const factor = churnSimulated ? 222 : 252;
    return Math.round((criticalCount / clients.length) * factor);
  }, [clients, threshold, churnSimulated]);

  const calculateCriticalCount = (t: number) => {
    return clients.filter((c) => c.score >= t).length;
  };

  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients];
    
    // CA04 - Filtro por nível de risco
    if (riskFilter !== "all") {
      result = result.filter(c => getRiskLevel(c.score) === riskFilter);
    }
    
    // CA02 - Ordenável por nível de risco (maior risco primeiro)
    result.sort((a, b) => {
      if (sortOrder === "desc") return b.score - a.score;
      return a.score - b.score;
    });
    
    return result;
  }, [clients, riskFilter, sortOrder, getRiskLevel]);

  const triggerChurnSimulation = () => {
    if (!activeModel) {
      addLog("Erro: É necessário treinar um modelo primeiro para gerar predições de Churn.");
      return;
    }
    setChurnSimulated(true);
    setMetrics({
      churnRate: "5.4%",
      atRisk: "148",
      actionsPending: "32",
      nps: "62",
    });
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === "C551") {
          return { ...c, score: 91, factor: "Parada repentina de acessos (7 dias). Cliente desativou integrações críticas.", action: "Ligação Urgente Key Account" };
        }
        return { ...c, score: Math.min(c.score + 10, 99) };
      })
    );
    addAlert({
      domain: "churn",
      item: "Tecnologia Avançada Beta (C551)",
      value: "91%",
      metric: "Churn Score",
      criticality: "high"
    });
    addLog("Simulação de desligamento repentino de clientes ativada. Alerta de Churn de Contas de Alto LTV.");
  };

  const resetSimulation = () => {
    setChurnSimulated(false);
    setMetrics({
      churnRate: "2.1%",
      atRisk: "84",
      actionsPending: "12",
      nps: "78",
    });
    setClients(initialClients);
    addLog("Simulação de churn cancelada. Retorno ao score estatístico histórico basal.");
  };

  const handleExport = () => {
    window.print();
    addLog("Relatório consolidado exportado para PDF via impressão.");
  };

  const mockFeatures = [
    { name: "Dias desde o último login", weight: 0.35, description: "Mede o engajamento diário do usuário principal da conta. Ausência de login é o principal indicativo de risco de evasão." },
    { name: "Tickets de Suporte Abertos", weight: 0.25, description: "Volume de reclamações ativas nos últimos 30 dias. Chamados pendentes elevam severamente o risco de cancelamento." },
    { name: "NPS Resposta", weight: 0.20, description: "Última pontuação de satisfação dada pelo cliente (0 a 10) nas pesquisas regulares." },
    { name: "Tempo de Contrato", weight: 0.12, description: "Clientes novos (meses 1-3) tendem a apresentar maior churn prematuro, exigindo onboard assistido." },
    { name: "Uso de Funcionalidades Premium", weight: 0.08, description: "Adoção de módulos avançados correlaciona fortemente com retenção de longo prazo." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-md relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 h-40 w-40 bg-violet-500/5 blur-3xl rounded-full" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-violet-500 font-bold text-xs uppercase tracking-widest">
            <Users className="h-4 w-4" />
            Módulo de Retenção de Clientes (Ativo)
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight flex flex-wrap items-center gap-2">
            Análise Preditiva de Churn de Clientes
            {activeModel && (
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border font-sans ${
                isModelObsolete 
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                  : "bg-emerald-500/10 text-emerald-550 dark:text-emerald-400 border-emerald-500/20 animate-pulse"
              }`}>
                <CheckCircle2 className="h-3 w-3" />
                {isModelObsolete ? "Modelo Obsoleto" : "Modelo Pronto para Uso"}
              </span>
            )}
          </h2>
          <p className="text-muted-foreground text-xs">
            Modelagem estatística de probabilidade de cancelamento de assinaturas e contas Enterprise.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 relative z-10">
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
            Exportar Relatório (PDF)
          </Button>
          {!activeModel ? (
            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs font-semibold font-sans">
              <AlertCircle className="h-4 w-4" />
              Treine um modelo primeiro
            </div>
          ) : churnSimulated ? (
            <Button
              onClick={resetSimulation}
              disabled={isTraining}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              Resetar Score
            </Button>
          ) : (
            <Button
              onClick={triggerChurnSimulation}
              disabled={isTraining}
              className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold gap-1.5"
            >
              <UserMinus className="h-4 w-4" />
              Simular Churn em Massa
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
            <p className="font-bold text-foreground">Sem Modelo Ativo Detectado</p>
            <p className="text-muted-foreground mt-0.5">
              Para liberar previsões e simulações completas de churn, realize o treinamento fazendo o upload da base de dados histórica (CSV) no painel de calibração abaixo.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Taxa de Churn Projetada
            </CardDescription>
            <CardTitle className={`text-2xl font-black ${churnSimulated ? "text-rose-500 animate-pulse" : "text-foreground"}`}>
              {metrics.churnRate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Meta estipulada anual: &lt; 3.0%</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Contas sob Alto Risco
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">{dynamicAtRisk}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Churn Score acima de 80%</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Ações Pendentes
            </CardDescription>
            <CardTitle className={`text-2xl font-black text-amber-500 ${churnSimulated ? "animate-pulse" : ""}`}>
              {metrics.actionsPending}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Campanhas de e-mail e ligações</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Score NPS da Carteira
            </CardDescription>
            <CardTitle className={`text-2xl font-black ${churnSimulated ? "text-rose-500" : "text-emerald-500"}`}>
              {metrics.nps}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Zona de excelência operacional</div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg text-sm text-foreground flex gap-3">
        <Sparkles className="h-5 w-5 text-violet-500 shrink-0" />
        <div>
          <strong className="text-violet-500 block mb-1">Insight Automático:</strong>
          {churnSimulated 
            ? "O alerta vermelho foi disparado. Observamos uma queda abrupta no uso de funcionalidades principais na base de clientes Beta. Sugere-se uma ação imediata de Customer Success."
            : "A base apresenta estabilidade, mas clientes com LTV intermediário (R$15k-R$30k) têm mostrado leve aumento no risco nos últimos 15 dias. Uma campanha de engajamento é recomendada."}
        </div>
      </div>

      <AlertThresholdSettings
        domain="churn"
        title="Limiar de Risco de Churn (Evasão)"
        min={0}
        max={100}
        unit="%"
        totalCount={clients.length}
        calculateCriticalCount={calculateCriticalCount}
        activeAlerts={activeAlerts}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border transition-colors duration-300 flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-muted-foreground/60" />
                  Classificação de Risco de Evasão
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground mt-1">
                  {activeModel ? (
                    <>Modelo ativo: <strong>{activeModel.modelId}</strong> com Acurácia de <strong>{((activeModel.metrics.accuracy || 0) * 100).toFixed(1)}%</strong>.</>
                  ) : (
                    "Faça o treinamento do modelo para gerar as classificações e scores de churn."
                  )}
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                  className="text-[10px] h-8"
                >
                  {sortOrder === "desc" ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronUp className="h-3 w-3 mr-1" />}
                  Risco
                </Button>
                
                <div className="flex bg-muted p-1 rounded-md">
                  {(["all", "high", "medium", "low"] as RiskLevel[]).map(level => (
                    <button
                      key={level}
                      onClick={() => setRiskFilter(level)}
                      className={`px-2 py-1 text-[10px] rounded capitalize ${riskFilter === level ? "bg-background shadow font-bold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {level === "all" ? "Todos" : level === "high" ? "Alto" : level === "medium" ? "Méd" : "Baixo"}
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
                 <p className="text-sm">Tabela de Classificação indisponível.</p>
                 <p className="text-xs opacity-70">Treine o modelo de Churn para gerar o scoring dos clientes.</p>
               </div>
            ) : (
              <div className="divide-y divide-border border-t border-border">
                {filteredAndSortedClients.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-xs">Nenhum cliente atende aos filtros atuais.</div>
                )}
                {filteredAndSortedClients.map((c) => {
                  const risk = getRiskLevel(c.score);
                  const isExpanded = expandedRow === c.id;
                  
                  return (
                    <div key={c.id} className="flex flex-col transition-colors hover:bg-muted/20">
                      {/* CA01 e CA03 - Cor distinta por faixa de risco */}
                      <div 
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                        onClick={() => setExpandedRow(isExpanded ? null : c.id)}
                      >
                        <div className="space-y-1 min-w-[200px]">
                          <div className="text-xs font-bold text-foreground flex items-center gap-2">
                            {c.name}
                            <span className={`w-2 h-2 rounded-full ${risk === 'high' ? 'bg-rose-500' : risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                            <span className="font-mono">ID: {c.id}</span>
                            <span>•</span>
                            <span>LTV: <strong className="text-muted-foreground/90">{c.ltv}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 sm:ml-auto">
                          <div className="text-right">
                            <div className="text-[9px] text-muted-foreground font-semibold uppercase">Churn Score</div>
                            <div className={`text-sm font-black font-mono ${
                              risk === 'high' ? "text-rose-500" : risk === 'medium' ? "text-amber-500" : "text-emerald-500"
                            }`}>{c.score}%</div>
                          </div>
                          
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                      
                      {/* CA05 - Detalhe dos fatores ao clicar */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 bg-muted/10 border-t border-border/50 animate-in slide-in-from-top-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div>
                              <div className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">Fatores Analíticos (Explicação)</div>
                              <p className="text-xs text-foreground/90 bg-background p-2.5 rounded border border-border/60">
                                {c.factor}
                              </p>
                            </div>
                            <div>
                              <div className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">Ação Sugerida</div>
                              <div className="flex items-center justify-between bg-background p-2.5 rounded border border-border/60">
                                <span className="text-xs font-bold text-violet-500">{c.action}</span>
                                <Button size="sm" variant="ghost" className="h-6 text-[10px]">Atribuir Tarefa</Button>
                              </div>
                            </div>
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
              <HeartHandshake className="h-4 w-4 text-muted-foreground/60" />
              Estratégias Recomendadas (CS)
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Ações baseadas no perfil da carteira.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-foreground/80 font-bold">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                Programa VIP de Upgrade
              </div>
              <p className="text-muted-foreground text-[10px] leading-relaxed">
                Disparar campanha direcionada para clientes com score &gt; 70% e LTV superior a R$ 50k, oferecendo suporte prioritário 24/7.
              </p>
            </div>

            <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-foreground/80 font-bold">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                Integração Assistida (Onboarding)
              </div>
              <p className="text-muted-foreground text-[10px] leading-relaxed">
                Agendamento de mentorias técnicas para clientes novos cujo engajamento de uso caiu abaixo de 20% no primeiro mês.
              </p>
            </div>

            {churnSimulated && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-[10px] text-rose-500 animate-pulse flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Alerta de Churn Crítico:</strong> O cliente <em>Tecnologia Avançada Beta</em> está em inatividade total há 7 dias consecutivos. Probabilidade de cancelamento de contrato subiu para 91%.
                </div>
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
            <UserMinus className="h-4 w-4 text-violet-500" />
            Sandbox de Simulação de Churn
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground">
            Simule cancelamento de clientes em massa para estressar a taxa de churn projetada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-xl space-y-3">
            <div className="text-xs font-bold text-foreground">Preset Rápido de Churn em Massa</div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Esta ferramenta simula a perda de contratos de alta relevância simultaneamente para verificar a capacidade de resposta das estratégias de Customer Success.
            </p>
            <div className="flex gap-2">
              {!activeModel ? (
                <div className="text-xs text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/25 p-2 rounded-lg w-full text-center">
                  ⚠️ É necessário realizar o treinamento do modelo na aba de Calibração antes de rodar simulações.
                </div>
              ) : churnSimulated ? (
                <Button
                  onClick={resetSimulation}
                  disabled={isTraining}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 h-9"
                >
                  Resetar Score e Normalizar Base
                </Button>
              ) : (
                <Button
                  onClick={triggerChurnSimulation}
                  disabled={isTraining}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold py-1.5 h-9"
                >
                  ⚠️ Simular Churn em Massa
                </Button>
              )}
            </div>
          </div>

          <div className="p-3 bg-muted/40 border border-border/80 rounded-xl text-xs space-y-2">
            <div className="font-bold text-foreground">Cenário de Estresse</div>
            <div className="text-muted-foreground text-[10px]">
              Status Atual da Simulação: <strong className={churnSimulated ? "text-rose-500 animate-pulse" : "text-emerald-500"}>{churnSimulated ? "CRÍTICO (CHURN EM MASSA SIMULADO)" : "NORMAL (LINHA DE BASE)"}</strong>
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
                  <BarChart3 className="h-4 w-4 text-violet-500" />
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
            
            <FeatureImportanceChart data={mockFeatures} title="Preditores de Evasão (Churn)" />
          </>
        )}

        <CSVUploader />
      </div>
    )}

    {currentView === "comparison" && (
      <div className="space-y-6 animate-in fade-in duration-300">
        <Card className="bg-card border-border transition-colors duration-300 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Comparação Real vs Previsto
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Módulo de validação de assertividade do modelo preditivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8 text-center text-muted-foreground text-xs font-sans">
            Esta área está reservada para o módulo de comparação entre dados reais e previsões (RF32).
          </CardContent>
        </Card>
      </div>
    )}
  </div>
);
}
