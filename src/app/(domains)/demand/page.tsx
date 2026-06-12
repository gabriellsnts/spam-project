"use client";

import React, { useState } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { TrendingUp, BarChart3, Package, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSVUploader } from "@/components/shared/csv-uploader";

export default function DemandPage() {
  const { addLog, isTraining } = useDomain();
  const [seasonalActive, setSeasonalActive] = useState(false);
  
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

  const triggerSeasonalSimulation = () => {
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
    addLog("Simulação de sazonalidade de alta demanda ativada (Black Friday / Pico). Alerta de ruptura de estoque disparado.");
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

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
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

        <div className="flex items-center gap-2 relative z-10">
          {seasonalActive ? (
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Acurácia do Modelo
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">{metrics.accuracy}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Modelo: Holt-Winters &amp; Prophet</div>
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
            <div className="text-[10px] text-muted-foreground">Próximos 30 dias operacionais</div>
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

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mock Chart */}
        <Card className="lg:col-span-2 bg-card border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-muted-foreground/60" />
              Projeção de Séries Temporais (30 dias)
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Linha sólida representa a demanda real histórica; linha tracejada azul representa a previsão estatística.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[240px] flex flex-col justify-end">
            {/* SVG Mock Chart */}
            <div className="w-full h-full relative mb-2">
              <svg className="w-full h-full animate-in fade-in duration-500" viewBox="0 0 500 200" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="50" x2="500" y2="50" className="stroke-border/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="500" y2="100" className="stroke-border/40" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="500" y2="150" className="stroke-border/40" strokeWidth="1" strokeDasharray="4 4" />

                {/* Actual Demand Path */}
                <path
                  d="M0 160 Q 50 140 100 150 T 200 120 T 300 130 T 350 110"
                  fill="none"
                  className="stroke-muted-foreground"
                  strokeWidth="2.5"
                />

                {/* Predicted Demand Path */}
                <path
                  d={
                    seasonalActive
                      ? "M350 110 L 375 70 L 400 40 L 425 20 L 450 30 L 475 10 L 500 20"
                      : "M350 110 L 375 115 L 400 100 L 425 105 L 450 95 L 475 90 L 500 95"
                  }
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="2.5"
                  strokeDasharray="4"
                  className="transition-all duration-1000"
                />

                {/* Shading below prediction */}
                <path
                  d={
                    seasonalActive
                      ? "M350 110 L 375 70 L 400 40 L 425 20 L 450 30 L 475 10 L 500 20 L 500 200 L 350 200 Z"
                      : "M350 110 L 375 115 L 400 100 L 425 105 L 450 95 L 475 90 L 500 95 L 500 200 L 350 200 Z"
                  }
                  fill="url(#gradient-sky)"
                  className="opacity-15 transition-all duration-1000"
                />

                <defs>
                  <linearGradient id="gradient-sky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-2">
              <span>Semana 01</span>
              <span>Semana 02</span>
              <span>Semana 03 (Histórico / Previsão)</span>
              <span>Semana 04</span>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Stock alerts */}
        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Package className="h-4 w-4 text-muted-foreground/60" />
              Cobertura de Estoque
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Análise de estoque de segurança versus demanda mensal média projetada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {products.map((p) => (
              <div key={p.id} className="p-2.5 rounded-lg bg-muted/40 border border-border text-xs flex flex-col gap-1">
                <div className="flex justify-between font-bold text-foreground/80">
                  <span>{p.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">Cód: {p.id}</span>
                </div>
                
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Qtd. em Estoque: <strong className="text-foreground">{p.stock} un.</strong></span>
                  <span>Demanda Prev: <strong className="text-foreground">{p.monthlyDemand} un/mês</strong></span>
                </div>

                <div className="mt-1.5 flex justify-end">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${
                    p.risk === "high"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse"
                      : p.risk === "medium"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  }`}>
                    {p.risk === "high" ? "Alto Risco Ruptura" : p.risk === "medium" ? "Risco Moderado" : "Seguro"}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Ingestão de Dados Históricos */}
      <CSVUploader />
    </div>
  );
}
