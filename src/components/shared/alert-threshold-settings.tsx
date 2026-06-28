"use client";
import React, { useState, useEffect } from "react";
import { useDomain, DomainType } from "@/lib/context/domain-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveAlertItem {
  id: string;
  name: string;
  value: number;
  threshold: number;
  details?: string;
}

interface AlertThresholdSettingsProps {
  domain: DomainType;
  title?: string;
  min: number;
  max: number;
  step?: number;
  unit: string;
  totalCount: number;
  calculateCriticalCount: (threshold: number) => number;
  activeAlerts: ActiveAlertItem[];
}

export function AlertThresholdSettings({
  domain,
  title,
  min,
  max,
  step = 1,
  unit,
  totalCount,
  calculateCriticalCount,
  activeAlerts,
}: AlertThresholdSettingsProps) {
  const { alertThresholds, updateAlertThreshold, resetAlertThreshold, updateDashboardAlertCount, currentUser, t } = useDomain();

  const appliedValue = alertThresholds[domain];
  const [draftValue, setDraftValue] = useState<number>(appliedValue);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const canEdit = !currentUser || currentUser.accessProfile === "Super Admin";

  const resolvedTitle = title || t("threshold_config_title");

  // Sync draft value when applied value changes from context (e.g. on load or reset)
  useEffect(() => {
    setDraftValue(appliedValue);
  }, [appliedValue]);

  // Synchronize dynamic alert count to Consolidated Dashboard
  useEffect(() => {
    updateDashboardAlertCount(domain, activeAlerts.length);
  }, [activeAlerts.length, domain, updateDashboardAlertCount]);

  const draftCriticalCount = calculateCriticalCount(draftValue);

  const handleApply = () => {
    updateAlertThreshold(domain, draftValue);
  };

  const handleResetClick = () => {
    setShowRestoreConfirm(true);
  };

  const handleConfirmReset = () => {
    resetAlertThreshold(domain);
    setShowRestoreConfirm(false);
  };

  const handleCancelReset = () => {
    setShowRestoreConfirm(false);
  };

  const hasChanges = draftValue !== appliedValue;

  // Domain specific styling (colors, glow, buttons)
  const getDomainStyles = () => {
    switch (domain) {
      case "maintenance":
        return {
          accent: "text-amber-500",
          borderGlow: "border-amber-500/30 dark:border-amber-500/20 bg-amber-500/[0.01]",
          btnApply: "bg-amber-600 hover:bg-amber-500 text-white",
          btnReset: "border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50",
          badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        };
      case "demand":
        return {
          accent: "text-sky-500",
          borderGlow: "border-sky-500/30 dark:border-sky-500/20 bg-sky-500/[0.01]",
          btnApply: "bg-sky-600 hover:bg-sky-500 text-white",
          btnReset: "border-sky-500/30 text-sky-500 hover:bg-sky-500/10 hover:border-sky-500/50",
          badge: "bg-sky-500/10 text-sky-500 border-sky-500/20",
        };
      case "churn":
        return {
          accent: "text-violet-500",
          borderGlow: "border-violet-500/30 dark:border-violet-500/20 bg-violet-500/[0.01]",
          btnApply: "bg-violet-600 hover:bg-violet-500 text-white",
          btnReset: "border-violet-500/30 text-violet-500 hover:bg-violet-500/10 hover:border-violet-500/50",
          badge: "bg-violet-500/10 text-violet-500 border-violet-500/20",
        };
      case "credit-risk":
        return {
          accent: "text-emerald-500",
          borderGlow: "border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/[0.01]",
          btnApply: "bg-emerald-600 hover:bg-emerald-500 text-white",
          btnReset: "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/50",
          badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        };
    }
  };

  const styles = getDomainStyles();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-6">
      {/* Configuration Card */}
      <Card className={`lg:col-span-2 bg-card border-border transition-colors duration-300 ${styles.borderGlow}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <AlertTriangle className={`h-4 w-4 ${styles.accent}`} />
            {resolvedTitle}
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground">
            {t("threshold_config_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Slider and Number Inputs */}
          <div className="flex flex-col sm:flex-row items-center gap-4.5 bg-zinc-950/20 p-3 rounded-lg border border-border/50">
            {/* Slider */}
            <div className="flex-1 w-full flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-semibold w-6">{min}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={draftValue}
                onChange={(e) => setDraftValue(Number(e.target.value))}
                disabled={!canEdit}
                className={cn("flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-current text-primary", !canEdit && "opacity-50 cursor-not-allowed")}
                style={{
                  color: domain === "maintenance" ? "var(--amber-500, #f59e0b)" : domain === "demand" ? "#0ea5e9" : domain === "churn" ? "#8b5cf6" : "#10b981"
                }}
              />
              <span className="text-[10px] text-muted-foreground font-semibold w-6 text-right">{max}</span>
            </div>

            {/* Numeric Input */}
            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={draftValue}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= min && val <= max) {
                    setDraftValue(val);
                  } else if (e.target.value === "") {
                    // Allow temporary empty input while typing
                  }
                }}
                disabled={!canEdit}
                className={cn("w-16 bg-background border border-border text-foreground font-mono text-center text-xs rounded px-1.5 py-1 focus:ring-1 focus:outline-none", !canEdit && "opacity-50 cursor-not-allowed bg-muted")}
              />
              <span className="text-xs text-muted-foreground font-semibold">{unit}</span>
            </div>
          </div>

          {/* Impact Preview Section */}
          <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs leading-relaxed">
            <div className="space-y-0.5 flex-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">{t("impact_preview_realtime")}</span>
              <p className="text-foreground/90 font-medium">
                {t("threshold_active_summary")} <strong className={styles.accent}>{draftValue} {unit}</strong>,{" "}
                <strong className={styles.accent}>{draftCriticalCount} de {totalCount} registros</strong> {t("threshold_marked_critical")}
              </p>
              <span className="text-[10px] text-muted-foreground block">
                {t("currently_active_threshold")} <strong className="text-foreground">{appliedValue} {unit}</strong> (com {activeAlerts.length} {t("active_alerts_count")}).
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {showRestoreConfirm ? (
                <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/25 p-1 rounded-md animate-in fade-in slide-in-from-right-2">
                  <span className="text-[9px] text-rose-500 font-bold px-1">{t("restore_defaults_question")}</span>
                  <Button
                    size="sm"
                    onClick={handleConfirmReset}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold h-6 text-[9px] px-2"
                  >
                    {t("yes")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelReset}
                    className="h-6 text-[9px] px-2 text-muted-foreground"
                  >
                    {t("no")}
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={handleResetClick}
                    variant="outline"
                    disabled={!canEdit}
                    className={`h-8 text-[10px] font-bold font-sans gap-1 ${styles.btnReset} disabled:opacity-40 disabled:cursor-not-allowed`}
                    title={canEdit ? "Restaurar limiar de alerta para o padrão de fábrica" : "Sem permissão"}
                  >
                    <RotateCcw className="h-3 w-3" />
                    {t("default")}
                  </Button>

                  <Button
                    onClick={handleApply}
                    disabled={!hasChanges || !canEdit}
                    className={`h-8 text-[10px] font-bold font-sans ${styles.btnApply} disabled:opacity-40 disabled:cursor-not-allowed`}
                    title={canEdit ? "" : "Sem permissão para alterar"}
                  >
                    {t("apply")}
                  </Button>
                </>
              )}
            </div>
          </div>
          {!canEdit && (
            <div className="text-[10px] text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/20 p-2 rounded flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              {t("admin_only_threshold")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visual Alerts Panel */}
      <Card className="bg-card border-border transition-colors duration-300 flex flex-col h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-rose-500" />
            {t("active_critical_alerts")}
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground">
            {t("active_critical_alerts_desc")} ({appliedValue} {unit}).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto max-h-[160px] p-4.5 pt-1.5 space-y-2 select-none">
          {activeAlerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-3 text-muted-foreground py-6 border border-dashed border-border rounded-lg bg-zinc-950/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-1.5" />
              <p className="text-[10px] font-bold">{t("no_critical_alerts")}</p>
              <p className="text-[9px] text-muted-foreground/80">{t("all_items_safe")}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-2 rounded border border-rose-500/20 bg-rose-500/[0.02] text-[10px] flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="flex justify-between font-bold text-foreground">
                    <span className="truncate pr-1.5">{alert.name}</span>
                    <span className="font-mono text-[9px] text-muted-foreground shrink-0">{alert.id}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                    <span>
                      {t("value_label")} <strong className="text-rose-500 font-mono">{alert.value} {unit}</strong>
                    </span>
                    <span>
                      {t("threshold_label")} <strong className="text-foreground/80 font-mono">{alert.threshold} {unit}</strong>
                    </span>
                  </div>
                  {alert.details && (
                    <div className="text-[8px] text-muted-foreground/75 italic mt-0.5 border-t border-rose-500/10 pt-0.5">
                      {alert.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
