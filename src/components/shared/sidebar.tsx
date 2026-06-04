"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDomain, DOMAINS, DomainType } from "@/lib/context/domain-context";
import {
  Wrench,
  TrendingUp,
  Users,
  ShieldAlert,
  Home,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench: Wrench,
  TrendingUp: TrendingUp,
  Users: Users,
  ShieldAlert: ShieldAlert,
};

export function Sidebar() {
  const { activeDomain, initiateDomainSwitch, logs } = useDomain();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getDomainColorClass = (type: DomainType, isActive: boolean) => {
    if (!isActive) return "text-muted-foreground hover:text-foreground hover:bg-muted/40";
    
    switch (type) {
      case "maintenance":
        return "text-amber-500 bg-amber-500/10 border-amber-500/30";
      case "demand":
        return "text-sky-500 bg-sky-500/10 border-sky-500/30";
      case "churn":
        return "text-violet-500 bg-violet-500/10 border-violet-500/30";
      case "credit-risk":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    }
  };

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
        {/* Navigation Label */}
        {!isCollapsed && (
          <div className="px-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest animate-in fade-in duration-300">
            Módulos Analíticos
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {(Object.keys(DOMAINS) as DomainType[]).map((key) => {
            const domain = DOMAINS[key];
            const isActive = activeDomain === key;
            const Icon = iconMap[domain.iconName] || Database;

            return (
              <button
                key={domain.id}
                onClick={() => initiateDomainSwitch(domain.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-xl border border-transparent text-xs font-semibold transition-all duration-200 relative group overflow-hidden",
                  getDomainColorClass(domain.id, isActive)
                )}
                title={isCollapsed ? domain.name : undefined}
              >
                {/* Visual hover left indicator */}
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 transition-all duration-200",
                    isActive
                      ? getActiveDotColorClass(domain.id)
                      : "bg-transparent group-hover:bg-muted-foreground/45"
                  )}
                  style={{ borderRadius: "0 4px 4px 0" }}
                />

                <Icon className="h-4.5 w-4.5 shrink-0 ml-1" />

                {!isCollapsed && (
                  <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
                    {domain.name}
                  </span>
                )}

                {/* Pulsing dot for active status (collapsed mode) */}
                {isCollapsed && isActive && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", getActiveDotColorClass(domain.id))} />
                    <span className={cn("relative inline-flex rounded-full h-2 w-2", getActiveDotColorClass(domain.id))} />
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Separator & General Navigation */}
        <div className="border-t border-border/80 pt-4 space-y-1.5">
          {!isCollapsed && (
            <div className="px-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest animate-in fade-in duration-300 mb-2">
              Painel Geral
            </div>
          )}

          <Link href="/" passHref legacyBehavior>
            <a
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent relative",
                !activeDomain ? "text-green-500 bg-green-500/10 border-green-500/20" : ""
              )}
              title={isCollapsed ? "Painel Inicial" : undefined}
            >
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 transition-all duration-200",
                  !activeDomain
                    ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                    : "bg-transparent"
                )}
                style={{ borderRadius: "0 4px 4px 0" }}
              />
              <Home className="h-4.5 w-4.5 shrink-0 ml-1" />
              {!isCollapsed && (
                <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
                  Painel Inicial (Home)
                </span>
              )}
            </a>
          </Link>
        </div>
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
