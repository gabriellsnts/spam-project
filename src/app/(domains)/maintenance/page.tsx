"use client";

import React, { useState, useMemo } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { 
  Wrench, 
  Settings, 
  AlertTriangle, 
  Download, 
  Sparkles,
  BarChart3,
  Radio,
  Sliders,
  RotateCcw,
  ClipboardCopy,
  Check,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSVUploader, ResidualsPlotView } from "@/components/shared/csv-uploader";
import { DescriptiveStats } from "@/components/shared/descriptive-stats";
import { FeatureImportanceChart } from "@/components/shared/feature-importance-chart";
import { calculateMachineRUL, BASE_RULS } from "@/lib/predictive-engine";
import { AlertThresholdSettings } from "@/components/shared/alert-threshold-settings";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ComparisonView } from "@/components/shared/comparison-view";
import { SchedulingCard } from "@/components/shared/scheduling-card";

export default function MaintenancePage() {
  const { addLog, isTraining, trainedModels, alertThresholds, addAlert, currentView, t, language } = useDomain();
  const activeModel = trainedModels["maintenance"];
  const isModelObsolete = activeModel ? (Date.now() - activeModel.timestamp > 30 * 24 * 60 * 60 * 1000) : false;
  const [horizon, setHorizon] = useState<7 | 30 | 90>(30);

  const threshold = alertThresholds["maintenance"] !== undefined ? alertThresholds["maintenance"] : 30;
  
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
    addAlert({
      domain: "maintenance",
      item: `${t("machine_m01")} (M01)`,
      value: `${t("vibration")}: 8.5 mm/s, Temp: 92°C`,
      metric: t("physical_telemetry"),
      criticality: "high"
    });
    addLog(t("anomaly_simulation_started_log", { name: t("machine_m01") }));
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
    addLog(t("simulation_finished_log"));
  };

  // Estados e funções para o RF12 – Sandbox de Simulação
  const [selectedMachineId, setSelectedMachineId] = useState<string>("M01");
  const [simulatedSpecs, setSimulatedSpecs] = useState<Record<string, { temp: number; vibration: number; oee: number }>>({});
  const [reportCopied, setReportCopied] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const activeAlertsList = useMemo(() => {
    const list: { id: string; name: string; value: number; threshold: number; details?: string }[] = [];
    machines.forEach((m) => {
      const simOverride = simulatedSpecs[m.id];
      const currentSpecs = simOverride || { temp: m.temp, vibration: m.vibration, oee: m.oee };
      const { rul } = calculateMachineRUL(m.id, currentSpecs.temp, currentSpecs.vibration, currentSpecs.oee);
      if (rul <= threshold * 24) {
        list.push({
          id: m.id,
          name: t("machine_" + m.id.toLowerCase()),
          value: Math.ceil(rul / 24),
          threshold: threshold,
          details: t("alert_details_template", { rulDays: String(Math.ceil(rul / 24)), threshold: String(threshold) }),
        });
      }
    });
    return list;
  }, [machines, simulatedSpecs, threshold, t]);

  const calculateCriticalCount = (t: number) => {
    let count = 0;
    machines.forEach((m) => {
      const simOverride = simulatedSpecs[m.id];
      const currentSpecs = simOverride || { temp: m.temp, vibration: m.vibration, oee: m.oee };
      const { rul } = calculateMachineRUL(m.id, currentSpecs.temp, currentSpecs.vibration, currentSpecs.oee);
      if (rul <= t * 24) {
        count++;
      }
    });
    return count;
  };

  const averageRul = useMemo(() => {
    let totalRul = 0;
    machines.forEach((m) => {
      const simOverride = simulatedSpecs[m.id];
      const currentSpecs = simOverride || { temp: m.temp, vibration: m.vibration, oee: m.oee };
      const { rul } = calculateMachineRUL(m.id, currentSpecs.temp, currentSpecs.vibration, currentSpecs.oee);
      totalRul += rul;
    });
    return totalRul / machines.length;
  }, [machines, simulatedSpecs]);

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
${t("report_hypothetical_title") || "RELATÓRIO DE IMPACTO DE CENÁRIO HIPOTÉTICO (RF12)"}
==================================================
${t("equipment") || "Equipamento"}          : ${selectedMachine.name}
${t("identifier_code") || "Código identificador"} : ${selectedMachine.id}-SENSOR
${t("simulation_date") || "Data da Simulação"}    : ${new Date().toLocaleString(language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US")}

--------------------------------------------------
${t("physical_variables_comparison") || "COMPARAÇÃO DE VARIÁVEIS FÍSICAS"}
--------------------------------------------------
${t("variable") || "Variável"}        | ${t("real_state_telemetry") || "Estado Real (Telemetria)"} | ${t("simulated_scenario") || "Cenário Simulado"}
${t("temperature") || "Temperatura"}     | ${selectedMachine.temp.toFixed(1)} °C                 | ${sim.temp.toFixed(1)} °C
${t("vibration") || "Vibração"}        | ${selectedMachine.vibration.toFixed(1)} mm/s                | ${sim.vibration.toFixed(1)} mm/s
${t("oee_efficiency") || "Eficiência OEE"}  | ${selectedMachine.oee.toFixed(1)} %                 | ${sim.oee.toFixed(1)} %

--------------------------------------------------
${t("predictive_impact_analysis") || "ANÁLISE DE IMPACTO PREDITIVO (RUL)"}
--------------------------------------------------
${t("current_real_rul") || "RUL Atual Real"}  : ${realRul.toFixed(1)} horas
${t("simulated_rul") || "RUL Simulado"}    : ${simRul.toFixed(1)} horas
${t("rul_variation") || "Variação de RUL"} : ${diffPct === 0 ? (t("no_change") || "Sem alteração") : `${diffPct > 0 ? "+" : ""}${diffPct.toFixed(1)}%`}

Status ${t("current") || "Atual"}    : ${selectedMachine.status.toUpperCase()}
Status ${t("simulated") || "Simulado"} : ${simStatus.toUpperCase()}

--------------------------------------------------
${t("recommended_contingency_plan") || "PLANO DE CONTINGÊNCIA RECOMENDADO"}
--------------------------------------------------
${
  simStatus === "critical"
    ? (t("critical_contingency_desc") || "ALERTA CRÍTICO: Os parâmetros simulados ultrapassaram os limites de segurança da engenharia (Temp > 80°C ou Vibração > 4.5 mm/s). Recomenda-se a interrupção imediata das atividades da máquina para manutenção corretiva e lubrificação, mitigando riscos de falha catastrófica.")
    : simStatus === "warning"
    ? (t("warning_contingency_desc") || "AVISO TÉCNICO: Variáveis físicas em nível de atenção. Recomenda-se programar uma vistoria preventiva nas próximas 24 horas para reajuste de calibração.")
    : (t("normal_contingency_desc") || "SITUAÇÃO NORMAL: O cenário simulado está dentro das faixas aceitáveis de operação. Continue monitorando as variáveis por meio da telemetria padrão.")
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
            {t("maintenance_module_title")}
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight flex flex-wrap items-center gap-2">
            {t("maintenance_subtitle")}
            {activeModel && (
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border font-sans ${
                isModelObsolete 
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                  : "bg-emerald-500/10 text-emerald-550 dark:text-emerald-400 border-emerald-500/20 animate-pulse"
              }`}>
                <CheckCircle2 className="h-3 w-3" />
                {isModelObsolete ? t("obsolete_model") || "Modelo Obsoleto" : t("ready_to_use") || "Modelo Pronto para Uso"}
              </span>
            )}
          </h2>
          <p className="text-muted-foreground text-xs">
            {t("maintenance_desc_long")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 relative z-10">
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
            {t("export_csv") || "Exportar Relatório"}
          </Button>
        </div>
      </div>

      {currentView === "monitoring" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {!activeModel && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-300 font-sans">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold text-foreground">{t("no_active_model")}</p>
                <p className="text-muted-foreground mt-0.5">
                  {t("maintenance_no_model_desc")}
                </p>
              </div>
            </div>
          )}
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t("oee_average")}
                </CardDescription>
                <CardTitle className="text-2xl font-black text-foreground">84.0%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t("within_limits")}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t("availability")}
                </CardDescription>
                <CardTitle className="text-2xl font-black text-foreground">92.4%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] text-muted-foreground">{t("planned_downtime")}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t("active_alerts_threshold")}
                </CardDescription>
                <CardTitle className={`text-2xl font-black transition-colors ${
                  activeAlertsList.length > 0 ? "text-rose-500 animate-pulse" : "text-amber-500"
                }`}>
                  {activeAlertsList.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] text-muted-foreground">
                  {activeAlertsList.length > 0 ? `${activeAlertsList.length} ${t("active_plural")}` : t("no_failures_predicted")}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t("average_rul")}
                </CardDescription>
                <CardTitle className="text-2xl font-black text-foreground">
                  {Math.ceil(averageRul / 24)} {t("days")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] text-muted-foreground">
                  {t("average_remaining_life")}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-foreground flex gap-3">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <strong className="text-amber-500 block mb-1">{t("auto_insight")}</strong>
              {simulationActive 
                ? t("insight_critical_maintenance", { machine: t("machine_m01") })
                : t("insight_stable_maintenance", { machine: t("machine_m02") })}
            </div>
          </div>

          <AlertThresholdSettings
            domain="maintenance"
            title={t("limit_lifetime_rul")}
            min={0}
            max={90}
            unit={t("days")}
            totalCount={machines.length}
            calculateCriticalCount={calculateCriticalCount}
            activeAlerts={activeAlertsList}
          />

          {/* Monitoramento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Machine Status List */}
            <Card className="lg:col-span-2 bg-card border-border transition-colors duration-300">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Settings className="h-4 w-4 text-muted-foreground/60" />
                    {t("equipment_monitored")}
                  </CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground">
                    {t("vibration_temp_desc")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{t("horizon")}</span>
                  <select
                    value={horizon}
                    onChange={(e) => setHorizon(Number(e.target.value) as 7 | 30 | 90)}
                    className="bg-background border border-border text-foreground rounded-lg text-xs px-2 py-1 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer font-sans"
                  >
                    <option value={7}>{t("days_7")}</option>
                    <option value={30}>{t("days_30")}</option>
                    <option value={90}>{t("days_90")}</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border border-t border-border">
                  {machines.map((m) => {
                    const isSelected = m.id === selectedMachineId;
                    const isMachineSimulated = !!simulatedSpecs[m.id];
                    const simOverride = simulatedSpecs[m.id];
                    const currentSpecs = simOverride || { temp: m.temp, vibration: m.vibration, oee: m.oee };
                    const { rul } = calculateMachineRUL(m.id, currentSpecs.temp, currentSpecs.vibration, currentSpecs.oee);
                    const requiresMaintenance = rul <= threshold * 24;

                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMachineId(m.id);
                          addLog(t("equipment_selected_log", { name: t("machine_" + m.id.toLowerCase()) }));
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
                              {t("machine_" + m.id.toLowerCase())}
                              {isMachineSimulated && (
                                <span className="text-[9px] px-1 bg-amber-500/15 text-amber-500 border border-amber-500/20 rounded font-bold font-sans">
                                  {t("simulating")}
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
                            <div className="text-[9px] text-muted-foreground uppercase font-semibold">{t("vibration_label").split(" ")[0]}</div>
                            <div className={`text-xs font-bold font-mono ${
                              m.vibration > 6 ? "text-rose-500" : m.vibration > 3 ? "text-amber-500" : "text-foreground/80"
                            }`}>{m.vibration} mm/s</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-muted-foreground uppercase font-semibold">OEE</div>
                            <div className={`text-xs font-bold font-mono ${
                              m.oee < 80 ? "text-amber-500" : "text-emerald-555 dark:text-emerald-405 font-bold"
                            }`}>{m.oee}%</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${
                            requiresMaintenance
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          }`}>
                            {requiresMaintenance ? `${t("maintenance_in")} ${Math.ceil(rul / 24)}d` : t("safe")}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            m.status === "ok"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                              : m.status === "warning"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/25"
                              : "bg-rose-500/10 text-rose-500 border-rose-500/25 animate-pulse"
                          }`}>
                            {m.status === "ok" ? t("operational") : m.status === "warning" ? t("tech_warning") : t("critical_failure")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Prediction Insights Card */}
            <div className="space-y-6 lg:col-span-1">
              <Card className="bg-card border-border transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-muted-foreground/60" />
                    {t("rul_insights")}
                  </CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground">
                    {t("rul_desc")}
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
                            {t("machine_" + m.id.toLowerCase())} (RUL)
                            {simOverride && (
                              <span className="text-[8px] px-1 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 font-bold">
                                {t("simulating")}
                              </span>
                            )}
                          </span>
                          <span className={`font-mono font-bold ${textClass}`}>
                            {rul.toFixed(1)} {t("hours")}
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

                  {machines.some((m) => {
                    const simOverride = simulatedSpecs[m.id];
                    const currentSpecs = simOverride || { temp: m.temp, vibration: m.vibration, oee: m.oee };
                    const { status } = calculateMachineRUL(m.id, currentSpecs.temp, currentSpecs.vibration, currentSpecs.oee);
                    return status === "critical";
                  }) && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-[10px] text-rose-500 animate-pulse flex items-start gap-2 mt-4">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <div>
                        <strong>{t("immediate_stop_alert")}</strong> {t("immediate_stop_desc")}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {currentView === "simulation" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {!activeModel && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-300 font-sans mb-6">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold text-foreground">{t("no_active_model_sim")}</p>
                <p className="text-muted-foreground mt-0.5">
                  {t("no_active_model_sim_desc")}
                </p>
              </div>
            </div>
          )}
          <div className="max-w-3xl mx-auto">
            {/* Sandbox de Simulação Card */}
            <Card className="bg-card border-border transition-colors duration-300 shadow-md">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-amber-500" />
                    {t("simulation_sandbox")}
                  </CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground">
                    {t("adjust_variables_desc")}
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
                  {t("reset")}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset Rápido de Anomalia */}
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t("quick_anomaly_preset")}</div>
                  <div className="flex gap-2">
                    {simulationActive ? (
                      <Button
                        onClick={resetSimulation}
                        disabled={isTraining}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 h-8"
                      >
                        {t("reset_sensors")}
                      </Button>
                    ) : (
                      <Button
                        onClick={triggerAnomalySimulation}
                        disabled={isTraining}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold gap-1.5 py-1.5 h-8"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {t("simulate_anomaly_vibration")}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Info Equipamento Selecionado */}
                <div className="p-2.5 bg-muted/40 border border-border/80 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-semibold">{t("equipment_in_simulation")}</div>
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
                      <span className="text-muted-foreground">{t("temp_label")}</span>
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
                      <span className="text-muted-foreground">{t("vibration_label")}</span>
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
                      <span className="text-muted-foreground">{t("oee_label")}</span>
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
                      {t("real_state")}
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
                      <span>{t("simulated_scenario")}</span>
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
                      {t("no_change_rul")}
                    </span>
                  ) : (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded border inline-block ${
                      diffPct < 0 
                        ? "bg-rose-500/15 text-rose-500 border-rose-500/20" 
                        : "bg-emerald-500/15 text-emerald-550 dark:text-emerald-400 border-emerald-500/20"
                    }`}>
                      {diffPct < 0 ? "" : "+"}{diffPct.toFixed(1)}% {t("rul_change_scenario")}
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
                        {t("copied")}
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="h-3.5 w-3.5" />
                        {t("copy_summary")}
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
                    {t("download_txt")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {currentView === "calibration" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Card Descritivo de Modelos Estatísticos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {t("active_algorithm_metrics")}
                </CardDescription>
                <CardTitle className="text-xl font-black text-foreground truncate" title={activeModel ? activeModel.algorithm : "Random Forest"}>
                  {activeModel ? activeModel.algorithm : "Random Forest"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {activeModel ? (
                    <>R² do Modelo: <strong className="font-mono text-emerald-500 text-sm">{(activeModel.metrics.r2 || 0).toFixed(4)}</strong></>
                  ) : (
                    "Acurácia RUL: 94.8% (Padrão)"
                  )}
                </div>
              </CardContent>
            </Card>

            {activeModel && (
              <Card className="bg-card border-border transition-colors duration-300">
                <CardHeader className="pb-2">
                  <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    {t("training_status")}
                  </CardDescription>
                  <CardTitle className="text-sm font-bold text-foreground">
                    {t("model_active_calibrated")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[10px] text-muted-foreground">
                    {t("calibrated_at")} {new Date(activeModel.timestamp).toLocaleString(language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US")}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {activeModel && (
            <FeatureImportanceChart data={mockFeatures} title="Preditores de Falha (Manutenção)" />
          )}

          {activeModel && (
            <Accordion className="w-full">
              <AccordionItem value="residuals-plot">
                <AccordionTrigger isOpen={isAccordionOpen} onClick={() => setIsAccordionOpen(!isAccordionOpen)}>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 font-sans">
                    <BarChart3 className="h-4.5 w-4.5 text-amber-500" />
                    {t("residuals_diagnostic")}
                  </span>
                </AccordionTrigger>
                <AccordionContent isOpen={isAccordionOpen}>
                  <div className="pt-4">
                    <ResidualsPlotView model={activeModel} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          <CSVUploader onConfirm={handleCSVConfirm} onReset={handleCSVReset} />
          
          {csvFileDetails && csvAllRows && (
            <DescriptiveStats
              fileDetails={csvFileDetails}
              allRows={csvAllRows}
              activeDomain="maintenance"
            />
          )}

          <SchedulingCard domain="maintenance" />
        </div>
      )}

      {currentView === "comparison" && (
        <ComparisonView domain="maintenance" />
      )}
    </div>
  );
}
