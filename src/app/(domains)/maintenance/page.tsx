"use client";

import React, { useState } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { 
  Wrench, 
  Settings, 
  AlertTriangle, 
  BarChart3, 
  Radio,
  Sliders,
  RotateCcw,
  ClipboardCopy,
  Download,
  Check,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSVUploader } from "@/components/shared/csv-uploader";
import { DescriptiveStats } from "@/components/shared/descriptive-stats";
import { FeatureImportanceChart } from "@/components/shared/feature-importance-chart";
import { calculateMachineRUL, BASE_RULS } from "@/lib/predictive-engine";

export default function MaintenancePage() {
  const { addLog, isTraining, trainedModels } = useDomain();
  const activeModel = trainedModels["maintenance"];
  const [csvFileDetails, setCsvFileDetails] = useState<{
    name: string;
    size: string;
    encoding: string;
    delimiter: string;
    rows: number;
    headers: string[];
  } | null>(null);
  const [csvAllRows, setCsvAllRows] = useState<string[][] | null>(null);

  const handleCSVConfirm = (
    fileDetails: {
      name: string;
      size: string;
      encoding: string;
      delimiter: string;
      rows: number;
      headers: string[];
    },
    allRows: string[][]
  ) => {
    setCsvFileDetails(fileDetails);
    setCsvAllRows(allRows);
  };

  const handleCSVReset = () => {
    setCsvFileDetails(null);
    setCsvAllRows(null);
  };

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

  // Estados e funções para o RF12 – Sandbox de Simulação
  const [selectedMachineId, setSelectedMachineId] = useState<string>("M01");
  const [simulatedSpecs, setSimulatedSpecs] = useState<Record<string, { temp: number; vibration: number; oee: number }>>({});
  const [reportCopied, setReportCopied] = useState(false);

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];
  const hasOverrides = !!simulatedSpecs[selectedMachine.id];
  
  const sim = simulatedSpecs[selectedMachine.id] || { 
    temp: selectedMachine.temp, 
    vibration: selectedMachine.vibration, 
    oee: selectedMachine.oee 
  };

  const handleSliderChange = (field: "temp" | "vibration" | "oee", val: number) => {
    setSimulatedSpecs((prev) => ({
      ...prev,
      [selectedMachine.id]: {
        ...sim,
        [field]: val,
      },
    }));
  };

  const handleResetSandbox = () => {
    const updated = { ...simulatedSpecs };
    delete updated[selectedMachine.id];
    setSimulatedSpecs(updated);
    addLog(`Parâmetros de simulação resetados para o equipamento ${selectedMachine.name}.`);
  };

  const realRul = calculateMachineRUL(
    selectedMachine.id, 
    selectedMachine.temp, 
    selectedMachine.vibration, 
    selectedMachine.oee
  ).rul;

  const simRulResult = calculateMachineRUL(
    selectedMachine.id, 
    sim.temp, 
    sim.vibration, 
    sim.oee
  );
  
  const simRul = simRulResult.rul;
  const simStatus = simRulResult.status;

  const diffPct = realRul > 0 ? ((simRul - realRul) / realRul) * 100 : 0;
  const isSimulatedCritical = sim.temp > 80 || sim.vibration > 4.5;

  const generateReportText = () => {
    return `==================================================
RELATÓRIO DE IMPACTO DE CENÁRIO HIPOTÉTICO (RF12)
==================================================
Equipamento          : ${selectedMachine.name}
Código identificador : ${selectedMachine.id}-SENSOR
Data da Simulação    : ${new Date().toLocaleString("pt-BR")}

--------------------------------------------------
COMPARAÇÃO DE VARIÁVEIS FÍSICAS
--------------------------------------------------
Variável        | Estado Real (Telemetria) | Cenário Simulado
Temperatura     | ${selectedMachine.temp.toFixed(1)} °C                 | ${sim.temp.toFixed(1)} °C
Vibração        | ${selectedMachine.vibration.toFixed(1)} mm/s                | ${sim.vibration.toFixed(1)} mm/s
Eficiência OEE  | ${selectedMachine.oee.toFixed(1)} %                 | ${sim.oee.toFixed(1)} %

--------------------------------------------------
ANÁLISE DE IMPACTO PREDITIVO (RUL)
--------------------------------------------------
RUL Atual Real  : ${realRul.toFixed(1)} horas
RUL Simulado    : ${simRul.toFixed(1)} horas
Variação de RUL : ${diffPct === 0 ? "Sem alteração" : `${diffPct > 0 ? "+" : ""}${diffPct.toFixed(1)}%`}

Status Atual    : ${selectedMachine.status.toUpperCase()}
Status Simulado : ${simStatus.toUpperCase()}

--------------------------------------------------
PLANO DE CONTINGÊNCIA RECOMENDADO
--------------------------------------------------
${
  simStatus === "critical"
    ? "ALERTA CRÍTICO: Os parâmetros simulados ultrapassaram os limites de segurança da engenharia (Temp > 80°C ou Vibração > 4.5 mm/s). Recomenda-se a interrupção imediata das atividades da máquina para manutenção corretiva e lubrificação, mitigando riscos de falha catastrófica."
    : simStatus === "warning"
    ? "AVISO TÉCNICO: Variáveis físicas em nível de atenção. Recomenda-se programar uma vistoria preventiva nas próximas 24 horas para reajuste de calibração."
    : "SITUAÇÃO NORMAL: O cenário simulado está dentro das faixas aceitáveis de operação. Continue monitorando as variáveis por meio da telemetria padrão."
}
==================================================`;
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(generateReportText());
      setReportCopied(true);
      addLog(`Relatório de impacto simulado copiado para a área de transferência (${selectedMachine.name}).`);
      setTimeout(() => setReportCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar relatório:", err);
    }
  };

  const handleDownloadReport = () => {
    const blob = new Blob([generateReportText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-simulacao-${selectedMachine.id.toLowerCase()}.txt`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addLog(`Relatório de impacto simulado baixado como arquivo texto (${selectedMachine.name}).`);
  };

  const handleExport = () => {
    window.print();
    addLog("Relatório consolidado exportado para PDF via impressão.");
  };

  const mockFeatures = [
    { name: "Vibração RMS", weight: 0.45, description: "Desgaste de rolamentos e desbalanceamento mecânico." },
    { name: "Temperatura do Eixo", weight: 0.35, description: "Aquecimento excessivo por atrito ou falta de lubrificação." },
    { name: "OEE Operacional", weight: 0.12, description: "Quedas de eficiência micro-paradas indicativas de falha iminente." },
    { name: "Horas de Uso (Contínuas)", weight: 0.08, description: "Fator de degradação por fadiga do material ao longo do tempo." },
  ];

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

        <div className="flex flex-col sm:flex-row items-center gap-2 relative z-10">
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
            Exportar Relatório (PDF)
          </Button>
          {simulationActive ? (
            <Button
              onClick={resetSimulation}
              disabled={isTraining}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              Resetar Sensores
            </Button>
          ) : (
            <Button
              onClick={triggerAnomalySimulation}
              disabled={isTraining}
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
            <CardTitle className="text-xl font-black text-foreground truncate" title={activeModel ? activeModel.algorithm : "XGBoost v2"}>
              {activeModel ? activeModel.algorithm : "XGBoost v2"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">
              {activeModel ? (
                <>R² do Modelo: <strong>{(activeModel.metrics.r2 || 0).toFixed(4)}</strong></>
              ) : (
                "Acurácia RUL: 94.8%"
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-foreground flex gap-3">
        <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
        <div>
          <strong className="text-amber-500 block mb-1">Insight Automático:</strong>
          {simulationActive 
            ? "O alerta crítico foi disparado. Observamos anomalia severa de vibração e temperatura no Torno CNC 01. Sugere-se parada de máquina imediata."
            : "A linha de produção apresenta estabilidade geral. Recomenda-se realizar lubrificação no Braço Robotizado A (preventiva)."}
        </div>
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
              Sensores acoplados monitorando vibração (mm/s RMS) e temperatura (°C) em tempo real. Clique em um equipamento para simular cenários de falha.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border border-t border-border">
              {machines.map((m) => {
                const isSelected = m.id === selectedMachineId;
                const isMachineSimulated = !!simulatedSpecs[m.id];
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMachineId(m.id);
                      addLog(`Equipamento ${m.name} selecionado para simulação sandbox.`);
                    }}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition ${
                      isSelected 
                        ? "bg-amber-500/5 border-l-2 border-amber-500 shadow-sm" 
                        : "hover:bg-muted/30"
                    }`}
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
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          {m.name}
                          {isMachineSimulated && (
                            <span className="text-[9px] px-1 bg-amber-500/15 text-amber-500 border border-amber-500/20 rounded font-bold font-sans">
                              Simulando
                            </span>
                          )}
                        </div>
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
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right Column (Insights + Sandbox) */}
        <div className="space-y-6 lg:col-span-1">
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
              {machines.map((m) => {
                const simOverride = simulatedSpecs[m.id];
                const currentSpecs = simOverride || { temp: m.temp, vibration: m.vibration, oee: m.oee };
                const { rul, status } = calculateMachineRUL(m.id, currentSpecs.temp, currentSpecs.vibration, currentSpecs.oee);
                
                const baseRul = BASE_RULS[m.id] || 300;
                const pct = Math.min(100, (rul / baseRul) * 100);

                const isCritical = status === "critical";
                const isWarning = status === "warning";

                const textClass = isCritical 
                  ? "text-rose-500 animate-pulse" 
                  : isWarning 
                  ? "text-amber-500" 
                  : "text-foreground";
                  
                const barClass = isCritical 
                  ? "bg-rose-500 animate-pulse" 
                  : isWarning 
                  ? "bg-amber-500" 
                  : "bg-emerald-500";

                return (
                  <div key={m.id} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        {m.name} (RUL)
                        {simOverride && (
                          <span className="text-[8px] px-1 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 font-bold">
                            Simulado
                          </span>
                        )}
                      </span>
                      <span className={`font-mono font-bold ${textClass}`}>
                        {rul.toFixed(1)} horas
                      </span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden border border-border">
                      <div
                        className={`h-full transition-all duration-500 ${barClass}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Alerta de parada se houver anomalias nas máquinas (reais ou simuladas) */}
              {machines.some((m) => {
                const simOverride = simulatedSpecs[m.id];
                const currentSpecs = simOverride || { temp: m.temp, vibration: m.vibration, oee: m.oee };
                const { status } = calculateMachineRUL(m.id, currentSpecs.temp, currentSpecs.vibration, currentSpecs.oee);
                return status === "critical";
              }) && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-[10px] text-rose-500 animate-pulse flex items-start gap-2 mt-4">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <div>
                    <strong>Alerta de Parada Imediata:</strong> Sensores registraram ou simularam temperatura excessiva ou vibração extrema. Recomenda-se vistoria urgente.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sandbox de Simulação Card */}
          <Card className="bg-card border-border transition-colors duration-300 shadow-md animate-in fade-in duration-300">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-amber-500" />
                  Sandbox de Simulação
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Ajuste de variáveis do equipamento selecionado.
                </CardDescription>
              </div>
              <Button
                onClick={handleResetSandbox}
                disabled={!hasOverrides || isTraining}
                variant="outline"
                className="text-[9px] h-7 px-2.5 text-muted-foreground hover:text-rose-500 font-bold border-border"
                title="Resetar parâmetros simulados para a telemetria original"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Resetar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info Equipamento Selecionado */}
              <div className="p-2.5 bg-muted/40 border border-border/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-muted-foreground font-semibold">Equipamento em Simulação:</div>
                  <div className="text-xs font-bold text-foreground">{selectedMachine.name}</div>
                </div>
                <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-border">
                  ID: {selectedMachine.id}
                </span>
              </div>

              {/* Sliders de Variáveis Físicas */}
              <div className="space-y-4 pt-2">
                {/* Temperatura */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Temperatura (°C)</span>
                    <span className={`font-mono font-bold ${sim.temp > 80 ? "text-rose-500 font-extrabold" : "text-foreground"}`}>{sim.temp} °C</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={120}
                    step={1}
                    value={sim.temp}
                    disabled={isTraining}
                    onChange={(e) => handleSliderChange("temp", Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="flex justify-between text-[8px] text-muted-foreground font-mono">
                    <span>0°C</span>
                    <span>Lim: 80°C</span>
                    <span>120°C</span>
                  </div>
                </div>

                {/* Vibração */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Vibração (mm/s)</span>
                    <span className={`font-mono font-bold ${sim.vibration > 4.5 ? "text-rose-500 font-extrabold" : "text-foreground"}`}>{sim.vibration.toFixed(1)} mm/s</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={10.0}
                    step={0.1}
                    value={sim.vibration}
                    disabled={isTraining}
                    onChange={(e) => handleSliderChange("vibration", Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="flex justify-between text-[8px] text-muted-foreground font-mono">
                    <span>0.0 mm/s</span>
                    <span>Lim: 4.5 mm/s</span>
                    <span>10.0 mm/s</span>
                  </div>
                </div>

                {/* OEE */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Eficiência OEE (%)</span>
                    <span className={`font-mono font-bold ${sim.oee < 80 ? "text-amber-500" : "text-foreground"}`}>{sim.oee}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={sim.oee}
                    disabled={isTraining}
                    onChange={(e) => handleSliderChange("oee", Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="flex justify-between text-[8px] text-muted-foreground font-mono">
                    <span>0%</span>
                    <span>Min: 80%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Comparação Lado a Lado (CA03) */}
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                {/* Estado Real Atual */}
                <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-2">
                  <div className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                    Estado Real
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div>Temp: <span className="font-bold">{selectedMachine.temp} °C</span></div>
                    <div>Vib: <span className="font-bold">{selectedMachine.vibration} mm/s</span></div>
                    <div>OEE: <span className="font-bold">{selectedMachine.oee}%</span></div>
                    <div className="border-t border-border pt-1.5 mt-1">
                      RUL: <span className="font-bold text-emerald-500">{realRul.toFixed(1)}h</span>
                    </div>
                    <div>
                      Status: <span className={`font-bold px-1 rounded text-[9px] ${
                        selectedMachine.status === "ok" 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : selectedMachine.status === "warning" 
                          ? "bg-amber-500/10 text-amber-500" 
                          : "bg-rose-500/10 text-rose-500"
                      }`}>{selectedMachine.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Cenário Simulado */}
                <div className={`p-3 rounded-xl space-y-2 transition-all duration-300 border ${
                  isSimulatedCritical 
                    ? "bg-rose-500/5 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.25)] animate-pulse" 
                    : "bg-amber-500/5 border-amber-500/25"
                }`}>
                  <div className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                    <span>Cenário Simulado</span>
                    {isSimulatedCritical && (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div>Temp: <span className={`font-bold ${sim.temp > 80 ? "text-rose-500 font-extrabold" : ""}`}>{sim.temp} °C</span></div>
                    <div>Vib: <span className={`font-bold ${sim.vibration > 4.5 ? "text-rose-500 font-extrabold" : ""}`}>{sim.vibration.toFixed(1)} mm/s</span></div>
                    <div>OEE: <span className="font-bold">{sim.oee}%</span></div>
                    <div className="border-t border-border pt-1.5 mt-1">
                      RUL: <span className={`font-bold ${
                        simRul < 50 ? "text-rose-500" : simRul < 200 ? "text-amber-500" : "text-emerald-500"
                      }`}>{simRul.toFixed(1)}h</span>
                    </div>
                    <div>
                      Status: <span className={`font-bold px-1 rounded text-[9px] ${
                        simStatus === "ok" 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : simStatus === "warning" 
                          ? "bg-amber-500/10 text-amber-500" 
                          : "bg-rose-500/10 text-rose-500 animate-pulse"
                      }`}>{simStatus.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variação Percentual (CA03) */}
              <div className="mt-2 text-center">
                {diffPct === 0 ? (
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    Sem alteração na vida útil estimada.
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded border inline-block ${
                    diffPct < 0 
                      ? "bg-rose-500/15 text-rose-500 border-rose-500/20" 
                      : "bg-emerald-500/15 text-emerald-550 dark:text-emerald-400 border-emerald-500/20"
                  }`}>
                    {diffPct < 0 ? "" : "+"}{diffPct.toFixed(1)}% de vida útil no cenário simulado
                  </span>
                )}
              </div>

              {/* Exportar Cenário Hipotético (CA05) */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                <Button
                  onClick={handleCopyReport}
                  disabled={isTraining}
                  variant="outline"
                  className="flex-1 text-[10px] h-8 font-bold gap-1 text-muted-foreground hover:text-foreground border-border"
                >
                  {reportCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="h-3.5 w-3.5" />
                      Copiar Resumo
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownloadReport}
                  disabled={isTraining}
                  variant="outline"
                  className="flex-1 text-[10px] h-8 font-bold gap-1 text-muted-foreground hover:text-foreground border-border"
                >
                  <Download className="h-3.5 w-3.5" />
                  Baixar TXT
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {activeModel && (
        <FeatureImportanceChart data={mockFeatures} title="Preditores de Falha (Manutenção)" />
      )}

      {/* Ingestão de Dados Históricos */}
      <div className="space-y-6">
        <CSVUploader onConfirm={handleCSVConfirm} onReset={handleCSVReset} />
        
        {csvFileDetails && csvAllRows && (
          <DescriptiveStats
            fileDetails={csvFileDetails}
            allRows={csvAllRows}
            activeDomain="maintenance"
          />
        )}
      </div>
    </div>
  );
}
