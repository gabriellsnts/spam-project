"use client";

import React, { useState, useMemo } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { TrendingUp, AlertTriangle, Coins, Percent, FileCheck, Search, ChevronDown, ChevronUp, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSVUploader } from "@/components/shared/csv-uploader";
import { FeatureImportanceChart } from "@/components/shared/feature-importance-chart";
import { Input } from "@/components/ui/input";

type RiskLevel = "all" | "high" | "medium" | "low";

interface ProposalData {
  id: string;
  applicant: string;
  amount: string;
  score: number;
  probability: number;
  action: string;
  influentialFactors: string;
}

export default function CreditRiskPage() {
  const { addLog, isTraining, trainedModels } = useDomain();
  const activeModel = trainedModels["credit-risk"];
  const [stressActive, setStressActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [metrics, setMetrics] = useState({
    defaultRate: "1.80%",
    avgScore: "720",
    proposalsPending: "15",
    totalExposure: "R$ 1.2M",
  });

  const initialProposals: ProposalData[] = [
    { id: "PROP-912", applicant: "Comércio Eletrodomésticos Luz", amount: "R$ 120.000", score: 450, probability: 88, action: "Rejeitar", influentialFactors: "Histórico de atrasos (peso: 40%). Comprometimento de renda > 50% (peso: 35%)." },
    { id: "PROP-909", applicant: "Construções e Incorporações Fortes", amount: "R$ 600.000", score: 580, probability: 61, action: "Revisar Garantia", influentialFactors: "Garantia insuficiente para o valor solicitado (peso: 45%)." },
    { id: "PROP-905", applicant: "Gabriel Silva Alimentos", amount: "R$ 80.000", score: 620, probability: 44, action: "Análise Manual", influentialFactors: "Tempo de constituição da empresa (peso: 30%). Setor de atuação com volatilidade (peso: 25%)." },
    { id: "PROP-902", applicant: "Distribuidora de Bebidas União", amount: "R$ 250.000", score: 810, probability: 12, action: "Aprovar", influentialFactors: "Bom histórico de pagamentos (peso: 50%). Patrimônio líquido elevado (peso: 20%)." },
    { id: "PROP-918", applicant: "Tech Solutions Brasil", amount: "R$ 1.500.000", score: 890, probability: 5, action: "Aprovar", influentialFactors: "Liquidez corrente muito alta (peso: 60%)." },
    { id: "PROP-922", applicant: "Transportes Velocidade Máxima", amount: "R$ 350.000", score: 520, probability: 75, action: "Rejeitar", influentialFactors: "Dívidas ativas em aberto (peso: 70%)." },
  ];

  const [proposals, setProposals] = useState<ProposalData[]>(initialProposals);

  const [ratings, setRatings] = useState([
    { label: "AAA", count: 48, percentage: 35, color: "bg-emerald-500" },
    { label: "AA", count: 32, percentage: 23, color: "bg-emerald-500/80" },
    { label: "A", count: 27, percentage: 20, color: "bg-emerald-500/60" },
    { label: "B", count: 18, percentage: 13, color: "bg-amber-500" },
    { label: "C", count: 10, percentage: 7, color: "bg-amber-500/80" },
    { label: "D", count: 3, percentage: 2, color: "bg-rose-500" },
  ]);

  const getRiskLevel = (score: number) => {
    if (score < 550) return "high";
    if (score <= 700) return "medium";
    return "low";
  };

  const filteredAndSortedProposals = useMemo(() => {
    let result = [...proposals];
    
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.id.toLowerCase().includes(q) || p.applicant.toLowerCase().includes(q));
    }
    
    if (riskFilter !== "all") {
      result = result.filter(p => getRiskLevel(p.score) === riskFilter);
    }
    
    result.sort((a, b) => {
      if (sortOrder === "asc") return a.score - b.score; 
      return b.score - a.score;
    });
    
    return result;
  }, [proposals, searchQuery, riskFilter, sortOrder]);

  const triggerStressSimulation = () => {
    if (!activeModel) {
      addLog("Erro: É necessário treinar um modelo primeiro para gerar predições de Crédito.", "error");
      return;
    }
    setStressActive(true);
    setMetrics({
      defaultRate: "4.35%",
      avgScore: "640",
      proposalsPending: "8",
      totalExposure: "R$ 850K",
    });
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === "PROP-905") {
          return { ...p, score: 510, probability: 78, action: "Rejeitar" };
        }
        if (p.id === "PROP-909") {
          return { ...p, score: 480, probability: 85, action: "Rejeitar" };
        }
        return { ...p, score: Math.max(p.score - 80, 300), probability: Math.min(p.probability + 15, 99) };
      })
    );
    setRatings([
      { label: "AAA", count: 20, percentage: 14, color: "bg-emerald-500" },
      { label: "AA", count: 15, percentage: 11, color: "bg-emerald-500/80" },
      { label: "A", count: 30, percentage: 22, color: "bg-emerald-500/60" },
      { label: "B", count: 38, percentage: 28, color: "bg-amber-500" },
      { label: "C", count: 25, percentage: 18, color: "bg-amber-500/80" },
      { label: "D", count: 10, percentage: 7, color: "bg-rose-500" },
    ]);
    addLog("Simulação de estresse de mercado ativada. Scores reclassificados.");
  };

  const resetSimulation = () => {
    setStressActive(false);
    setMetrics({
      defaultRate: "1.80%",
      avgScore: "720",
      proposalsPending: "15",
      totalExposure: "R$ 1.2M",
    });
    setProposals(initialProposals);
    setRatings([
      { label: "AAA", count: 48, percentage: 35, color: "bg-emerald-500" },
      { label: "AA", count: 32, percentage: 23, color: "bg-emerald-500/80" },
      { label: "A", count: 27, percentage: 20, color: "bg-emerald-500/60" },
      { label: "B", count: 18, percentage: 13, color: "bg-amber-500" },
      { label: "C", count: 10, percentage: 7, color: "bg-amber-500/80" },
      { label: "D", count: 3, percentage: 2, color: "bg-rose-500" },
    ]);
    addLog("Simulação de estresse desativada. Coeficientes restaurados.");
  };

  const handleExport = () => {
    window.print();
    addLog("Relatório consolidado exportado para PDF via impressão.");
  };

  const mockFeatures = [
    { name: "Histórico de Pagamentos", weight: 0.40, description: "Frequência e atrasos em pagamentos de créditos anteriores." },
    { name: "Comprometimento de Renda", weight: 0.25, description: "Porcentagem da receita já comprometida com outras dívidas." },
    { name: "Patrimônio Líquido", weight: 0.15, description: "Garantias reais e bens no nome da empresa/indivíduo." },
    { name: "Tempo de Mercado", weight: 0.12, description: "Tempo de constituição do CNPJ." },
    { name: "Setor de Atuação", weight: 0.08, description: "Risco associado à volatilidade do setor econômico atual." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-md relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 blur-3xl rounded-full" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest">
            <Coins className="h-4 w-4" />
            Módulo de Risco de Crédito (Ativo)
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Análise e Escoragem Preditiva de Crédito
          </h2>
          <p className="text-muted-foreground text-xs">
            Avaliação de riscos de default e concessão de limites de crédito empresarial com redes profundas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 relative z-10">
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
            Exportar Relatório (PDF)
          </Button>
          {!activeModel ? (
            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs font-semibold">
              <AlertCircle className="h-4 w-4" />
              Treine um modelo primeiro
            </div>
          ) : stressActive ? (
            <Button
              onClick={resetSimulation}
              disabled={isTraining}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              Resetar Análise
            </Button>
          ) : (
            <Button
              onClick={triggerStressSimulation}
              disabled={isTraining}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5"
            >
              <TrendingUp className="h-4 w-4" />
              Simular Teste de Estresse
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Taxa de Default Projetada (PD)
            </CardDescription>
            <CardTitle className={`text-2xl font-black ${stressActive ? "text-rose-500 animate-pulse" : "text-foreground"}`}>
              {metrics.defaultRate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Probabilidade de inadimplência média</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Score Médio de Crédito
            </CardDescription>
            <CardTitle className={`text-2xl font-black ${stressActive ? "text-amber-500" : "text-emerald-500"}`}>
              {metrics.avgScore} pt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Classificação: Saudável</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Propostas Pendentes
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">{metrics.proposalsPending}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Aguardando decisão do modelo</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Exposição de Carteira (VaR)
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">{metrics.totalExposure}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-muted-foreground">Valor em Risco estimado a 95%</div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-foreground flex gap-3">
        <Sparkles className="h-5 w-5 text-emerald-500 shrink-0" />
        <div>
          <strong className="text-emerald-500 block mb-1">Insight Automático:</strong>
          {stressActive 
            ? "O cenário de estresse elevou a probabilidade de inadimplência (PD) geral para 4.35%. Recomenda-se aumentar as garantias exigidas nas novas propostas em análise."
            : "Carteira de crédito saudável. A maior exposição de risco está no setor de Transportes. Distribuidora de Bebidas União demonstrou score excepcional."}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border transition-colors duration-300 flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-muted-foreground/60" />
                  Propostas de Crédito em Análise
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground mt-1">
                  {activeModel ? (
                    <>Modelo ativo: <strong>{activeModel.modelId}</strong> com Acurácia de <strong>{((activeModel.metrics.accuracy || 0) * 100).toFixed(1)}%</strong>.</>
                  ) : (
                    "Score preditivo de adimplência e probabilidade estatística de default."
                  )}
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Buscar ID ou Solicitante..." 
                    className="h-8 pl-8 text-xs w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                  className="text-[10px] h-8"
                  title="Ordenar por Risco"
                >
                  {sortOrder === "asc" ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                  Risco
                </Button>
                
                <div className="flex bg-muted p-1 rounded-md">
                  {(["all", "high", "medium", "low"] as RiskLevel[]).map(level => (
                    <button
                      key={level}
                      onClick={() => setRiskFilter(level)}
                      className={`px-2 py-1 text-[10px] rounded capitalize ${riskFilter === level ? "bg-background shadow font-bold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {level === "all" ? "Todos" : level === "high" ? "Alto" : level === "medium" ? "Méd" : "Baixo"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {!activeModel ? (
               <div className="h-[280px] w-full flex flex-col items-center justify-center text-muted-foreground border-t border-border bg-muted/5">
                 <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                 <p className="text-sm">Predições não disponíveis.</p>
                 <p className="text-xs opacity-70">Treine o modelo de Risco de Crédito para gerar o scoring.</p>
               </div>
            ) : (
              <div className="divide-y divide-border border-t border-border">
                {filteredAndSortedProposals.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-xs">Nenhum registro atende aos filtros atuais.</div>
                )}
                {filteredAndSortedProposals.map((p) => {
                  const risk = getRiskLevel(p.score);
                  const isExpanded = expandedRow === p.id;
                  
                  return (
                    <div key={p.id} className="flex flex-col transition-colors hover:bg-muted/20">
                      <div 
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                        onClick={() => setExpandedRow(isExpanded ? null : p.id)}
                      >
                        <div className="space-y-1 min-w-[200px]">
                          <div className="text-xs font-bold text-foreground flex items-center gap-2">
                            {p.applicant}
                            <span className={`w-2 h-2 rounded-full ${risk === 'high' ? 'bg-rose-500' : risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                            <span className="font-mono">{p.id}</span>
                            <span>•</span>
                            <span>Valor: <strong className="text-muted-foreground/90">{p.amount}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 sm:ml-auto">
                          <div className="grid grid-cols-2 gap-8 text-right sm:max-w-[150px]">
                            <div>
                              <div className="text-[9px] text-muted-foreground font-semibold uppercase">Score</div>
                              <div className={`text-xs font-bold font-mono ${
                                risk === 'high' ? "text-rose-500" : risk === 'medium' ? "text-amber-500" : "text-emerald-500"
                              }`}>{p.score}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-muted-foreground font-semibold uppercase">Probab. Default</div>
                              <div className="text-xs font-bold font-mono text-foreground/80">{p.probability}%</div>
                            </div>
                          </div>
                          
                          <div className="w-[100px] text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              risk === 'low'
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                                : risk === 'medium'
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/25"
                                : "bg-rose-500/10 text-rose-500 border-rose-500/25"
                            }`}>
                              {p.action}
                            </span>
                          </div>
                          
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground ml-2" /> : <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 bg-muted/10 border-t border-border/50 animate-in slide-in-from-top-2">
                          <div>
                            <div className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">Variáveis Mais Influentes na Decisão (Explicabilidade Local)</div>
                            <p className="text-xs text-foreground/90 bg-background p-2.5 rounded border border-border/60">
                              {p.influentialFactors}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Percent className="h-4 w-4 text-muted-foreground/60" />
              Distribuição de Ratings
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Distribuição de clientes ativos nas classes de risco financeiro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {ratings.map((r) => (
              <div key={r.label} className="space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span className="font-semibold text-foreground/80">{r.label}</span>
                  <span className="font-mono">{r.count} clientes ({r.percentage}%)</span>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden border border-border">
                  <div
                    className={`h-full transition-all duration-75 ${r.color}`}
                    style={{ width: `${r.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            {stressActive && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-[10px] text-rose-500 animate-pulse flex items-start gap-2 mt-4">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Aviso de Risco Sistemático:</strong> Teste de estresse indica rebaixamento em massa de 40% da carteira de ratings AAA e AA para classes B e C. Risco de provisionamento de capital aumentado.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {activeModel && (
        <FeatureImportanceChart data={mockFeatures} title="Preditores de Risco de Crédito" />
      )}

      <CSVUploader />
    </div>
  );
}
