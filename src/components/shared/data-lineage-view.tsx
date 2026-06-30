import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCommit, Database, ArrowRight, UploadCloud, Activity, SearchCode, Shuffle } from "lucide-react";
import { useDomain } from "@/lib/context/domain-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DataLineageView() {
  const { t, activeDomain } = useDomain();

  const lineageNodes = [
    {
      id: "raw_data",
      title: "Dados Brutos",
      description: "Upload via CSV ou API Externa",
      icon: <UploadCloud className="w-5 h-5" />,
      color: "bg-zinc-500",
      details: ["150k+ linhas", "50 colunas originais", "v1.0 (Hash: 8f9b2a)"]
    },
    {
      id: "cleaning",
      title: "Limpeza de Outliers",
      description: "Auto Data Prep",
      icon: <SearchCode className="w-5 h-5" />,
      color: "bg-blue-500",
      details: ["Z-Score aplicado", "-2.4% (3.600 outliers)", "v1.1 (Hash: a1b2c3)"]
    },
    {
      id: "feature_selection",
      title: "Seleção Automática",
      description: "Redução de Dimensionalidade",
      icon: <Shuffle className="w-5 h-5" />,
      color: "bg-purple-500",
      details: ["Drop de 12 features", "Correl. de Pearson > 0.85", "v1.2 (Hash: e4f5g6)"]
    },
    {
      id: "balancing",
      title: "Balanceamento de Classes",
      description: "SMOTE (Oversampling)",
      icon: <Activity className="w-5 h-5" />,
      color: "bg-emerald-500",
      details: ["Classes balanceadas (50/50)", "Aumento para 180k linhas", "v1.3 (Hash: z9y8x7)"]
    },
    {
      id: "training_ready",
      title: "Dataset Final",
      description: "Pronto para Auto-ML",
      icon: <Database className="w-5 h-5" />,
      color: "bg-emerald-600",
      details: ["Split: 80% Treino / 20% Teste", "Cache Inteligente ativo", "v2.0-ready (Atual)"]
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-emerald-500" />
              {t("ui_lineage_versionamento_de_dados_379")}</CardTitle>
            <CardDescription>
              {t("ui_rastreabilidade_completa_de_ponta_587")}{activeDomain || "todos"}.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono">
            {t("ui_head_v2_0_ready_675")}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Linha conectora */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border/50 hidden md:block" />
          
          <div className="space-y-6">
            {lineageNodes.map((node, i) => (
              <div key={node.id} className="relative flex flex-col md:flex-row gap-4 items-start md:items-center">
                
                {/* Ícone no eixo da linha (Desktop) */}
                <div className={cn(
                  "hidden md:flex z-10 w-12 h-12 rounded-full border-4 border-background items-center justify-center text-white shrink-0 shadow-lg",
                  node.color
                )}>
                  {node.icon}
                </div>

                {/* Card de Informação do Nó */}
                <div className="flex-1 bg-muted/20 border border-border/50 rounded-xl p-4 hover:bg-muted/40 transition-colors w-full group">
                  <div className="flex flex-col sm:flex-row justify-between gap-2 items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "md:hidden w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0",
                          node.color
                        )}>
                          {node.icon}
                        </div>
                        <h4 className="font-bold text-sm text-foreground">{node.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground ml-10 md:ml-0">{node.description}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 ml-10 md:ml-0 w-full sm:w-auto">
                      {node.details.map((detail, idx) => (
                        <span key={idx} className="text-[10px] bg-background border px-2 py-0.5 rounded font-mono text-muted-foreground shadow-sm">
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Seta indicativa entre nós no mobile */}
                {i < lineageNodes.length - 1 && (
                  <div className="md:hidden flex justify-center w-full py-2">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/50 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
