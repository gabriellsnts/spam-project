"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDomain, DomainType } from "@/lib/context/domain-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "@/components/shared/user-management";
import { ThemeCustomizer } from "@/components/shared/theme-customizer";
import { TuningPanel } from "@/components/shared/tuning-panel";
import { AlertsWebhookConfig } from "@/components/shared/alerts-webhook-config";
import { PipelineSettings } from "@/components/shared/pipeline-settings";
import { Sun, Moon, Laptop, Mail, Settings, Play, Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const {
    currentUser,
    isAuthLoading,
    theme,
    setTheme,
    emailConfig,
    updateEmailConfig,
    showPremiumToast,
    simulateCriticalAlertsBatch,
    language,
    setLanguage,
    activeProfileSection,
    startTutorial,
    t
  } = useDomain();
  const router = useRouter();

  const [localEmail, setLocalEmail] = useState("");
  const [localEnabledDomains, setLocalEnabledDomains] = useState<Record<DomainType, boolean>>({
    maintenance: true,
    demand: true,
    churn: true,
    "credit-risk": true
  });

  useEffect(() => {
    if (emailConfig) {
      setLocalEmail(emailConfig.email);
      setLocalEnabledDomains(emailConfig.enabledDomains);
    }
  }, [emailConfig]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>({});

  const hasChanges = !!emailConfig && (
    localEmail !== emailConfig.email ||
    JSON.stringify(localEnabledDomains) !== JSON.stringify(emailConfig.enabledDomains)
  );

  const handleSaveEmailConfig = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (localEmail && !emailRegex.test(localEmail)) {
      showPremiumToast(
        language === "pt"
          ? "Por favor, insira um e-mail válido."
          : language === "es"
          ? "Por favor, introduzca un correo electrónico válido."
          : "Please enter a valid email.",
        "error"
      );
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      updateEmailConfig({
        email: localEmail,
        enabledDomains: localEnabledDomains
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 600);
  };

  const handleToggleDomain = (domain: DomainType, checked: boolean) => {
    if (toggleLoading[domain]) return;
    setToggleLoading(prev => ({ ...prev, [domain]: true }));
    setTimeout(() => {
      setLocalEnabledDomains(prev => ({
        ...prev,
        [domain]: checked
      }));
      setToggleLoading(prev => ({ ...prev, [domain]: false }));
    }, 300);
  };

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isAuthLoading, router]);

  if (isAuthLoading || !currentUser) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-zinc-400 font-semibold animate-pulse">{t("loading_user_data")}</span>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.profileName === "Administrador";

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100 uppercase">
          {t("profile_and_settings")}
        </h1>
        <p className="text-slate-700 dark:text-zinc-400 text-xs mt-1">
          {t("profile_settings_desc")}
        </p>
      </div>

      {/* Conteúdo: Preferências */}
      {activeProfileSection === "preferences" && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
          {/* Configurações de Aparência / Tema (RF52) */}
            <Card className="border-zinc-200 dark:border-border/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Laptop className="h-4.5 w-4.5 text-emerald-500" />
                  {t("dashboard_appearance")}
                </CardTitle>
                <CardDescription className="text-xs text-slate-700 dark:text-zinc-500">
                  {t("dashboard_appearance_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Tema Claro */}
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 gap-3 group relative overflow-hidden cursor-pointer",
                      theme === "light"
                        ? "bg-white dark:bg-zinc-950/80 border-emerald-500/40 text-slate-900 dark:text-foreground shadow-md ring-1 ring-emerald-500/20"
                        : "bg-zinc-100 dark:bg-zinc-950/30 border-zinc-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-700/80 hover:bg-zinc-200/50 dark:hover:bg-zinc-950/50 shadow-sm dark:shadow-none"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-lg border transition-all duration-300",
                      theme === "light"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-350"
                    )}>
                      <Sun className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-900 dark:text-zinc-200">{t("light_mode")}</div>
                      <div className="text-[10px] text-slate-660 mt-0.5">{t("light_mode_desc")}</div>
                    </div>
                  </button>

                  {/* Tema Escuro */}
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 gap-3 group relative overflow-hidden cursor-pointer",
                      theme === "dark"
                        ? "bg-white dark:bg-zinc-950/80 border-emerald-500/40 text-slate-900 dark:text-foreground shadow-md ring-1 ring-emerald-500/20"
                        : "bg-zinc-100 dark:bg-zinc-950/30 border-zinc-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-700/80 hover:bg-zinc-200/50 dark:hover:bg-zinc-950/50 shadow-sm dark:shadow-none"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-lg border transition-all duration-300",
                      theme === "dark"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-350"
                    )}>
                      <Moon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-900 dark:text-zinc-200">{t("dark_mode")}</div>
                      <div className="text-[10px] text-slate-655 dark:text-zinc-550 mt-0.5">{t("dark_mode_desc")}</div>
                    </div>
                  </button>

                  {/* Tema Sistema */}
                  <button
                    onClick={() => setTheme("auto")}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 gap-3 group relative overflow-hidden cursor-pointer",
                      theme === "auto"
                        ? "bg-white dark:bg-zinc-950/80 border-emerald-500/40 text-slate-900 dark:text-foreground shadow-md ring-1 ring-emerald-500/20"
                        : "bg-zinc-100 dark:bg-zinc-950/30 border-zinc-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-700/80 hover:bg-zinc-200/50 dark:hover:bg-zinc-950/50 shadow-sm dark:shadow-none"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-lg border transition-all duration-300",
                      theme === "auto"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-350"
                    )}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <rect width="20" height="14" x="2" y="3" rx="2" />
                        <line x1="8" x2="16" y1="21" y2="21" />
                        <line x1="12" x2="12" y1="17" y2="21" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-900 dark:text-zinc-200">{t("system_mode")}</div>
                      <div className="text-[10px] text-slate-650 dark:text-zinc-555 mt-0.5">{t("system_mode_desc")}</div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

          {/* Seletor de Idioma (RF54) */}
          <div className="pt-8 border-t border-slate-700/50 mt-8">
            <Card className="border-zinc-200 dark:border-border/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Globe className="h-4.5 w-4.5 text-emerald-500" />
                  {t("language_selection")}
                </CardTitle>
                <CardDescription className="text-xs text-slate-700 dark:text-zinc-500">
                  {t("language_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Português */}
                  <button
                    onClick={() => setLanguage("pt")}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 gap-2 cursor-pointer",
                      language === "pt"
                        ? "bg-white dark:bg-zinc-950/80 border-emerald-500/40 text-slate-900 dark:text-foreground shadow-md ring-1 ring-emerald-500/20"
                        : "bg-zinc-100 dark:bg-zinc-950/30 border-zinc-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-950/50 shadow-sm"
                    )}
                  >
                    <span className="text-2xl">🇧🇷</span>
                    <span className="text-xs font-bold">Português (BR)</span>
                  </button>

                  {/* Inglês */}
                  <button
                    onClick={() => setLanguage("en")}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 gap-2 cursor-pointer",
                      language === "en"
                        ? "bg-white dark:bg-zinc-950/80 border-emerald-500/40 text-slate-900 dark:text-foreground shadow-md ring-1 ring-emerald-500/20"
                        : "bg-zinc-100 dark:bg-zinc-950/30 border-zinc-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-950/50 shadow-sm"
                    )}
                  >
                    <span className="text-2xl">🇺🇸</span>
                    <span className="text-xs font-bold">English (US)</span>
                  </button>

                  {/* Espanhol */}
                  <button
                    onClick={() => setLanguage("es")}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 gap-2 cursor-pointer",
                      language === "es"
                        ? "bg-white dark:bg-zinc-950/80 border-emerald-500/40 text-slate-900 dark:text-foreground shadow-md ring-1 ring-emerald-500/20"
                        : "bg-zinc-100 dark:bg-zinc-950/30 border-zinc-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-950/50 shadow-sm"
                    )}
                  >
                    <span className="text-2xl">🇪🇸</span>
                    <span className="text-xs font-bold">Español</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tutorial Interativo (RF57 - CA05) */}
      {activeProfileSection === "preferences" && (
        <div className="pt-8 border-t border-slate-700/50 mt-8 max-w-4xl mx-auto mt-6">
          <Card className="w-full border-zinc-200 dark:border-border/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-300">
            <CardHeader className="border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Play className="h-4.5 w-4.5 text-emerald-500" />
                {t("tutorial_title")}
              </CardTitle>
              <CardDescription className="text-xs text-slate-700 dark:text-zinc-500">
                {t("tutorial_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-200">
                    {t("tutorial_reexecute")}
                  </div>
                  <p className="text-[10px] text-slate-650 dark:text-zinc-550">
                    {t("tutorial_reexecute_desc")}
                  </p>
                </div>
                <button
                  onClick={() => {
                    startTutorial();
                    router.push("/");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-dashed border-emerald-500/50 hover:border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  {t("tutorial_start_btn")}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conteúdo: Gestão Administrativa */}
      {activeProfileSection === "admin" && isAdmin && (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
          <UserManagement />
        </div>
      )}

      {/* Conteúdo: Customização de Tema (RF53) */}
      {activeProfileSection === "theme" && isAdmin && (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
          <ThemeCustomizer />
        </div>
      )}

      {/* Conteúdo: Tuning, Alertas e Pipeline (RF51, RF61, RF62, RF72, RF78, RF68, RF77) */}
      {activeProfileSection === "tuning" && isAdmin && (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">{t("tuning_title")}</h2>
            <p className="text-sm text-muted-foreground">{t("tuning_desc")}</p>
          </div>
          {/* Configuração de Notificações por E-mail (RF41) */}
          <Card className="w-full border-zinc-200 dark:border-border/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-300">
            <CardHeader className="border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Mail className="h-4.5 w-4.5 text-emerald-500" />
                {t("email_notifications")}
              </CardTitle>
              <CardDescription className="text-xs text-slate-700 dark:text-zinc-500">
                {t("email_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Formulário de Email */}
                <div className="md:col-span-1 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <label htmlFor="email-input" className="text-xs font-bold text-slate-750 dark:text-zinc-300 block">
                      {t("manager_email")}
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      value={localEmail}
                      onChange={(e) => setLocalEmail(e.target.value)}
                      placeholder={t("ui_gestor_empresa_com_217")}
                      className="w-full text-xs bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    />
                  </div>
                  
                  <button
                    onClick={handleSaveEmailConfig}
                    disabled={!hasChanges || isSaving || saveSuccess}
                    className={cn(
                      "w-full py-2.5 rounded-xl text-white font-bold text-xs transition-colors shadow-lg flex items-center justify-center gap-1.5",
                      !hasChanges && !saveSuccess ? "bg-zinc-400 dark:bg-zinc-700 cursor-not-allowed shadow-none" : "",
                      hasChanges && !isSaving && !saveSuccess ? "bg-emerald-600 hover:bg-emerald-550 active:scale-[0.98] active:brightness-110 shadow-emerald-600/10 cursor-pointer" : "",
                      isSaving ? "bg-emerald-500/80 cursor-wait shadow-none" : "",
                      saveSuccess ? "bg-emerald-500 shadow-emerald-500/20" : ""
                    )}
                  >
                    {isSaving && <div className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />}
                    {saveSuccess && <Check className="h-3.5 w-3.5" />}
                    {!isSaving && !saveSuccess && t("save_settings")}
                    {isSaving && (t("saving"))}
                    {saveSuccess && (t("saved"))}
                  </button>
                </div>

                {/* Switches de Domínios */}
                <div className="md:col-span-2 space-y-4">
                  <div className="text-xs font-black text-slate-750 dark:text-zinc-300 uppercase tracking-wider block">
                    {t("domain_activation")}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Manutenção */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/40 dark:bg-zinc-950/20">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                          {t("maintenance_name")}
                        </div>
                        <span className="text-[10px] text-slate-650 dark:text-zinc-550 block mt-0.5">{t("maintenance_desc_short")}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localEnabledDomains.maintenance}
                          onChange={(e) => handleToggleDomain("maintenance", e.target.checked)}
                          disabled={toggleLoading["maintenance"]}
                          className="sr-only peer"
                        />
                        <div className={cn("w-9 h-5 bg-zinc-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500", toggleLoading["maintenance"] && "opacity-50 cursor-wait animate-pulse ring-2 ring-emerald-500/50 ring-offset-1")}></div>
                      </label>
                    </div>

                    {/* Demanda */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/40 dark:bg-zinc-950/20">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                          {t("demand_name")}
                        </div>
                        <span className="text-[10px] text-slate-650 dark:text-zinc-550 block mt-0.5">{t("demand_desc_short")}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localEnabledDomains.demand}
                          onChange={(e) => handleToggleDomain("demand", e.target.checked)}
                          disabled={toggleLoading["demand"]}
                          className="sr-only peer"
                        />
                        <div className={cn("w-9 h-5 bg-zinc-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500", toggleLoading["demand"] && "opacity-50 cursor-wait animate-pulse ring-2 ring-emerald-500/50 ring-offset-1")}></div>
                      </label>
                    </div>

                    {/* Churn */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/40 dark:bg-zinc-950/20">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                          {t("churn_name")}
                        </div>
                        <span className="text-[10px] text-slate-650 dark:text-zinc-550 block mt-0.5">{t("churn_desc_short")}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localEnabledDomains.churn}
                          onChange={(e) => handleToggleDomain("churn", e.target.checked)}
                          disabled={toggleLoading["churn"]}
                          className="sr-only peer"
                        />
                        <div className={cn("w-9 h-5 bg-zinc-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500", toggleLoading["churn"] && "opacity-50 cursor-wait animate-pulse ring-2 ring-emerald-500/50 ring-offset-1")}></div>
                      </label>
                    </div>

                    {/* Crédito */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/40 dark:bg-zinc-950/20">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                          {t("credit_risk_name")}
                        </div>
                        <span className="text-[10px] text-slate-650 dark:text-zinc-550 block mt-0.5">{t("credit_risk_desc_short")}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localEnabledDomains["credit-risk"]}
                          onChange={(e) => handleToggleDomain("credit-risk", e.target.checked)}
                          disabled={toggleLoading["credit-risk"]}
                          className="sr-only peer"
                        />
                        <div className={cn("w-9 h-5 bg-zinc-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500", toggleLoading["credit-risk"] && "opacity-50 cursor-wait animate-pulse ring-2 ring-emerald-500/50 ring-offset-1")}></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modo Demo */}
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-2">
                    <Settings className="h-3.5 w-3.5 text-zinc-500" />
                    {t("demo_simulation_tools")}
                  </div>
                  <p className="text-[10px] text-slate-650 dark:text-zinc-550">
                    {t("demo_simulation_desc")}
                  </p>
                </div>
                <button
                  onClick={simulateCriticalAlertsBatch}
                  className="px-4 py-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-dashed-zinc-400 dark:hover:border-zinc-700 bg-zinc-100/50 dark:bg-zinc-950/20 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-250 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  {t("simulate_batch_btn")}
                </button>
              </div>
            </CardContent>
          </Card>

          <TuningPanel />
          <PipelineSettings />
          <AlertsWebhookConfig />
        </div>
      )}
    </div>
  );
}
