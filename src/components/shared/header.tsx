"use client";

import React from "react";
import Link from "next/link";
import { useDomain, DomainType } from "@/lib/context/domain-context";
import { Button } from "@/components/ui/button";
import { UtilityDrawer } from "@/components/shared/utility-drawer";
import {
  Activity,
  Wrench,
  TrendingUp,
  Users,
  ShieldAlert,
  Bell,
  Menu,
  Globe,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const {
    activeDomain,
    trainingFinishedAlert,
    dismissFinishedAlert,
    alerts,
    activeUtilityPanel,
    setActiveUtilityPanel,
    t,
    language,
    setLanguage,
    getDomainName
  } = useDomain();

  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);

  const unrecognizedAlertsCount = alerts.filter((a) => !a.recognized).length;

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
                {t("ui_spam_system_831")}</span>
              <span className="text-[9px] text-zinc-500 font-medium tracking-tight">
                {t("multi_domain_prediction")}
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
                {getDomainName(activeDomain)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/20 text-zinc-500 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-650" />
              </span>
              <span>{t("no_domain")}</span>
            </div>
          )}

          {trainingFinishedAlert && activeDomain && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-xs font-bold animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{t("training_finished")}</span>
              <button
                onClick={dismissFinishedAlert}
                className="ml-1 hover:text-foreground text-muted-foreground transition font-sans text-[10px] font-bold"
                title={t("close_alert")}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Quick Menu Trigger (Limpeza Radical - Sidebar Unificada) */}
        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown (RF54 CA01) */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="h-9 gap-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition px-2 py-0.5 rounded-lg flex items-center justify-center align-middle"
              title={language === "en" ? "Change Language" : language === "es" ? "Cambiar Idioma" : "Alterar Idioma"}
            >
              <Globe className="h-4.5 w-4.5" />
              <span className="text-[10px] uppercase font-black tracking-wider hidden sm:inline">{language}</span>
              <ChevronDown className={cn("h-3 w-3 opacity-60 transition-transform duration-200 hidden sm:inline", langDropdownOpen && "rotate-180")} />
            </Button>
            {langDropdownOpen && (
              <>
                {/* Backdrop overlay to close on click outside */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setLangDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-32 bg-background border border-border/80 rounded-xl shadow-xl p-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => {
                      setLanguage("pt");
                      setLangDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                      language === "pt" ? "bg-emerald-500/10 text-emerald-550" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="text-sm">🇧🇷</span>
                    <span>Português (BR)</span>
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("en");
                      setLangDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                      language === "en" ? "bg-emerald-500/10 text-emerald-550" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="text-sm">🇺🇸</span>
                    <span>English (US)</span>
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("es");
                      setLangDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                      language === "es" ? "bg-emerald-500/10 text-emerald-550" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="text-sm">🇪🇸</span>
                    <span>Español</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notification Quick Access */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveUtilityPanel(activeUtilityPanel === "alerts" ? null : "alerts")}
            className="relative h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
            title={t("system_alerts")}
          >
            <Bell className="h-5 w-5" />
            {unrecognizedAlertsCount > 0 && (
              <span className={cn(
                "absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white shadow-sm ring-1 ring-zinc-900 transition-all",
                unrecognizedAlertsCount > 9 
                  ? "bg-rose-500/70 text-zinc-100" 
                  : "bg-rose-650/90 text-white"
              )}>
                {unrecognizedAlertsCount}
              </span>
            )}
          </Button>

          {/* Unified Sidebar Hamburger Menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveUtilityPanel(activeUtilityPanel === "menu" ? null : "menu")}
            className="h-9 w-9 text-zinc-400 hover:text-foreground hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
            title={t("main_menu")}
            data-tutorial-target={activeUtilityPanel !== "menu" && activeDomain !== "credit-risk" ? "sidebar-credit-risk" : undefined}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Unified Utility Panel (RF22) */}
      <UtilityDrawer />
    </>
  );
}
