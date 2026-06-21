"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDomain, DOMAINS, DomainType } from "@/lib/context/domain-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AuditLogsDrawer } from "@/components/shared/audit-logs-drawer";
import { AlertsMenu } from "@/components/shared/alerts-menu";
import {
  Activity,
  Wrench,
  TrendingUp,
  Users,
  ShieldAlert,
  ChevronDown,
  ShieldCheck,
  Home,
  User,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";

export function Header() {
  const {
    activeDomain,
    initiateDomainSwitch,
    theme,
    toggleTheme,
    currentUser,
    logout,
    trainingFinishedAlert,
    dismissFinishedAlert,
  } = useDomain();

  // Play discrete notification sound on completion (CA05)
  React.useEffect(() => {
    if (trainingFinishedAlert) {
      try {
        const audioCtx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
        const now = audioCtx.currentTime;
        
        // Premium double chime note (C5 to E5)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(523.25, now); // C5
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc1.start(now);
        osc1.stop(now + 0.3);

        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5
        gain2.gain.setValueAtTime(0, now + 0.12);
        gain2.gain.linearRampToValueAtTime(0.12, now + 0.17);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.45);
      } catch (err) {
        console.warn("Audio Context blocked or not supported:", err);
      }
    }
  }, [trainingFinishedAlert]);

  const [logsOpen, setLogsOpen] = useState(false);

  const getDomainIcon = (type: DomainType) => {
    switch (type) {
      case "maintenance":
        return <Wrench className="h-4 w-4" />;
      case "demand":
        return <TrendingUp className="h-4 w-4" />;
      case "churn":
        return <Users className="h-4 w-4" />;
      case "credit-risk":
        return <ShieldAlert className="h-4 w-4" />;
    }
  };

  const getDomainColorClass = (type: DomainType) => {
    switch (type) {
      case "maintenance":
        return "text-amber-500 border-amber-500/20 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
      case "demand":
        return "text-sky-500 border-sky-500/20 bg-sky-500/5 shadow-[0_0_15px_rgba(14,165,233,0.1)]";
      case "churn":
        return "text-violet-500 border-violet-500/20 bg-violet-500/5 shadow-[0_0_15px_rgba(139,92,246,0.1)]";
      case "credit-risk":
        return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
    }
  };

  const getPulseColorClass = (type: DomainType) => {
    switch (type) {
      case "maintenance":
        return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]";
      case "demand":
        return "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]";
      case "churn":
        return "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]";
      case "credit-risk":
        return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]";
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 border-b border-border bg-background/75 backdrop-blur-md px-6 flex items-center justify-between transition-colors duration-300">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center text-zinc-950 font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)] group-hover:scale-105 transition duration-200">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground font-extrabold text-sm tracking-wider leading-none">
                SPAM SYSTEM
              </span>
              <span className="text-[9px] text-zinc-500 font-medium tracking-tight">
                Predição Multi-Domínio
              </span>
            </div>
          </Link>
        </div>

        {/* Active Domain Indicator (CA04) & Training Finished Alert (CA05) */}
        <div className="hidden md:flex items-center gap-3">
          {activeDomain ? (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold animate-in zoom-in-95 duration-300 ${getDomainColorClass(
                activeDomain
              )}`}
            >
              {/* Pulse Indicator */}
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getPulseColorClass(
                    activeDomain
                  )}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${getPulseColorClass(
                    activeDomain
                  )}`}
                />
              </span>
              <span className="flex items-center gap-1.5">
                {getDomainIcon(activeDomain)}
                {DOMAINS[activeDomain].name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/20 text-zinc-500 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-650" />
              </span>
              <span>Nenhum domínio ativo</span>
            </div>
          )}

          {trainingFinishedAlert && activeDomain && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-xs font-bold animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Treino Concluído!</span>
              <button
                onClick={dismissFinishedAlert}
                className="ml-1 hover:text-foreground text-muted-foreground transition font-sans text-[10px] font-bold"
                title="Fechar Alerta"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* User Info & Quick Switch Menu & Logs Trigger */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
            title={
              theme === "dark" 
                ? "Ativar Modo Automático (Sistema)" 
                : theme === "light" 
                ? "Ativar Modo Escuro" 
                : "Ativar Modo Claro"
            }
          >
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-violet-400 animate-in spin-in-12 duration-500" />
            ) : theme === "light" ? (
              <Sun className="h-5 w-5 text-amber-400 animate-in spin-in-12 duration-500" />
            ) : (
              <Laptop className="h-5 w-5 text-emerald-400 animate-in spin-in-12 duration-500" />
            )}
          </Button>

          {/* Alertas e Notificações (RF22) */}
          <AlertsMenu />

          {/* Audit Logs Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLogsOpen(true)}
            className="relative h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
            title="Logs de Auditoria"
          >
            <ShieldCheck className="h-5 w-5" />
          </Button>

          {/* Identificação do Usuário e Painel Expandido (RF36) */}
          {currentUser ? (
            <div className="relative group flex items-center">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/40 border border-transparent hover:border-border transition cursor-default">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground leading-none">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    {currentUser.accessProfile}
                  </span>
                </div>
              </div>

              {/* Hover Card Expandido (CA04) */}
              <div className="absolute top-full right-0 mt-2 w-72 p-4 rounded-xl bg-popover border border-border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{currentUser.fullName}</h4>
                    <p className="text-[10px] font-mono text-muted-foreground">@{currentUser.username}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Perfil de Acesso:</span>
                    <span className="font-semibold text-foreground">{currentUser.accessProfile}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Departamento:</span>
                    <span className="font-semibold text-foreground">{currentUser.department}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Último Login:</span>
                    <span className="font-semibold text-foreground">{new Date(currentUser.lastLogin).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {currentUser.profileName === "Administrador" && (
                    <Link href="/admin/usuarios" passHref legacyBehavior>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8 text-green-500 border-green-500/20 hover:bg-green-500/10 cursor-pointer"
                      >
                        <a>
                          <Users className="h-3.5 w-3.5 mr-2" />
                          Gerenciar Usuários
                        </a>
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      localStorage.setItem("spam-inactivity-test-time", "10000");
                      alert("Simulação de inatividade de 10 segundos ativada! Não interaja com a página por 10 segundos para ser desconectado.");
                      window.dispatchEvent(new Event("mousemove"));
                    }}
                    className="w-full text-[10px] h-8 text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
                  >
                    <Activity className="h-3 w-3 mr-2 animate-pulse" />
                    Simular Inatividade (10s)
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => logout()}
                    className="w-full text-xs font-bold h-8"
                  >
                    <User className="h-3.5 w-3.5 mr-2" />
                    Encerrar Sessão (Sair)
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted/40 border border-border text-xs text-muted-foreground h-8">
              <User className="h-3.5 w-3.5 opacity-60" />
              <span>Visitante</span>
            </div>
          )}

          {/* Quick Switch Dropdown (CA06 menu de atalho rápido) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1 text-xs border-border bg-background text-foreground hover:bg-muted transition"
              >
                <span>Módulos</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-popover border-border text-popover-foreground"
            >
              <DropdownMenuLabel className="text-muted-foreground text-[10px] tracking-wider uppercase font-bold">
                Atalho Rápido (CA06)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => initiateDomainSwitch("maintenance")}
                className={`gap-2 text-xs cursor-pointer ${
                  activeDomain === "maintenance" ? "text-amber-500 font-semibold" : ""
                }`}
              >
                <Wrench className="h-3.5 w-3.5 text-amber-500" />
                <span>Manutenção</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => initiateDomainSwitch("demand")}
                className={`gap-2 text-xs cursor-pointer ${
                  activeDomain === "demand" ? "text-sky-500 font-semibold" : ""
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5 text-sky-500" />
                <span>Previsão de Demanda</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => initiateDomainSwitch("churn")}
                className={`gap-2 text-xs cursor-pointer ${
                  activeDomain === "churn" ? "text-violet-500 font-semibold" : ""
                }`}
              >
                <Users className="h-3.5 w-3.5 text-violet-500" />
                <span>Retenção de Clientes</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => initiateDomainSwitch("credit-risk")}
                className={`gap-2 text-xs cursor-pointer ${
                  activeDomain === "credit-risk" ? "text-emerald-500 font-semibold" : ""
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5 text-emerald-500" />
                <span>Risco de Crédito</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link
                  href="/"
                  className="w-full flex items-center gap-2 text-xs cursor-pointer"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Painel Inicial (Reset)</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="flex items-center gap-2 text-xs cursor-pointer text-red-500 font-semibold"
              >
                <User className="h-3.5 w-3.5 text-red-500" />
                <span>Sair da Conta (Logout)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Audit Logs Sidebar Panel */}
      <AuditLogsDrawer isOpen={logsOpen} onClose={() => setLogsOpen(false)} />
    </>
  );
}
