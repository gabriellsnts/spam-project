"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDomain, DomainType } from "@/lib/context/domain-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "@/components/shared/user-management";
import { ThemeCustomizer } from "@/components/shared/theme-customizer";
import { Sun, Moon, Laptop, Shield, User as UserIcon, Calendar, Building, Tag, Mail, Settings, Play, Paintbrush } from "lucide-react";
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
    simulateCriticalAlertsBatch
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

  const handleSaveEmailConfig = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (localEmail && !emailRegex.test(localEmail)) {
      showPremiumToast("Por favor, insira um e-mail válido.", "error");
      return;
    }
    
    updateEmailConfig({
      email: localEmail,
      enabledDomains: localEnabledDomains
    });
  };

  const handleToggleDomain = (domain: DomainType, checked: boolean) => {
    setLocalEnabledDomains(prev => ({
      ...prev,
      [domain]: checked
    }));
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
          <span className="text-sm text-zinc-400 font-semibold animate-pulse">Carregando dados do usuário...</span>
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
          Perfil e Configurações
        </h1>
        <p className="text-slate-700 dark:text-zinc-400 text-xs mt-1">
          Gerencie suas preferências visuais e acesse configurações administrativas da conta.
        </p>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        {/* Lista de abas (renderizadas condicionalmente) */}
        <div className="border-b border-zinc-800/80 pb-px mb-4">
          <TabsList className="bg-zinc-950/80 border border-zinc-800/80 p-1 rounded-xl h-11">
            <TabsTrigger 
              value="preferences" 
              className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-zinc-850 data-[state=active]:text-foreground data-[state=active]:border-zinc-700/50 data-[state=active]:shadow-sm"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Preferências
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger 
                value="admin" 
                className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-zinc-850 data-[state=active]:text-emerald-400 data-[state=active]:border-zinc-700/50 data-[state=active]:shadow-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Gestão Administrativa
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger 
                value="theme" 
                className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-zinc-850 data-[state=active]:text-emerald-400 data-[state=active]:border-zinc-700/50 data-[state=active]:shadow-sm"
              >
                <Paintbrush className="h-4 w-4 mr-2" />
                Customização de Tema
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Conteúdo: Preferências */}
        <TabsContent value="preferences" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card de Informações Básicas (Visual Premium) */}
            <Card className="md:col-span-1 border-zinc-200 dark:border-border/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl flex flex-col justify-between">
              <CardHeader className="text-center pt-8 pb-4">
                <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-2xl shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                  {currentUser.fullName
                    ? currentUser.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                    : "AD"}
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-4 leading-tight">
                  {currentUser.fullName}
                </h2>
                <p className="text-xs text-slate-700 dark:text-zinc-400 font-mono mt-1">
                  @{currentUser.username}
                </p>
                <div className="flex justify-center mt-3">
                  <span className={cn(
                    "text-[10px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-sm",
                    isAdmin
                      ? "bg-emerald-550/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25"
                  )}>
                    <Tag className="h-3 w-3" />
                    {currentUser.accessProfile}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="border-t border-zinc-200 dark:border-zinc-800/60 pt-6 pb-8 space-y-4 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-zinc-400">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-zinc-500" />
                    Departamento
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{currentUser.department}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-zinc-400">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    Último Acesso
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                    {currentUser.lastLogin 
                      ? new Date(currentUser.lastLogin).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "Recém-logado"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Aparência / Tema (RF52) */}
            <Card className="md:col-span-2 border-zinc-200 dark:border-border/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Laptop className="h-4.5 w-4.5 text-emerald-500" />
                  Aparência do Painel
                </CardTitle>
                <CardDescription className="text-xs text-slate-700 dark:text-zinc-500">
                  Ajuste a paleta visual do ecossistema. O tema automático detecta e aplica a preferência do seu dispositivo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                {/* Seletor Visual Nativo de Temas */}
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
                        ? "bg-emerald-550/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-350"
                    )}>
                      <Sun className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-900 dark:text-zinc-200">Modo Claro</div>
                      <div className="text-[10px] text-slate-650 dark:text-zinc-500 mt-0.5">Interface clara e suave</div>
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
                        ? "bg-emerald-550/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-350"
                    )}>
                      <Moon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-900 dark:text-zinc-200">Modo Escuro</div>
                      <div className="text-[10px] text-slate-650 dark:text-zinc-500 mt-0.5">Foco visual com economia de energia</div>
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
                        ? "bg-emerald-550/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
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
                      <div className="text-xs font-bold text-slate-900 dark:text-zinc-200">Sistema</div>
                      <div className="text-[10px] text-slate-650 dark:text-zinc-500 mt-0.5">Sincroniza com as cores do seu SO</div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Configuração de Notificações por E-mail (RF41) */}
            <Card className="md:col-span-3 border-zinc-200 dark:border-border/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
              <CardHeader className="border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Mail className="h-4.5 w-4.5 text-emerald-500" />
                  Configuração de Notificações por E-mail
                </CardTitle>
                <CardDescription className="text-xs text-slate-700 dark:text-zinc-500">
                  Configure seu e-mail para receber alertas preditivos críticos em tempo real e ative individualmente para cada domínio.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 pb-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Formulário de Email */}
                  <div className="md:col-span-1 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <label htmlFor="email-input" className="text-xs font-bold text-slate-750 dark:text-zinc-300 block">
                        E-mail do Gestor
                      </label>
                      <input
                        id="email-input"
                        type="email"
                        value={localEmail}
                        onChange={(e) => setLocalEmail(e.target.value)}
                        placeholder="gestor@empresa.com"
                        className="w-full text-xs bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                      />
                    </div>
                    
                    <button
                      onClick={handleSaveEmailConfig}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-555 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Salvar Configurações
                    </button>
                  </div>

                  {/* Switches de Domínios */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="text-xs font-black text-slate-750 dark:text-zinc-300 uppercase tracking-wider block">
                      Ativação por Domínio de Origem
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Manutenção */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/40 dark:bg-zinc-950/20">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                            Manutenção
                          </div>
                          <span className="text-[10px] text-slate-650 dark:text-zinc-550 block mt-0.5">Falhas físicas e sensores</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localEnabledDomains.maintenance}
                            onChange={(e) => handleToggleDomain("maintenance", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {/* Demanda */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/40 dark:bg-zinc-950/20">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                            Demanda
                          </div>
                          <span className="text-[10px] text-slate-650 dark:text-zinc-550 block mt-0.5">Ruptura de estoque</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localEnabledDomains.demand}
                            onChange={(e) => handleToggleDomain("demand", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {/* Churn */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/40 dark:bg-zinc-950/20">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                            Churn de Clientes
                          </div>
                          <span className="text-[10px] text-slate-650 dark:text-zinc-550 block mt-0.5">Risco de cancelamento</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localEnabledDomains.churn}
                            onChange={(e) => handleToggleDomain("churn", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {/* Crédito */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/40 dark:bg-zinc-950/20">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                            Risco de Crédito
                          </div>
                          <span className="text-[10px] text-slate-650 dark:text-zinc-550 block mt-0.5">Score de crédito e inadimplência</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localEnabledDomains["credit-risk"]}
                            onChange={(e) => handleToggleDomain("credit-risk", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
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
                      Ferramentas de Simulação (Modo Demo)
                    </div>
                    <p className="text-[10px] text-slate-650 dark:text-zinc-550">
                      Gere múltiplos alertas críticos simulados para ver a regra de agrupamento consolidando o e-mail em tempo real.
                    </p>
                  </div>
                  <button
                    onClick={simulateCriticalAlertsBatch}
                    className="px-4 py-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-zinc-100/50 dark:bg-zinc-950/20 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-250 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Simular Disparo Crítico em Lote
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conteúdo: Gestão Administrativa */}
        {isAdmin && (
          <TabsContent value="admin" className="outline-none">
            <UserManagement />
          </TabsContent>
        )}

        {/* Conteúdo: Customização de Tema (RF53) */}
        {isAdmin && (
          <TabsContent value="theme" className="outline-none">
            <ThemeCustomizer />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
