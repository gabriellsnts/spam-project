"use client";

import React, { useState, useEffect } from "react";
import { useDomain, DomainType, SchedulingConfig } from "@/lib/context/domain-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Play, Pause, Trash2, Save, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchedulingCardProps {
  domain: DomainType;
}

export function SchedulingCard({ domain }: SchedulingCardProps) {
  const { schedules, saveSchedule, deleteSchedule, runScheduledTrigger, t } = useDomain();
  const schedule = schedules[domain];

  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [specificDay, setSpecificDay] = useState<number>(1);

  // Sync state with active schedule on load or schedule change
  useEffect(() => {
    if (schedule) {
      setFrequency(schedule.frequency);
      setStartTime(schedule.startTime);
      if (schedule.specificDay !== undefined) {
        setSpecificDay(schedule.specificDay);
      }
    }
  }, [schedule]);

  const handleSave = () => {
    saveSchedule(domain, {
      frequency,
      startTime,
      specificDay: frequency !== "daily" ? specificDay : undefined,
      isActive: true
    });
  };

  const handleToggleActive = () => {
    if (!schedule) return;
    saveSchedule(domain, {
      frequency: schedule.frequency,
      startTime: schedule.startTime,
      specificDay: schedule.specificDay,
      isActive: !schedule.isActive
    });
  };

  const handleDelete = () => {
    deleteSchedule(domain);
  };

  const handleAdvanceTime = () => {
    runScheduledTrigger(domain);
  };

  // Domain specific styles
  const getDomainStyles = () => {
    switch (domain) {
      case "maintenance":
        return {
          accent: "text-amber-500",
          border: "border-amber-500/20",
          bg: "bg-amber-500/[0.02]",
          button: "bg-amber-600 hover:bg-amber-500 text-white",
          btnOutline: "border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50",
          glow: "shadow-[0_0_15px_rgba(245,158,11,0.05)]",
        };
      case "demand":
        return {
          accent: "text-sky-500",
          border: "border-sky-500/20",
          bg: "bg-sky-500/[0.02]",
          button: "bg-sky-600 hover:bg-sky-500 text-white",
          btnOutline: "border-sky-500/30 text-sky-500 hover:bg-sky-500/10 hover:border-sky-500/50",
          glow: "shadow-[0_0_15px_rgba(14,165,233,0.05)]",
        };
      case "churn":
        return {
          accent: "text-violet-500",
          border: "border-violet-500/20",
          bg: "bg-violet-500/[0.02]",
          button: "bg-violet-600 hover:bg-violet-500 text-white",
          btnOutline: "border-violet-500/30 text-violet-500 hover:bg-violet-500/10 hover:border-violet-500/50",
          glow: "shadow-[0_0_15px_rgba(139,92,246,0.05)]",
        };
      case "credit-risk":
        return {
          accent: "text-emerald-500",
          border: "border-emerald-500/20",
          bg: "bg-emerald-500/[0.02]",
          button: "bg-emerald-600 hover:bg-emerald-500 text-white",
          btnOutline: "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/50",
          glow: "shadow-[0_0_15px_rgba(16,185,129,0.05)]",
        };
      default:
        return {
          accent: "text-primary",
          border: "border-border",
          bg: "bg-card",
          button: "bg-primary text-primary-foreground hover:bg-primary/95",
          btnOutline: "border-input bg-background hover:bg-accent",
          glow: "",
        };
    }
  };

  const styles = getDomainStyles();

  // Translate Day of Week
  const getDayOfWeekName = (day: number) => {
    const days: Record<number, string> = {
      1: t("monday"),
      2: t("tuesday"),
      3: t("wednesday"),
      4: t("thursday"),
      5: t("friday"),
      6: t("saturday"),
      7: t("sunday")
    };
    return days[day] || "";
  };

  // Generate Summary Text
  const getScheduleSummary = (cfg: SchedulingConfig) => {
    const freqLabel = cfg.frequency === "daily" 
      ? t("daily") 
      : cfg.frequency === "weekly" 
      ? `${t("weekly")} (${getDayOfWeekName(cfg.specificDay || 1)})`
      : `${t("monthly")} (${t("day_short")} ${cfg.specificDay || 1})`;
    
    return `${freqLabel} às ${cfg.startTime}`;
  };

  return (
    <Card className={cn("bg-card border-border transition-all duration-300 relative overflow-hidden", styles.border, styles.glow)}>
      <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r", 
        domain === "maintenance" ? "from-amber-600 to-amber-500" :
        domain === "demand" ? "from-sky-600 to-sky-500" :
        domain === "churn" ? "from-violet-600 to-violet-500" : "from-emerald-600 to-emerald-500"
      )} />
      
      <CardHeader>
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <Clock className={cn("h-4 w-4", styles.accent)} />
          {t("scheduling_title")}
        </CardTitle>
        <CardDescription className="text-[11px] text-muted-foreground">
          {t("scheduling_desc")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Schedule Overview */}
        <div className={cn("p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4", styles.bg, styles.border)}>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {t("active_schedule_summary")}
            </span>
            <p className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {schedule ? getScheduleSummary(schedule) : t("no_active_schedule")}
            </p>
            {schedule && (
              <span className={cn("inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-black uppercase mt-1.5 border", 
                schedule.isActive 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/25"
              )}>
                {schedule.isActive ? t("status_active") : t("status_paused")}
              </span>
            )}
          </div>

          {schedule && (
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToggleActive} 
                className={cn("text-[10px] font-bold h-8 gap-1 border", styles.btnOutline)}
              >
                {schedule.isActive ? (
                  <>
                    <Pause className="h-3 w-3" />
                    {t("pause")}
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    {t("resume")}
                  </>
                )}
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete} 
                className="text-[10px] font-bold h-8 gap-1 bg-red-650 hover:bg-red-550"
              >
                <Trash2 className="h-3 w-3" />
                {t("delete")}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdvanceTime}
                className="text-[10px] font-black h-8 gap-1.5 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-indigo-500/30 text-indigo-400 hover:text-indigo-350 hover:border-indigo-500/50"
              >
                <Sparkles className="h-3 w-3 animate-pulse text-indigo-400" />
                {t("advance_time_demo")}
              </Button>
            </div>
          )}
        </div>

        {/* Configuration Form */}
        <div className="space-y-4 pt-2 border-t border-border/40">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Frequency selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">{t("frequency")}</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as "daily" | "weekly" | "monthly")}
                className="w-full bg-zinc-900/90 dark:bg-zinc-950/80 border border-border/80 rounded-lg p-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/60 transition-all"
              >
                <option value="daily">{t("daily")}</option>
                <option value="weekly">{t("weekly")}</option>
                <option value="monthly">{t("monthly")}</option>
              </select>
            </div>

            {/* Start Time input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">{t("start_time")}</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-900/90 dark:bg-zinc-950/80 border border-border/80 rounded-lg p-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/60 transition-all"
              />
            </div>

            {/* Specific Day selector */}
            {frequency !== "daily" && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">
                  {frequency === "weekly" ? t("specific_day_week") : t("specific_day_month")}
                </label>
                
                {frequency === "weekly" ? (
                  <select
                    value={specificDay}
                    onChange={(e) => setSpecificDay(Number(e.target.value))}
                    className="w-full bg-zinc-900/90 dark:bg-zinc-950/80 border border-border/80 rounded-lg p-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/60 transition-all"
                  >
                    <option value={1}>{t("monday")}</option>
                    <option value={2}>{t("tuesday")}</option>
                    <option value={3}>{t("wednesday")}</option>
                    <option value={4}>{t("thursday")}</option>
                    <option value={5}>{t("friday")}</option>
                    <option value={6}>{t("saturday")}</option>
                    <option value={7}>{t("sunday")}</option>
                  </select>
                ) : (
                  <select
                    value={specificDay}
                    onChange={(e) => setSpecificDay(Number(e.target.value))}
                    className="w-full bg-zinc-900/90 dark:bg-zinc-950/80 border border-border/80 rounded-lg p-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/60 transition-all"
                  >
                    {Array.from({ length: 31 }).map((_, idx) => (
                      <option key={idx} value={idx + 1}>
                        {t("day_short")} {idx + 1}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              className={cn("text-xs font-bold gap-1.5", styles.button)}
            >
              <Save className="h-3.5 w-3.5" />
              {t("save_schedule")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
