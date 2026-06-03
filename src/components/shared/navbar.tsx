"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDomain, DOMAINS, DomainType, useDomainColors } from "@/lib/context/domain-context";
import { Button } from "@/components/ui/button";
import { AuditLogsDrawer } from "@/components/shared/audit-logs-drawer";
import {
  Activity,
  Wrench,
  TrendingUp,
  Users,
  ShieldAlert,
  ShieldCheck,
  User,
  Sun,
  Moon,
} from "lucide-react";

export function Navbar() {
  const {
    activeDomain,
    logs,
    userProfile,
    theme,
    toggleTheme,
  } = useDomain();

  const [logsOpen, setLogsOpen] = useState(false);
  const domainColors = useDomainColors(activeDomain);

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

  return (
    <>
      <header className="w-full h-16 border-b border-border bg-background/75 backdrop-blur-md px-6 flex items-center justify-between transition-colors duration-300 relative z-30">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-zinc-950 font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)] group-hover:scale-105 transition duration-200">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground font-black text-sm tracking-wider leading-none">
                SPAM SYSTEM
              </span>
              <span className="text-[9px] text-muted-foreground font-medium tracking-tight">
                Predição Multi-Domínio
              </span>
            </div>
          </Link>
        </div>

        {/* Active Domain Badge (Dynamic chromatic color based on useDomainColors) */}
        <div className="hidden md:flex items-center">
          {activeDomain ? (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold animate-in zoom-in-95 duration-300 ${domainColors.accent}`}
            >
              {/* Pulse Indicator */}
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${domainColors.pulseClass}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${domainColors.pulseClass}`}
                />
              </span>
              <span className="flex items-center gap-1.5">
                {getDomainIcon(activeDomain)}
                {DOMAINS[activeDomain].name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-850 bg-zinc-900/10 text-muted-foreground text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600" />
              </span>
              <span>Dashboard Geral</span>
            </div>
          )}
        </div>

        {/* Action Controls & User Identity */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition"
            title={theme === "dark" ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400 animate-in spin-in-12 duration-500" />
            ) : (
              <Moon className="h-5 w-5 text-violet-400 animate-in spin-in-12 duration-500" />
            )}
          </Button>

          {/* Audit Logs Trigger Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLogsOpen(true)}
            className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition"
            title="Logs de Auditoria"
          >
            <ShieldCheck className="h-5 w-5" />
            {logs.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white shadow-sm ring-1 ring-zinc-900 animate-in zoom-in duration-300">
                {logs.length}
              </span>
            )}
          </Button>

          {/* Logged User Info (Luiz Admin) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground font-semibold">
            <User className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span>{userProfile}</span>
          </div>
        </div>
      </header>

      {/* Audit Logs Panel */}
      <AuditLogsDrawer isOpen={logsOpen} onClose={() => setLogsOpen(false)} />
    </>
  );
}
