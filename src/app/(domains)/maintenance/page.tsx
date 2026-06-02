"use client";

import React, { useState } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { Wrench, Settings, AlertTriangle, BarChart3, Radio } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  const { addLog } = useDomain();
  const [machines, setMachines] = useState([
    { id: "M01", name: "Torno CNC 01", status: "ok", temp: 58, vibration: 1.2, oee: 88 },
    { id: "M02", name: "Braço Robotizado A", status: "ok", temp: 62, vibration: 2.1, oee: 84 },
    { id: "M03", name: "Esteira Transportadora", status: "ok", temp: 45, vibration: 0.8, oee: 91 },
    { id: "M04", name: "Prensa Hidráulica 04", status: "warning", temp: 78, vibration: 4.8, oee: 73 },
  ]);
  const [simulationActive, setSimulationActive] = useState(false);

  const triggerAnomalySimulation = () => {
    setSimulationActive(true);
    setMachines((prev) =>
      prev.map((m) =>
        m.id === "M01"
          ? { ...m, status: "critical", temp: 92, vibration: 8.5, oee: 45 }
          : m
      )
    );
    addLog("Simulação de anomalia crítica iniciada: Vibração excessiva no Torno CNC 01.");
  };

  const resetSimulation = () => {
    setSimulationActive(false);
    setMachines((prev) =>
      prev.map((m) =>
        m.id === "M01"
          ? { ...m, status: "ok", temp: 58, vibration: 1.2, oee: 88 }
          : m
      )
    );
    addLog("Simulação finalizada. Retorno das máquinas ao estado operacional estável.");
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-md relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/5 blur-3xl rounded-full" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest">
            <Radio className="h-4 w-4 animate-pulse" />
            Módulo de Manutenção Preditiva (Ativo)
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Análise de Vibração e Falha de Máquinas
          </h2>
          <p className="text-muted-foreground text-xs">
            Monitoramento térmico e estatísticas OEE integradas em tempo real com sensor IoT simulado.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {simulationActive ? (
            <Button
              onClick={resetSimulation}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              Resetar Sensores
            </Button>
          ) : (
            <Button
              onClick={triggerAnomalySimulation}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold gap-1.5"
            >
              <AlertTriangle className="h-4 w-4" />
              Simular Anomalia (Vibração)
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              OEE Médio Operacional
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">84.0%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Dentro do limite aceitável (&gt;80%)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Disponibilidade
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">92.4%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Tempo de inatividade planejado: 2.1h</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Alertas Ativos
            </CardDescription>
            <CardTitle className={`text-2xl font-black transition-colors ${
              simulationActive ? "text-rose-500 animate-pulse" : "text-amber-500"
            }`}>
              {simulationActive ? "2" : "1"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">
              {simulationActive ? "1 anomalia grave detectada!" : "Manutenção agendada pendente"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Modelos Estatísticos
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">XGBoost v2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Acurácia RUL: 94.8%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Status List */}
        <Card className="lg:col-span-2 bg-card border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-muted-foreground/60" />
              Equipamentos sob Monitoramento
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Sensores acoplados monitorando vibração (mm/s RMS) e temperatura (°C) em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border border-t border-border">
              {machines.map((m) => (
                <div
                  key={m.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${
                      m.status === "ok"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : m.status === "warning"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-rose-500/10 text-rose-500 animate-pulse"
                    }`}>
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">{m.name}</div>
                      <div className="text-[9px] text-muted-foreground font-mono">UUID: {m.id}-SENSOR</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 sm:gap-8 text-right">
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase font-semibold">Temp.</div>
                      <div className={`text-xs font-bold font-mono ${
                        m.temp > 80 ? "text-rose-500" : m.temp > 70 ? "text-amber-500 animate-pulse" : "text-foreground/80"
                      }`}>{m.temp} °C</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase font-semibold">Vibração</div>
                      <div className={`text-xs font-bold font-mono ${
                        m.vibration > 6 ? "text-rose-500" : m.vibration > 3 ? "text-amber-500" : "text-foreground/80"
                      }`}>{m.vibration} mm/s</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase font-semibold">OEE</div>
                      <div className={`text-xs font-bold font-mono ${
                        m.oee < 80 ? "text-amber-500" : "text-emerald-550 dark:text-emerald-405 font-bold"
                      }`}>{m.oee}%</div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      m.status === "ok"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                        : m.status === "warning"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/25"
                        : "bg-rose-500/10 text-rose-500 border-rose-500/25 animate-pulse"
                    }`}>
                      {m.status === "ok" ? "Operacional" : m.status === "warning" ? "Aviso Técnico" : "Falha Crítica"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prediction Insights Card */}
        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-muted-foreground/60" />
              Insights do Modelo RUL
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Vida Útil Restante (RUL) estimada por regressão linear Bayesiana.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Torno CNC 01 (RUL)</span>
                <span className={`font-mono font-bold ${simulationActive ? "text-rose-500 animate-pulse" : "text-foreground"}`}>
                  {simulationActive ? "1.5 horas" : "184 horas"}
                </span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden border border-border">
                <div
                  className={`h-full transition-all duration-500 ${
                    simulationActive ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                  }`}
                  style={{ width: simulationActive ? "3%" : "72%" }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Prensa Hidráulica 04 (RUL)</span>
                <span className="font-mono font-bold text-amber-500">22 horas</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden border border-border">
                <div className="bg-amber-500 h-full" style={{ width: "12%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Esteira Transportadora (RUL)</span>
                <span className="font-mono font-bold text-foreground">620 horas</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden border border-border">
                <div className="bg-emerald-500 h-full" style={{ width: "94%" }} />
              </div>
            </div>

            {simulationActive && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-[10px] text-rose-500 animate-pulse flex items-start gap-2 mt-4">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <div>
                  <strong>Alerta de Parada Imediata:</strong> Sensores registraram temperatura excessiva no rolamento principal do Torno CNC 01. Substituição mecânica recomendada em menos de 2 horas.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
