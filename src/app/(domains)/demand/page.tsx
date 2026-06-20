"use client";

import React, { useState, useMemo } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { TrendingUp, BarChart3, Package, Calendar, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSVUploader, ResidualsPlotView } from "@/components/shared/csv-uploader";
import { FeatureImportanceChart } from "@/components/shared/feature-importance-chart";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

export default function DemandPage() {
  const { addLog, isTraining, trainedModels } = useDomain();
  const activeModel = trainedModels["demand"];
  const [seasonalActive, setSeasonalActive] = useState(false);
  const [horizon, setHorizon] = useState<7 | 30 | 90>(30);
  
  const [metrics, setMetrics] = useState({
    accuracy: "93.8%",
    projectedGrowth: "+12.4%",
    criticalItems: "4",
    totalSales: "R$ 482.000",
  });

  const [products, setProducts] = useState([
    { id: "P01", name: "Bobina de Aço Galvanizado", stock: 120, leadTime: 14, monthlyDemand: 450, risk: "none" },
    { id: "P02", name: "Cabos Elétricos de Cobre", stock: 15, leadTime: 10, monthlyDemand: 80, risk: "high" },
    { id: "P03", name: "Chapa Metálica 2mm", stock: 350, leadTime: 15, monthlyDemand: 300, risk: "medium" },
    { id: "P04", name: "Pernos de Fixação Hexagonal", stock: 2400, leadTime: 5, monthlyDemand: 2500, risk: "medium" },
  ]);

  const generateChartData = (days: number, isSeasonal: boolean) => {
    const data = [];
    const today = new Date();
    for (let i = -15; i <= 0; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      data.push({
        date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        historico: 100 + Math.random() * 50 + (i * 2),
        previsao: null,
        isFuture: false,
      });
    }
    const lastHist = data[data.length - 1].historico as number;
    for (let i = 1; i <= days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      let multiplier = 1;
      if (isSeasonal && i > 5 && i < 15) multiplier = 2.5; 
      
      data.push({
        date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        historico: null,
        previsao: lastHist + (i * 1.5) * multiplier + (Math.random() * 20),
        isFuture: true,
      });
    }
    const currentPoint = data.find(d => d.isFuture === false && data.indexOf(d) === 15);
    if (currentPoint) {
      data[15].previsao = currentPoint.historico;
    }

    return data;
  };

  const chartData = useMemo(() => generateChartData(horizon, seasonalActive), [horizon, seasonalActive]);

  const triggerSeasonalSimulation = () => {
    if (!activeModel) {
      addLog("Erro: É necessário treinar um modelo primeiro para gerar previsões.");
      return;
    }
    setSeasonalActive(true);
    setMetrics({
      accuracy: "91.2%",
      projectedGrowth: "+48.9%",
      criticalItems: "8",
      totalSales: "R$ 720.000",
    });
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === "P01") return { ...p, stock: 120, monthlyDemand: 850, risk: "high" };
        if (p.id === "P03") return { ...p, stock: 350, monthlyDemand: 650, risk: "high" };
        if (p.id === "P04") return { ...p, stock: 2400, monthlyDemand: 5000, risk: "high" };
        return p;
      })
    );
    addLog("Simulação de sazonalidade de alta demanda ativada. Alerta de ruptura de estoque disparado.");
  };

  const resetSimulation = () => {
    setSeasonalActive(false);
    setMetrics({
      accuracy: "93.8%",
      projectedGrowth: "+12.4%",
      criticalItems: "4",
      totalSales: "R$ 482.000",
    });
    setProducts([
      { id: "P01", name: "Bobina de Aço Galvanizado", stock: 120, leadTime: 14, monthlyDemand: 450, risk: "none" },
      { id: "P02", name: "Cabos Elétricos de Cobre", stock: 15, leadTime: 10, monthlyDemand: 80, risk: "high" },
      { id: "P03", name: "Chapa Metálica 2mm", stock: 350, leadTime: 15, monthlyDemand: 300, risk: "medium" },
      { id: "P04", name: "Pernos de Fixação Hexagonal", stock: 2400, leadTime: 5, monthlyDemand: 2500, risk: "medium" },
    ]);
    addLog("Simulação de sazonalidade redefinida. Projeções de demanda normalizadas.");
  };

  const mockFeatures = [
    { name: "Sazonalidade Mensal", weight: 0.45, description: "Variação esperada devido a feriados e picos sazonais." },
    { name: "Preço do Produto", weight: 0.25, description: "Sensibilidade de demanda cruzada com alterações no ticket médio." },
    { name: "Promoções Ativas", weight: 0.15, description: "Impacto temporário por queimas de estoque e campanhas pontuais." },
    { name: "Temperatura", weight: 0.10, description: "Fator climático local impactando logística e tráfego em loja." },
    { name: "Concorrentes Ativos", weight: 0.05, description: "Ações promocionais do mercado registradas no CRM." },
  ];

  const handleExport = () => {
    window.print();
    addLog("Relatório consolidado exportado para PDF via impressão.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-md relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/5 blur-3xl rounded-full" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest">
            <TrendingUp className="h-4 w-4" />
            Módulo de Previsão de Demanda (Ativo)
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Modelagem Preditiva de Séries Temporais
          </h2>
          <p className="text-muted-foreground text-xs">
            Planejamento inteligente de cadeia de suprimentos integrado com algoritmo Prophet-ML.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 relative z-10">
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
            Exportar Relatório (PDF)
          </Button>
          {!activeModel ? (
            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs font-semibold">
              <AlertCircle className="h-4 w-4" />
              Treine um modelo primeiro
            </div>
          ) : seasonalActive ? (
            <Button
              onClick={resetSimulation}
              disabled={isTraining}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              Resetar Demanda
            </Button>
          ) : (
            <Button
              onClick={triggerSeasonalSimulation}
              disabled={isTraining}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold gap-1.5"
            >
              <Calendar className="h-4 w-4" />
              Simular Pico de Demanda
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {activeModel ? "R² (Score do Modelo)" : "Acurácia do Modelo"}
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">
              {activeModel ? `${((activeModel.metrics.r2 || 0) * 100).toFixed(1)}%` : metrics.accuracy}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">
              {activeModel ? `Modelo: ${activeModel.algorithm}` : "Modelo: Holt-Winters & Prophet"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Crescimento Projetado
            </CardDescription>
            <CardTitle className={`text-2xl font-black ${seasonalActive ? "text-sky-500" : "text-foreground"}`}>
              {metrics.projectedGrowth}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Próximos {horizon} dias operacionais</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Itens sob Risco de Ruptura
            </CardDescription>
            <CardTitle className={`text-2xl font-black ${Number(metrics.criticalItems) > 5 ? "text-rose-500 animate-pulse" : "text-amber-500"}`}>
              {metrics.criticalItems}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Estoque abaixo da cobertura mínima</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Faturamento Estimado
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">{metrics.totalSales}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Margem de contribuição média: 28%</div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sm text-foreground flex gap-3">
        <Sparkles className="h-5 w-5 text-sky-500 shrink-0" />
        <div>
          <strong className="text-sky-500 block mb-1">Insight Automático:</strong>
          {seasonalActive 
            ? "Simulação de pico indica risco severo de ruptura de estoque para 'Pernos de Fixação' e 'Bobina de Aço'. Aumento de demanda focado na próxima quinzena."
            : "A tendência atual aponta crescimento orgânico moderado, sem gargalos logísticos no horizonte de curto prazo. Faturamento estável."}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border transition-colors duration-300">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-muted-foreground/60" />
                Projeção de Séries Temporais
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Unidade: Quantidade Estimada de Vendas (un) | Domínio: Previsão de Demanda
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {[7, 30, 90].map((h) => (
                <Button
                  key={h}
                  variant={horizon === h ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHorizon(h as 7 | 30 | 90)}
                  className="h-7 text-[10px] px-2"
                  disabled={!activeModel}
                >
                  {h} Dias
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {!activeModel ? (
               <div className="h-[280px] w-full flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg bg-muted/20">
                 <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                 <p className="text-sm">Geração bloqueada.</p>
                 <p className="text-xs opacity-70">Faça o upload de dados e treine o modelo primeiro.</p>
               </div>
            ) : (
              <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '4px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number, name: string) => [
                        `${Number(value).toFixed(0)} un`, 
                        name === 'historico' ? 'Histórico Real' : 'Previsão Estimada'
                      ]}
                    />
                    <ReferenceLine x={chartData[15].date} stroke="currentColor" strokeOpacity={0.3} strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Hoje', fill: 'currentColor', fontSize: 10, opacity: 0.5 }} />
                    <Line 
                      type="monotone" 
                      dataKey="historico" 
                      stroke="currentColor" 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 4, fill: "currentColor" }}
                      className="text-foreground"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="previsao" 
                      stroke="#0ea5e9" 
                      strokeWidth={2.5} 
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{ r: 4, fill: "#0ea5e9" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Package className="h-4 w-4 text-muted-foreground/60" />
              Cobertura de Estoque
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Análise de estoque de segurança.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="p-2 rounded-lg bg-muted/40 border border-border text-xs flex flex-col gap-1">
                <div className="flex justify-between font-bold text-foreground/80">
                  <span className="truncate pr-2">{p.name}</span>
                  <span className="text-[9px] text-muted-foreground font-mono shrink-0">{p.id}</span>
                </div>
                
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>Estoque: <strong className="text-foreground">{p.stock} un.</strong></span>
                  <span>Demanda: <strong className="text-foreground">{p.monthlyDemand}/mês</strong></span>
                </div>

                <div className="mt-1 flex justify-end">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${
                    p.risk === "high"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse"
                      : p.risk === "medium"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  }`}>
                    {p.risk === "high" ? "Alto Risco" : p.risk === "medium" ? "Risco Moderado" : "Seguro"}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Ingestão de Dados Históricos e Diagnósticos */}
      <div className="space-y-6">
        {activeModel && (
          <>
            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-sky-500" />
                  Diagnóstico Visual do Modelo (RF13)
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Gráfico de resíduos interativo para verificação da qualidade das predições.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResidualsPlotView model={activeModel} />
              </CardContent>
            </Card>

            <FeatureImportanceChart data={mockFeatures} />
          </>
        )}

        <CSVUploader />
      </div>
    </div>
  );
}
