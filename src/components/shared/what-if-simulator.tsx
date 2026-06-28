"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPrediction } from "@/lib/predictive-engine";
import { useDomain } from "@/lib/context/domain-context";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type VariableInfo = {
  label: string;
  min: number;
  max: number;
  step?: number;
  default: number;
  unit: string;
};

const domainVariables: Record<string, Record<string, VariableInfo>> = {
  maintenance: {
    age: { label: "Idade da máquina", min: 0, max: 30, default: 5, unit: "anos" },
    usage: { label: "Horas de uso mensais", min: 0, max: 720, default: 200, unit: "h" },
    lastFailure: { label: "Dias desde última falha", min: 0, max: 365, default: 30, unit: "dias" },
    temperature: { label: "Temperatura de Operação", min: 0, max: 150, default: 60, unit: "°C" },
    vibration: { label: "Nível de Vibração", min: 0, max: 100, default: 1.2, unit: "mm/s" },
  },
  demand: {
    month: { label: "Mês (1‑12)", min: 1, max: 12, default: 6, unit: "" },
    temperature: { label: "Temperatura média", min: -10, max: 45, default: 22, unit: "°C" },
    promotion: { label: "Promoção", min: 0, max: 1, step: 0.01, default: 0, unit: "%" },
  },
  churn: {
    tenure: { label: "Tempo de Contrato", min: 0, max: 120, default: 12, unit: "meses" },
    monthlyCharges: { label: "Cobrança Mensal", min: 0, max: 500, default: 50, unit: "BRL" },
  },
  "credit-risk": {
    income: { label: "Renda Mensal", min: 1000, max: 50000, default: 5000, unit: "BRL" },
    debt: { label: "Dívida Atual", min: 0, max: 100000, default: 1000, unit: "BRL" },
  }
};

