"use client";

import React, { useState } from "react";
import { useDomain, DomainType } from "@/lib/context/domain-context";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Sliders,
  Settings,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { activeDomain, logs, currentView, setCurrentView } = useDomain();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getActiveDotColorClass = (type: DomainType) => {
    switch (type) {
      case "maintenance":
        return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
      case "demand":
        return "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]";
      case "churn":
        return "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]";
      case "credit-risk":
        return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
      default:
        return "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
    }
  };

  const getViewColorClass = (viewName: string) => {
    const isViewActive = currentView === viewName;
    if (!isViewActive) return "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent";

    switch (activeDomain) {
      case "maintenance":
        return "text-amber-500 bg-amber-500/10 border-amber-500/30";
      case "demand":
        return "text-sky-500 bg-sky-500/10 border-sky-500/30";
      case "churn":
        return "text-violet-500 bg-violet-500/10 border-violet-500/30";
      case "credit-risk":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
      default:
        return "text-green-500 bg-green-500/10 border-green-500/30";
    }
  };

  const getActiveDotClass = (viewName: string) => {
    const isViewActive = currentView === viewName;
    if (!isViewActive) return "bg-transparent";

    switch (activeDomain) {
      case "maintenance":
        return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
      case "demand":
        return "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]";
      case "churn":
        return "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]";
      case "credit-risk":
        return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
      default:
        return "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
    }
  };

  const renderActiveDomainMetric = () => {
    if (!activeDomain) return null;

    switch (activeDomain) {
      case "maintenance":
        return (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Sensores</span>
              <span className="text-emerald-500 font-semibold">Ativos (IoT)</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>OEE Geral</span>
              <span className="text-foreground font-semibold">84.0%</span>
            </div>
          </div>
        );
      case "demand":
        return (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Modelo</span>
              <span className="text-sky-500 font-semibold font-mono text-[9px]">Prophet-ML</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Acurácia</span>
              <span className="text-foreground font-semibold">93.8%</span>
            </div>
          </div>
        );
      case "churn":
        return (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Monitorando</span>
              <span className="text-violet-500 font-semibold">Contas Ent.</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>NPS Geral</span>
              <span className="text-foreground font-semibold">78 pt</span>
            </div>
          </div>
        );
      case "credit-risk":
        return (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>VaR Risco</span>
              <span className="text-emerald-500 font-semibold">R$ 1.2M</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Default (PD)</span>
              <span className="text-foreground font-semibold">1.80%</span>
            </div>
          </div>
        );
    }
  };

  const viewItems = [
    {
      id: "monitoring",
      name: "Painel de Monitoramento",
      desc: "Métricas & KPIs em tempo real",
      icon: BarChart3
    },
    {
      id: "simulation",
      name: "Sandbox de Simulação",
      desc: activeDomain === "maintenance"
        ? "Estressar parâmetros IoT"
        : activeDomain === "demand"
        ? "Simular pico de demanda"
        : activeDomain === "churn"
        ? "Simular cancelamento"
        : "Estressar risco de crédito",
      icon: Sliders
    },
    {
      id: "calibration",
      name: "Calibração do Modelo",
      desc: "Treinamento & base CSV",
      icon: Settings
    },
    {
      id: "comparison",
      name: "Comparação Real vs Previsto",
      desc: "Acurácia & dados reais (RF32)",
      icon: Sparkles
    }
  ];

  return (
    <div
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] border-r border-border bg-card/30 backdrop-blur-md flex flex-col justify-between transition-all duration-300 select-none z-20 shrink-0",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-30 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center cursor-pointer shadow-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
        title={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Nav Content */}
      <div className="p-3 space-y-6 flex-1 flex flex-col overflow-y-auto">
        {!isCollapsed && activeDomain && (
          <div className="px-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest animate-in fade-in duration-300">
            Ferramentas Internas
          </div>
        )}

        <nav className="space-y-2">
          {activeDomain ? (
            viewItems.map((item) => {
              const isViewActive = currentView === item.id;
              const Icon = item.icon;

              if (isCollapsed) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={cn(
                      "w-full flex items-center justify-center p-2.5 rounded-xl border transition-all duration-200 relative group",
                      getViewColorClass(item.id)
                    )}
                    title={item.name}
                  >
                    {isViewActive && (
                      <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", getActiveDotClass(item.id))} />
                        <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", getActiveDotClass(item.id))} />
                      </span>
                    )}
                    <Icon className="h-5 w-5 shrink-0" />
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group",
                    getViewColorClass(item.id)
                  )}
                >
                  <div className={cn(
                    "absolute left-0 top-3 bottom-3 w-1 rounded-r-md transition-all duration-200",
                    getActiveDotClass(item.id)
                  )} />

                  <Icon className="h-5 w-5 shrink-0 mt-0.5" />

                  <div className="space-y-0.5">
                    <div className="text-xs font-bold leading-none">{item.name}</div>
                    <div className="text-[9px] text-muted-foreground font-normal leading-none mt-1 group-hover:text-foreground/70 transition-colors">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            !isCollapsed && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                Nenhum módulo selecionado. Use o menu hambúrguer para abrir um módulo analítico.
              </div>
            )
          )}
        </nav>
      </div>

      {/* Footer Area: Active Module Summary Info */}
      {!isCollapsed && activeDomain && (
        <div className="p-4 m-3 rounded-2xl bg-card border border-border shadow-inner text-xs space-y-2.5 animate-in fade-in duration-300">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", getActiveDotColorClass(activeDomain))} />
            <span>Módulo Ativo</span>
          </div>
          {renderActiveDomainMetric()}
        </div>
      )}

      {/* Mini signature / audit count */}
      <div className={cn("p-4 border-t border-border/80 flex items-center text-muted-foreground/50 text-[10px] font-mono", isCollapsed ? "flex-col gap-1 justify-center" : "justify-between")}>
        <ShieldCheck className="h-4 w-4 shrink-0" />
        {!isCollapsed && (
          <span className="animate-in fade-in duration-300">
            Eventos Logs: {logs.length}
          </span>
        )}
      </div>
    </div>
  );
}
