"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDomain, DOMAINS, DomainType, AuditLog } from "@/lib/context/domain-context";
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
  User as UserIcon,
  Moon,
  Sun,
  LogOut,
  Menu,
  ChevronRight,
  Download,
  History,
  Activity
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
    setPeriodFilter,
    predictionHistory,
    clearPredictionHistory
  } = useDomain();

  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unrecognized">("unrecognized");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [logUserFilter, setLogUserFilter] = useState<string>("all");
  const [logStartDate, setLogStartDate] = useState<string>("");
  const [logEndDate, setLogEndDate] = useState<string>("");
  const [logActionType, setLogActionType] = useState<string>("all");

  const criticalCount = React.useMemo(() => {
    return logs.filter((log) => 
      /falha|erro|error|crítico|critical|bloquead|suspen/i.test(log.action)
    ).length;
  }, [logs]);

  const activeUsersCount = React.useMemo(() => {
    return new Set(logs.map((log) => log.username).filter(Boolean)).size;
  }, [logs]);

  const uniqueLogUsers = React.useMemo(() => {
    return Array.from(new Set(logs.map(log => log.username).filter(Boolean)));
  }, [logs]);

  const displayedLogs = React.useMemo(() => {
    let filtered = [...logs];

    // Filter by User
    if (logUserFilter !== "all") {
      filtered = filtered.filter((log) => log.username === logUserFilter);
    }

    // Filter by Date range
    if (logStartDate) {
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timestamp);
        const y = logDate.getFullYear();
        const m = String(logDate.getMonth() + 1).padStart(2, "0");
        const d = String(logDate.getDate()).padStart(2, "0");
        const logLocalDateStr = `${y}-${m}-${d}`;
        return logLocalDateStr >= logStartDate;
      });
    }
    if (logEndDate) {
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timestamp);
        const y = logDate.getFullYear();
        const m = String(logDate.getMonth() + 1).padStart(2, "0");
        const d = String(logDate.getDate()).padStart(2, "0");
        const logLocalDateStr = `${y}-${m}-${d}`;
        return logLocalDateStr <= logEndDate;
      });
    }

    // Filter by Action Type
    if (logActionType !== "all") {
      filtered = filtered.filter((log) => {
        const action = log.action || "";
        if (logActionType === "auth") {
          return /login|sessão|conta|senha/i.test(action);
        }
        if (logActionType === "models") {
          return /training|treinamento|model/i.test(action);
        }
        if (logActionType === "alerts") {
          return /alert|alerta|limiar/i.test(action);
        }
        if (logActionType === "others") {
          return !/login|sessão|conta|senha|training|treinamento|model|alert|alerta|limiar/i.test(action);
        }
        return true;
      });
    }

    // Sort chronologically (most recent first)
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, logUserFilter, logStartDate, logEndDate, logActionType]);

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

  const displayedPredictions = React.useMemo(() => {
    const sorted = [...predictionHistory].sort((a, b) => b.timestamp - a.timestamp);
    return sorted.filter((pred) => {
      if (domainFilter !== "all" && pred.domain !== domainFilter) {
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
        if (pred.timestamp < now - limit) {
          return false;
        }
      }
      return true;
    });
  }, [predictionHistory, domainFilter, periodFilter]);

  if (!activeUtilityPanel) return null;

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
  const isPredictions = activeUtilityPanel === "predictions";
  const isMenu = activeUtilityPanel === "menu";

  const exportToCSV = () => {
    const headers = ["ID", "Dominio", "Item", "Metrica", "Valor", "Criticidade", "Data", "Horario", "Status"];
    const rows = displayedAlerts.map(alert => {
      const dateObj = new Date(alert.timestamp);
      const dateStr = dateObj.toLocaleDateString("pt-BR");
      const timeStr = dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const domainName = DOMAINS[alert.domain]?.name || alert.domain;
      const statusStr = alert.recognized ? "Reconhecido" : "Pendente";
      const criticalityStr = alert.criticality === "high" ? "Alto" : "Médio";
      
      const escape = (val: string | number) => {
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        escape(alert.id),
        escape(domainName),
        escape(alert.item),
        escape(alert.metric),
        escape(alert.value),
        escape(criticalityStr),
        escape(dateStr),
        escape(timeStr),
        escape(statusStr)
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `historico_alertas_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportLogsToCSV = () => {
    const headers = ["Data", "Horário", "Nome do Usuário", "Perfil de Acesso", "Descrição da Ação"];
    const rows = displayedLogs.map(log => {
      const dateObj = new Date(log.timestamp);
      const dateStr = dateObj.toLocaleDateString("pt-BR");
      const timeStr = dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      
      const escape = (val: string | number) => {
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        escape(dateStr),
        escape(timeStr),
        escape(log.username),
        escape(log.accessProfile),
        escape(log.action)
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `log_auditoria_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPredictionsToCSV = () => {
    const headers = ["Data", "Horário", "Domínio", "Item Analisado", "Resultado da Previsão", "ID do Registro", "Probabilidade/Detalhe"];
    const rows = displayedPredictions.map(pred => {
      const dateObj = new Date(pred.timestamp);
      const dateStr = dateObj.toLocaleDateString("pt-BR");
      const timeStr = dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const domainName = DOMAINS[pred.domain]?.name || pred.domain;
      
      const escape = (val: string | number) => {
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const detailInfo = pred.details?.probabilidadeRetorno 
        ? `${pred.details.probabilidadeRetorno}%` 
        : pred.details?.probabilidadeFalha 
          ? `${pred.details.probabilidadeFalha}%` 
          : "";

      return [
        escape(dateStr),
        escape(timeStr),
        escape(domainName),
        escape(pred.item),
        escape(pred.predictionResult),
        escape(pred.id),
        escape(detailInfo)
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `historico_previsoes_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateConsolidatedReport = () => {
    // Basic consolidated CSV for RF40
    const alertsSection = [["--- ALERTAS ---"]];
    const alertsHeaders = ["Data", "Horário", "Domínio", "Item", "Métrica", "Valor", "Criticidade"];
    const alertsRows = displayedAlerts.map(alert => {
      const d = new Date(alert.timestamp);
      return [
        d.toLocaleDateString("pt-BR"),
        d.toLocaleTimeString("pt-BR"),
        DOMAINS[alert.domain]?.name || alert.domain,
        `"${alert.item.replace(/"/g, '""')}"`,
        `"${alert.metric.replace(/"/g, '""')}"`,
        `"${alert.value.replace(/"/g, '""')}"`,
        alert.criticality
      ];
    });

    const predsSection = [["\n--- PREVISOES ---"]];
    const predsHeaders = ["Data", "Horário", "Domínio", "Item Analisado", "Resultado da Previsão"];
    const predsRows = displayedPredictions.map(pred => {
      const d = new Date(pred.timestamp);
      return [
        d.toLocaleDateString("pt-BR"),
        d.toLocaleTimeString("pt-BR"),
        DOMAINS[pred.domain]?.name || pred.domain,
        `"${pred.item.replace(/"/g, '""')}"`,
        `"${pred.predictionResult.replace(/"/g, '""')}"`
      ];
    });

    const content = [
      ...alertsSection,
      alertsHeaders,
      ...alertsRows,
      ...predsSection,
      predsHeaders,
      ...predsRows
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_consolidado_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="pb-5 border-b border-border/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {!isMenu && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveUtilityPanel("menu")}
                className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-zinc-900 transition px-2 py-0 flex items-center justify-center gap-1 shrink-0 align-middle"
              >
                ← Voltar
              </Button>
            )}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isMenu ? (
                <>
                  <Menu className="h-5 w-5 text-zinc-400 shrink-0" />
                  <h2 className="text-md font-semibold text-foreground truncate">Menu Principal</h2>
                </>
              ) : isAlerts ? (
                <>
                  <Bell className="h-5 w-5 text-zinc-400 shrink-0" />
                  <h2 className="text-md font-semibold text-foreground truncate">Alertas do Sistema</h2>
                </>
              ) : isPredictions ? (
                <>
                  <History className="h-5 w-5 text-zinc-400 shrink-0" />
                  <h2 className="text-md font-semibold text-foreground truncate">Histórico de Previsões</h2>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <h2 className="text-md font-semibold text-foreground truncate">Log de Auditoria Interna</h2>
                </>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-zinc-900 transition shrink-0"
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
                {(currentUser?.accessProfile === "Super Admin" || !currentUser) && (
                  <button
                    onClick={() => {
                      router.push("/admin/usuarios");
                      handleClose();
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 mt-1 text-left w-fit"
                  >
                    ⚙️ Acessar Área Administrativa
                  </button>
                )}
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
                <button
                  onClick={() => setActiveUtilityPanel("predictions")}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
                      <History className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Histórico de Previsões</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateConsolidatedReport}
                    className="w-full text-xs font-bold border-zinc-700/50 hover:bg-zinc-900 text-foreground"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Relatório Consolidado
                  </Button>
                </div>
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
              <div className="flex flex-col gap-2.5 p-3 bg-zinc-900/30 border border-border/10 rounded-xl mt-3 mx-1 shrink-0">
                <div className="flex items-center gap-2">
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

                {/* Export CSV Button */}
                <Button
                  size="sm"
                  onClick={exportToCSV}
                  className="w-full h-8 text-[11px] font-bold bg-green-500 hover:bg-green-600 text-zinc-950 transition-colors flex items-center justify-center gap-1.5 rounded-md"
                >
                  <Download className="h-3.5 w-3.5" />
                  Exportar CSV
                </Button>
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
                          {filter === "unrecognized" ? (
                            !alert.recognized ? (
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
                            )
                          ) : (
                            // Read-only status badge in the HISTÓRICO tab
                            alert.recognized ? (
                              <span className="text-[9px] text-zinc-550 dark:text-zinc-500 font-bold flex items-center gap-0.5 select-none py-0.5 px-1.5 bg-zinc-950/20 border border-border/20 rounded">
                                <Check className="h-3 w-3 text-emerald-500/70" />
                                Reconhecido
                              </span>
                            ) : (
                              <span className="text-[9px] text-amber-500/80 dark:text-amber-500/75 font-bold flex items-center gap-0.5 select-none py-0.5 px-1.5 bg-zinc-950/20 border border-border/20 rounded">
                                Pendente
                              </span>
                            )
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

        {isPredictions && (
          <>
            <div className="flex flex-col gap-2.5 p-3 bg-zinc-900/30 border border-border/10 rounded-xl mt-3 mx-1 shrink-0">
              <div className="flex items-center gap-2">
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

              {/* Export CSV Button */}
              <Button
                size="sm"
                onClick={exportPredictionsToCSV}
                className="w-full h-8 text-[11px] font-bold bg-green-500 hover:bg-green-600 text-zinc-950 transition-colors flex items-center justify-center gap-1.5 rounded-md"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar CSV
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-5 space-y-4 select-none scrollbar-thin">
              {displayedPredictions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <History className="h-10 w-10 text-muted-foreground/40 mb-2 stroke-[1.5]" />
                  <p className="text-sm">Nenhuma previsão encontrada.</p>
                </div>
              ) : (
                displayedPredictions.map((pred) => {
                  const domainInfo = DOMAINS[pred.domain];
                  const detailInfo = pred.details?.probabilidadeRetorno 
                    ? `Retorno: ${pred.details.probabilidadeRetorno}%` 
                    : pred.details?.probabilidadeFalha 
                      ? `Falha: ${pred.details.probabilidadeFalha}%` 
                      : "";

                  return (
                    <div
                      key={pred.id}
                      className={cn(
                        "p-4.5 flex flex-col gap-3 transition-all duration-300 relative border border-border/30 border-l-4 rounded-xl shadow-sm",
                        "border-l-blue-500 bg-blue-500/[0.03]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border",
                                getDomainColorClass(pred.domain)
                              )}
                            >
                              {getDomainIcon(pred.domain)}
                              {domainInfo.name.split(" ")[0]}
                            </span>
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                                "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              )}
                            >
                              {pred.predictionResult}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground leading-snug mt-1 truncate">
                            {pred.item}
                          </h4>
                        </div>
                        <span className="text-[8px] font-mono text-zinc-500/40 dark:text-zinc-600/40 tracking-wider shrink-0 select-none">
                          #{pred.id.substring(4, 11)}
                        </span>
                      </div>

                      {detailInfo && (
                        <div className="flex items-center justify-between bg-zinc-950/20 dark:bg-zinc-950/50 px-2.5 py-1.5 rounded-lg border border-border/20 text-[10px]">
                          <span className="text-zinc-500 dark:text-zinc-400/80 text-[10px] font-medium">Confiança/Probab.:</span>
                          <span className="font-mono font-bold text-[10px] text-blue-400">
                            {detailInfo}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/20">
                        <span className="text-[9px] text-zinc-500/55 dark:text-zinc-550/55 font-mono select-none flex items-center gap-1.5">
                          <span>
                            {new Date(pred.timestamp).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="opacity-40">•</span>
                          <span>
                            {new Date(pred.timestamp).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              initiateDomainSwitch(pred.domain);
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
                Registros: {displayedPredictions.length}
              </span>
              {predictionHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearPredictionHistory}
                  className="h-7 text-xs text-rose-500 hover:text-rose-455 hover:bg-rose-500/5 font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Limpar Histórico
                </Button>
              )}
            </div>
          </>
        )}

        {isLogs && (
          <>
            {/* Indicators Panel */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-zinc-900/20 border border-border/10 rounded-xl mt-3 mx-1 shrink-0">
              <div className="bg-zinc-950 border border-border/20 p-2.5 rounded-lg flex flex-col justify-center min-w-0">
                <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider truncate">Total Ações</span>
                <span className="text-base font-black text-foreground mt-0.5 font-mono">{logs.length}</span>
              </div>
              <div className="bg-zinc-950 border border-border/20 p-2.5 rounded-lg flex flex-col justify-center min-w-0">
                <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider truncate">Críticas</span>
                <span className="text-base font-black text-rose-500 mt-0.5 font-mono">{criticalCount}</span>
              </div>
              <div className="bg-zinc-950 border border-border/20 p-2.5 rounded-lg flex flex-col justify-center min-w-0">
                <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-wider truncate">Usuários At.</span>
                <span className="text-base font-black text-emerald-500 mt-0.5 font-mono">{activeUsersCount}</span>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-col gap-2.5 p-3 bg-zinc-900/30 border border-border/10 rounded-xl mt-3 mx-1 shrink-0">
              <div className="flex items-center gap-2">
                {/* User Filter */}
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-500">
                    Usuário
                  </label>
                  <select
                    value={logUserFilter}
                    onChange={(e) => setLogUserFilter(e.target.value)}
                    className="bg-zinc-950 border border-border/30 text-[11px] text-foreground px-2 py-1 rounded-md outline-none focus:border-green-550 transition h-8 cursor-pointer w-full text-ellipsis"
                  >
                    <option value="all">Todos</option>
                    {uniqueLogUsers.map((user) => (
                      <option key={user} value={user}>
                        {user}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Type Filter */}
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-500">
                    Tipo de Ação
                  </label>
                  <select
                    value={logActionType}
                    onChange={(e) => setLogActionType(e.target.value)}
                    className="bg-zinc-950 border border-border/30 text-[11px] text-foreground px-2 py-1 rounded-md outline-none focus:border-green-550 transition h-8 cursor-pointer w-full"
                  >
                    <option value="all">Todos</option>
                    <option value="auth">Autenticação</option>
                    <option value="models">Modelos/Treino</option>
                    <option value="alerts">Alertas/Limiares</option>
                    <option value="others">Outros</option>
                  </select>
                </div>
              </div>

              {/* Date Filters */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-500">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={logStartDate}
                    onChange={(e) => setLogStartDate(e.target.value)}
                    className="bg-zinc-950 border border-border/30 text-[11px] text-foreground px-2 py-1 rounded-md outline-none focus:border-green-550 transition h-8 cursor-pointer w-full"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-500">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={logEndDate}
                    onChange={(e) => setLogEndDate(e.target.value)}
                    className="bg-zinc-950 border border-border/30 text-[11px] text-foreground px-2 py-1 rounded-md outline-none focus:border-green-550 transition h-8 cursor-pointer w-full"
                  />
                </div>
              </div>
              
              {/* Reset Filters and Export CSV buttons */}
              <div className="flex items-center justify-between gap-3 pt-1">
                {(logUserFilter !== "all" || logStartDate !== "" || logEndDate !== "" || logActionType !== "all") ? (
                  <button
                    onClick={() => {
                      setLogUserFilter("all");
                      setLogStartDate("");
                      setLogEndDate("");
                      setLogActionType("all");
                    }}
                    className="text-[9px] font-bold text-rose-500 hover:text-rose-400 transition"
                  >
                    Limpar Filtros Avançados
                  </button>
                ) : (
                  <span />
                )}
                
                <Button
                  size="sm"
                  onClick={exportLogsToCSV}
                  disabled={displayedLogs.length === 0}
                  className="h-7 text-[10px] font-bold bg-green-500 hover:bg-green-600 disabled:opacity-50 text-zinc-950 transition-colors flex items-center justify-center gap-1 px-3 rounded-md shrink-0 ml-auto"
                >
                  <Download className="h-3 w-3" />
                  Exportar CSV
                </Button>
              </div>
            </div>

            {/* Logs Content */}
            <div className="flex-1 overflow-y-auto py-5 select-none scrollbar-thin flex flex-col min-h-0 relative">
              {displayedLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <ShieldCheck className="h-10 w-10 text-muted-foreground/40 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-semibold">Nenhum log encontrado.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Nenhum evento registrado corresponde aos filtros aplicados.</p>
                  {(logUserFilter !== "all" || logStartDate !== "" || logEndDate !== "" || logActionType !== "all") && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setLogUserFilter("all");
                        setLogStartDate("");
                        setLogEndDate("");
                        setLogActionType("all");
                      }}
                      className="mt-4 h-8 text-[11px] font-bold bg-zinc-900 border border-border/30 text-foreground hover:bg-zinc-800"
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              ) : (
                <div className="w-full overflow-x-auto border border-border/20 rounded-xl bg-zinc-950/40 scrollbar-thin">
                  <table className="w-full text-left border-collapse text-[10px] min-w-[500px]">
                    <thead>
                      <tr className="border-b border-border/25 bg-zinc-900/60 text-zinc-400 font-bold uppercase tracking-wider select-none">
                        <th className="p-3 w-[75px] shrink-0 font-extrabold">Data</th>
                        <th className="p-3 w-[65px] shrink-0 font-extrabold">Horário</th>
                        <th className="p-3 w-[100px] font-extrabold">Usuário</th>
                        <th className="p-3 w-[95px] font-extrabold">Perfil</th>
                        <th className="p-3 font-extrabold">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/15">
                      {displayedLogs.map((log) => {
                        const dateObj = new Date(log.timestamp);
                        const dateStr = dateObj.toLocaleDateString("pt-BR");
                        const timeStr = dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                        
                        return (
                          <tr
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            className="hover:bg-zinc-900/40 cursor-pointer active:bg-zinc-900/60 transition duration-150 group"
                          >
                            <td className="p-3 text-zinc-400 font-medium whitespace-nowrap">{dateStr}</td>
                            <td className="p-3 text-zinc-400 font-mono whitespace-nowrap">{timeStr}</td>
                            <td className="p-3 text-foreground font-semibold truncate max-w-[100px]" title={log.username}>{log.username}</td>
                            <td className="p-3 text-zinc-400 font-medium truncate max-w-[95px]" title={log.accessProfile}>{log.accessProfile}</td>
                            <td className="p-3 text-zinc-300 font-medium max-w-[200px] truncate group-hover:text-foreground transition-colors" title={log.action}>{log.action}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub-panel details (CA06) */}
              {selectedLog && (
                <div className="absolute inset-0 bg-zinc-950 z-25 flex flex-col p-6 animate-in slide-in-from-right duration-200 border border-border/20 rounded-xl m-1">
                  <div className="flex items-center justify-between pb-4 border-b border-border/20 mb-4 shrink-0">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                      Detalhes do Registro
                    </h3>
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-zinc-900 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 text-[11px] scrollbar-thin pr-1">
                    <div className="bg-zinc-900/40 border border-border/15 rounded-xl p-3.5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-semibold">ID do Registro:</span>
                        <span className="font-mono font-bold text-foreground bg-zinc-900 px-1.5 py-0.5 rounded border border-border/20">#{selectedLog.id}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-border/10 pt-2.5">
                        <span className="text-zinc-500 font-semibold">Data da Ação:</span>
                        <span className="font-bold text-foreground">{new Date(selectedLog.timestamp).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-border/10 pt-2.5">
                        <span className="text-zinc-500 font-semibold">Horário da Ação:</span>
                        <span className="font-bold text-foreground font-mono">{new Date(selectedLog.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                      </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-border/15 rounded-xl p-3.5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-semibold">Usuário:</span>
                        <span className="font-bold text-foreground">{selectedLog.username}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-border/10 pt-2.5">
                        <span className="text-zinc-500 font-semibold">Perfil de Acesso:</span>
                        <span className="font-bold text-foreground">{selectedLog.accessProfile}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-border/10 pt-2.5">
                        <span className="text-zinc-500 font-semibold">Escopo (Sistema/Usuário):</span>
                        <span className="font-bold text-zinc-400">{selectedLog.profile}</span>
                      </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-border/15 rounded-xl p-3.5 space-y-2">
                      <span className="text-zinc-500 font-semibold block">Descrição da Ação:</span>
                      <p className="text-foreground leading-relaxed font-bold bg-zinc-950 p-3 rounded-lg border border-border/20 break-words whitespace-pre-wrap font-mono text-[10px]">
                        {selectedLog.action}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/10 shrink-0">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedLog(null)}
                      className="w-full text-xs font-bold bg-zinc-900 border border-border/30 text-foreground hover:bg-zinc-800"
                    >
                      Voltar para a Listagem
                    </Button>
                  </div>
                </div>
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
