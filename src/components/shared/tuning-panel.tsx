"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Scale, Minimize2, Check, RefreshCw } from "lucide-react";
import { useDomain } from "@/lib/context/domain-context";

export function TuningPanel() {
  const { activeDomain, showPremiumToast } = useDomain();

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

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showPremiumToast(`Ajustes salvos para o modelo de ${activeDomain || "todos"}`, "success");
    }, 800);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Painel de Ajuste Fino (Tuning)
            </CardTitle>
            <CardDescription>
              Ajuste hiperparâmetros, calibração e regularização do modelo atual.
            </CardDescription>
          </div>
          <Badge variant="outline" className="capitalize">
            {activeDomain || "todos"} Model
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calibration" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="calibration" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Calibração (RF61)</span>
            </TabsTrigger>
            <TabsTrigger value="hyperparameters" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Hiperparâmetros (RF62)</span>
            </TabsTrigger>
            <TabsTrigger value="regularization" className="flex items-center gap-2">
              <Minimize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Regularização (RF72)</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba de Calibração */}
          <TabsContent value="calibration" className="space-y-6 animate-in fade-in duration-300 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Limiar de Decisão (Threshold)</Label>
                <span className="text-sm font-mono text-muted-foreground">{(calibrationThreshold[0] / 100).toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ajuste o limiar para favorecer Recall (menor limiar) ou Precision (maior limiar).
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
                <span>Favorece Recall (Falsos Positivos sobem)</span>
                <span>Ponto de Equilíbrio</span>
                <span>Favorece Precisão (Falsos Negativos sobem)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Penalidade Falso Positivo (FP)</Label>
                <Input type="number" defaultValue={1} min={1} max={10} />
              </div>
              <div className="space-y-2">
                <Label>Penalidade Falso Negativo (FN)</Label>
                <Input type="number" defaultValue={5} min={1} max={10} />
                <p className="text-[10px] text-muted-foreground">
                  Para o domínio {activeDomain || "atual"}, geralmente um FN é mais custoso.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Aba de Hiperparâmetros */}
          <TabsContent value="hyperparameters" className="space-y-6 animate-in fade-in duration-300 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Taxa de Aprendizado (Learning Rate)</Label>
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
                  <Label>Profundidade Máxima (Max Depth)</Label>
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
                  <Label>Número de Estimadores (N-Estimators)</Label>
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
                  <Label>Balanço L1 / L2 (Elastic Net)</Label>
                  <span className="text-sm font-mono text-muted-foreground">
                    L1: {regularization.l1Ratio[0]}% / L2: {100 - regularization.l1Ratio[0]}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Define a proporção entre regularização Lasso (L1) e Ridge (L2).
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
                  <span>Pura L2 (Ridge)</span>
                  <span>Pura L1 (Lasso)</span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <Label>Força de Regularização (C / Inverse Alpha)</Label>
                  <span className="text-xs font-mono">{regularization.cValue}</span>
                </div>
                <Input 
                  type="number" 
                  step={0.1} 
                  value={regularization.cValue} 
                  onChange={(e) => setRegularization({...regularization, cValue: parseFloat(e.target.value)})}
                />
                <p className="text-[10px] text-muted-foreground">
                  Valores menores aplicam maior regularização (maior penalidade para coeficientes grandes).
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Restaurar Padrões
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 min-w-[120px]">
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {isSaving ? "Aplicando..." : "Aplicar Ajustes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
