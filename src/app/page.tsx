"use client";

import React from "react";
import { useDomain, DOMAINS, DomainType } from "@/lib/context/domain-context";
import { Header } from "@/components/shared/header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, TrendingUp, Users, ShieldAlert, ArrowRight, AlertTriangle, Clock, Activity, RefreshCcw } from "lucide-react";

export default function Home() {
  const { activeDomain, initiateDomainSwitch, dashboardStatus, simulateDashboardEvent } = useDomain();

  const getIcon = (type: DomainType) => {
    const size = "h-6 w-6";
    switch (type) {
      case "maintenance": return <Wrench className={`${size} text-amber-500`} />;
      case "demand": return <TrendingUp className={`${size} text-sky-500`} />;
      case "churn": return <Users className={`${size} text-violet-500`} />;
      case "credit-risk": return <ShieldAlert className={`${size} text-emerald-500`} />;
    }
  };

  const getBorderColor = (type: DomainType, isActive: boolean) => {
    if (isActive) {
      switch (type) {
        case "maintenance": return "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-amber-500/[0.02] dark:bg-amber-950/[0.08]";
        case "demand": return "border-sky-500 shadow-[0_0_30px_rgba(14,165,233,0.2)] bg-sky-500/[0.02] dark:bg-sky-950/[0.08]";
        case "churn": return "border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.2)] bg-violet-500/[0.02] dark:bg-violet-950/[0.08]";
        case "credit-risk": return "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-500/[0.02] dark:bg-emerald-950/[0.08]";
      }
    }
    
    switch (type) {
      case "maintenance": return "hover:border-amber-500/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.12)]";
      case "demand": return "hover:border-sky-500/50 hover:shadow-[0_0_25px_rgba(14,165,233,0.12)]";
      case "churn": return "hover:border-violet-500/50 hover:shadow-[0_0_25px_rgba(139,92,246,0.12)]";
      case "credit-risk": return "hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)]";
    }
  };

  const getGlowBg = (type: DomainType) => {
    switch (type) {
      case "maintenance": return "from-amber-500/10";
      case "demand": return "from-sky-500/10";
      case "churn": return "from-violet-500/10";
      case "credit-risk": return "from-emerald-500/10";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-green-500/20 selection:text-green-400 relative overflow-hidden">
      {/* Premium Texture and Glow Overlay */}
      <div className="absolute inset-0 grid-bg text-zinc-500/[0.05] dark:text-zinc-400/[0.03] pointer-events-none z-0" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/[0.02] dark:bg-indigo-550/[0.04] rounded-full blur-[120px] pointer-events-none z-0" />

      <Header />

      <main className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 max-w-7xl mx-auto w-full relative z-10 space-y-8">
        
        {/* Hero Section & Health Indicator (CA04) */}
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/75">
              Dashboard Consolidado
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl mt-2 leading-relaxed">
              Visão geral de todos os módulos preditivos. Acompanhe alertas, histórico e status de modelos centralizados.
            </p>
          </div>
        </div>

        {/* 4 Cards Grid (CA01) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full animate-in fade-in zoom-in-95 duration-500 delay-100">
          {(Object.keys(DOMAINS) as DomainType[]).map((key) => {
            const domain = DOMAINS[key];
            const isActive = activeDomain === key;
            const status = dashboardStatus[key];

            return (
              <Card
                key={domain.id}
                onClick={() => initiateDomainSwitch(domain.id)}
                className={`group relative overflow-hidden bg-card/60 dark:bg-card/35 border-border/80 backdrop-blur-md cursor-pointer transition-all duration-300 rounded-2xl shadow-sm hover:-translate-y-1 ${getBorderColor(
                  domain.id,
                  isActive
                )} flex flex-col h-full`}
              >
                {/* Internal Glow Effect */}
                <div
                  className={`absolute -inset-10 opacity-0 group-hover:opacity-10 transition duration-500 bg-gradient-to-tr ${getGlowBg(
                    domain.id
                  )} to-transparent blur-2xl rounded-full`}
                />

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-background border border-border/80 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      {getIcon(domain.id)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold tracking-tight text-foreground transition">
                        {domain.name}
                      </CardTitle>
                    </div>
                  </div>
                  {isActive && (
                    <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        domain.id === "maintenance" ? "bg-amber-400" : domain.id === "demand" ? "bg-sky-400" : domain.id === "churn" ? "bg-violet-400" : "bg-emerald-400"
                      }`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        domain.id === "maintenance" ? "bg-amber-500" : domain.id === "demand" ? "bg-sky-500" : domain.id === "churn" ? "bg-violet-500" : "bg-emerald-500"
                      }`} />
                    </span>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-7 relative z-10 flex-1 pt-5">
                  {/* Status Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Modelo */}
                    <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-background/50 border border-border/40">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                        <Activity className="h-3 w-3" /> Modelo
                      </span>
                      <span className={`text-xs font-bold ${status.isModelTrained ? "text-emerald-500" : "text-zinc-400"}`}>
                        {status.isModelTrained ? "Treinado" : "Ausente"}
                      </span>
                    </div>

                    {/* Alertas */}
                    <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-background/50 border border-border/40">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Alertas
                      </span>
                      <span className={`text-xs font-bold ${status.activeAlertsCount > 0 ? "text-amber-500" : "text-foreground"}`}>
                        {status.activeAlertsCount > 0 ? `${status.activeAlertsCount} Ativos` : "Nenhum"}
                      </span>
                    </div>

                    {/* Previsão */}
                    <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-background/50 border border-border/40 overflow-hidden">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Previsão
                      </span>
                      <span className="text-xs font-bold text-foreground truncate">
                        {status.lastPredictionDate ? new Date(status.lastPredictionDate).toLocaleDateString() : "--/--/----"}
                      </span>
                    </div>
                  </div>

                  {/* Histórico Resumido (CA05) */}
                  <div className="pt-4 border-t border-border/25">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
                      Últimas Atividades
                    </span>
                    <div className="space-y-3">
                      {status.recentActivities.length > 0 ? (
                        status.recentActivities.slice(0, 2).map((activity) => (
                          <div key={activity.id} className="flex items-start gap-2 text-xs">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-border flex-shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-foreground truncate font-medium">{activity.description}</span>
                              <span className="text-[9px] text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground italic">
                          Nenhuma atividade recente.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Card footer como atalho (CA03) */}
                <CardFooter className="pt-3 pb-3 relative z-10 border-t border-border/40 mt-auto bg-muted/10">
                  <div className="flex items-center text-xs font-bold group-hover:translate-x-1.5 transition-transform duration-300 w-full justify-between">
                    <span className={
                      domain.id === "maintenance"
                        ? "text-amber-500"
                        : domain.id === "demand"
                        ? "text-sky-500"
                        : domain.id === "churn"
                        ? "text-violet-500"
                        : "text-emerald-500"
                    }>
                      {isActive ? "Módulo Ativo" : "Acessar Painel Visual"}
                    </span>
                    <ArrowRight className={`h-4 w-4 ${
                      domain.id === "maintenance"
                        ? "text-amber-500"
                        : domain.id === "demand"
                        ? "text-sky-500"
                        : domain.id === "churn"
                        ? "text-violet-500"
                        : "text-emerald-500"
                    }`} />
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Footer Actions & Info */}
        <div className="flex flex-col items-center gap-4 mt-8 w-full pb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              simulateDashboardEvent();
            }}
            className="text-xs gap-2 border-primary/20 text-primary hover:bg-primary/10 shadow-sm"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Simular Evento Preditivo em Tempo Real (CA02)
          </Button>

          <div className="text-muted-foreground/40 text-[10px] text-center font-mono border-t border-border/80 pt-6 w-full max-w-md">
            SISTEMA PREDITIVO DE ANÁLISE MULTI-DOMÍNIO — SPAM<br />
            INTERFACE ADAPTATIVA COM DADOS MOCKADOS E AUDITORIA
          </div>
        </div>
      </main>
    </div>
  );
}
