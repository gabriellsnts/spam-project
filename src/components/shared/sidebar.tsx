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
  Sparkles,
  BookOpen,
  HelpCircle,
  History as HistoryIcon,
  DatabaseBackup
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const { 
    activeDomain, 
    logs, 
    currentView, 
    setCurrentView, 
    t, 
    currentUser,
    activeProfileSection,
    setActiveProfileSection,
    activeProfileSubSection,
    setActiveProfileSubSection
  } = useDomain();
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
              <span>{t("sensors")}</span>
              <span className="text-emerald-500 font-semibold">{t("active_iot")}</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{t("overall_oee")}</span>
              <span className="text-foreground font-semibold">84.0%</span>
            </div>
          </div>
        );
      case "demand":
        return (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{t("model")}</span>
              <span className="text-sky-500 font-semibold font-mono text-[9px]">Prophet-ML</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{t("accuracy")}</span>
              <span className="text-foreground font-semibold">93.8%</span>
            </div>
          </div>
        );
      case "churn":
        return (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{t("monitoring_label")}</span>
              <span className="text-violet-500 font-semibold">{t("enterprise_accounts")}</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{t("overall_nps")}</span>
              <span className="text-foreground font-semibold">78 pt</span>
            </div>
          </div>
        );
      case "credit-risk":
        return (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{t("risk_var")}</span>
              <span className="text-emerald-500 font-semibold">R$ 1.2M</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{t("default_pd")}</span>
              <span className="text-foreground font-semibold">1.80%</span>
            </div>
          </div>
        );
    }
  };

  const viewItems = [
    {
      id: "monitoring",
      name: t("monitoring"),
      desc: t("monitoring_desc"),
      icon: BarChart3
    },
    {
      id: "simulation",
      name: t("simulation"),
      desc: activeDomain === "maintenance"
        ? t("simulate_iot")
        : activeDomain === "demand"
        ? t("simulate_demand")
        : activeDomain === "churn"
        ? t("simulate_churn")
        : t("simulate_credit"),
      icon: Sliders
    },
    {
      id: "calibration",
      name: t("calibration"),
      desc: t("calibration_desc"),
      icon: Settings
    },
    {
      id: "comparison",
      name: t("comparison"),
      desc: t("comparison_desc"),
      icon: Sparkles
    },
    {
      id: "model-history",
      name: t("model_history") || "Histórico de Modelos",
      desc: t("model_history_desc") || "Compare e gerencie versões de modelos",
      icon: HistoryIcon
    },
    {
      id: "analytics",
      name: "Analytics Avançado",
      desc: "Lift, Gains, SHAP, Drift, Fairness (RF60, RF74, RF75, RF85, RF86, RF90)",
      icon: BarChart3
    }
  ];

  if (pathname === "/profile" || pathname === "/profile/") {
    const isAdmin = currentUser?.profileName === "Administrador";
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
          title={isCollapsed ? t("expand_menu") : t("collapse_menu")}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Nav Content */}
        <div className="p-3 space-y-6 flex-1 flex flex-col overflow-y-auto">
          {/* User Block */}
          {currentUser && (
            <div className={cn(
              "flex flex-col items-center border-b border-border/60 pb-5 mb-2 transition-all duration-300",
              isCollapsed ? "px-1" : "px-3"
            )}>
              <div className={cn(
                "rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/25 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black shadow-md relative overflow-hidden group transition-all duration-300 shrink-0",
                isCollapsed ? "h-9 w-9 text-xs" : "h-14 w-14 text-lg"
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/15" />
                {currentUser.fullName
                  ? currentUser.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                  : "AD"}
              </div>
              
              {!isCollapsed && (
                <div className="text-center mt-3 animate-in fade-in duration-300 w-full overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-muted-foreground/75 font-mono truncate mt-0.5">
                    @{currentUser.username}
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <span className={cn(
                      "text-[9px] font-extrabold px-2 py-0.5 rounded-full border tracking-wide uppercase shadow-sm",
                      isAdmin
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    )}>
                      {currentUser.accessProfile}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isCollapsed && (
            <div className="px-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest animate-in fade-in duration-300">
              {t("profile_settings") || "Configurações"}
            </div>
          )}

          <nav className="space-y-2">
            {/* Preferências */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveProfileSection("preferences");
                  setActiveProfileSubSection("");
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group",
                  activeProfileSection === "preferences"
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent",
                  isCollapsed && "justify-center"
                )}
                title={t("preferences")}
              >
                {activeProfileSection === "preferences" && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r-md" />
                )}
                <Settings className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold leading-none">{t("preferences")}</div>
                    <div className="text-[9px] text-muted-foreground font-normal leading-none mt-1 group-hover:text-foreground/70 transition-colors">
                      {t("profile_settings_desc")}
                    </div>
                  </div>
                )}
              </button>

              {/* Subtópicos de Preferências */}
              {!isCollapsed && activeProfileSection === "preferences" && (
                <div className="pl-6 pt-0.5 space-y-1 animate-in slide-in-from-top-1.5 duration-200 border-l border-zinc-200/50 dark:border-zinc-800/40 ml-5 mt-1">
                  <button
                    onClick={() => setActiveProfileSubSection("appearance")}
                    className={cn(
                      "w-full text-left text-[10.5px] py-1.5 px-2.5 rounded-lg transition-colors block font-medium relative",
                      activeProfileSubSection === "appearance"
                        ? "text-emerald-500 bg-emerald-500/5 font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/15"
                    )}
                  >
                    {activeProfileSubSection === "appearance" && (
                      <span className="absolute left-0 top-[9px] w-1 h-1 rounded-full bg-emerald-500" />
                    )}
                    {t("dashboard_appearance")}
                  </button>
                  <button
                    onClick={() => setActiveProfileSubSection("language")}
                    className={cn(
                      "w-full text-left text-[10.5px] py-1.5 px-2.5 rounded-lg transition-colors block font-medium relative",
                      activeProfileSubSection === "language"
                        ? "text-emerald-500 bg-emerald-500/5 font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/15"
                    )}
                  >
                    {activeProfileSubSection === "language" && (
                      <span className="absolute left-0 top-[9px] w-1 h-1 rounded-full bg-emerald-500" />
                    )}
                    {t("language_selection")}
                  </button>
                </div>
              )}
            </div>

            {/* Gestão Administrativa */}
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveProfileSection("admin");
                  setActiveProfileSubSection("");
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group",
                  activeProfileSection === "admin"
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent",
                  isCollapsed && "justify-center"
                )}
                title={t("admin_management")}
              >
                {activeProfileSection === "admin" && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r-md" />
                )}
                <ShieldCheck className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold leading-none">{t("admin_management")}</div>
                    <div className="text-[9px] text-muted-foreground font-normal leading-none mt-1 group-hover:text-foreground/70 transition-colors">
                      {t("admin_management_desc") || "Gerenciamento de usuários"}
                    </div>
                  </div>
                )}
              </button>
            )}

            {/* Customização de Tema */}
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveProfileSection("theme");
                  setActiveProfileSubSection("");
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group",
                  activeProfileSection === "theme"
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent",
                  isCollapsed && "justify-center"
                )}
                title={t("theme_customization")}
              >
                {activeProfileSection === "theme" && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r-md" />
                )}
                <Sparkles className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold leading-none">{t("theme_customization")}</div>
                    <div className="text-[9px] text-muted-foreground font-normal leading-none mt-1 group-hover:text-foreground/70 transition-colors">
                      {t("theme_customization_desc") || "Cores e branding corporativo"}
                    </div>
                  </div>
                )}
              </button>
            )}

            {/* Backups do Sistema (RF48) */}
            {isAdmin && (
              <Link
                href="/admin/backups"
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent",
                  isCollapsed && "justify-center"
                )}
                title="Backups do Sistema"
              >
                <DatabaseBackup className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold leading-none">Backups do Sistema</div>
                    <div className="text-[9px] text-muted-foreground font-normal leading-none mt-1 group-hover:text-foreground/70 transition-colors">
                      Gerenciar snapshots e restauração
                    </div>
                  </div>
                )}
              </Link>
            )}
          </nav>
        </div>

        {/* Mini signature / audit count */}
        <div className={cn("p-4 border-t border-border/80 flex items-center text-muted-foreground/50 text-[10px] font-mono", isCollapsed ? "flex-col gap-1 justify-center" : "justify-between")}>
          <ShieldCheck className="h-4 w-4 shrink-0" />
          {!isCollapsed && (
            <span className="animate-in fade-in duration-300">
              {t("log_events")} {logs.length}
            </span>
          )}
        </div>
      </div>
    );
  }

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
        title={isCollapsed ? t("expand_menu") : t("collapse_menu")}
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
            {t("internal_tools")}
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
                {t("no_domain_selected")}
              </div>
            )
          )}
        </nav>
        
        {/* Help & Docs Section */}
        <div className="pt-4 border-t border-border mt-4">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest animate-in fade-in duration-300">
              {t("Suporte & Docs")}
            </div>
          )}
          <nav className="space-y-2">
            <Link 
              href="/docs/glossary"
              className={cn(
                "w-full flex items-center p-2.5 rounded-xl border border-transparent transition-all duration-200 group text-muted-foreground hover:text-foreground hover:bg-muted/40",
                isCollapsed ? "justify-center" : "gap-3 px-3"
              )}
              title="Glossário"
            >
              <BookOpen className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <div className="text-xs font-bold leading-none">Glossário (RF55)</div>
              )}
            </Link>
            
            <Link 
              href="/docs/help"
              className={cn(
                "w-full flex items-center p-2.5 rounded-xl border border-transparent transition-all duration-200 group text-muted-foreground hover:text-foreground hover:bg-muted/40",
                isCollapsed ? "justify-center" : "gap-3 px-3"
              )}
              title="Central de Ajuda"
            >
              <HelpCircle className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <div className="text-xs font-bold leading-none">Central de Ajuda (RF56)</div>
              )}
            </Link>
          </nav>
        </div>
      </div>

      {/* Footer Area: Active Module Summary Info */}
      {!isCollapsed && activeDomain && (
        <div className="p-4 m-3 rounded-2xl bg-card border border-border shadow-inner text-xs space-y-2.5 animate-in fade-in duration-300">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", getActiveDotColorClass(activeDomain))} />
            <span>{t("active_module")}</span>
          </div>
          {renderActiveDomainMetric()}
        </div>
      )}

      {/* Mini signature / audit count */}
      <div className={cn("p-4 border-t border-border/80 flex items-center text-muted-foreground/50 text-[10px] font-mono", isCollapsed ? "flex-col gap-1 justify-center" : "justify-between")}>
        <ShieldCheck className="h-4 w-4 shrink-0" />
        {!isCollapsed && (
          <span className="animate-in fade-in duration-300">
            {t("log_events")} {logs.length}
          </span>
        )}
      </div>
    </div>
  );
}
