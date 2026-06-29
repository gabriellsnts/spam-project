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
import { Network, Activity, PieChart, ShieldAlert, CheckCircle2, Skull } from "lucide-react";

export function AdvancedModelAnalytics() {
  const { activeDomain , t } = useDomain();
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
              {t("advanced_analytics")}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {t("advanced_analytics_desc")}
            </CardDescription>
          </div>
        </div>
        
        <div className="flex space-x-1 mt-4">
          <button 
            onClick={() => setActiveTab("evaluation")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'evaluation' ? 'bg-indigo-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}
          >
            {t("evaluation_cv_lift")}
          </button>
          <button 
            onClick={() => setActiveTab("explicability")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'explicability' ? 'bg-indigo-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}
          >
            {t("explainability_shap")}
          </button>
          <button 
            onClick={() => setActiveTab("monitoring")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'monitoring' ? 'bg-indigo-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}
          >
            {t("data_drift_production")}
          </button>
          <button 
            onClick={() => setActiveTab("fairness")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'fairness' ? 'bg-indigo-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}
          >
            {t("fairness_analysis")}
          </button>
          <button 
            onClick={() => setActiveTab("robustness")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'robustness' ? 'bg-rose-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}
          >
            {t("adversarial_robustness_rf84")}
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
                  <h3 className="text-sm font-bold">{t("visual_cross_validation_rf60")}</h3>
                </div>
                <div className="h-64 border rounded-xl p-4 bg-muted/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cvScores}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="fold" fontSize={10} />
                      <YAxis domain={[80, 100]} fontSize={10} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="accuracy" name={t("accuracy")} fill="#0ea5e9" radius={[4,4,0,0]} />
                      <Bar dataKey="f1" name={t("f1_score")} fill="#8b5cf6" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lift & Gains - RF74, RF75 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-bold">{t("cumulative_gains_rf75")}</h3>
                </div>
                <div className="h-64 border rounded-xl p-4 bg-muted/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={liftGains}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="percentile" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="modelGains" name={t("model_gains")} stroke="#10b981" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="randomGains" name={t("random_gains")} stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold">{t("lift_chart_rf74")}</h3>
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
                      <Area type="monotone" dataKey="modelLift" name={t("lift_multiplier")} stroke="#f59e0b" fillOpacity={1} fill="url(#colorLift)" />
                      <Line type="monotone" dataKey="randomLift" name={t("base_1_0x")} stroke="#94a3b8" strokeDasharray="5 5" />
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
                <h3 className="text-sm font-bold">{t("explainability_shap_lime")}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{t("explainability_desc")}</p>
              
              <div className="h-80 border rounded-xl p-4 bg-muted/20">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shapValues} layout="vertical" margin={{ left: 120 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" fontSize={10} />
                    <YAxis dataKey="feature" type="category" fontSize={10} width={150} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar 
                      dataKey="importance" 
                      name={t("relative_impact_shap")} 
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
                  <h3 className="text-sm font-bold">{t("production_drift_monitoring")}</h3>
                </div>
                <div className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/20 animate-pulse">
                  {t("alert_possible_degradation")}
                </div>
             </div>
              <p className="text-xs text-muted-foreground mb-4">{t("monitor_psi_desc")}</p>
              
              <div className="h-80 border rounded-xl p-4 bg-muted/20 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataDrift}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    {/* Linha de referência do limite aceitável de PSI */}
                    <Line type="monotone" dataKey={() => 0.1} stroke="#ef4444" strokeDasharray="3 3" dot={false} strokeWidth={1} name={t("critical_limit_0_1")} />
                    <Line type="monotone" dataKey="psi" name={t("psi_drift")} stroke="#f43f5e" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
          </div>
        )}

        {activeTab === "fairness" && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold">{t("bias_fairness_analysis_rf90")}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{t("compare_fpr_fnr_desc")}</p>
              
              <div className="h-80 border rounded-xl p-4 bg-muted/20">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fairness}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="group" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="fpr" name={t("false_positive_rate_fpr")} fill="#3b82f6" radius={[4,4,0,0]} />
                    <Bar dataKey="fnr" name={t("false_negative_rate_fnr")} fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
        )}

        {activeTab === "robustness" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skull className="h-4 w-4 text-rose-500" />
                <h3 className="text-sm font-bold">{t("adversarial_robustness_test_rf84")}</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("adversarial_robustness_desc")}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="border rounded-xl p-4 bg-muted/20 border-rose-500/20">
                  <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <ShieldAlert className="h-3 w-3 text-rose-500" />
                    {t("noise_injection_gaussian")}
                  </h4>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs">
                      <span>{t("baseline_f1")}</span>
                      <span className="font-mono font-bold">0.89</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>{t("f1_10_noise")}</span>
                      <span className="font-mono text-amber-500 font-bold">0.82 (-7%)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>{t("f1_25_noise")}</span>
                      <span className="font-mono text-rose-500 font-bold">0.65 (-24%)</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-xl p-4 bg-muted/20 border-rose-500/20">
                  <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <ShieldAlert className="h-3 w-3 text-rose-500" />
                    {t("extreme_values_outliers")}
                  </h4>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs">
                      <span>{t("baseline_recall")}</span>
                      <span className="font-mono font-bold">0.85</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>{t("recall_post_attack")}</span>
                      <span className="font-mono text-emerald-500 font-bold">0.83 (-2%)</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 border-t pt-2">
                      {t("model_high_resilience")}
                    </p>
                  </div>
                </div>

                <div className="border rounded-xl p-4 bg-muted/20 border-rose-500/20">
                  <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <ShieldAlert className="h-3 w-3 text-rose-500" />
                    {t("feature_corruption")}
                  </h4>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs">
                      <span>{t("original_accuracy")}</span>
                      <span className="font-mono font-bold">92%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>{t("with_1_feature_zero")}</span>
                      <span className="font-mono text-amber-500 font-bold">88%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>{t("vulnerability")}</span>
                      <span className="font-mono text-amber-500 font-bold">{t("medium")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