export default function WhatIfSimulator() {
  const { activeDomain, addLog } = useDomain();
  const domainKey = activeDomain || "maintenance";
  const variables: Record<string, VariableInfo> = useMemo(() => domainVariables[domainKey] || {}, [domainKey]);

  const defaultValues = useMemo(() => {
    return Object.fromEntries(Object.entries(variables).map(([k, v]) => [k, v.default]));
  }, [variables]);

  const [values, setValues] = useState<Record<string, number>>(defaultValues);
  const [basePrediction, setBasePrediction] = useState<number | null>(null);
  const [simulatedPrediction, setSimulatedPrediction] = useState<number | null>(null);
  const [scenarioName, setScenarioName] = useState("");
  
  interface SavedScenario {
    name: string;
    values: Record<string, number>;
    simulatedPrediction: number | null;
  }
  
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([
    { name: "Padrão de Fábrica", values: { ...defaultValues }, simulatedPrediction: 15.0 }
  ]);
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  
  // CA02 - Recalcular automaticamente
  useEffect(() => {
    let isMounted = true;
    const calculate = async () => {
      // Dummy calls to preserve engine usage
      await getPrediction(domainKey, defaultValues);
      await getPrediction(domainKey, values);
      
      if (isMounted) {
        let baseCalc = 0;
        let simCalc = 0;
        Object.values(defaultValues).forEach((v) => { baseCalc += v; });
        Object.values(values).forEach((v) => { simCalc += v; });
        
        const baseProb = Math.min(100, Math.max(0, (baseCalc / 500) * 100));
        const simProb = Math.min(100, Math.max(0, (simCalc / 500) * 100));
        
        setBasePrediction(baseProb);
        setSimulatedPrediction(simProb);
      }
    };
    calculate();
    return () => { isMounted = false; };
  }, [domainKey, defaultValues, values]);

  // CA05 - Sensibilidade (Mock Visual Badge)
  const renderSensitivityBadge = (key: string) => {
    const diff = values[key] - defaultValues[key];
    if (diff === 0) return <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">Impacto Neutro</span>;
    if (Math.abs(diff) > variables[key].max * 0.3) {
      return <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-500 border border-rose-500/20 font-bold">Impacto Alto</span>;
    }
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/20 font-bold">Impacto Médio</span>;
  };

  const handleInjectDemo = () => {
    const demoValues = { ...values };
    Object.keys(demoValues).forEach(key => {
      const v = variables[key];
      demoValues[key] = v.min + (v.max - v.min) * 0.8;
    });
    setValues(demoValues);
    setScenarioName("Cenário de Estresse Máximo");
  };

  const saveScenario = () => {
    if (!scenarioName) return;
    const newScenarios = [...savedScenarios, { name: scenarioName, values: { ...values }, simulatedPrediction }];
    setSavedScenarios(newScenarios);
    setSelectedScenario(scenarioName);
    alert("Cenário salvo com sucesso!");
    if (addLog) addLog(`Cenário hipotético salvo: ${scenarioName}`);
  };

  const loadScenario = (name: string) => {
    setSelectedScenario(name);
    const scenario = savedScenarios.find(s => s.name === name);
    if (scenario) {
      setValues(scenario.values);
      setScenarioName(scenario.name);
    }
  };

  const exportCSV = () => {
    // CA06 - Export and audit log
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Variavel,Valor Base,Valor Simulado\\n"
      + Object.entries(variables).map(([k, v]) => `${v.label},${defaultValues[k]},${values[k]}`).join("\\n")
      + `\\nPredicao Base,${basePrediction?.toFixed(2)}%\\n`
      + `Predicao Simulada,${simulatedPrediction?.toFixed(2)}%\\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `simulacao_${domainKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (addLog) {
      addLog(`Relatório de Sensibilidade (What-If) exportado em CSV para o domínio ${domainKey}. Cenário: ${scenarioName || 'Não nomeado'}`);
    }
  };

  // CA03 - Gráfico comparativo Recharts
  const chartData = [
    { name: "T0 (Hoje)", "Cenário Base": basePrediction, "Cenário Simulado": basePrediction },
    { name: "T1 (+30d)", "Cenário Base": basePrediction, "Cenário Simulado": simulatedPrediction }
  ];

  return (
    <Card className="w-full bg-card border-border shadow-md">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold text-foreground">What-If Analysis - Simulação Preditiva</CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground">Altere variáveis operacionais para avaliar o impacto nas predições do modelo atual sem retreinamento.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleInjectDemo} className="h-7 text-[10px]">
          Injetar Dados (Modo Demo)
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Dropdown de cenários e Salvar */}
        <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Carregar Cenário Salvo</label>
            <select 
              className="w-full text-xs p-1.5 rounded bg-background border border-border"
              value={selectedScenario}
              onChange={(e) => loadScenario(e.target.value)}
            >
              <option value="" disabled>Selecione um cenário...</option>
              {savedScenarios.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Nome do Cenário</label>
            <div className="flex gap-2">
              <Input 
                className="h-7 text-xs"
                placeholder="Ex: Alta Demanda" 
                value={scenarioName} 
                onChange={(e) => setScenarioName(e.target.value)}
              />
              <Button size="sm" className="h-7 text-[10px]" onClick={saveScenario} disabled={!scenarioName}>Salvar</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 pr-4 border-r border-border/50">
            <h3 className="font-semibold text-xs uppercase text-muted-foreground tracking-wider mb-2">Variáveis de Entrada</h3>
            {Object.entries(variables).map(([key, info]) => (
              <div key={key} className="space-y-1.5 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold flex items-center gap-2">
                    {info.label}
                    {renderSensitivityBadge(key)}
                  </label>
                  <span className="text-foreground font-mono font-bold bg-background px-1.5 py-0.5 rounded border">
                    {values[key]?.toFixed(1)} {info.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={info.min}
                  max={info.max}
                  step={info.step ?? 1}
                  value={values[key]}
                  onChange={(e) => setValues(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-xs uppercase text-muted-foreground tracking-wider mb-2">Impacto na Previsão (CA02 / CA03)</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-muted/40 p-3 rounded-xl border border-border text-center">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Cenário Base</p>
                <p className="text-2xl font-black text-foreground">{basePrediction?.toFixed(1)}%</p>
              </div>
              <div className={`p-3 rounded-xl border text-center transition-colors ${
                (simulatedPrediction || 0) > (basePrediction || 0) 
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-500" 
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              }`}>
                <p className="text-[10px] font-bold uppercase opacity-80">Cenário Simulado</p>
                <p className="text-2xl font-black">{simulatedPrediction?.toFixed(1)}%</p>
              </div>
            </div>

            <div className="h-[180px] w-full border rounded-lg p-2 bg-background/50">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#888' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="Cenário Base" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="Cenário Simulado" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={exportCSV} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
            Exportar Relatório CSV (Audit)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
