"use client";

import React, { useState, useMemo } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { TrendingUp, BarChart3, Package, Calendar, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSVUploader, ResidualsPlotView } from "@/components/shared/csv-uploader";
import { FeatureImportanceChart } from "@/components/shared/feature-importance-chart";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { AlertThresholdSettings } from "@/components/shared/alert-threshold-settings";
import { ComparisonView } from "@/components/shared/comparison-view";
import { SchedulingCard } from "@/components/shared/scheduling-card";

export default function DemandPage() {
  const { addLog, isTraining, trainedModels, alertThresholds, addAlert, currentView, t } = useDomain();
  const activeModel = trainedModels["demand"];
  const isModelObsolete = activeModel ? (Date.now() - activeModel.timestamp > 30 * 24 * 60 * 60 * 1000) : false;
  const [seasonalActive, setSeasonalActive] = useState(false);
  const [horizon, setHorizon] = useState<7 | 30 | 90>(30);

  const threshold = alertThresholds["demand"] !== undefined ? alertThresholds["demand"] : 15;
  
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

  const productsWithRisk = useMemo(() => {
    return products.map((p) => {
      const dailyDemand = p.monthlyDemand / 30;
      const coverage = dailyDemand > 0 ? p.stock / dailyDemand : 999;
      
      let risk: "high" | "medium" | "none" = "none";
      if (coverage <= threshold) {
        risk = "high";
      } else if (coverage <= threshold * 1.5) {
        risk = "medium";
      }
      
      return { ...p, coverage, risk };
    });
  }, [products, threshold]);

  const activeAlerts = useMemo(() => {
    return productsWithRisk
      .filter((p) => p.risk === "high")
      .map((p) => ({
        id: p.id,
        name: p.name,
        value: Math.round(p.coverage),
        threshold: threshold,
        details: `Cobertura de estoque de apenas ${Math.round(p.coverage)} dias, abaixo do limiar de segurança de ${threshold} dias.`,
      }));
  }, [productsWithRisk, threshold]);

  const calculateCriticalCount = (t: number) => {
    return products.filter((p) => {
      const dailyDemand = p.monthlyDemand / 30;
      const coverage = dailyDemand > 0 ? p.stock / dailyDemand : 999;
      return coverage <= t;
    }).length;
  };

  const generateChartData = (days: number, isSeasonal: boolean) => {
    const data: { date: string; historico: number | null; previsao: number | null; isFuture: boolean }[] = [];
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
    addAlert({
      domain: "demand",
      item: "Bobina de Aço Galvanizado (P01)",
      value: "4 dias de cobertura",
      metric: "Cobertura de Estoque",
      criticality: "high"
    });
    addLog("Simulação de Sazonalidade de alta demanda ativada. Alerta de ruptura de estoque disparado.");
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
            {t("demand_module_title")}
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight flex flex-wrap items-center gap-2">
            {t("demand_subtitle")}
            {activeModel && (
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border font-sans ${
                isModelObsolete 
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                  : "bg-emerald-500/10 text-emerald-550 dark:text-emerald-400 border-emerald-500/20 animate-pulse"
              }`}>
                <CheckCircle2 className="h-3 w-3" />
                {isModelObsolete ? t("obsolete_model") || "Modelo Obsoleto" : t("ready_to_use") || "Modelo Pronto para Uso"}
              </span>
            )}
          </h2>
          <p className="text-muted-foreground text-xs">
            {t("demand_desc_long")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 relative z-10">
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
            {t("export_csv") || "Exportar Relatório (PDF)"}
          </Button>
          {!activeModel ? (
            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs font-semibold font-sans">
              <AlertCircle className="h-4 w-4" />
              {t("no_active_model")}
            </div>
          ) : seasonalActive ? (
            <Button
              onClick={resetSimulation}
              disabled={isTraining}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              {t("reset")}
            </Button>
          ) : (
            <Button
              onClick={triggerSeasonalSimulation}
              disabled={isTraining}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold gap-1.5"
            >
              <Calendar className="h-4 w-4" />
              {t("simulate_seasonal_peak")}
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
                  {t("demand_no_model_desc")}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {activeModel ? "R² (Score do Modelo)" : t("accuracy")}
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
                  {t("growth_projected")}
                </CardDescription>
                <CardTitle className={`text-2xl font-black ${seasonalActive ? "text-sky-500" : "text-foreground"}`}>
                  {metrics.projectedGrowth}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] text-muted-foreground">{t("growth_desc")}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t("critical_items")}
                </CardDescription>
                <CardTitle className={`text-2xl font-black ${activeAlerts.length > 0 ? "text-rose-500 animate-pulse" : "text-amber-500"}`}>
                  {activeAlerts.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] text-muted-foreground">{t("items_below_limit")}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t("total_sales")}
                </CardDescription>
                <CardTitle className="text-2xl font-black text-foreground">{metrics.totalSales}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] text-muted-foreground">{t("total_exposure_desc")}</div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sm text-foreground flex gap-3">
            <Sparkles className="h-5 w-5 text-sky-500 shrink-0" />
            <div>
              <strong className="text-sky-500 block mb-1">{t("auto_insight")}</strong>
              {seasonalActive 
                ? t("insight_critical_demand")
                : t("insight_stable_demand")}
            </div>
          </div>

          <AlertThresholdSettings
            domain="demand"
            title={t("limit_lifetime_rul") || "Limiar de Segurança de Estoque (Cobertura)"}
            min={0}
            max={60}
            unit={t("days")}
            totalCount={products.length}
            calculateCriticalCount={calculateCriticalCount}
            activeAlerts={activeAlerts}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card border-border transition-colors duration-300">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-muted-foreground/60" />
                    {t("demand_forecast_chart")}
                  </CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground">
                    {t("demand_chart_desc")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{t("horizon")}</span>
                  <select
                    value={horizon}
                    onChange={(e) => setHorizon(Number(e.target.value) as 7 | 30 | 90)}
                    className="bg-background border border-border text-foreground rounded-lg text-xs px-2 py-1 focus:ring-1 focus:ring-sky-500 focus:outline-none cursor-pointer font-sans"
                  >
                    <option value={7}>{t("days_7")}</option>
                    <option value={30}>{t("days_30")}</option>
                    <option value={90}>{t("days_90")}</option>
                  </select>
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
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10, fill: "hsl(var(--foreground))", opacity: 0.7 }} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          tick={{ fontSize: 10, fill: "hsl(var(--foreground))", opacity: 0.7 }} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                          labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '4px' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any, name: any) => [
                            `${Number(value).toFixed(0)} un`, 
                            name === 'historico' ? 'Histórico Real' : 'Previsão Estimada'
                          ]}
                        />
                        <ReferenceLine x={chartData[15].date} stroke="hsl(var(--border))" strokeOpacity={0.7} strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Hoje', fill: 'hsl(var(--foreground))', fontSize: 10, opacity: 0.6 }} />
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
                  {t("products_monitored")}
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  {t("stock_leadtime_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {productsWithRisk.map((p) => (
                  <div key={p.id} className="p-2 rounded-lg bg-muted/40 border border-border text-xs flex flex-col gap-1">
                    <div className="flex justify-between font-bold text-foreground/80">
                      <span className="truncate pr-2">{p.name}</span>
                      <span className="text-[9px] text-muted-foreground font-mono shrink-0">{p.id}</span>
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                      <span>{t("stock_short")}: <strong className="text-foreground">{p.stock} un.</strong></span>
                      <span>{t("stock_coverage")}: <strong className="text-foreground">{Math.round(p.coverage)} {t("days")}</strong></span>
                    </div>

                    <div className="mt-1 flex justify-end">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${
                        p.risk === "high"
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse"
                          : p.risk === "medium"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }`}>
                        {p.risk === "high" ? t("high_risk") : p.risk === "medium" ? t("medium_risk") : t("no_risk")}
                      </span>
                    </div>
                  </div>
                ))}
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
                <Calendar className="h-4 w-4 text-sky-500" />
                {t("simulation_sandbox")}
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                {t("adjust_variables_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl space-y-3">
                <div className="text-xs font-bold text-foreground">{t("quick_anomaly_preset")}</div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {t("simulate_batch_desc")}
                </p>
                <div className="flex gap-2">
                  {!activeModel ? (
                    <div className="text-xs text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/25 p-2 rounded-lg w-full text-center">
                      {t("no_active_model_sim_desc")}
                    </div>
                  ) : seasonalActive ? (
                    <Button
                      onClick={resetSimulation}
                      disabled={isTraining}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 h-9"
                    >
                      {t("reset")}
                    </Button>
                  ) : (
                    <Button
                      onClick={triggerSeasonalSimulation}
                      disabled={isTraining}
                      className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-1.5 h-9"
                    >
                      {t("simulate_seasonal_peak")}
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-muted/40 border border-border/80 rounded-xl text-xs space-y-2">
                <div className="font-bold text-foreground">{t("active_algorithm_metrics")}</div>
                <div className="text-muted-foreground text-[10px]">
                  Status: <strong className={seasonalActive ? "text-sky-500" : "text-emerald-500"}>{seasonalActive ? "SIMULATION ACTIVE" : "NORMAL"}</strong>
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
                    <BarChart3 className="h-4 w-4 text-sky-500" />
                    {t("residuals_diagnostic")}
                  </CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground">
                    Gráfico de resíduos interativo para verificação da qualidade das predições.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResidualsPlotView model={activeModel} />
                </CardContent>
              </Card>

              <FeatureImportanceChart data={mockFeatures} title={t("predictor_importance_demand") || "Preditores de Demanda"} />
            </>
          )}

          <CSVUploader />
          <SchedulingCard domain="demand" />
        </div>
      )}

      {currentView === "comparison" && (
        <ComparisonView domain="demand" />
      )}
    </div>
  );
}
