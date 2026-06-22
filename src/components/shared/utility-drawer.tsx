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
  X,
  ShieldCheck,
  Clock,
  User as UserIcon,
  Moon,
  Sun,
  LogOut,
  Menu,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export function UtilityDrawer() {
  const {
    activeUtilityPanel,
    setActiveUtilityPanel,
    alerts,
    recognizeAlert,
    clearAlerts,
    initiateDomainSwitch,
    logs,
    clearLogs,
    currentUser,
    logout,
    theme,
    toggleTheme,
    domainFilter,
    setDomainFilter,
    periodFilter,
    setPeriodFilter
  } = useDomain();

  const [filter, setFilter] = useState<"all" | "unrecognized">("unrecognized");

  if (!activeUtilityPanel) return null;

  const unrecognizedAlerts = alerts.filter((a) => !a.recognized);
  const displayedAlerts = React.useMemo(() => {
    if (filter === "unrecognized") {
      return unrecognizedAlerts;
    }
    const sorted = [...alerts].sort((a, b) => b.timestamp - a.timestamp);
    return sorted.filter((alert) => {
      if (domainFilter !== "all" && alert.domain !== domainFilter) {
        return false;
      }
      if (periodFilter !== "all") {
        const now = Date.now();
        const limit =
          periodFilter === "24h"
            ? 24 * 60 * 60 * 1000
            : periodFilter === "7d"
            ? 7 * 24 * 60 * 60 * 1000
            : 30 * 24 * 60 * 60 * 1000;
        if (alert.timestamp < now - limit) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, filter, domainFilter, periodFilter, unrecognizedAlerts]);

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

  const handleClose = () => setActiveUtilityPanel(null);

  const isAlerts = activeUtilityPanel === "alerts";
  const isLogs = activeUtilityPanel === "logs";
  const isMenu = activeUtilityPanel === "menu";

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-zinc-950 border-l border-border/30 shadow-2xl flex flex-col p-6 transition-transform duration-300 animate-in slide-in-from-right">
        {/* Header */}
        <div className="pb-5 border-b border-border/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {!isMenu && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveUtilityPanel("menu")}
                className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-zinc-900 transition px-2 py-1 flex items-center gap-1 mr-1.5"
              >
                ← Voltar
              </Button>
            )}
            {isMenu ? (
              <>
                <Menu className="h-5 w-5 text-zinc-400" />
                <h2 className="text-md font-semibold text-foreground">Menu Principal</h2>
              </>
            ) : isAlerts ? (
              <>
                <Bell className="h-5 w-5 text-zinc-400" />
                <h2 className="text-md font-semibold text-foreground">Alertas do Sistema</h2>
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <h2 className="text-md font-semibold text-foreground">Log de Auditoria Interna</h2>
              </>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-zinc-900 transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Dynamic Content */}
        {isMenu && (
          <div className="flex flex-col h-full overflow-hidden pt-4">
            {/* Topo: Perfil do Administrador */}
            <div className="flex items-center gap-4 px-2 pb-6 border-b border-border/10 shrink-0">
              <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                <UserIcon className="h-6 w-6 text-zinc-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-foreground truncate">
                  {currentUser?.fullName || "Administrador"}
                </span>
                <span className="text-xs text-muted-foreground truncate mt-0.5">
                  {currentUser?.accessProfile || "Super Admin"}
                </span>
                <span className="text-[10px] text-zinc-500/80 truncate mt-0.5">
                  {currentUser?.department || "TI & Infraestrutura"}
                </span>
              </div>
            </div>

            {/* Corpo Central: Opções de Navegação */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6 select-none scrollbar-thin px-2">
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 px-2">
                  Sistema
                </h3>
                <button
                  onClick={() => setActiveUtilityPanel("alerts")}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
                      <Bell className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Alertas do Sistema</span>
                  </div>
                  {unrecognizedAlerts.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-bold">
                      {unrecognizedAlerts.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveUtilityPanel("logs")}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Log de Auditoria</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>

              <div className="h-px bg-border/10 w-full" />

              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 px-2">
                  Módulos de Domínio
                </h3>
                {(Object.keys(DOMAINS) as DomainType[]).map((domainType) => {
                  const domain = DOMAINS[domainType];
                  return (
                    <button
                      key={domainType}
                      onClick={() => {
                        initiateDomainSwitch(domainType);
                        handleClose();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
                          {getDomainIcon(domainType)}
                        </div>
                        <span className="text-sm font-medium">{domain.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rodapé: Alternar Tema e Logout */}
            <div className="pt-4 border-t border-border/10 shrink-0 space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="p-1.5 rounded-md bg-zinc-900 transition-colors">
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </div>
                <span className="text-sm font-medium">
                  Tema {theme === "dark" ? "Claro" : "Escuro"}
                </span>
              </button>
              
              <button
                onClick={() => {
                  handleClose();
                  logout();
                }}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors group"
              >
                <div className="p-1.5 rounded-md bg-zinc-900 group-hover:bg-rose-500/20 transition-colors">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        )}

        {isAlerts && (
          <>
            {/* Tab Filters */}
            <div className="flex border-b border-border/10 bg-zinc-950/40 shrink-0 mt-3">
              <button
                onClick={() => setFilter("unrecognized")}
                className={cn(
                  "flex-1 py-2 text-[10px] font-bold uppercase border-b-2 tracking-wide transition-all",
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
                  "flex-1 py-2 text-[10px] font-bold uppercase border-b-2 tracking-wide transition-all",
                  filter === "all"
                    ? "border-green-500 text-green-500 bg-green-500/[0.02]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Histórico ({alerts.length})
              </button>
            </div>

            {filter === "all" && (
              <div className="flex items-center gap-2 p-3 bg-zinc-900/30 border border-border/10 rounded-xl mt-3 mx-1 shrink-0">
                {/* Filtro de Domínio */}
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-500">
                    Domínio
                  </label>
                  <select
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value as DomainType | "all")}
                    className="bg-zinc-950 border border-border/30 text-[11px] text-foreground px-2 py-1 rounded-md outline-none focus:border-green-550 transition h-8 cursor-pointer"
                  >
                    <option value="all">Todos</option>
                    <option value="maintenance">Manutenção</option>
                    <option value="demand">Demanda</option>
                    <option value="churn">Retenção</option>
                    <option value="credit-risk">Crédito</option>
                  </select>
                </div>

                {/* Filtro de Período */}
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-500">
                    Período
                  </label>
                  <select
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value as "all" | "24h" | "7d" | "30d")}
                    className="bg-zinc-950 border border-border/30 text-[11px] text-foreground px-2 py-1 rounded-md outline-none focus:border-green-550 transition h-8 cursor-pointer"
                  >
                    <option value="all">Todos</option>
                    <option value="24h">Últimas 24h</option>
                    <option value="7d">Últimos 7 dias</option>
                    <option value="30d">Últimos 30 dias</option>
                  </select>
                </div>
              </div>
            )}

            {/* Alerts List */}
            <div className="flex-1 overflow-y-auto py-5 space-y-4 select-none scrollbar-thin">
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

                            {/* Status Badge */}
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                                alert.recognized
                                  ? "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                                  : "bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse"
                              )}
                            >
                              {alert.recognized ? "Reconhecido" : "Pendente"}
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
                        <span className={cn("font-mono font-bold text-[10px]", isHigh ? "text-rose-400" : "text-amber-400")}>
                          {alert.value}
                        </span>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/20">
                        <span className="text-[9px] text-zinc-500/55 dark:text-zinc-550/55 font-mono select-none flex items-center gap-1.5">
                          <span>
                            {new Date(alert.timestamp).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="opacity-40">•</span>
                          <span>
                            {new Date(alert.timestamp).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
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
                              handleClose();
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
            <div className="pt-4 border-t border-border/20 bg-transparent flex items-center justify-between shrink-0">
              <span className="text-xs text-muted-foreground font-mono">
                {filter === "all" ? `Alertas exibidos: ${displayedAlerts.length}` : `Alertas ativos: ${unrecognizedAlerts.length}`}
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
          </>
        )}

        {isLogs && (
          <>
            {/* Logs Content */}
            <div className="flex-1 overflow-y-auto py-5 space-y-4 select-none scrollbar-thin">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <ShieldCheck className="h-10 w-10 text-muted-foreground/40 mb-2 stroke-[1.5]" />
                  <p className="text-sm">Nenhum evento registrado no log.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Selecione ou alterne domínios para gerar logs.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-lg bg-card/60 border border-border/40 hover:border-muted-foreground/30 transition flex flex-col gap-2 relative overflow-hidden"
                  >
                    {/* ID Tag */}
                    <div className="absolute top-2 right-2 text-[9px] font-mono text-muted-foreground/80 bg-background px-1.5 py-0.5 rounded border border-border/40">
                      ID: {log.id}
                    </div>

                    {/* Action/Description */}
                    <div className="text-xs text-foreground font-medium pr-16 line-clamp-2">
                      {log.action}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] text-muted-foreground">
                      {/* User Profile */}
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3 text-muted-foreground/60" />
                        <span className="font-semibold text-foreground/80">{log.profile}</span>
                      </div>

                      {/* Millisecond Timestamp (CA05 requirement) */}
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3 text-muted-foreground/60" />
                        <span>{log.timestamp} ms</span>
                      </div>
                    </div>

                    {/* Human readable date */}
                    <div className="text-[9px] text-muted-foreground/50 italic">
                      {new Date(log.timestamp).toLocaleString("pt-BR")}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-border/20 bg-transparent flex items-center justify-between shrink-0">
              <span className="text-xs text-muted-foreground font-mono">
                Registros ativos: {logs.length}
              </span>
              {logs.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearLogs}
                  className="h-7 text-xs text-rose-500 hover:text-rose-455 hover:bg-rose-500/5 font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Limpar Logs
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
