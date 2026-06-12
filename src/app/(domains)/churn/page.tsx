"use client";

import React, { useState } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { Users, UserMinus, AlertCircle, Sparkles, Star, HeartHandshake } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSVUploader } from "@/components/shared/csv-uploader";

export default function ChurnPage() {
  const { addLog, isTraining } = useDomain();
  const [churnSimulated, setChurnSimulated] = useState(false);

  const [metrics, setMetrics] = useState({
    churnRate: "2.1%",
    atRisk: "84",
    actionsPending: "12",
    nps: "78",
  });

  const [clients, setClients] = useState([
    { id: "C104", name: "Indústrias Metalúrgicas Alfa", score: 87, ltv: "R$ 45.000", factor: "Falta de suporte técnico", action: "Reunião de Alinhamento" },
    { id: "C302", name: "Supermercados Ideal", score: 72, ltv: "R$ 18.200", factor: "Baixo engajamento na plataforma", action: "Disparar Cupom Engajamento" },
    { id: "C098", name: "Logística Expressa S.A.", score: 68, ltv: "R$ 92.500", factor: "Término de contrato (30d)", action: "Propor Renovação Promocional" },
    { id: "C551", name: "Tecnologia Avançada Beta", score: 45, ltv: "R$ 15.000", factor: "Uso regular", action: "Monitorar Acessos" },
  ]);

  const triggerChurnSimulation = () => {
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
          return { ...c, score: 91, factor: "Parada repentina de acessos (7 dias)", action: "Ligação Urgente Key Account" };
        }
        return { ...c, score: Math.min(c.score + 10, 99) };
      })
    );
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
    setClients([
      { id: "C104", name: "Indústrias Metalúrgicas Alfa", score: 87, ltv: "R$ 45.000", factor: "Falta de suporte técnico", action: "Reunião de Alinhamento" },
      { id: "C302", name: "Supermercados Ideal", score: 72, ltv: "R$ 18.200", factor: "Baixo engajamento na plataforma", action: "Disparar Cupom Engajamento" },
      { id: "C098", name: "Logística Expressa S.A.", score: 68, ltv: "R$ 92.500", factor: "Término de contrato (30d)", action: "Propor Renovação Promocional" },
      { id: "C551", name: "Tecnologia Avançada Beta", score: 45, ltv: "R$ 15.000", factor: "Uso regular", action: "Monitorar Acessos" },
    ]);
    addLog("Simulação de churn cancelada. Retorno ao score estatístico histórico basal.");
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-md relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 h-40 w-40 bg-violet-500/5 blur-3xl rounded-full" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-violet-500 font-bold text-xs uppercase tracking-widest">
            <Users className="h-4 w-4" />
            Módulo de Retenção de Clientes (Ativo)
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Análise Preditiva de Churn de Clientes
          </h2>
          <p className="text-muted-foreground text-xs">
            Modelagem estatística de probabilidade de cancelamento de assinaturas e contas Enterprise.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {churnSimulated ? (
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

      {/* KPI Cards Grid */}
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
            <CardTitle className="text-2xl font-black text-foreground">{metrics.atRisk}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Churn Score acima de 65%</div>
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

      {/* Main Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table representation */}
        <Card className="lg:col-span-2 bg-card border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-muted-foreground/60" />
              Contas com Maior Risco de Churn (ML Classifier)
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Clientes identificados pelo modelo de rede neural classificadora com probabilidade de saída nos próximos 30 dias.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border border-t border-border">
              {clients.map((c) => (
                <div
                  key={c.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                      <span className="font-mono">ID: {c.id}</span>
                      <span>•</span>
                      <span>LTV: <strong className="text-muted-foreground/90">{c.ltv}</strong></span>
                    </div>
                  </div>

                  <div className="flex-1 sm:max-w-[200px] text-left sm:text-right">
                    <div className="text-[9px] text-muted-foreground font-semibold uppercase">Fator de Risco Principal</div>
                    <div className="text-xs text-muted-foreground italic line-clamp-1">{c.factor}</div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[9px] text-muted-foreground font-semibold uppercase">Churn Score</div>
                      <div className={`text-sm font-black font-mono ${
                        c.score > 80 ? "text-rose-500" : c.score > 60 ? "text-amber-500" : "text-emerald-500"
                      }`}>{c.score}%</div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-muted-foreground block">Ação Recomendada</span>
                      <span className="px-2 py-0.5 rounded bg-background border border-border text-[10px] text-violet-500 font-medium whitespace-nowrap">
                        {c.action}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Strategy Card */}
        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4 text-muted-foreground/60" />
              Estratégias Recomendadas (CS)
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Ações baseadas no perfil do cliente para reverter o risco analítico.
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

      {/* Ingestão de Dados Históricos */}
      <CSVUploader />
    </div>
  );
}
