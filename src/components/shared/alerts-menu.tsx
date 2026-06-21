"use client";

import React, { useState } from "react";
import { useDomain, DOMAINS, DomainType } from "@/lib/context/domain-context";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Check,
  ExternalLink,
  Trash2,
  Wrench,
  TrendingUp,
  Users,
  ShieldAlert,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AlertsMenu() {
  const {
    alerts,
    recognizeAlert,
    clearAlerts,
    initiateDomainSwitch
  } = useDomain();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unrecognized">("unrecognized");

  const unrecognizedAlerts = alerts.filter((a) => !a.recognized);
  const displayedAlerts = alerts; // keeping recognized alerts visible in Ativos as requested

  const getDomainIcon = (type: DomainType) => {
    switch (type) {
      case "maintenance":
        return <Wrench className="h-3.5 w-3.5" />;
      case "demand":
        return <TrendingUp className="h-3.5 w-3.5" />;
      case "churn":
        return <Users className="h-3.5 w-3.5" />;
      case "credit-risk":
        return <ShieldAlert className="h-3.5 w-3.5" />;
    }
  };

  const getDomainColorClass = (type: DomainType) => {
    switch (type) {
      case "maintenance":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "demand":
        return "text-sky-500 bg-sky-500/10 border-sky-500/20";
      case "churn":
        return "text-violet-500 bg-violet-500/10 border-violet-500/20";
      case "credit-risk":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
        title="Alertas e Notificações"
      >
        <Bell className="h-5 w-5" />
        {unrecognizedAlerts.length > 0 && (
          <span className={cn(
            "absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white shadow-sm ring-1 ring-zinc-900 transition-all",
            unrecognizedAlerts.length > 9 
              ? "bg-rose-500/70 text-zinc-100" 
              : "bg-rose-650/90 text-white"
          )}>
            {unrecognizedAlerts.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background/95 border-l border-border shadow-2xl flex flex-col transition-transform duration-300 animate-in slide-in-from-right">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-zinc-400" />
                <h2 className="text-md font-semibold text-foreground">Alertas do Sistema</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tab Filters */}
            <div className="flex border-b border-border/45 bg-zinc-950/40 shrink-0">
              <button
                onClick={() => setFilter("unrecognized")}
                className={cn(
                  "flex-1 py-3 text-[10px] font-bold uppercase border-b-2 tracking-wide transition-all",
                  filter === "unrecognized"
                    ? "border-green-500 text-green-500 bg-green-500/[0.02]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Ativos ({unrecognizedAlerts.length})
              </button>
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "flex-1 py-3 text-[10px] font-bold uppercase border-b-2 tracking-wide transition-all",
                  filter === "all"
                    ? "border-green-500 text-green-500 bg-green-500/[0.02]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Histórico ({alerts.length})
              </button>
            </div>

            {/* Alerts List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 select-none scrollbar-thin">
              {displayedAlerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <Bell className="h-10 w-10 text-muted-foreground/40 mb-2 stroke-[1.5]" />
                  <p className="text-sm">Nenhum alerta encontrado.</p>
                </div>
              ) : (
                displayedAlerts.map((alert) => {
                  const domainInfo = DOMAINS[alert.domain];
                  const isHigh = alert.criticality === "high";

                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-4.5 flex flex-col gap-3 transition-all duration-300 relative border border-border/30 border-l-4 rounded-xl shadow-sm",
                        isHigh
                          ? alert.recognized
                            ? "border-l-rose-500/30 bg-rose-500/[0.01]"
                            : "border-l-rose-500 bg-rose-500/[0.03]"
                          : alert.recognized
                          ? "border-l-amber-500/30 bg-amber-500/[0.01]"
                          : "border-l-amber-500 bg-amber-500/[0.03]",
                        alert.recognized && "opacity-50 grayscale"
                      )}
                    >
                      {/* Alert Header Info */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border",
                                getDomainColorClass(alert.domain)
                              )}
                            >
                              {getDomainIcon(alert.domain)}
                              {domainInfo.name.split(" ")[0]}
                            </span>
                            
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                                isHigh
                                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              )}
                            >
                              {isHigh ? "Crítico (Alto)" : "Atenção (Médio)"}
                            </span>
                          </div>
                          
                          <h4 className="text-xs font-bold text-foreground leading-snug mt-1 truncate">
                            {alert.item}
                          </h4>
                        </div>

                        <span className="text-[8px] font-mono text-zinc-500/40 dark:text-zinc-600/40 tracking-wider shrink-0 select-none">
                          #{alert.id.substring(4, 11)}
                        </span>
                      </div>

                      {/* Value and Metric Description */}
                      <div className="flex items-center justify-between bg-zinc-950/20 dark:bg-zinc-950/50 px-2.5 py-1.5 rounded-lg border border-border/20 text-[10px]">
                        <span className="text-zinc-500 dark:text-zinc-400/80 text-[10px] font-medium">{alert.metric}:</span>
                        <span className={cn("font-mono font-bold text-[10px]", isHigh ? "text-rose-450 dark:text-rose-400" : "text-amber-450 dark:text-amber-400")}>
                          {alert.value}
                        </span>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/20">
                        <span className="text-[9px] text-zinc-500/50 dark:text-zinc-550/50 font-mono select-none">
                          {new Date(alert.timestamp).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* 1-Click Recognize Button */}
                          {!alert.recognized ? (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                recognizeAlert(alert.id);
                              }}
                              className="h-6 text-[9px] font-black bg-zinc-900 border border-border/80 hover:bg-green-550/10 hover:border-green-500 hover:text-green-500 text-foreground transition-all duration-200 px-2 flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" />
                              Reconhecer
                            </Button>
                          ) : (
                            <span className="text-[9px] text-zinc-500/60 dark:text-zinc-450/60 font-bold flex items-center gap-0.5 select-none py-0.5 px-1.5 bg-zinc-950/20 border border-border/20 rounded">
                              <Check className="h-3 w-3 text-emerald-500/70" />
                              Reconhecido
                            </span>
                          )}

                          {/* Shortcut to domain dashboard */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              initiateDomainSwitch(alert.domain);
                              setIsOpen(false);
                            }}
                            className="h-6 w-6 p-0 text-zinc-500 hover:text-primary hover:bg-primary/5 transition"
                            title={`Ir para o painel de ${domainInfo.name}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-border bg-muted/20 backdrop-blur-md flex items-center justify-between shrink-0">
              <span className="text-xs text-muted-foreground font-mono">
                Alertas ativos: {unrecognizedAlerts.length}
              </span>
              {alerts.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAlerts}
                  className="h-7 text-xs text-rose-500 hover:text-rose-455 hover:bg-rose-500/5 font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Limpar Tudo
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
