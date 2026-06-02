"use client";

import React from "react";
import { useDomain, DOMAINS, DomainType } from "@/lib/context/domain-context";
import { Header } from "@/components/shared/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, TrendingUp, Users, ShieldAlert, ArrowRight } from "lucide-react";

export default function Home() {
  const { activeDomain, initiateDomainSwitch } = useDomain();

  const getIcon = (type: DomainType) => {
    const size = "h-7 w-7";
    switch (type) {
      case "maintenance":
        return <Wrench className={`${size} text-amber-500`} />;
      case "demand":
        return <TrendingUp className={`${size} text-sky-500`} />;
      case "churn":
        return <Users className={`${size} text-violet-500`} />;
      case "credit-risk":
        return <ShieldAlert className={`${size} text-emerald-500`} />;
    }
  };

  const getBorderColor = (type: DomainType, isActive: boolean) => {
    if (isActive) {
      switch (type) {
        case "maintenance":
          return "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-amber-500/[0.02] dark:bg-amber-950/[0.08]";
        case "demand":
          return "border-sky-500 shadow-[0_0_30px_rgba(14,165,233,0.2)] bg-sky-500/[0.02] dark:bg-sky-950/[0.08]";
        case "churn":
          return "border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.2)] bg-violet-500/[0.02] dark:bg-violet-950/[0.08]";
        case "credit-risk":
          return "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-500/[0.02] dark:bg-emerald-950/[0.08]";
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

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-16 max-w-6xl mx-auto w-full relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mb-16 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-border bg-card/80 text-muted-foreground text-xs font-semibold mb-2 shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Módulos Analíticos Avançados
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/75">
            Sistema Preditivo SPAM
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Selecione um domínio analítico para monitorar fluxos industriais, prever sazonalidades de demanda, analisar churn ou escorar limites de crédito.
          </p>
        </div>

        {/* 4 Cards Grid (CA01) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in zoom-in-95 duration-500 delay-100">
          {(Object.keys(DOMAINS) as DomainType[]).map((key) => {
            const domain = DOMAINS[key];
            const isActive = activeDomain === key;

            return (
              <Card
                key={domain.id}
                onClick={() => initiateDomainSwitch(domain.id)}
                className={`group relative overflow-hidden bg-card/60 dark:bg-card/35 border-border/80 backdrop-blur-md cursor-pointer transition-all duration-300 rounded-2xl shadow-sm hover:-translate-y-1 ${getBorderColor(
                  domain.id,
                  isActive
                )}`}
              >
                {/* Internal Glow Effect */}
                <div
                  className={`absolute -inset-10 opacity-0 group-hover:opacity-10 transition duration-500 bg-gradient-to-tr ${getGlowBg(
                    domain.id
                  )} to-transparent blur-2xl rounded-full`}
                />

                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 relative z-10">
                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-xl bg-background border border-border/80 w-fit mb-2 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      {getIcon(domain.id)}
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight text-foreground transition">
                      {domain.name}
                    </CardTitle>
                  </div>
                  {isActive && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        domain.id === "maintenance" ? "bg-amber-400" : domain.id === "demand" ? "bg-sky-400" : domain.id === "churn" ? "bg-violet-400" : "bg-emerald-400"
                      }`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        domain.id === "maintenance" ? "bg-amber-500" : domain.id === "demand" ? "bg-sky-500" : domain.id === "churn" ? "bg-violet-500" : "bg-emerald-500"
                      }`} />
                    </span>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4 relative z-10">
                  <CardDescription className="text-muted-foreground text-xs md:text-sm leading-relaxed min-h-[48px]">
                    {domain.description}
                  </CardDescription>

                  <div className="flex items-center text-xs font-bold pt-2 group-hover:translate-x-1.5 transition-transform duration-300">
                    <span className={
                      domain.id === "maintenance"
                        ? "text-amber-500"
                        : domain.id === "demand"
                        ? "text-sky-500"
                        : domain.id === "churn"
                        ? "text-violet-500"
                        : "text-emerald-500"
                    }>
                      {isActive ? "Módulo Ativo" : "Inicializar Análise"}
                    </span>
                    <ArrowRight className={`ml-1 h-4 w-4 ${
                      domain.id === "maintenance"
                        ? "text-amber-500"
                        : domain.id === "demand"
                        ? "text-sky-500"
                        : domain.id === "churn"
                        ? "text-violet-500"
                        : "text-emerald-500"
                    }`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-muted-foreground/40 text-[10px] text-center mt-20 font-mono border-t border-border/80 pt-6 w-full max-w-md">
          SISTEMA PREDITIVO DE ANÁLISE MULTI-DOMÍNIO — SPAM<br />
          INTERFACE ADAPTATIVA COM DADOS MOCKADOS E AUDITORIA
        </div>
      </main>
    </div>
  );
}
