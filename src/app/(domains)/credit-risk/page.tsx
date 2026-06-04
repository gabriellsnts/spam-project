"use client";

import React, { useState } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { TrendingUp, AlertTriangle, Coins, Percent, FileCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSVUploader } from "@/components/shared/csv-uploader";

export default function CreditRiskPage() {
  const { addLog } = useDomain();
  const [stressActive, setStressActive] = useState(false);

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
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              Resetar Análise
            </Button>
          ) : (
            <Button
              onClick={triggerStressSimulation}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit Proposals List */}
        <Card className="lg:col-span-2 bg-card border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-muted-foreground/60" />
              Propostas de Crédito em Análise
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Score preditivo de adimplência e probabilidade estatística de retorno do valor financiado.
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
      <CSVUploader />
    </div>
  );
}
