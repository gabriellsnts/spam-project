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
} from "lucide-react";

export function Header() {
  const {
    activeDomain,
    initiateDomainSwitch,
    logs,
    userProfile,
    theme,
    toggleTheme,
    currentUser,
    logout,
  } = useDomain();

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

        {/* Active Domain Indicator (CA04) */}
        <div className="hidden md:flex items-center">
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
        </div>

        {/* User Info & Quick Switch Menu & Logs Trigger */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
            title={theme === "dark" ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400 animate-in spin-in-12 duration-500" />
            ) : (
              <Moon className="h-5 w-5 text-violet-400 animate-in spin-in-12 duration-500" />
            )}
          </Button>

          {/* Audit Logs Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLogsOpen(true)}
            className="relative h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
            title="Logs de Auditoria"
          >
            <ShieldCheck className="h-5 w-5" />
            {logs.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white shadow-sm ring-1 ring-zinc-900">
                {logs.length}
              </span>
            )}
          </Button>

          {/* User Profile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted/40 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition h-8"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground/60" />
                <span>{userProfile}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border text-popover-foreground">
              <DropdownMenuLabel className="text-muted-foreground text-[10px] tracking-wider uppercase font-bold">
                Conta do Usuário
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="text-xs">
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">{currentUser?.profileName}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">@{currentUser?.username}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* Simular Inatividade para homologação */}
              <DropdownMenuItem
                onClick={() => {
                  localStorage.setItem("spam-inactivity-test-time", "10000");
                  alert("Simulação de inatividade de 10 segundos ativada! Não interaja com a página por 10 segundos para ser desconectado.");
                  window.dispatchEvent(new Event("mousemove"));
                }}
                className="text-xs gap-2 cursor-pointer text-amber-500 hover:text-amber-400"
              >
                <Activity className="h-3.5 w-3.5 animate-pulse" />
                <span>Simular Inatividade (10s)</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-xs gap-2 cursor-pointer text-red-500 hover:text-red-400 font-bold"
              >
                <User className="h-3.5 w-3.5" />
                <span>Encerrar Sessão (Sair)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
