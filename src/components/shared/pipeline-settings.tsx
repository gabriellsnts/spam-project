"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CheckCircle2, ShieldCheck, DatabaseZap } from "lucide-react";
import { useDomain } from "@/lib/context/domain-context";

export function PipelineSettings() {
  const { activeDomain, showPremiumToast } = useDomain();

  const [schedule, setSchedule] = useState("weekly");
  const [nullStrategy, setNullStrategy] = useState("mean");
  const [autoRetrain, setAutoRetrain] = useState(true);
  const [strictValidation, setStrictValidation] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showPremiumToast(`As regras de validação e agendamento para ${activeDomain || "todos"} foram atualizadas.`, "success");
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Agendamento de Retreinamento (RF68) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Agendamento de Retreinamento (RF68)
          </CardTitle>
          <CardDescription>
            Configure a janela de tempo em que o backend executará jobs de treinamento automático.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-blue-500/5">
            <div className="flex flex-col space-y-1">
              <Label className="text-base font-semibold flex items-center gap-2">
                <DatabaseZap className="h-4 w-4" />
                Retreinamento Automático (Auto-ML)
              </Label>
              <span className="text-sm text-muted-foreground">
                Permitir que o pipeline busque novos dados no Data Warehouse e treine um novo modelo.
              </span>
            </div>
            <Switch checked={autoRetrain} onCheckedChange={setAutoRetrain} />
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${autoRetrain ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="space-y-2">
              <Label>Frequência (Cron Schedule)</Label>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário (00:00)</SelectItem>
                  <SelectItem value="weekly">Semanal (Domingo 02:00)</SelectItem>
                  <SelectItem value="monthly">Mensal (Dia 1 03:00)</SelectItem>
                  <SelectItem value="drift">Baseado em Drift (Reativo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amostragem Máxima (Registros)</Label>
              <Input type="number" defaultValue={500000} step={10000} />
              <p className="text-[10px] text-muted-foreground">
                Limite de linhas puxadas do banco para evitar out-of-memory.
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
            Regras de Qualidade de Dados (RF77)
          </CardTitle>
          <CardDescription>
            Configurações do pipeline de pré-processamento e sanitização (Data Cleaning) antes da inferência.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
            <div className="flex flex-col space-y-1">
              <Label className="text-base font-semibold">Modo Estrito de Schema</Label>
              <span className="text-sm text-muted-foreground">
                Rejeitar lotes inteiros caso uma única coluna obrigatória não esteja presente.
              </span>
            </div>
            <Switch checked={strictValidation} onCheckedChange={setStrictValidation} />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Estratégia para Valores Nulos (Missing Values)</Label>
              <Select value={nullStrategy} onValueChange={setNullStrategy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mean">Preencher numéricos com a Média (Mean)</SelectItem>
                  <SelectItem value="median">Preencher numéricos com a Mediana (Median)</SelectItem>
                  <SelectItem value="zero">Preencher com Zero</SelectItem>
                  <SelectItem value="drop">Descartar a linha (Drop Row)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Limiar de Tolerância de Nulos (%)</Label>
              <div className="flex items-center gap-4">
                <Input type="number" defaultValue={15} max={100} min={1} className="w-[100px]" />
                <span className="text-sm text-muted-foreground">
                  Se uma coluna tiver mais que esse % de nulos, abortar o pipeline.
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <CheckCircle2 className="h-4 w-4 animate-pulse" /> : <CheckCircle2 className="h-4 w-4" />}
            {isSaving ? "Aplicando..." : "Salvar Configurações do Pipeline"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
