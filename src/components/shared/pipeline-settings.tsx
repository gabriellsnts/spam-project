"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CheckCircle2, ShieldCheck, DatabaseZap, Zap, Server } from "lucide-react";
import { useDomain } from "@/lib/context/domain-context";

export function PipelineSettings() {
  const { activeDomain, showPremiumToast , t } = useDomain();

  const [schedule, setSchedule] = useState("weekly");
  const [nullStrategy, setNullStrategy] = useState("mean");
  const [autoRetrain, setAutoRetrain] = useState(true);
  const [strictValidation, setStrictValidation] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Cache Settings (RF65)
  const [cacheEnabled, setCacheEnabled] = useState(false);
  const [cacheTTL, setCacheTTL] = useState("3600");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showPremiumToast(t("validation_rules_updated") + ` ${activeDomain || "todos"}.`, "success");
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Agendamento de Retreinamento (RF68) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            {t("retraining_schedule_rf68")}
          </CardTitle>
          <CardDescription>
            {t("retraining_schedule_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-blue-500/5">
            <div className="flex flex-col space-y-1">
              <Label className="text-base font-semibold flex items-center gap-2">
                <DatabaseZap className="h-4 w-4" />
                {t("auto_ml")}
              </Label>
              <span className="text-sm text-muted-foreground">
                {t("auto_ml_desc")}
              </span>
            </div>
            <Switch checked={autoRetrain} onCheckedChange={setAutoRetrain} />
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${autoRetrain ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="space-y-2">
              <Label>{t("cron_schedule")}</Label>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t("daily_00")}</SelectItem>
                  <SelectItem value="weekly">{t("weekly_sun_02")}</SelectItem>
                  <SelectItem value="monthly">{t("monthly_1st_03")}</SelectItem>
                  <SelectItem value="drift">{t("drift_reactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("max_sampling_records")}</Label>
              <Input type="number" defaultValue={500000} step={10000} />
              <p className="text-[10px] text-muted-foreground">
                {t("limit_rows_memory")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validação de Dados de Entrada (RF77) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-500" />
            {t("data_quality_rules_rf77")}
          </CardTitle>
          <CardDescription>
            {t("data_quality_rules_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
            <div className="flex flex-col space-y-1">
              <Label className="text-base font-semibold">{t("strict_schema_mode")}</Label>
              <span className="text-sm text-muted-foreground">
                {t("strict_schema_mode_desc")}
              </span>
            </div>
            <Switch checked={strictValidation} onCheckedChange={setStrictValidation} />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("null_values_strategy")}</Label>
              <Select value={nullStrategy} onValueChange={setNullStrategy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mean">{t("fill_mean")}</SelectItem>
                  <SelectItem value="median">{t("fill_median")}</SelectItem>
                  <SelectItem value="zero">{t("fill_zero")}</SelectItem>
                  <SelectItem value="drop">{t("drop_row")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2">
              <Label>{t("null_tolerance_threshold")}</Label>
              <div className="flex items-center gap-4">
                <Input type="number" defaultValue={15} max={100} min={1} className="w-[100px]" />
                <span className="text-sm text-muted-foreground">
                  {t("null_tolerance_desc")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Inteligente (RF65) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            {t("smart_cache_rf65")}
          </CardTitle>
          <CardDescription>
            {t("smart_cache_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-amber-500/5">
            <div className="flex flex-col space-y-1">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Server className="h-4 w-4 text-amber-500" />
                {t("enable_inference_cache")}
              </Label>
              <span className="text-sm text-muted-foreground">
                {t("enable_inference_cache_desc")}
              </span>
            </div>
            <Switch checked={cacheEnabled} onCheckedChange={setCacheEnabled} />
          </div>

          <div className={`space-y-4 transition-opacity ${cacheEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="space-y-2">
              <Label>{t("cache_ttl")}</Label>
              <Select value={cacheTTL} onValueChange={setCacheTTL}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">{t("ttl_5m")}</SelectItem>
                  <SelectItem value="3600">{t("ttl_1h")}</SelectItem>
                  <SelectItem value="86400">{t("ttl_1d")}</SelectItem>
                  <SelectItem value="604800">{t("ttl_1w")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border">
              <strong>{t("eviction_strategy")}:</strong> {t("eviction_strategy_desc")}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <CheckCircle2 className="h-4 w-4 animate-pulse" /> : <CheckCircle2 className="h-4 w-4" />}
            {isSaving ? t("applying") : t("save_pipeline_settings")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
