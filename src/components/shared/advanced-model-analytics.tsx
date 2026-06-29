"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDomain } from "@/lib/context/domain-context";
import { 
  getMockCrossValidationScores, 
  getMockLiftAndGainsCurves, 
  getMockShapValues, 
  getMockDataDrift, 
  getMockFairnessAnalysis 
} from "@/lib/predictive-engine";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { Network, Activity, PieChart, ShieldAlert, CheckCircle2 } from "lucide-react";

export function AdvancedModelAnalytics() {
  const { activeDomain } = useDomain();
  const [activeTab, setActiveTab] = useState("evaluation");

  const cvScores = getMockCrossValidationScores();
  const liftGains = getMockLiftAndGainsCurves();
  const shapValues = getMockShapValues(activeDomain || "churn");
  const dataDrift = getMockDataDrift();
  const fairness = getMockFairnessAnalysis();

  return (
    <Card className="border-border/60 shadow-md">
      <CardHeader className="pb-2 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Network className="h-5 w-5 text-indigo-500" />
              Analytics Avançado
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Avaliação aprofundada: Cross-Validation, Lift/Gains, Explicabilidade, Drift e Viés.
            </CardDescription>
          </div>
        </div>
        
        <div className="flex space-x-1 mt-4">
          <button 
            onClick={() => setActiveTab("evaluation")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'evaluation' ? 'bg-indigo-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Avaliação (CV & Lift/Gains)
          </button>
          <button 
            onClick={() => setActiveTab("explicability")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'explicability' ? 'bg-indigo-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Explicabilidade (SHAP)
          </button>
          <button 
            onClick={() => setActiveTab("monitoring")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'monitoring' ? 'bg-indigo-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Data Drift em Produção
          </button>
          <button 
            onClick={() => setActiveTab("fairness")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'fairness' ? 'bg-indigo-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Análise de Viés (Fairness)
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {activeTab === "evaluation" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cross Validation - RF60 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-sky-500" />
                  <h3 className="text-sm font-bold">Validação Cruzada Visual (RF60)</h3>
                </div>
                <div className="h-64 border rounded-xl p-4 bg-muted/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cvScores}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="fold" fontSize={10} />
                      <YAxis domain={[80, 100]} fontSize={10} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="accuracy" name="Acurácia (%)" fill="#0ea5e9" radius={[4,4,0,0]} />
                      <Bar dataKey="f1" name="F1-Score (%)" fill="#8b5cf6" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lift & Gains - RF74, RF75 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-bold">Gráfico de Gains Cumulativo (RF75)</h3>
                </div>
                <div className="h-64 border rounded-xl p-4 bg-muted/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={liftGains}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="percentile" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="modelGains" name="Ganhos Modelo (%)" stroke="#10b981" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="randomGains" name="Ganhos Aleatórios (%)" stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold">Gráfico de Lift (RF74)</h3>
                </div>
                <div className="h-56 border rounded-xl p-4 bg-muted/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={liftGains}>
                      <defs>
                        <linearGradient id="colorLift" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="percentile" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Area type="monotone" dataKey="modelLift" name="Multiplicador de Lift (x)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorLift)" />
                      <Line type="monotone" dataKey="randomLift" name="Base (1.0x)" stroke="#94a3b8" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </div>
          </div>
        )}

        {activeTab === "explicability" && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-violet-500" />
                <h3 className="text-sm font-bold">Explicabilidade com SHAP/LIME (RF85)</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Entenda o peso e a direção de cada feature nas predições do modelo atual.</p>
              
              <div className="h-80 border rounded-xl p-4 bg-muted/20">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shapValues} layout="vertical" margin={{ left: 120 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" fontSize={10} />
                    <YAxis dataKey="feature" type="category" fontSize={10} width={150} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar 
                      dataKey="importance" 
                      name="Impacto Relativo (SHAP)" 
                      radius={[0,4,4,0]} 
                      fill="#8b5cf6"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
        )}

        {activeTab === "monitoring" && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-rose-500" />
                  <h3 className="text-sm font-bold">Monitoramento de Drift em Produção (RF86)</h3>
                </div>
                <div className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/20 animate-pulse">
                  Alerta: Possível degradação em Junho
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Monitora o Population Stability Index (PSI). Valores &gt; 0.1 indicam mudança de distribuição.</p>
              
              <div className="h-80 border rounded-xl p-4 bg-muted/20 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataDrift}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    {/* Linha de referência do limite aceitável de PSI */}
                    <Line type="monotone" dataKey={() => 0.1} stroke="#ef4444" strokeDasharray="3 3" dot={false} strokeWidth={1} name="Limite Crítico (0.1)" />
                    <Line type="monotone" dataKey="psi" name="PSI (Drift)" stroke="#f43f5e" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
          </div>
        )}

        {activeTab === "fairness" && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold">Análise de Viés e Equidade (RF90)</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Compara Falsos Positivos (FPR) e Falsos Negativos (FNR) entre diferentes grupos demográficos/segmentos para auditar vieses.</p>
              
              <div className="h-80 border rounded-xl p-4 bg-muted/20">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fairness}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="group" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="fpr" name="Falso Positivo Rate (FPR %)" fill="#3b82f6" radius={[4,4,0,0]} />
                    <Bar dataKey="fnr" name="Falso Negativo Rate (FNR %)" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
