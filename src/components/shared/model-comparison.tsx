"use client";

import React, { useState, useMemo } from "react";
import { useDomain, DomainType, TrainedModel, generateModelHash } from "@/lib/context/domain-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from "recharts";
import { Download, History, CheckCircle, Activity, LayoutGrid, Calendar, FilterX, AlertTriangle, ShieldCheck, ShieldAlert, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelComparisonProps {
  domain: DomainType;
}

export default function ModelComparison({ domain }: ModelComparisonProps) {
  const { modelsHistory, trainedModels, setModelActive, addLog } = useDomain();
  
  const history = useMemo(() => modelsHistory[domain] || [], [modelsHistory, domain]);
  const activeModel = trainedModels[domain];
  
  // States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [algFilter, setAlgFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [modelToRestore, setModelToRestore] = useState<TrainedModel | null>(null);

  // Options
  const algorithms = useMemo(() => {
    const algs = new Set(history.map(m => m.algorithm));
    return Array.from(algs);
  }, [history]);

  // Filters
  const filteredHistory = useMemo(() => {
    let result = [...history];

    if (algFilter !== "all") {
      result = result.filter(m => m.algorithm === algFilter);
    }

    if (dateFilter !== "all") {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      if (dateFilter === "7d") result = result.filter(m => now - m.timestamp <= 7 * day);
      else if (dateFilter === "30d") result = result.filter(m => now - m.timestamp <= 30 * day);
    }

    // Sort by newest first
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [history, algFilter, dateFilter]);

  // Handlers
  const toggleSelection = (modelId: string) => {
    setSelectedIds(prev => 
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleActivate = (modelId: string) => {
    const model = history.find(m => m.modelId === modelId);
    if (model) setModelToRestore(model);
  };

  const confirmRestore = () => {
    if (modelToRestore) {
      setModelActive(domain, modelToRestore.modelId);
      setModelToRestore(null);
    }
  };

  const handleExportCSV = () => {
    if (selectedModels.length === 0) return;
    
    // CA06 - Export CSV with side-by-side metrics
    const headers = ["Métrica", ...selectedModels.map(m => `${m.algorithm} (${new Date(m.timestamp).toLocaleDateString()})`)];
    const metricsToExport = ["accuracy", "precision", "recall", "f1Score", "aucRoc", "r2", "rmse", "mae"];
    
    const rows = metricsToExport.map(metric => {
      const row = [metric];
      selectedModels.forEach(m => {
        const val = m.metrics[metric as keyof TrainedModel["metrics"]];
        row.push(val !== undefined ? val.toFixed(4) : "N/A");
      });
      return row.join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `comparacao_modelos_${domain}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addLog(`[Model Comparison] Relatório comparativo de ${selectedModels.length} modelos exportado com sucesso (CSV).`);
  };

  // Derived for Comparison
  const selectedModels = useMemo(() => {
    return history.filter(m => selectedIds.includes(m.modelId));
  }, [history, selectedIds]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any) => typeof value === 'number' ? value.toFixed(4) : value;

  const chartData = useMemo(() => {
    if (selectedModels.length < 2) return [];
    
    const isClassification = selectedModels[0].type === "Classification";
    const metricsKeys = isClassification 
      ? ["accuracy", "precision", "recall", "f1Score", "aucRoc"]
      : ["r2", "rmse", "mae"];
      
    return metricsKeys.map(key => {
      const dataPoint: Record<string, string | number> = { name: key };
      selectedModels.forEach(m => {
        dataPoint[m.modelId] = m.metrics[key as keyof TrainedModel["metrics"]] || 0;
      });
      return dataPoint;
    });
  }, [selectedModels]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50 flex items-center gap-2">
            <History className="h-6 w-6 text-indigo-500" />
            Histórico e Comparação
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Selecione modelos no histórico para analisar métricas lado a lado e ativar versões anteriores.
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportCSV}
          disabled={selectedModels.length < 2}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* FILTROS */}
      <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5" /> Algoritmo
            </label>
            <select 
              value={algFilter} 
              onChange={(e) => setAlgFilter(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Todos os Algoritmos</option>
              {algorithms.map(alg => (
                <option key={alg} value={alg}>{alg}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Período
            </label>
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Qualquer data</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            title="Limpar Filtros"
            onClick={() => { setAlgFilter("all"); setDateFilter("all"); }}
          >
            <FilterX className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LISTA DE HISTÓRICO */}
        <Card className="xl:col-span-1 border-border/60 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Modelos Treinados
              <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                {filteredHistory.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto max-h-[600px]">
            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Nenhum modelo encontrado no histórico.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredHistory.map((model) => {
                  const isActive = activeModel?.modelId === model.modelId;
                  const isSelected = selectedIds.includes(model.modelId);
                  
                  return (
                    <div 
                      key={model.modelId} 
                      className={cn(
                        "p-4 transition-colors hover:bg-muted/30 cursor-pointer flex flex-col gap-3",
                        isSelected && "bg-indigo-500/5 hover:bg-indigo-500/10"
                      )}
                      onClick={() => toggleSelection(model.modelId)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(model.modelId)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                          />
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2">
                              {model.algorithm}
                              <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded border border-indigo-500/20 font-bold uppercase">
                                {model.version || "v1"}
                              </span>
                              {isActive && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase font-bold flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" /> Ativo
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 truncate max-w-[200px]" title={model.datasetName}>
                              <FileText className="h-3 w-3 flex-shrink-0" /> {model.datasetName || "base_historica.csv"} ({(model.datasetSize || 0).toFixed(1)} KB)
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                              ID: {model.modelId.split("-")[2]} • Hash: {model.hash ? model.hash.substring(0, 8) : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pl-7">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs text-muted-foreground">
                            {new Date(model.timestamp).toLocaleString()}
                          </div>
                          {/* Verificação de Integridade */}
                          {model.hash && generateModelHash(model as Omit<TrainedModel, "hash">) === model.hash ? (
                            <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium">
                              <ShieldCheck className="h-3 w-3" /> Integridade OK
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-500 flex items-center gap-1 font-bold">
                              <ShieldAlert className="h-3 w-3" /> Corrompido
                            </span>
                          )}
                        </div>
                        
                        {!isActive && (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="h-7 text-xs px-3"
                            onClick={(e) => { e.stopPropagation(); handleActivate(model.modelId); }}
                          >
                            Tornar Ativo
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ÁREA DE COMPARAÇÃO */}
        <div className="xl:col-span-2 space-y-6">
          {selectedModels.length < 2 ? (
            <Card className="h-full min-h-[400px] flex items-center justify-center border-dashed bg-muted/20">
              <div className="text-center space-y-3 max-w-sm p-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-zinc-100">
                  Selecione modelos para comparar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione dois ou mais modelos na lista ao lado para visualizar a tabela comparativa de métricas e gráficos de desempenho.
                </p>
              </div>
            </Card>
          ) : (
            <>
              {/* TABELA COMPARATIVA */}
              <Card className="border-border/60 shadow-md">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-lg">Tabela Comparativa de Métricas</CardTitle>
                  <CardDescription>
                    O melhor valor em cada métrica está destacado em verde.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-3 border-b">Métrica</th>
                        {selectedModels.map((m, i) => (
                          <th key={m.modelId} className="px-4 py-3 border-b border-l text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span style={{ color: COLORS[i % COLORS.length] }}>
                                {m.algorithm}
                              </span>
                              <span className="text-[10px] font-mono font-normal">
                                {m.modelId.split("-")[2]}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {chartData.map((row: any) => {
                        const metric = String(row.name);
                        // Find the best value (highest for most, lowest for RMSE/MAE)
                        const vals = selectedModels.map(m => m.metrics[metric as keyof TrainedModel["metrics"]] || 0);
                        const isErrorMetric = ["rmse", "mae"].includes(metric);
                        const bestVal = isErrorMetric ? Math.min(...vals) : Math.max(...vals);

                        return (
                          <tr key={metric} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-medium capitalize border-r bg-muted/10">
                              {metric}
                            </td>
                            {selectedModels.map((m) => {
                              const val = m.metrics[metric as keyof TrainedModel["metrics"]] || 0;
                              const isBest = val === bestVal;
                              return (
                                <td key={m.modelId} className="px-4 py-3 border-l text-center font-mono">
                                  <span className={cn(
                                    "px-2 py-1 rounded",
                                    isBest 
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold" 
                                      : "text-muted-foreground"
                                  )}>
                                    {val.toFixed(4)}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* GRÁFICO COMPARATIVO */}
              <Card className="border-border/60 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Desempenho Visual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: "currentColor" }} 
                          className="text-muted-foreground text-xs uppercase" 
                        />
                        <YAxis 
                          tick={{ fill: "currentColor" }} 
                          className="text-muted-foreground text-xs font-mono" 
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                          itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                          labelStyle={{ color: 'hsl(var(--foreground))', marginBottom: '8px', fontWeight: 'bold', textTransform: 'capitalize' }}
                          formatter={tooltipFormatter}
                        />
                        <Legend />
                        {selectedModels.map((m, i) => (
                          <Bar 
                            key={m.modelId} 
                            dataKey={m.modelId} 
                            name={`${m.algorithm} (${m.version || "v1"})`}
                            fill={COLORS[i % COLORS.length]} 
                            radius={[4, 4, 0, 0]} 
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Modal de Restauração de Versão (CA04) */}
      {modelToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border shadow-xl rounded-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold flex items-center gap-2 text-rose-500 mb-2">
              <AlertTriangle className="h-5 w-5" />
              Restaurar Versão Anterior
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Você está prestes a substituir o modelo ativo atual pela versão <strong className="text-foreground uppercase">{modelToRestore.version || "v1"}</strong> ({modelToRestore.algorithm}).
            </p>
            <div className="bg-muted/50 border border-border rounded-md p-3 mb-6 text-xs text-muted-foreground">
              <strong>Impacto da Operação:</strong> As próximas predições do domínio de {domain} utilizarão imediatamente os pesos matemáticos desta versão histórica. O modelo ativo atual não será excluído, sendo preservado no histórico para auditoria.
            </div>
            
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setModelToRestore(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmRestore}>
                Confirmar Restauração
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
