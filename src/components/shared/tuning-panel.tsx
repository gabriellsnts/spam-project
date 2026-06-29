"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Scale, Minimize2, Check, RefreshCw, Wand2, Layers, Network, Info } from "lucide-react";
import { useDomain } from "@/lib/context/domain-context";
import { Switch } from "@/components/ui/switch";

export function TuningPanel() {
  const { activeDomain, showPremiumToast , t } = useDomain();

  // Estados dos formulários (mock)
  const [isSaving, setIsSaving] = useState(false);
  const [calibrationThreshold, setCalibrationThreshold] = useState([50]);
  const [hyperParams, setHyperParams] = useState({
    learningRate: 0.01,
    maxDepth: 6,
    nEstimators: 100,
  });
  const [regularization, setRegularization] = useState({
    l1Ratio: [10],
    cValue: 1.0,
  });
  
  // Ensemble State (RF87)
  const [ensembleEnabled, setEnsembleEnabled] = useState(false);
  const [ensembleModels, setEnsembleModels] = useState({
    rf: true,
    xgb: false,
    lr: true,
    nn: false
  });

  const handleAutoTune = () => {
    // RF58 - Auto-Tuner
    setHyperParams({
      learningRate: 0.005,
      maxDepth: 12,
      nEstimators: 250,
    });
    setCalibrationThreshold([45]);
    setRegularization({ l1Ratio: [30], cValue: 0.5 });
    showPremiumToast(t("auto_tune_success"), "success");
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showPremiumToast(t("settings_saved_model") + ` ${activeDomain || "todos"}`, "success");
    }, 800);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              {t("tuning_panel")}
            </CardTitle>
            <CardDescription>
              {t("tuning_panel_desc")}
            </CardDescription>
          </div>
          <Badge variant="outline" className="capitalize">
            {activeDomain || "todos"} Model
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calibration" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="calibration" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">{t("calibration_rf61")}</span>
            </TabsTrigger>
            <TabsTrigger value="hyperparameters" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">{t("hyperparameters_rf62")}</span>
            </TabsTrigger>
            <TabsTrigger value="regularization" className="flex items-center gap-2">
              <Minimize2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t("regularization_rf72")}</span>
            </TabsTrigger>
            <TabsTrigger value="ensemble" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">{t("ensemble_rf87")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba de Calibração */}
          <TabsContent value="calibration" className="space-y-6 animate-in fade-in duration-300 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">{t("decision_threshold")}</Label>
                <span className="text-sm font-mono text-muted-foreground">{(calibrationThreshold[0] / 100).toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("adjust_threshold_desc")}
              </p>
              <div className="pt-4">
                <Slider 
                  value={calibrationThreshold} 
                  onValueChange={setCalibrationThreshold} 
                  max={100} 
                  step={1} 
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{t("favors_recall")}</span>
                <span>{t("balance_point")}</span>
                <span>{t("favors_precision")}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>{t("penalty_fp")}</Label>
                <Input type="number" defaultValue={1} min={1} max={10} />
              </div>
              <div className="space-y-2">
                <Label>{t("penalty_fn")}</Label>
                <Input type="number" defaultValue={5} min={1} max={10} />
                <p className="text-[10px] text-muted-foreground">
                  {t("fn_more_costly", { domain: activeDomain || "atual" })}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Aba de Hiperparâmetros */}
          <TabsContent value="hyperparameters" className="space-y-6 animate-in fade-in duration-300 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{t("learning_rate")}</Label>
                  <span className="text-xs font-mono">{hyperParams.learningRate}</span>
                </div>
                <Input 
                  type="number" 
                  step={0.001} 
                  value={hyperParams.learningRate} 
                  onChange={(e) => setHyperParams({...hyperParams, learningRate: parseFloat(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{t("max_depth")}</Label>
                  <span className="text-xs font-mono">{hyperParams.maxDepth}</span>
                </div>
                <Slider 
                  value={[hyperParams.maxDepth]} 
                  onValueChange={(v) => setHyperParams({...hyperParams, maxDepth: v[0]})} 
                  max={20} 
                  min={1}
                  step={1} 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{t("n_estimators")}</Label>
                  <span className="text-xs font-mono">{hyperParams.nEstimators}</span>
                </div>
                <Input 
                  type="number" 
                  step={10} 
                  value={hyperParams.nEstimators} 
                  onChange={(e) => setHyperParams({...hyperParams, nEstimators: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </TabsContent>

          {/* Aba de Regularização */}
          <TabsContent value="regularization" className="space-y-6 animate-in fade-in duration-300 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>{t("elastic_net_balance")}</Label>
                  <span className="text-sm font-mono text-muted-foreground">
                    L1: {regularization.l1Ratio[0]}% / L2: {100 - regularization.l1Ratio[0]}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {t("regularization_proportion")}
                </p>
                <div className="pt-2">
                  <Slider 
                    value={regularization.l1Ratio} 
                    onValueChange={(v) => setRegularization({...regularization, l1Ratio: v})} 
                    max={100} 
                    step={1} 
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{t("pure_l2")}</span>
                  <span>{t("pure_l1")}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <Label>{t("regularization_strength")}</Label>
                  <span className="text-xs font-mono">{regularization.cValue}</span>
                </div>
                <Input 
                  type="number" 
                  step={0.1} 
                  value={regularization.cValue} 
                  onChange={(e) => setRegularization({...regularization, cValue: parseFloat(e.target.value)})}
                />
                <p className="text-[10px] text-muted-foreground">
                  {t("lower_values_regularization")}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Aba de Ensemble (RF87) */}
          <TabsContent value="ensemble" className="space-y-6 animate-in fade-in duration-300 pt-2">
            <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-base font-bold flex items-center gap-2">
                  <Network className="h-4 w-4 text-emerald-500" />
                  {t("enable_ensemble")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("ensemble_desc")}
                </p>
              </div>
              <Switch checked={ensembleEnabled} onCheckedChange={setEnsembleEnabled} />
            </div>

            {ensembleEnabled && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Random Forest */}
                  <div className={`p-3 border rounded-lg flex items-center justify-between transition-colors ${ensembleModels.rf ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-background'}`}>
                    <div className="space-y-1">
                      <Label className="font-semibold text-xs">Random Forest</Label>
                      <p className="text-[9px] text-muted-foreground">{t("main_base_model")}</p>
                    </div>
                    <Switch checked={ensembleModels.rf} onCheckedChange={(v) => setEnsembleModels({...ensembleModels, rf: v})} />
                  </div>
                  {/* XGBoost */}
                  <div className={`p-3 border rounded-lg flex items-center justify-between transition-colors ${ensembleModels.xgb ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-background'}`}>
                    <div className="space-y-1">
                      <Label className="font-semibold text-xs">XGBoost</Label>
                      <p className="text-[9px] text-muted-foreground">{t("gradient_boosting")}</p>
                    </div>
                    <Switch checked={ensembleModels.xgb} onCheckedChange={(v) => setEnsembleModels({...ensembleModels, xgb: v})} />
                  </div>
                  {/* Regressão Logística */}
                  <div className={`p-3 border rounded-lg flex items-center justify-between transition-colors ${ensembleModels.lr ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-background'}`}>
                    <div className="space-y-1">
                      <Label className="font-semibold text-xs">{t("logistic_regression")}</Label>
                      <p className="text-[9px] text-muted-foreground">{t("classic_linear_model")}</p>
                    </div>
                    <Switch checked={ensembleModels.lr} onCheckedChange={(v) => setEnsembleModels({...ensembleModels, lr: v})} />
                  </div>
                  {/* Redes Neurais */}
                  <div className={`p-3 border rounded-lg flex items-center justify-between transition-colors ${ensembleModels.nn ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-background'}`}>
                    <div className="space-y-1">
                      <Label className="font-semibold text-xs">Deep Neural Network</Label>
                      <p className="text-[9px] text-muted-foreground">MLP 3 Layers</p>
                    </div>
                    <Switch checked={ensembleModels.nn} onCheckedChange={(v) => setEnsembleModels({...ensembleModels, nn: v})} />
                  </div>
                </div>

                <div className="text-[10px] text-blue-500 bg-blue-500/10 p-2.5 rounded-lg flex items-start gap-2 border border-blue-500/20">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <p>
                    {t("ensemble_cost_warning")}
                    <strong> {(Object.values(ensembleModels).filter(Boolean).length * 1.2).toFixed(1)}x</strong>.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t pt-4">
        <Button onClick={handleAutoTune} variant="secondary" className="gap-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20 border font-bold">
          <Wand2 className="h-4 w-4" />
          {t("auto_tuner_rf58")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t("restore")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 min-w-[120px]">
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {isSaving ? t("applying") : t("apply_settings")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
